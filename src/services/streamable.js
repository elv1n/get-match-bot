const domain = 'streamable.com';

const scrape = {
	file: {
		selector: '#download',
		attr: 'href'
	}
};

module.exports = {
	domain,
	scrape
};
