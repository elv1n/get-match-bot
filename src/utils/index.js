const fs = require('fs');
const path = require('path');
const get = require('lodash/get');
const scrapeIt = require('./scrapeIt');
const { SERVICES, PRIORITY } = require('../constants');
const OK = require('../services/ok');
const STREAMABLE = require('../services/streamable');
const { matchInfo } = require('./parser');

/**
 * Find video service from constants by link
 * @param link
 */
const getService = link => SERVICES.find(s => link.includes(s.domain));

const getServiceDomain = link => {
	const service = getService(link);
	return service && service.domain;
};

const linksByPriority = (a, b) =>
	PRIORITY.indexOf(getServiceDomain(a.link)) -
	PRIORITY.indexOf(getServiceDomain(b.link));

const getAssets = name => path.join(__dirname, '../../assets', name || '');
const getDist = name => getAssets(path.join('dist', name || ''));

const deleteFromDist = file =>
	fs.unlink(getDist(file), err => {
		if (err) {
			console.log('Cant delete file', err);
		}
	});

/**
 * Video hosting take time to handle video and when on page found video player - its
 * @param url
 */
const videoIsAvailable = url =>
	scrapeIt(url, {
		video: { attr: 'poster', selector: '#video-player-tag' }
	}).then(res => get(res, 'video.length'));

/**
 * Check link on service
 * @param link
 */
const is = {
	streamable: link => link.includes(STREAMABLE.domain),
	ok: link => link.includes(OK.domain)
};

module.exports = {
	getDist,
	getAssets,
	getService,
	deleteFromDist,
	linksByPriority,
	scrapeIt,
	matchInfo,
	videoIsAvailable,
	is
};
