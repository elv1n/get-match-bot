const path = require('path');
const url = require('url');
const normalizeUrl = require('normalize-url');
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
	const videoPath = url.parse(video).pathname;
	const videoFile = path.basename(videoPath);

	const formData = {
		filename: videoFile || `${v4()}.mp4`
	};

	//video = '//cf-e2.streamablevideo.com/video/mp4/bwkxc_1.mp4?token=1510767987-EBdi%2FrpybheHOXFWi%2FIR%2BC7Rc6T7rGwT7uIDo%2Fk%2FEuk%3D';

	try {
		await download(normalizeUrl(video), dist, formData);
		return formData;
	} catch (e) {
		console.log('cannot download', video);
		return null;
	}
};

module.exports = downloadSource;
