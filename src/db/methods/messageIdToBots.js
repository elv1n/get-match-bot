const telegram = require('../../api/telegram.v0');

const putOrWait = async (db, ...args) => {
	try {
		await db.put(...args);
		return 'success';
	} catch (e) {
		if (e.status === 409) {
			console.log('catch error');
			await setTimeout(() => putOrWait(db, ...args), 50);
		}
	}
};
/**
 * Convert records to support multiple bots
 * @param db
 * @returns {Promise.<boolean>}
 */
module.exports = async function resetInDownload(db) {
	const docs = await db.findBy({ message_id: { $exists: true } });
	let chatId = null;
	const { id: botId } = await telegram.bot.getMe();
	await docs.reduce(async (promise, doc) => {
		await promise;
		console.log(chatId);
		if (!doc.message_id || !botId) {
			console.log('not found message and bot');
			return Promise.resolve();
		}
		if (!chatId) {
			try {
				const res = await telegram.editMatch(doc);
				chatId = res.chat.id;
			} catch (e) {
				throw new Error(e);
			}
		}

		if (chatId) {
			const { message_id } = doc;
			delete doc.message_id;
			return putOrWait(
				db,
				{
					...doc,
					bots: [
						{
							chatId,
							botId,
							message_id
						}
					]
				},
				{ _rev: doc._rev }
			);
		}
		return Promise.resolve();
	}, Promise.resolve());
	console.log('finish');
	return Promise.resolve(true);

	//console.log(docs.length);
	//return await Promise.all(
	//	docs.map(async doc => {
	//		await db.updateOrWait(doc._id, { inDownload: false });
	//	})
	//);
};
