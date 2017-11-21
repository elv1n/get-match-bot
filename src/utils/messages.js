function match({ teams, date, uploadUrl }) {
	return `<b>${teams.home} - ${teams.guest}</b> (${date})

<a href="${uploadUrl}">Open in browser</a>`;
}

module.exports = {
	match
};
