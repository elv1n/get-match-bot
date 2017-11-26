const OK = require('../services/ok');
const VK = require('../services/vk');
const STREAMABLE = require('../services/streamable');

const PRIORITY = [VK.domain, STREAMABLE.domain, OK.domain];
const SERVICES = [VK, OK, STREAMABLE];

const URL = 'http://gooool.org/';
const HIGHLIGHTS = `${URL}obzors`;
const LINKS_SELECTOR = '.articles .item';

module.exports = {
	SERVICES,
	PRIORITY,
	PARSE_RESOURCE: {
		HIGHLIGHTS,
		LINKS_SELECTOR
	}
};
