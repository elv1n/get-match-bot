const utils = require('../../utils');
const parser = require('../../utils/parser');
const findValidService = require('./findValidService');

module.exports = async ({ reviews, title, pathname, ...props }) => {
	const matchInfo = parser.matchInfo(title);
	const links = reviews.map(({ link }) => link).filter(Boolean);
	const result = await findValidService(links);
	if (result && result.file) {
		return {
			...matchInfo,
			...result,
			...props,
			_id: pathname,
		};
	} else {
		console.log('Valid links not found', links);
		return null;
	}
};