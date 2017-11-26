const db = require('../db');
const telegram = require('../api/telegram');
const download = require('../api/download');
const stream = require('../api/stream');
const utils = require('../utils');

const badQuality = require('./process/badQuality');
const reloadMatch = require('./parser/reloadMatch');

const downloadProcess = async doc => {
	await db.updateOrWait(doc._id, { inDownload: true });
	const downloadedFile = await download(doc.file);
	if (downloadedFile) {
		await db.updateOrWait(doc._id, {
			download: true,
			localFilename: downloadedFile.filename
		});
	} else {
		await db.updateOrWait(doc._id, { inDownload: false });
		await reloadMatch(doc._id);
	}
};

/**
 * Find all not downloaded docs and download it to server
 * For control download process and not start again use inDownloaded key
 * @returns {Promise.<void>}
 */
const checkDownload = async () => {
	const docs = await db.findBy({ download: false, inDownload: false });
	await Promise.all(
		docs.map(async doc => {
			if (utils.is.ok(doc.link)) {
				await reloadMatch(doc._id);
				doc = await db.get(doc._id);
			}
			await downloadProcess(doc);
		})
	);
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
	await Promise.all(
		docs.map(async doc => {
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
		})
	);
};

const sendToTelegram = async doc => {
	try {
		if (Array.isArray(doc.videos)) {
			await telegram.editMatch(doc);
			await db.updateOrWait(doc._id, {
				send: true
			});
		} else {
			const { message_id } = await telegram.sendMatch(doc);
			await db.updateOrWait(doc._id, {
				send: true,
				message_id
			});
		}
		utils.deleteFromDist(doc.localFilename);
	} catch (e) {
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
	await Promise.all(
		docs.map(async doc => {
			try {
				const alreadyUpload = await utils.videoIsAvailable(
					doc.uploadUrl
				);

				if (alreadyUpload) {
					await sendToTelegram(doc);
				} else {
					// Wait when streambale handle video
					setTimeout(() => {
						checkUploadInit();
					}, 1000 * 60);
				}
			} catch (e) {
				if (e.statusCode === 404) {
					utils.deleteFromDist(doc.localFilename);

					await db.update(doc._id, {
						download: false,
						uploaded: false,
						inDownload: false,
						inUpload: false
					});
				}
			}
		})
	);
};

const run = () => {
	checkDownload();
	checkUploaded();
	checkUploadInit();
	badQuality();
};
/**
 * Run all check functions every 30 minutes
 */
const init = () => setInterval(() => run(), 1000 * 60 * 15);

module.exports = { run, init };
