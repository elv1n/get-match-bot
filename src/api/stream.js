const config = require('config');
const fs = require('fs');
const request = require('request-promise');
const utils = require('../utils');

const URL = 'https://streamable.com/';
const AUTH = config.get('streamable');

const importByUrl = async (url, title) => {
	const Streamable = {
		method: 'GET',
		url: `https://api.streamable.com/import?url=${url}&title=${title}`,
		json: true,
		auth: AUTH
	};

	try {
		const { status, shortcode } = await request(Streamable);
		if (status === 1) {
			return URL + shortcode;
		}
		console.log(status, shortcode);
		return null;
	} catch (e) {
		console.log(e);
		console.log(`Cant upload ${url}`);
		return null;
	}
};

/**
 * Upload from localhost to streamable video hosting
 * @param {string} file name in dist folder
 * @param {object} options for uploaded vide
 * @returns {string|null} return link to streambable.com or null when failed
 */
const upload = async (file, options = {}) => {
	// @{link} https://github.com/remixz/to-streamable
	const { duration } = options;
	let params = [];

	if (duration && duration > 600) {
		params = [...params, 'start=10,length=600'];
	}

	const paramString = params.length > 0 ? `?${params.join('&')}` : '';

	const Streamable = {
		method: 'POST',
		url: `https://api.streamable.com/upload?${paramString}`,
		formData: {
			file: fs.createReadStream(utils.getDist(file))
		},
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
module.exports.importByUrl = importByUrl;
