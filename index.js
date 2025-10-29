const { Telegraf } = require('telegraf');
const express = require('express');

const app = express();
const bot = new Telegraf('8353179858:AAFMgCR5KLWOh7-4Tid-A4x1RAwPd3-Y9xE');

const ADMIN_ID = 5985723887; // <--- /id dan oling
const DOMAIN = 'https://namoz-bot.onrender.com';
const CHANNEL = '@Islomxon_masjidi';

// Web App faylini berish
app.get('/webapp.html', (req, res) => {
  res.sendFile(__dirname + '/webapp.html');
});

// Webhook yo'li
app.use('/webhook', bot.webhookCallback('/webhook'));

// /start
bot.command('start', (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.reply('Faqat admin.');

  ctx.reply('Namoz vaqtlarini yuborish:', {
    reply_markup: {
      inline_keyboard: [[
        { text: 'Web App', web_app: { url: `${DOMAIN}/webapp.html` } }
      ]]
    }
  });
});

// /id
bot.command('id', (ctx) => {
  ctx.reply(`Sizning ID: ${ctx.from.id}`);
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

// Webhook o'rnatish (server ishga tushganda)
app.listen(process.env.PORT || 3000, async () => {
  const url = `${DOMAIN}/webhook`;
  try {
    await bot.telegram.setWebhook(url);
    console.log('Webhook o‘rnatildi:', url);
  } catch (err) {
    console.error('Webhook xatosi:', err.message);
  }
  console.log('Server ishlayapti:', url);
});
