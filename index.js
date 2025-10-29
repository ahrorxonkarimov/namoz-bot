// index.js — Render.com uchun tayyor va xavfsiz
const express = require('express');
const { Telegraf } = require('telegraf');
const path = require('path');

const app = express();
app.use(express.json());

// ====== Konfiguratsiya (Environment variables) ======
// Render-da quyidagilarni qoʻshganingizga ishonch hosil qiling:
// BOT_TOKEN, DOMAIN, CHANNEL, ADMIN_IDS
const TOKEN = process.env.BOT_TOKEN || process.env.TOKEN || '';
const DOMAIN = process.env.DOMAIN || '';
const CHANNEL = process.env.CHANNEL || '@Islomxon_masjidi';

// ADMIN_IDS — vergul bilan ajratilgan raqamlar, yoki bo'sh bo'lsa [] qaytaradi
const ADMIN_IDS = (process.env.ADMIN_IDS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean); // misol: "7894421569,5985723887"

// ====== Tekshiruv: muhim qiymatlar mavjudmi? ======
if (!TOKEN) {
  console.error('XATO: BOT_TOKEN (yoki TOKEN) topilmadi. Render Environment variables ga BOT_TOKEN ni qo\'shing.');
}
if (!DOMAIN) {
  console.error('XATO: DOMAIN topilmadi. Render Environment variables ga DOMAIN ni qo\'shing (misol: https://your-app.onrender.com).');
}
if (ADMIN_IDS.length === 0) {
  console.warn('OGOH: ADMIN_IDS bo\'sh — hech qanday admin ruxsati yo\'q. ADMIN_IDS ni kiriting.');
}

const bot = new Telegraf(TOKEN);

// ====== Static fayllarni xizmat qilish (webapp.html shu papkada bo\'lishi kerak) ======
app.use(express.static(path.join(__dirname)));

// Qo'shimcha: oddiy root tekshiruv
app.get('/', (req, res) => {
  res.send('Islomxon bot server ishlayapti — webapp: /webapp.html');
});

// Agar webapp.html papkada bo'lsa, yuqoridagi static yetarli; shunday bo'lmasa:
// app.get('/webapp.html', (req, res) => res.sendFile(path.join(__dirname, 'webapp.html')));

// ====== Bot komandalar ======
bot.start(async (ctx) => {
  try {
    const userIdStr = ctx.from.id.toString();
    if (!ADMIN_IDS.includes(userIdStr)) {
      return ctx.reply('Faqat adminlar foydalanishi mumkin.');
    }

    // Admin uchun Web App tugmasi
    await ctx.reply('Islomxon jome masjidi — Namoz vaqtlarini yuborish:', {
      reply_markup: {
        inline_keyboard: [[
          { text: 'Web App ochish', web_app: { url: `${DOMAIN}/webapp.html` } }
        ]]
      }
    });
  } catch (err) {
    console.error('start komandasi xatosi:', err);
  }
});

// Foydalanuvchiga o'z ID sini bilish uchun
bot.command('id', (ctx) => ctx.reply(`Sizning ID: ${ctx.from.id}`));

// Web App orqali kelgan ma'lumotlarni qabul qilish
bot.on('web_app_data', async (ctx) => {
  try {
    const userIdStr = ctx.from.id.toString();
    if (!ADMIN_IDS.includes(userIdStr)) {
      return ctx.reply('Faqat adminlar yuborishi mumkin.');
    }

    const data = JSON.parse(ctx.webAppData.data || '{}');

    const text = `Islomxon jome masjidi

Sana: ${data.date || '-'}
Bomdod: ${data.bomdod || '-'}
Peshin: ${data.peshin || '-'}
Asr: ${data.asr || '-'}
Shom: ${data.shom || '-'}
Hufton: ${data.hufton || '-'}

${data.izoh || ''}
    
Hududingiz uchun to'g'ri vaqtlarda namoz o'qing!
Allah qabul qilsin!

${CHANNEL}`;

    await bot.telegram.sendMessage(CHANNEL, text);
    await ctx.reply('Post kanalga yuborildi!', {
      reply_markup: [{ inline_keyboard: [[{ text: 'Kanalga o\'tish', url: `https://t.me/${CHANNEL.replace('@','')}` }]] }]
    });

  } catch (err) {
    console.error('web_app_data xatosi:', err);
    try { ctx.reply('Xato yuz berdi: ' + (err.message || err.toString())); } catch(e) {}
  }
});

// ====== Webhook o'rnatish va server ishga tushishi ======
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server ishlayapti: ${DOMAIN}/webapp.html (port ${PORT})`);

  // agar TOKEN va DOMAIN to'g'ri bo'lsa webhook o'rnatamiz
  if (TOKEN && DOMAIN) {
    try {
      await bot.telegram.setWebhook(`${DOMAIN}/bot-webhook`);
      app.use(bot.webhookCallback('/bot-webhook'));
      console.log('Webhook o‘rnatildi');
    } catch (err) {
      console.error('Webhook o‘rnatishda xato:', err);
    }
  } else {
    console.warn('Webhook o‘rnatilmadi — TOKEN yoki DOMAIN yetishmayapti.');
  }
});

// global catch
bot.catch((err) => {
  console.error('Bot ichida umumiy xato:', err);
});
