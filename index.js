const { Telegraf } = require('telegraf');
const express = require('express');

const app = express();
const bot = new Telegraf('8353179858:AAFMgCR5KLWOh7-4Tid-A4x1RAwPd3-Y9xE');

const ADMIN_ID = 5985723887; // <--- /id dan oling
const DOMAIN = 'https://namoz-bot-production.up.railway.app'; // <--- TO'G'RI URL
const CHANNEL = '@Islomxon_masjidi';

// Web App faylini berish
app.get('/webapp.html', (req, res) => {
  res.sendFile(__dirname + '/webapp.html');
});

// Bosh sahifa (Cannot GET / ni tuzatish)
app.get('/', (req, res) => {
  res.send('<h1>Namoz Bot ishlayapti!</h1><a href="/webapp.html">Web App</a>');
});

// Webhook
app.use('/webhook', bot.webhookCallback('/webhook'));

// /start
bot.start((ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.reply('Faqat admin.');

  ctx.reply('Namoz vaqtlari:', {
    reply_markup: {
      inline_keyboard: [[
        { text: 'Web App', web_app: { url: `${DOMAIN}/webapp.html` } }
      ]]
    }
  });
});

// /id
bot.command('id', (ctx) => {
  ctx.reply(`ID: ${ctx.from.id}`);
});

// Web App ma'lumotlari
bot.on('web_app_data', async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  try {
    const data = JSON.parse(ctx.webAppData.data);
    const text = `Islomxon jome masjidi

Sana: ${data.date}
Bomdod: ${data.bomdod}
Peshin: ${data.peshin}
Asr: ${data.asr}
Shom: ${data.shom}
Hufton: ${data.hufton}

${data.izoh}

https://t.me/Islomxon_masjidi`;

    await bot.telegram.sendMessage(CHANNEL, text);
    await ctx.reply('Post yuborildi!');
  } catch (e) {
    ctx.reply('Xato: ' + e.message);
  }
});

// Serverni ishga tushirish
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    await bot.telegram.setWebhook(`${DOMAIN}/webhook`);
    console.log(`Webhook o‘rnatildi: ${DOMAIN}/webhook`);
  } catch (err) {
    console.error('Webhook xatosi:', err.message);
  }
  console.log(`Server ishlayapti: ${DOMAIN}`);
});
