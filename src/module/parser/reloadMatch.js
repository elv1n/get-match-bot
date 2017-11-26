const db = require('../../db');
const PARSE_RESOURCE = require('../../constants').PARSE_RESOURCE;

const getMatch = require('./getMatch');
const getLinks = require('./getLinks');

const parseMatch = async _id => {
	const match = await getMatch({
		link: PARSE_RESOURCE.HIGHLIGHTS + '/' + _id + '.html'
	});
	return await getLinks(match);
};

const reloadMatch = async _id => {
	const match = await parseMatch(_id);
	return await db.update(_id, match);
};
module.exports = reloadMatch;
module.exports.parseMatch = parseMatch;
