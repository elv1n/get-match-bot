const config = require('config');
const TelegramBot = require('node-telegram-bot-api');

const messages = require('../utils/messages');

const TOKEN = config.get('telegram.token');
const CHANNEL = `${config.get('telegram.channel')}`;

const bot = new TelegramBot(TOKEN, { polling: true });

/**
 * Return message when write directly to bot
 */
bot.on('message', msg =>
	bot.sendMessage(msg.chat.id, 'Sorry, we dont work directly with users now.')
);

/**
 * Send match details to telegram channel
 * @param {object} doc
 */
function sendMatch(doc) {
	const message = messages.match(doc);
	return bot.sendMessage(CHANNEL, message, { parse_mode: 'HTML' });
}

module.exports = {
	sendMatch
};
