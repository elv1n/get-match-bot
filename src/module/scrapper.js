const DB = require('../db');

const utils = require('../utils');

const { scrapeIt } = utils;

const checker = require('./checker');
const parseUrl = require('./parser');

const PARSE_RESOURCE = require('../constants').PARSE_RESOURCE;
const MATCH = require('../constants/match');

const getHighlights = async url => {
	const { highlights } = await scrapeIt(url, {
		highlights: {
			listItem: PARSE_RESOURCE.LINKS_SELECTOR,
			data: {
				link: {
					selector: 'a',
					attr: 'href'
				}
			}
		}
	});

	return await Promise.all(
		highlights.map(async match => await parseUrl.getMatch(match))
	);
};

const generateResults = async matches => {
	matches = matches.filter(Boolean);

	// Save new matches to DB
	const newMatches = await Promise.all(
		matches.map(async match => {
			const exist = await DB.exist(match._id);
			if (!exist) {
				await DB.put({
					...match,
					...MATCH.defaultProps,
					timestamp: new Date()
				});
				return true;
			}
			return false;
		})
	);

	const savedNewMatches = newMatches.filter(Boolean).length;
	if (savedNewMatches) {
		console.log('Save new matches: ', savedNewMatches);

		await checker.run();
	}
};

const run = async () => {
	const highlights = await getHighlights(
		PARSE_RESOURCE.HIGHLIGHTS + '/page/1/'
	);
	const links = await Promise.all(
		highlights.map(async page => await parseUrl.getLinks(page))
	);
	await generateResults(links);
};

const init = () => setInterval(run, 1000 * 60 * 30);

module.exports = { run, init };
