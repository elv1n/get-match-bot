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
		const result = await utils.scrapeIt(link, service.scrape);
		if (typeof service.afterScrape === 'function') {
			return service.afterScrape(result);
		}
		return result;
	} catch (err) {
		return null;
	}
};

module.exports = checkService;
