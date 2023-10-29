const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const cors = require("cors");
const { token } = require("./token");
const bot = new TelegramBot(token, { polling: true });
const app = express();
app.use(express.json());
app.use(cors());

const _url = "https://tangerine-tartufo-2f93e7.netlify.app/";
bot.on("message", async (msg) => {
	const { text } = msg;
	const chatId = msg.chat.id;
	if (text === "/start") {
		await bot.sendMessage(chatId, "Сделать заказ", {
			reply_markup: {
				inline_keyboard: [[{ text: "Тык", web_app: { url: _url } }]],
			},
		});
		await bot.sendMessage(chatId, "Ниже появится форма для заполнения", {
			reply_markup: {
				keyboard: [
					[{ text: "Заполнить форму", web_app: { url: _url + "form" } }],
				],
			},
		});
	}

	if (msg?.web_app_data?.data) {
		try {
			const data = JSON.parse(msg.web_app_data.data);
			await bot.sendMessage(chatId, "Спасибо за обратную связь!");
			await bot.sendMessage(chatId, `Страна: ${data.country}`);
			await bot.sendMessage(chatId, `Улица: ${data.street}`);
		} catch (error) {}
	}
});

app.post("/data", async (req, res) => {
	const { queryId, products, totalPrice } = req.body;
	try {
		await bot.answerWebAppQuery(queryId, {
			type: "product",
			id: queryId,
			title: "Успешная покупка",
			input_message_content: {
				message_text: `Поздравляем с покупкой на сумму ${totalPrice}`,
			},
		});
		return res.status(200).json({});
	} catch (error) {
		await bot.answerWebAppQuery(queryId, {
			type: "product",
			id: queryId,
			title: "Ошибка(",
			input_message_content: {
				message_text: `Не удалось оплатить}`,
			},
		});
		return res.status(500).json({});
	}
});
const Port = 8000;
app.listen(Port, () => console.log(`start server on PORT ${Port}`));
