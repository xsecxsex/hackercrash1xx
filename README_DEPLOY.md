# LION deployment

1. Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in Vercel Project Settings → Environment Variables.
2. Deploy this folder with `index.html` at the project root.
3. Keep the bot token out of frontend code. Because the token was shared in chat, rotate it with BotFather before production.
4. Keep the existing Firebase Realtime Database URL and verify its rules allow the intended reads/writes.
5. The admin approves a pending order from the dashboard; this creates a one-use key with the package duration and product type.
