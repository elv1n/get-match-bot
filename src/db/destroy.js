const db = require('./index');

db.destroy().then(() => {
	process.exit(0);
});
