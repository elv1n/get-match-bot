const config = require('config');
const https = require('https');
const fs = require('fs');
const request = require('request-promise');
const utils = require('../utils');

const URL = 'https://streamable.com/';
const AUTH = config.get('streamable');

/**
 * Upload from localhost to streamable video hosting
 * @param {string} file name in dist folder
 * @returns {string|null} return link to streambable.com or null when failed
 */
const upload = async file => {
	// @{link} https://github.com/remixz/to-streamable
	const Streamable = {
		method: 'POST',
		url: `https://api.streamable.com/upload`,
		formData: { file: fs.createReadStream(utils.getDist(file)) },
		json: true,
		auth: AUTH
	};

	try {
		const { status, shortcode } = await request(Streamable);
		if (status === 1) {
			return URL + shortcode;
		}
		return null;
	} catch (e) {
		console.log(`Cant upload ${file}`);
		return null;
	}
};

module.exports = upload;
