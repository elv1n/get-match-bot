function match({ teams, date, uploadUrl }) {
	return `<b>${teams.home} - ${teams.guest}</b> (${date})

<a href="${uploadUrl}">Open in browser</a>`;
}

function getButtons({ videos, uploadUrl, quality }) {
	if (Array.isArray(videos)) {
		const buttons = [...videos, { url: uploadUrl, quality }].map(
			({ url, quality }) =>
				url && [
					{
						text: quality,
						url
					}
				]
		);
		return buttons.length ? { inline_keyboard: buttons } : null;
	}
	return null;
}

module.exports = {
	match,
	getButtons
};
