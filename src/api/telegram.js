const config = require('config');
const TelegramBot = require('node-telegram-bot-api');

const messages = require('../utils/messages');

const settings = config.get('telegram');

if (!Array.isArray(settings)) {
	console.error('Telegram config should be an array');
}

const createBot = token => new TelegramBot(token, { polling: true });

const BOTS = settings.map(({ token, channel }) => ({
	bot: createBot(token),
	channel
}));

/**
 * Run function for multiple bots
 * @param rule
 */
const ruleForBots = rule => (...args) =>
	BOTS.map(({ bot, channel }) => rule(bot, channel)(...args));

/**
 * Return message when write directly to bot
 */

const acceptMessage = bot => () =>
	bot.on('message', msg =>
		bot.sendMessage(
			msg.chat.id,
			'Sorry, we dont work directly with users now.'
		)
	);

/**
 * Send match details to telegram channel
 * @param bot
 * @param channel
 */
const sendMatch = (bot, channel) => doc => {
	const message = messages.match(doc);
	return bot.sendMessage(channel, message, { parse_mode: 'HTML' });
};

/**
 * Edit message when find better video quality
 * @param bot
 * @param channel
 */
const editMatch = (bot, channel) => doc => {
	const { message_id } = doc;
	const message = messages.match(doc);
	const buttons = messages.getButtons(doc);
	return bot.editMessageText(message, {
		message_id,
		chat_id: channel,
		parse_mode: 'HTML',
		reply_markup: buttons
	});
};
/**
 * Run accept message with multiple bots
 */
ruleForBots(acceptMessage)();

const multipleSendMatch = ruleForBots(sendMatch);

module.exports = {
	sendMatch: (...args) => Promise.all(multipleSendMatch(...args)), // Waif for all responses
	editMatch: ruleForBots(editMatch)
};
