const config = require('config');
const TelegramBot = require('node-telegram-bot-api');

const messages = require('../utils/messages');

const TOKEN = config.get('telegramOld.token');
const CHANNEL = `${config.get('telegramOld.channel')}`;

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

/**
 * Edit message when find better video quality
 * @param {object} doc
 */
function editMatch(doc) {
	const { message_id } = doc;
	const message = messages.match(doc);
	const buttons = messages.getButtons(doc);
	return bot.editMessageText(message, {
		message_id,
		chat_id: CHANNEL,
		parse_mode: 'HTML',
		reply_markup: buttons
	});
}

module.exports = {
	sendMatch,
	editMatch,
	bot
};
