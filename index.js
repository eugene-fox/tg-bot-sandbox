require("dotenv").config();

const { BOT_TOKEN } = process.env;

const fetch = require("node-fetch");

const { Telegraf } = require("telegraf");
const { message } = require("telegraf/filters");

const bot = new Telegraf(BOT_TOKEN);
bot.start((ctx) => ctx.reply("Welcome"));
bot.help((ctx) => ctx.reply("Send me a sticker"));
bot.on(message("sticker"), (ctx) => ctx.reply("👍"));
bot.hears("hi", (ctx) => ctx.reply("Hey there"));
bot.telegram.setMyCommands([
  { command: "/weather", description: "Укажите город" },
  { command: "/animals", description: "Хочу животное!" },
  { command: "/keyboard", description: "Хочу клавиатуру!" },
]);
bot.command("weather", async (ctx) => {
  const { text } = ctx.update.message;
  const userText = text.split(" ")[1];
  ctx.deleteMessage();
  const weather = await getWeatherByCityName(userText);
  ctx.reply(weather);
});

bot.command("animals", async (ctx) => {
  ctx.deleteMessage();
  bot.telegram.sendMessage(ctx.chat.id, "Hello with animals!", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Cat!", callback_data: "cat" }],
        [{ text: "Dog!", callback_data: "dog" }],
      ],
    },
  });
});

bot.command("keyboard", async (ctx) => {
  bot.telegram.sendMessage(ctx.chat.id, "Want to test keyboards?", {
    reply_markup: {},
  });
});

bot.action("cat", (ctx) => {
  bot.telegram.sendPhoto(ctx.chat.id, { source: "./res/rui2.png" });
});

bot.action("dog", (ctx) => {
  bot.telegram.sendPhoto(ctx.chat.id, { source: "./res/rui3.png" });
});

const getWeatherByCityName = async (cityName) => {
  const result = await fetch(`https://wttr.in/${cityName}?format=4`);
  const resultParsed = await result.text();
  return resultParsed;
};

bot.launch();
