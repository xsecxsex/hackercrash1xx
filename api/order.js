export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  try {
    const { tg, num, item, price, minutes, product, screenshot } = req.body || {};
    if (!tg || !num || !item || !price || !minutes || !screenshot) return res.status(400).json({error:'بيانات الطلب غير مكتملة'});
    if (!String(screenshot).startsWith('data:image/')) return res.status(400).json({error:'ملف التحويل غير صالح'});
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) return res.status(500).json({error:'إعدادات البوت غير مضافة على Vercel'});
    const comma = screenshot.indexOf(',');
    const mime = screenshot.slice(5, screenshot.indexOf(';')) || 'image/jpeg';
    const binary = Buffer.from(screenshot.slice(comma + 1), 'base64');
    if (binary.length > 4 * 1024 * 1024) return res.status(413).json({error:'الصورة أكبر من الحد المسموح'});
    const label = product === 'plane' ? '✈️ الطيارة' : '🍎 التفاحة';
    const text = `🛒 طلب كود تفعيل جديد\n\nالنوع: ${label}\nالباقة: ${item}\nالمدة: ${minutes} دقيقة\nالسعر: ${price} EGP\nTelegram: ${tg}\nرقم التحويل: ${num}\n\nراجع الصورة ثم وافق من لوحة تحكم الموقع لتوليد الكود.`;
    const form = new FormData();
    form.append('chat_id', chatId);
    form.append('caption', text);
    form.append('photo', new Blob([binary], {type:mime}), 'payment.jpg');
    const tgResponse = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {method:'POST', body:form});
    const result = await tgResponse.json();
    if (!tgResponse.ok || !result.ok) return res.status(502).json({error:'تعذر إرسال الطلب إلى تيليجرام'});
    return res.status(200).json({ok:true, messageId:result.result?.message_id});
  } catch (e) { return res.status(500).json({error:'حدث خطأ أثناء إرسال الطلب'}); }
}
