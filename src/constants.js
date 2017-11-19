const STREAMABLE = 'STREAMABLE';

const PRIORITY = [STREAMABLE];
const SERVICES = [
	{
		domain: 'streamable.com',
		order: 1,
		name: STREAMABLE,
		scrape: {
			file: {
				selector: '#download',
				attr: 'href'
			}
		}
	}
];

const links = {
	[STREAMABLE]: code => 'https://streamable.com/' + code
};
module.exports = {
	SERVICES,
	PRIORITY,
	links
};
