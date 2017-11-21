module.exports = async function resetInDownload(db) {
	const docs = await db.findBy({ download: false, inDownload: true });
	return await Promise.all(
		docs.map(async doc => {
			await db.updateOrWait(doc._id, { inDownload: false });
		})
	);
};
