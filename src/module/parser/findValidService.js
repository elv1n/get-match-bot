const utils = require('../../utils');

const checkService = require('./checkService');

/**
 * Iterate links
 * @param links
 */
const collectLinks = async links =>
	await Promise.all(
		links.map(async link => ({
			file: await checkService(link),
			link
		}))
	);

/**
 * Collect all links from services, sort by priority and return first
 * @param links
 * @returns {Promise.<T>}
 */
const findValidService = async links => {
	const collectedLinks = await collectLinks(links);
	return collectedLinks
		.filter(s => s.file)
		.sort(utils.linksByPriority)
		.shift();
};

module.exports = findValidService;
