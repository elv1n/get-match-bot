const { map, parallel } = require('asyncro');
const db = require('../db');
const telegram = require('../api/telegram');
const download = require('../api/download');
const stream = require('../api/stream');
const { defaultProps } = require('../constants/match');
const TIME = require('../constants/time');
const utils = require('../utils');

const badQuality = require('./process/badQuality');
const reloadMatch = require('./parser/reloadMatch');

const downloadProcess = async doc => {
	await db.updateOrWait(doc._id, { inDownload: true });
	const downloadedFile = await download(doc.file);
	if (downloadedFile) {
		return await db.updateOrWait(doc._id, {
			download: true,
			localFilename: downloadedFile.filename
		});
	}
	await db.updateOrWait(doc._id, { inDownload: false });
	return await reloadMatch(doc._id);
};

/**
 * Find all not downloaded docs and download it to server
 * For control download process and not start again use inDownloaded key
 * @returns {Promise.<void>}
 */
const checkDownload = async () => {
	let docs = await db.findBy({ download: false, inDownload: false });
	// Reload token for ok
	docs = await map(docs, async doc => {
		if (utils.is.ok(doc.link)) {
			await reloadMatch(doc._id);
			return await db.get(doc._id);
		}
		return Promise.resolve(doc);
	});

	// Download videos in parallel
	await parallel(docs.map(doc => () => downloadProcess(doc)));
	// Call upload to streamable
	return checkUploaded();
};

/**
 * Find and upload to hosting not uploaded docs
 * @returns {Promise.<void>}
 */
const checkUploaded = async () => {
	const docs = await db.findBy({
		uploaded: false,
		inUpload: false,
		download: true
	});
	await map(docs, async doc => {
		await db.updateOrWait(doc._id, { inUpload: true });
		try {
			const uploadUrl = await stream(doc.localFilename, {
				duration: doc.duration
			});
			if (uploadUrl) {
				await db.updateOrWait(doc._id, {
					uploaded: true,
					uploadUrl
				});
			}
		} catch (e) {
			await db.updateOrWait(doc._id, { inUpload: false });
		}
	});
};

const sendToTelegram = async _id => {
	try {
		const doc = await db.get(_id);
		if (doc.send) {
			return;
		}
		if (Array.isArray(doc.videos)) {
			await telegram.editMatch(doc);
			await db.updateOrWait(doc._id, {
				send: true
			});
		} else {
			const bots = await telegram.sendMatch(doc);
			await db.updateOrWait(doc._id, {
				send: true,
				bots
			});
		}
		utils.deleteFromDist(doc.localFilename);
	} catch (e) {
		await db.updateOrWait(_id, {
			send: true
		});
		console.log(`Cannot sent to telegram`);
	}
};

/**
 * Check when uploaded video handled by hosting and send to telegram channel
 * @returns {Promise.<void>}
 */
const checkUploadInit = async () => {
	const docs = await db.findBy({
		send: false,
		download: true,
		uploaded: true
	});
	await map(docs, async doc => {
		try {
			const alreadyUpload = await utils.videoIsAvailable(doc.uploadUrl);

			if (alreadyUpload) {
				await sendToTelegram(doc._id);
			}
		} catch (e) {
			if (e.statusCode === 404) {
				utils.deleteFromDist(doc.localFilename);

				await db.update(doc._id, { ...defaultProps });
			}
		}
	});
};

const run = () => {
	checkDownload();
	badQuality();
};

const runCheckUploadInit = async () => {
	await checkUploadInit();
	setTimeout(() => runCheckUploadInit(), TIME.FIVE_MINUTES);
};

/**
 * Run all check functions every 30 minutes
 */
const init = () => {
	runCheckUploadInit();
	setInterval(() => run(), TIME.MINUTE * 5);
};

module.exports = {
	run,
	init,
	checkDownload
};
