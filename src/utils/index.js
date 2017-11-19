const path = require('path');
const scrapeIt = require('./scrapeIt');
const { SERVICES, PRIORITY } = require('../constants');
const { matchInfo } = require('./parser');

function serviceScrape(link) {
	const service = SERVICES.find(({ domain }) => link.includes(domain));
	if (!service) {
		// console.log(`Cannot find service for link ${link}`);
		return null;
	}
	return Object.assign({ link }, service);
}

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
	scrapeIt,
	matchInfo,
	getPreferService,
	promiseEach,
	videoIsAvailable
};
