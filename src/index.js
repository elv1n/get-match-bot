const db = require('./db');
const telegram = require('./api/telegram');

const checker = require('./module/checker');
const scrapper = require('./module/scrapper');

db.init().then(async () => {
	await telegram.init();
	scrapper.run();
	scrapper.init();
	checker.run();
	checker.init();
});
