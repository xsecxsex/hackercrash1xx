export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { orderId, tg, num, item, price, minutes, product, code, expiry } = req.body || {};
    if (!orderId || !tg || !item || !price || !minutes || !product || !code || !expiry) {
      return res.status(400).json({ error: 'بيانات الموافقة غير مكتملة' });
    }
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) return res.status(500).json({ error: 'إعدادات البوت غير مضافة على Vercel' });
    const label = product === 'plane' ? '✈️ الطيارة' : '🍎 التفاحة';
    const expires = new Date(expiry).toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' });
    const text = `✅ تمت الموافقة على الطلب\n\nالنوع: ${label}\nالباقة: ${item}\nالمدة: ${minutes} دقيقة\nالسعر: ${price} EGP\nTelegram: ${tg}\nرقم التحويل: ${num || 'غير مذكور'}\nرقم الطلب: ${orderId}\n\nACTIVATION CODE: ${code}\nينتهي في: ${expires}`;
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text })
    });
    const result = await response.json();
    if (!response.ok || !result.ok) return res.status(502).json({ error: 'تعذر إرسال كود التفعيل إلى تيليجرام' });
    return res.status(200).json({ ok: true, messageId: result.result?.message_id });
  } catch (e) {
    return res.status(500).json({ error: 'حدث خطأ أثناء إرسال كود التفعيل' });
  }
}
