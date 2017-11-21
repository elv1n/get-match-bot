const path = require('path');
const scrapeIt = require('./scrapeIt');
const { SERVICES, PRIORITY } = require('../constants');
const { matchInfo } = require('./parser');

/**
 * Find video service from constants by link
 * @param link
 */
const getService = link => SERVICES.find(s => link.includes(s.domain));

const getServiceName = link => {
	const service = getService(link);
	return service && service.name;
};

function serviceScrape(link) {
	const service = getService(link);
	if (!service) {
		// console.log(`Cannot find service for link ${link}`);
		return null;
	}
	return Object.assign({ link }, service);
}

const linksByPriority = (a, b) =>
	PRIORITY.indexOf(getServiceName(a.link)) -
	PRIORITY.indexOf(getServiceName(b.link));

function getPreferService(links) {
	const grab = links
		.map(link => serviceScrape(link))
		.filter(Boolean)
		.sort((a, b) => PRIORITY.indexOf(a.name) - PRIORITY.indexOf(b.name));

	return grab.length ? grab[0] : null;
}

const getAssets = name => path.join(__dirname, '../../assets', name || '');
const getDist = name => getAssets(path.join('dist', name || ''));

const promiseEach = (funcs, previous) =>
	funcs.reduce(
		(promise, func) =>
			promise.then(r =>
				func(r[r.length - 1]).then(Array.prototype.concat.bind(r))
			),
		Promise.resolve([])
	);

/**
 * Video hosting take time to handle video and when on page found video player - its
 * @param url
 */
const videoIsAvailable = url =>
	scrapeIt(url, {
		video: { attr: 'poster', selector: '#video-player-tag' }
	}).then(({ video }) => video && video.length);

module.exports = {
	getDist,
	getAssets,
	getService,
	linksByPriority,
	scrapeIt,
	matchInfo,
	getPreferService,
	promiseEach,
	videoIsAvailable
};
