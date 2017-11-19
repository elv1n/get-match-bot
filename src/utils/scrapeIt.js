const scrapeItOriginal = require('scrape-it');
const request = require('request-promise');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

/**
 * scrapeIt
 * A scraping module for humans.
 *
 * @name scrapeIt
 * @function
 * @param {String|Object} url The page url or request options.
 * @param {Object} opts The options passed to `scrapeHTML` method.n.
 * @return {Promise} A promise object.
 */
function scrapeIt(url, opts) {
	return request({
		url,
		encoding: null
	})
		.then(body => {
			const utf8String = iconv.decode(body, 'windows-1251');
			const $ = cheerio.load(utf8String);

			return scrapeItOriginal.scrapeHTML($, opts);
		})
		.catch(err => {
			console.error(`Cannt parse ${url}`);
		});
}

module.exports = scrapeIt;
