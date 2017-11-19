const ProxyLists = require('proxy-lists');

const options = {
	countries: ['ua', 'ru'],
	protocols: ['https'],
	sourcesWhiteList: ['freeproxylists']
};

const { API } = require('../constants');
module.exports = () => {
	console.time('getProxy');
	const gettingProxies = ProxyLists.getProxies(options);

	gettingProxies.on('data', proxies => {
		console.timeEnd('getProxy');
		console.log(proxies);
	});

	gettingProxies.on('error', error => {
		// Some error has occurred.
		console.error(error);
	});

	gettingProxies.once('end', () => {
		// Done getting proxies.
	});
};
