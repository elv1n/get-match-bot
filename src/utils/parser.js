const regex = require('./regex');

const isStr = str => typeof str === 'string';
function getTeams(str) {
	const teamsStr = isStr(str) ? str.split(' обзор матча')[0] : null;
	const teams = isStr(teamsStr) ? teamsStr.split(' – ') : [null, null];

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
