const fs = require('fs');
const db = require('../db');
const telegram = require('../api/telegram');
const download = require('../api/download');
const stream = require('../api/stream');
const utils = require('../utils');

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
	//docs.reduce(async (promise, doc) => {
	//	await promise;
	//	console.log(doc);
	//	if (utils.isOK(doc.link)) {
	//		await reloadMatch(doc._id);
	//		doc = await db.get(doc._id);
	//	}
	//	return downloadProcess(doc);
	//}, Promise.resolve());
	//Async download
	await Promise.all(
		docs.map(async doc => {
			if (utils.isOK(doc.link)) {
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
				const uploadUrl = await stream(doc.localFilename);
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
			const alreadyUpload = await utils.videoIsAvailable(doc.uploadUrl);
			if (alreadyUpload) {
				try {
					const { message_id } = await telegram.sendMatch(doc);
					await db.updateOrWait(doc._id, { send: true, message_id });
					fs.unlink(utils.getDist(doc.localFilename), err => {
						if (err) {
							console.log('Cant delete file', err);
						}
					});
				} catch (e) {
					console.log(`Cannot sent to telegram`);
				}
			}
		})
	);
};

const run = () => {
	checkDownload();
	checkUploaded();
	checkUploadInit();
};
/**
 * Run all check functions every 30 minutes
 */
const init = () => setInterval(() => run(), 1000 * 60 * 15);

module.exports = { run, init };
