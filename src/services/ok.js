const { URL } = require('url');
const QUALITY = require('../constants/quality');
const domain = 'ok.ru';

const editURL = url => {
	url = new URL(url);
	url.searchParams.set('ct', 4);
	return url.href;
};
const findQuality = name => {
	const q = QUALITY.NAMES.find(q => q.name === name);
	if (!q) {
		console.log(`Cannot find quality with name ${name}`);
		return null;
	}
	return q.p;
};

const parseOptions = opts => {
	try {
		const options = JSON.parse(opts);
		const { videos, movie } = JSON.parse(options.flashvars.metadata) || {};
		return { videos, duration: parseFloat(movie.duration || 0) };
	} catch (e) {
		return null;
	}
};

const afterScrape = ({ player }) => {
	const { videos, duration } = player;
	const { url, name } = videos.sort(
		// Sort from higher to lower quality
		(a, b) => QUALITY.INDEX.indexOf(a.name) < QUALITY.INDEX.indexOf(b.name)
	)[0];
	return {
		file: editURL(url),
		quality: findQuality(name),
		duration
	};
};

const scrape = {
	player: {
		selector: '[data-module="OKVideo"]',
		attr: 'data-options',
		convert: parseOptions
	}
};

module.exports = {
	domain,
	scrape,
	afterScrape
};
