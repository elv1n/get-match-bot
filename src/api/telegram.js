const config = require('config');
const TelegramBot = require('node-telegram-bot-api');

const messages = require('../utils/messages');

const settings = config.get('telegram');

// Property to collect bots info
let BOTS = null;

const createBot = token => new TelegramBot(token, { polling: true });

/**
 * Init bots
 * @returns {Promise.<void>}
 */
const init = async () => {
	BOTS = await Promise.all(
		settings.map(async ({ token, channel, ...props }) => {
			const bot = createBot(token);
			const { id } = await bot.getMe();
			return {
				id,
				bot,
				channel,
				...props
			};
		})
	);

	/**
	 * Run accept message with multiple bots
	 */
	ruleForBots(acceptMessage)();
	return BOTS;
};

if (!Array.isArray(settings)) {
	console.error('Telegram config should be an array');
}

/**
 * Run function for multiple bots
 * @param rule
 */
const ruleForBots = rule => (...args) =>
	Promise.all(
		BOTS.map(async ({ bot, channel }) => await rule(bot, channel)(...args))
	);

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
 * @param doc
 * @param bot
 * @param channel
 * @param message_id
 * @returns {Promise}
 */
const editMatch = (doc, { bot, channel, message_id }) => {
	const message = messages.match(doc);
	const buttons = messages.getButtons(doc);
	return bot.editMessageText(message, {
		message_id,
		chat_id: channel,
		parse_mode: 'HTML',
		reply_markup: buttons
	});
};

const handleTelegramResponse = res =>
	res.map(({ message_id, from, chat }) => ({
		message_id,
		fromId: from.id,
		chatId: chat.id
	}));

const editMultipleMatch = async doc => {
	const { bots } = doc;
	if (Array.isArray(bots)) {
		return await Promise.all(
			bots.map(async ({ message_id, fromId, chatId }) => {
				const BOT = BOTS.find(({ id }) => id === fromId);
				if (BOT) {
					return await editMatch(doc, {
						bot: BOT.bot,
						channel: chatId,
						message_id
					});
				}
			})
		);
	}
	return null;
};

const multipleSendMatch = ruleForBots(sendMatch);

const resolveResponse = func => async (...args) =>
	handleTelegramResponse(await func(...args));

module.exports = {
	init,
	sendMatch: resolveResponse(multipleSendMatch),
	editMatch: editMultipleMatch
};
