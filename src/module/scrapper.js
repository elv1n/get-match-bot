const path = require('path');

const DB = require('../db');

const utils = require('../utils');
const parser = require('../utils/parser');

const { scrapeIt } = utils;

const checker = require('./checker');
const parseUrl = require('./parser');

const MATCH = require('../constants').MATCH;

const getHighlights = async () => {
	const { highlights } = await scrapeIt(MATCH.HIGHLIGHTS, {
		highlights: {
			listItem: MATCH.LINKS_SELECTOR,
			data: {
				link: {
					selector: 'a',
					attr: 'href'
				}
			}
		}
	});

	return await Promise.all(highlights.map(async (match) => await parseUrl.getMatch(match)));
};

const generateResults = async matches => {
	matches = matches.filter(Boolean);

	// Save new matches to DB
	const newMatches = await Promise.all(matches.map(async match => {
			const exist = await DB.exist(match._id);
			if (!exist) {
				await DB.put({
					...match,
					download: false,
					uploaded: false,
					send: false,
					inDownload: false,
					inUpload: false,
				});
				return true;
			}
			return false;
		}),
	);

	console.log('Save new matches: ', newMatches.filter(Boolean).length);

	await checker.run();
};

const run = async () => {
	const highlights = await getHighlights();
	const links = await Promise.all(highlights.map(async page => await parseUrl.getLinks(page)));
	await generateResults(links);
};

const init = () => setInterval(run, 1000 * 60 * 30);

module.exports = { run, init };
