const { Telegraf } = require('telegraf');
const express = require('express');
const path = require('path');

const app = express();

// ==== O'ZGARTIRING ====
const TOKEN = '8353179858:AAFMgCR5KLWOh7-4Tid-A4x1RAwPd3-Y9xE';
const bot = new Telegraf(TOKEN);

const ADMIN_IDS = [7894421569, 5985723887]; // Adminlar
const CHANNEL = '@Islomxon_masjidi';
const DOMAIN = 'https://islomxonbot-asosiy.onrender.com';

// Static folder sozlash
app.use(express.static(path.join(__dirname)));

app.use(bot.webhookCallback('/bot-webhook'));

// START komandasi
bot.command('start', (ctx) => {
  if (!ADMIN_IDS.includes(ctx.from.id)) return ctx.reply('Faqat admin.');
  ctx.reply('Islomxon jome masjidi\nNamoz vaqtlarini yuborish:', {
    reply_markup: {
      inline_keyboard: [[
        { text: 'Web App ochish', web_app: { url: `${DOMAIN}/webapp.html` } }
      ]]
    }
  });
});

// Admin uchun ID komandasi
bot.command('id', (ctx) => {
  ctx.reply(`ID: ${ctx.from.id}`);
});

// Web App dan ma’lumot qabul qilish
bot.on('web_app_data', async (ctx) => {
  if (!ADMIN_IDS.includes(ctx.from.id)) return;

  try {
    const data = JSON.parse(ctx.webAppData.data);

    const text = `Islomxon jome masjidi

Sana: ${data.date}

Bomdod: ${data.bomdod}
Peshin: ${data.peshin}
Asr: ${data.asr}
Shom: ${data.shom}
Hufton: ${data.hufton}

⏳Намозни адо этганингиздан сўнг, Аллоҳни турган, ўтирган ва ёнбошлаган ҳолингизда эсланг. Хотиржам бўлганингизда намозни тўлиқ адо этинг. Албатта, намоз мўминларга вақтида фарз қилингандир. (Нисо сураси 103-оят) 📍 Ҳудудингиз учун тўғри вақтда ибодатни адо этинг. Аллоҳ ҳар бир қадамимизни савобли қилсин! 📤Ушбу маълумотни яқинларизга улашиб савобимизга шерик бўлинг!

https://t.me/Islomxon_masjidi`;

    await bot.telegram.sendMessage(CHANNEL, text);
    await ctx.reply('Post kanalga yuborildi!', {
      reply_markup: { inline_keyboard: [[{ text: 'Kanalga o‘tish', url: 'https://t.me/Islomxon_masjidi' }]] }
    });
  } catch (err) {
    console.error('XATO:', err.message);
    ctx.reply('Xato: ' + err.message);
  }
});

// Webhook o‘rnatish
(async () => {
  await bot.telegram.setWebhook(`${DOMAIN}/bot-webhook`);
  console.log('Webhook o‘rnatildi');
})();

// Port sozlash
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ishlayapti: ${DOMAIN}/webapp.html`);
});
