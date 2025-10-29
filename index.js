const { Telegraf } = require('telegraf');
const express = require('express');

const app = express();

// === MUHIM QISMLAR ===
const TOKEN = process.env.BOT_TOKEN; // Render dagi Environment Variable
const DOMAIN = process.env.DOMAIN;   // Render dagi Environment Variable
const ADMIN_IDS = process.env.ADMIN_IDS.split(','); // 7894421569,5985723887

const bot = new Telegraf(TOKEN);

// === Bot komandalarini yozamiz ===
bot.start((ctx) => {
  const userId = ctx.from.id.toString();

  if (!ADMIN_IDS.includes(userId)) {
    return ctx.reply("Faqat adminlar uchun ruxsat berilgan.");
  }

  ctx.reply("Assalomu alaykum, admin!");
});

// === Webhook ===
app.use(express.json());

app.post(`/webhook/${TOKEN}`, (req, res) => {
  bot.handleUpdate(req.body, res);
  res.sendStatus(200);
});

// === Serverni ishga tushiramiz ===
app.listen(3000, async () => {
  console.log(`Server ishlayapti: ${DOMAIN}/webapp.html`);
  await bot.telegram.setWebhook(`${DOMAIN}/webhook/${TOKEN}`);
  console.log('Webhook o‘rnatildi');
});
