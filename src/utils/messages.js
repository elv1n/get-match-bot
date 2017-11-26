function match({ teams, date, uploadUrl, quality, videos }) {
	const qualityInfo = videos ? '' : ` ${quality}p`;
	return `<b>${teams.home} - ${teams.guest}</b> (${date})

<a href="${uploadUrl}">Open in browser${qualityInfo}</a>`;
}

function getButtons({ videos, uploadUrl, quality }) {
	if (Array.isArray(videos)) {
		const buttons = [...videos, { url: uploadUrl, quality }].map(
			({ url, quality }) => [
				{
					text: quality,
					url
				}
			]
		);
		return { inline_keyboard: buttons };
	}
	return null;
}

module.exports = {
	match,
	getButtons
};
