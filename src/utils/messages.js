function match({ teams, date, uploadUrl }) {
	return `<b>${teams.home} - ${teams.guest}</b> (${date})

<a href="${uploadUrl}">Open video</a>`;
}

module.exports = {
	match
};
