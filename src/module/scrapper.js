const { filter, map } = require('asyncro');
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
	// Save new matches to DB
	const newMatches = await map(
		matches.filter(Boolean),
		async match =>
			await DB.put({
				...match,
				...MATCH.defaultProps,
				timestamp: new Date()
			})
	);

	console.log('Save new matches: ', newMatches);
	await checker.run();
};

const getNewMatches = links =>
	filter(links, async ({ pathname }) => !await DB.exist(pathname));

const run = async () => {
	const highlights = await getHighlights(
		PARSE_RESOURCE.HIGHLIGHTS + '/page/1/'
	);
	const newHighlights = await getNewMatches(highlights);
	const links = await Promise.all(
		newHighlights.map(async page => await parseUrl.getLinks(page))
	);
	links.length && (await generateResults(links));
};

const init = () => setInterval(run, 1000 * 60 * 5);

module.exports = { run, init };
