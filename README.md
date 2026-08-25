# GLITCH Activation Store

Static GLITCH activation store with a Vercel API endpoint for forwarding payment requests to Telegram.

## Deploy

Upload this folder to GitHub, import the repository into Vercel, and add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` as Vercel Environment Variables. Do not commit real secrets. Rotate the bot token before production because it was previously shared in chat.

## Archive

The original Archive game files are preserved unchanged under `archive/`. The protected GLITCH route uses `plane.html`; the original standalone Archive can be opened at `/archive/index.html` if needed.
