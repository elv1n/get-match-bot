const path = require('path');
const utils = require('../../utils');
const parser = require('../../utils/parser');

module.exports = async  ({ link }) => {
	const pathname = path.basename(link, path.extname(link));

	const match = await utils.scrapeIt(link, {
		title: {
			selector: 'title',
			how: 'text'
		},
		reviews: {
			listItem: '.article-main td',
			data: {
				link: {
					selector: 'a',
					attr: 'onclick',
					convert: parser.link
				}
			}
		}
	});

	return { ...match, pathname };
};