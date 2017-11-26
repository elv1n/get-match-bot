const get = require('lodash/get');
const INDEX_P = require('../constants/quality').INDEX_P;

const domain = 'vk.com';

const scrape = {
	player: {
		selector: '#video_player',
		how: player => {
			const sources = [];
			player.find('source').map((i, s) => {
				sources.push(get(s, 'attribs.src'));
			});
			return {
				duration: player.attr('data-duration'),
				sources: sources.filter(Boolean)
			};
		}
	}
};

const sourceIndex = source =>
	INDEX_P.findIndex(p => source.includes(p + '.mp4'));

const afterScrape = ({ player }) => {
	const { sources, duration = 0 } = player;
	const file = sources.sort((a, b) => sourceIndex(a) < sourceIndex(b))[0];

	return {
		file,
		duration: parseFloat(duration),
		quality: INDEX_P[sourceIndex(file)]
	};
};

module.exports = {
	domain,
	scrape,
	afterScrape
};
