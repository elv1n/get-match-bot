const STREAMABLE = 'STREAMABLE';
const OK = 'OK';
const VK = 'VK';

const PRIORITY = [VK, STREAMABLE, OK];
const SERVICES = [
	{
		domain: 'streamable.com',
		name: STREAMABLE,
		scrape: {
			file: {
				selector: '#download',
				attr: 'href'
			}
		}
	},
	{
		domain: 'vk.com',
		name: VK,
		scrape: {
			file: {
				selector: '#video_player source',
				attr: 'src'
			}
		}
	},
	{
		domain: 'ok.ru',
		name: OK,
		scrape: {
			file: {
				selector: '[data-module="OKVideo"]',
				attr: 'data-options',
				convert: options => {
					options = JSON.parse(options);
					if (options && options.flashvars) {
						const { videos } = JSON.parse(
							options.flashvars.metadata
						);
						return videos.reverse()[0].url;
					}
					return null;
				}
			}
		}
	}
];

const links = {
	[STREAMABLE]: code => 'https://streamable.com/' + code
};

const URL = 'http://gooool.org/';
const HIGHLIGHTS = `${URL}obzors`;
const LINKS_SELECTOR = '.articles .item';

module.exports = {
	SERVICES,
	PRIORITY,
	links,
	MATCH: {
		HIGHLIGHTS,
		LINKS_SELECTOR
	}
};
