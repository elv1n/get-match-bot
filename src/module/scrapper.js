const path = require('path');

const DB = require('../db');

const utils = require('../utils');
const parser = require('../utils/parser');

const { scrapeIt } = utils;

const checker = require('./checker');
const parseUrl = require('./parser');

const URL = 'http://gooool.org/';
const HIGHLIGHTS = `${URL}obzors`;
const LINKS_SELECTOR = '.articles .item';

const getHighlights = async () => {
	const { highlights } = await scrapeIt(HIGHLIGHTS, {
		highlights: {
			listItem: LINKS_SELECTOR,
			data: {
				link: {
					selector: 'a',
					attr: 'href'
				}
			}
		}
	});

	return await Promise.all(highlights.map(async (match) => await getMatch(match)));
};

const getMatch = async ({ link }) => {
	const pathname = path.basename(link, path.extname(link));

	const match = await scrapeIt(link, {
		title: {
			selector: 'title',
			how: 'text'
		},
		reviews: {
			listItem: '.article-main td',
			data: {
				link: {
					selector: 'a',
					attr: 'onclick',
					convert: parser.link
				}
			}
		}
	});

	return { ...match, pathname };
};

const getLinks = async (pages) => {
	return await Promise.all(pages.map(
		async ({ reviews, title, pathname }) => {
			const matchInfo = parser.matchInfo(title);
			const links = reviews.map(({ link }) => link).filter(Boolean);
			const result = await parseUrl.findValidService(links);
			if (result && result.file) {
				return {
					...matchInfo,
					...result,
					_id: pathname,
				};
			} else {
				console.log('Valid links not found', links);
				return null;
			}
		}
	));
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
	const links = await getLinks(highlights);
	await generateResults(links);
};

const init = () => setInterval(run, 1000 * 60 * 30);

module.exports = { run, init };
