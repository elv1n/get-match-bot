const domain = 'streamable.com';

const scrape = {
	file: {
		selector: '#download',
		attr: 'href'
	},
	script: {
		selector: '#embed-js',
		how: 'text'
	}
};

function findTextAndReturnRemainder(target, variable) {
	const chopFront = target.substring(
		target.search(variable) + variable.length,
		target.length
	);
	return chopFront.substring(0, chopFront.search(';'));
}

const afterScrape = ({ file, script }) => {
	if (!file) {
		return null;
	}
	const findAndClean = findTextAndReturnRemainder(
		script,
		'var videoObject ='
	);
	const { files } = JSON.parse(findAndClean);
	const { url, height } = files.mp4;
	return {
		file: url,
		quality: height
	};
};

module.exports = {
	domain,
	scrape,
	afterScrape
};
