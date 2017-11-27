/**
 * Create pouch db and add additional utils around db
 */

const PouchDB = require('pouchdb-node');
PouchDB.plugin(require('pouchdb-find'));

const resetInDownload = require('./methods/resetInDownload');
const messageIdToBots = require('./methods/messageIdToBots');
const MATCH = require('../constants/match');

const utils = require('../utils');

const db = new PouchDB(utils.getAssets('/db/matches'));

db
	.info()
	.then(result => {
		// handle result
		console.log(result);
	})
	.catch(err => {
		console.log(err);
	});

/**
 * Init indexes before start
 */
const init = () =>
	db
		.createIndex({
			index: {
				fields: MATCH.searchFields
			}
		})
		.then(() => resetInDownload(db))
		.then(() => messageIdToBots(db));

/**
 * Check id on existing in db
 * @param {string} id
 */
const exist = id => {
	return db
		.get(id)
		.then(() => {
			return Promise.resolve(true);
		})
		.catch(() => {
			return Promise.resolve(false);
		});
};

/**
 * Handler to update db record
 * @param {string} id
 * @param {object} data
 */
const update = (id, data) =>
	db
		.get(id)
		.then(doc =>
			db
				.put(Object.assign({}, doc, data, { _rev: doc._rev }))
				.then(() => console.log('up db', data))
		);

/**
 * Find and collect all documents by indexed parameters
 * @param {object} selector
 */
const findBy = selector =>
	db
		.find({
			selector,
			fields: ['_id']
		})
		.then(({ docs }) => Promise.all(docs.map(({ _id }) => db.get(_id))));

/**
 * Prevent from crash when save data asynchronous
 * @param {string, object} args
 */
const updateOrWait = async (...args) => {
	try {
		await update(...args);
		return 'success';
	} catch (e) {
		if (e.status === 409) {
			await setTimeout(() => updateOrWait(...args), 1000);
		}
	}
};

module.exports = db;
module.exports.exist = exist;
module.exports.update = update;
module.exports.init = init;
module.exports.findBy = findBy;
module.exports.updateOrWait = updateOrWait;
