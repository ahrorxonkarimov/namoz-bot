const { Telegraf } = require('telegraf');
const express = require('express');

const app = express();
const bot = new Telegraf('8353179858:AAFMgCR5KLWOh7-4Tid-A4x1RAwPd3-Y9xE');

const ADMIN_ID = 5985723887; // <--- /id dan oling
const DOMAIN = 'https://namoz-bot.onrender.com';
const CHANNEL = '@Islomxon_masjidi';

app.get('/webapp.html', (req, res) => {
  res.sendFile(__dirname + '/webapp.html');
});

app.use(bot.webhookCallback('/webhook'));

bot.command('start', (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.reply('Faqat admin.');

  ctx.reply('Namoz vaqtlarini yuborish:', {
    reply_markup: {
      inline_keyboard: [[{ text: 'Web App', web_app: { url: `${DOMAIN}/webapp.html` } }]]
    }
  });
});

bot.command('id', (ctx) => ctx.reply(`ID: ${ctx.from.id}`));

bot.on('web_app_data', async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  const data = JSON.parse(ctx.webAppData.data);
  const text = `🕌 *Islomxon Jome Masjidi* 🕌

📅 *Sana:* ${data.date}

🌅 *Bomdod:* \`${data.bomdod}\`
☀️ *Peshin:* \`${data.peshin}\`
🌇 *Asr:* \`${data.asr}\`
🌆 *Shom:* \`${data.shom}\`
🌙 *Hufton:* \`${data.hufton}\`

${data.izoh}

📍 Hududingiz uchun to‘g‘ri vaqtlarda namoz o‘qing!
🤲 Allah qabul qilsin!

https://t.me/Islomxon_masjidi`;

  try {
    await bot.telegram.sendMessage(CHANNEL, text, { parse_mode: 'MarkdownV2' });
    await ctx.reply('✅ *Post kanalga yuborildi!*', {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [[{ text: 'Kanalga o‘tish', url: 'https://t.me/Islomxon_masjidi' }]] }
    });
  } catch (e) {
    ctx.reply('❌ Xato: ' + e.message);
  }
});

bot.telegram.setWebhook(`${DOMAIN}/webhook`);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Ishlayapti'));
