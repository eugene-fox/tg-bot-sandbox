require("dotenv").config();

const { BOT_TOKEN } = process.env;

const fetch = require("node-fetch");

const { Telegraf } = require("telegraf");
const { message } = require("telegraf/filters");
const { Markup } = require("telegraf");

const bot = new Telegraf(BOT_TOKEN);
const weclomeText =
  "Привет! Я Ким Чен Сплит 🚀Помогу тебе разделить расходы с друзьями или коллегами в ресторанах и поездках. Нажми кнопку ниже для создания группы";

bot.start((ctx) => {
  ctx.reply(
    weclomeText,
    Markup.inlineKeyboard([
      [Markup.button.callback("Создать группу", "createGroup")],
    ])
      .oneTime()
      .resize()
  );
  ctx.deleteMessage();
});

bot.command("expenses", async (ctx) => {
  await bot.telegram.sendPhoto(ctx.chat.id, {
    source: "./res/emil-kalibradov-K05Udh2LhFA-unsplash.png",
  });

  await bot.telegram.sendMessage(
    ctx.chat.id,
    "🥇 Вы находитесь в группе %группаНейм%"
  );

  await bot.telegram.sendMessage(
    ctx.chat.id,
    "🚧 Далее идет текст с описанием операций, возможностями и возможно какая-то базовая общая инфа по конкретной групп 🚧"
  );

  await bot.telegram.sendMessage(
    ctx.chat.id,
    "🤑 Воспользуйтесь меню, что бы добавить расходы, либо выберете другую группу. ",
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "➕ Добавить расходы", callback_data: "addExpenses" },
            { text: "↩ Выбор группы", callback_data: "groupChoose" },
          ],
        ],
      },
    }
  );
});

bot.help((ctx) => ctx.reply("Send me a sticker"));
bot.on(message("sticker"), (ctx) => ctx.reply("👍"));
bot.hears("hi", (ctx) => ctx.reply("Hey there"));
bot.telegram.setMyCommands([
  { command: "/start", description: "Стартовый экран" },
  { command: "/expenses", description: "Интерфейс добавления трат" },
  { command: "/weather", description: "Укажите город" },
  { command: "/animals", description: "Хочу животное!" },
  { command: "/keyboard", description: "Хочу клавиатуру!" },
  { command: "/special", description: "Хочу клавиатуру!" },
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
    reply_markup: JSON.stringify({
      hide_keyboard: true,
    }),
  });
});

bot.command("onetime", (ctx) =>
  ctx.reply(
    "One time keyboard",
    Markup.keyboard(["/simple", "/inline", "/pyramid"]).oneTime().resize()
  )
);

bot.command("custom", async (ctx) => {
  return await ctx.reply(
    "Custom buttons keyboard",
    Markup.keyboard([
      ["🔍 Search", "😎 Popular"], // Row1 with 2 buttons
      ["☸ Setting", "📞 Feedback"], // Row2 with 2 buttons
      ["📢 Ads", "⭐️ Rate us", "👥 Share"], // Row3 with 3 buttons
    ])
      .oneTime()
      .resize()
  );
});

bot.hears("🔍 Search", (ctx) => ctx.reply("Yay!"));
bot.hears("📢 Ads", (ctx) => ctx.reply("Free hugs. Call now!"));

bot.command("special", (ctx) => {
  return ctx.reply(
    "Special buttons keyboard",
    Markup.keyboard([
      Markup.button.contactRequest("Send contact"),
      Markup.button.locationRequest("Send location"),
    ]).resize()
  );
});

bot.command("pyramid", (ctx) => {
  return ctx.reply(
    "Keyboard wrap",
    Markup.keyboard(["one", "two", "three", "four", "five", "six"], {
      wrap: (btn, index, currentRow) => currentRow.length >= (index + 1) / 2,
    })
  );
});

bot.command("simple", (ctx) => {
  return ctx.replyWithHTML(
    "<b>Coke</b> or <i>Pepsi?</i>",
    Markup.keyboard(["Coke", "Pepsi"])
  );
});

bot.command("inline", (ctx) => {
  return ctx.reply("<b>Coke</b> or <i>Pepsi?</i>", {
    parse_mode: "HTML",
    ...Markup.inlineKeyboard([
      Markup.button.callback("Coke", "Coke"),
      Markup.button.callback("Pepsi", "Pepsi"),
    ]),
  });
});

bot.command("random", (ctx) => {
  return ctx.reply(
    "random example",
    Markup.inlineKeyboard([
      Markup.button.callback("Coke", "Coke"),
      Markup.button.callback("Dr Pepper", "Dr Pepper", Math.random() > 0.5),
      Markup.button.callback("Pepsi", "Pepsi"),
    ])
  );
});

bot.command("caption", (ctx) => {
  return ctx.replyWithPhoto(
    { url: "https://picsum.photos/200/300/?random" },
    {
      caption: "Caption",
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        Markup.button.callback("Plain", "plain"),
        Markup.button.callback("Italic", "italic"),
      ]),
    }
  );
});

bot.hears(/\/wrap (\d+)/, (ctx) => {
  return ctx.reply(
    "Keyboard wrap",
    Markup.keyboard(["one", "two", "three", "four", "five", "six"], {
      columns: parseInt(ctx.match[1]),
    })
  );
});

bot.action("Dr Pepper", (ctx, next) => {
  return ctx.reply("👍").then(() => next());
});

bot.action("plain", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageCaption(
    "Caption",
    Markup.inlineKeyboard([
      Markup.button.callback("Plain", "plain"),
      Markup.button.callback("Italic", "italic"),
    ])
  );
});

bot.action("italic", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageCaption("_Caption_", {
    parse_mode: "Markdown",
    ...Markup.inlineKeyboard([
      Markup.button.callback("Plain", "plain"),
      Markup.button.callback("* Italic *", "italic"),
    ]),
  });
});

bot.action(/.+/, (ctx) => {
  return ctx.answerCbQuery(`Oh, ${ctx.match[0]}! Great choice`);
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
