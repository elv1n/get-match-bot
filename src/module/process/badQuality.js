const db = require('../../db');
const reloadMatch = require('../parser/reloadMatch');

const { DAY } = require('../../constants/time');
const MATCH = require('../../constants/match');

const badQuality = async () => {
	const timestamp = new Date() - DAY;
	const docs = await db.findBy({
		quality: { $lt: 720 },
		timestamp: { $gt: timestamp }
	});

	docs.map(async doc => {
		const match = await reloadMatch.parseMatch(doc._id);
		if (match.quality > doc.quality) {
			const { videos = [], uploadUrl, quality } = doc;
			if (!videos.some(video => video.quality === quality)) {
				videos.push({ quality, url: uploadUrl });
			}
			await db.update(doc._id, {
				...MATCH.defaultProps,
				...match,
				videos
			});
		}
	});
};

module.exports = badQuality;
