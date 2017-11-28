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
	if (match) {
		return await db.update(_id, match);
	}
	try {
		const doc = await db.get(_id);
		return await db.remove(doc);
	} catch (e) {
		console.log(`Cannot remove doc ${_id}`, e);
		return null;
	}
};
module.exports = reloadMatch;
module.exports.parseMatch = parseMatch;
