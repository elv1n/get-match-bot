const utils = require('../../utils');

/**
 * Find service and scrape file
 * @param link
 * @returns {Promise.<*>}
 */
const checkService = async link => {
	const service = utils.getService(link);

	if (!service) {
		console.log('Service not found', link);
		return null;
	}

	try {
		const { file } = await utils.scrapeIt(link, service.scrape);
		return file;
	} catch (err) {
		console.log('Cannot work with', link);
		return null;
	}
};

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
