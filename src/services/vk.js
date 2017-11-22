const domain = 'vk.com';

const scrape = {
	file: {
		selector: '#video_player source',
		attr: 'src'
	}
};

module.exports = {
	domain,
	scrape
};
