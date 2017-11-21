const db = require('../../db');
const MATCH = require('../../constants').MATCH;

const getMatch = require('./getMatch');
const getLinks = require('./getLinks');

module.exports = async _id => {
	const match = await getMatch({
		link: MATCH.HIGHLIGHTS + '/' + _id + '.html'
	});
	const matchWithLinks = await getLinks(match);
	return await db.update(_id, matchWithLinks);
};
