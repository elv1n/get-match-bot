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

module.exports = checkService;
