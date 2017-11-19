const PARSE_IN_OPEN = /\(([^)]+)\)/;

const regex = (str, pattern, flags = 'i') =>
	new RegExp(pattern, flags).match(str);

function parseLink(link) {
	if (typeof link !== 'string') {
		return null;
	}
	const reg = link.match(PARSE_IN_OPEN);
	const href = reg[1].split("','")[0];
	return href && href.replace("'", '');
}

function matchDate(date) {
	const reg = date.match(PARSE_IN_OPEN);
	return reg[1];
}

module.exports = {
	link: parseLink,
	matchDate: matchDate
};
