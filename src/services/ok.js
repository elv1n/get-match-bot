const { URL } = require('url');

const domain = 'ok.ru';

const editURL = url => {
	url = new URL(url);
	url.searchParams.set('ct', 4);
	return url.href;
};

const parseOptions = opts => {
	try {
		const options = JSON.parse(opts);
		const { videos } = JSON.parse(options.flashvars.metadata) || {};
		const { url } = videos.reverse()[0];
		return editURL(url);
	} catch (e) {
		return null;
	}
};

const scrape = {
	file: {
		selector: '[data-module="OKVideo"]',
		attr: 'data-options',
		convert: parseOptions
	}
};

module.exports = {
	domain,
	scrape
};
