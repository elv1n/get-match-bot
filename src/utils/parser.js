const regex = require('./regex');

const isStr = str => typeof str === 'string';

/**
 * On parsed service in titles using two types of hyphen
 * @type {string}
 */
const hyphen1 = ' – ';
const hyphen2 = ' - ';
const splitTeams = (str, sep) =>
	isStr(str) && str.split(sep).length === 2 ? str.split(sep) : null;

function getTeams(str) {
	const teamsStr = isStr(str) ? str.split(' обзор матча')[0] : null;
	const teams = splitTeams(teamsStr, hyphen1) ||
		splitTeams(teamsStr, hyphen2) || [null, null];

	return {
		home: teams[0],
		guest: teams[1]
	};
}

function matchInfo(title) {
	return {
		teams: getTeams(title),
		date: regex.matchDate(title)
	};
}

module.exports = {
	matchInfo,
	link: regex.link
};
