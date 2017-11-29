const path = require('path');
const URI = require('urijs');
const { v4 } = require('uuid');

const download = require('download');

const dist = require('../utils').getDist();

/**
 * Download video by url to server
 *
 * @param {string} video url
 * @returns {FormData|null} return object with filename when download successfully or null when catch error
 */
const downloadSource = async video => {
	const videoPath = URI.parse(video).path;
	const videoFile = path.basename(videoPath);

	const formData = {
		filename: videoFile || `${v4()}.mp4`
	};

	const httpsVideo = URI(video)
		.protocol('https')
		.toString();

	try {
		await download(httpsVideo, dist, formData);
		return formData;
	} catch (e) {
		console.log('cannot download', video);
		console.log(e);
		return null;
	}
};

module.exports = downloadSource;
