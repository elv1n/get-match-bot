const db = require('./db');
const checker = require('./module/checker');
const scrapper = require('./module/scrapper');

db.init().then(() => {
	scrapper.run();
	scrapper.init();
	checker.init();
});
