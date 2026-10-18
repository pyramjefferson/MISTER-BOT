# MISTER-BOT 🇭🇹

WhatsApp bot built with Node.js, Express, and Baileys. Includes a pairing page at `/` and `/pair`.

## Deploy on Render
1. Upload this folder to a GitHub repository.
2. In Render, create a **Web Service** from that repository.
3. Build command: `npm install`
4. Start command: `npm start`
5. Set Environment Variables:
   - `OWNER_NUMBER` = your WhatsApp number in international format, digits only (example Haiti: `509XXXXXXXX`)
   - `BOT_MODE` = `public` or `private`
   - `PREFIX` = `.`
6. Deploy. Open the service URL; it should show the MISTER-BOT pairing page.
7. Enter the number of the WhatsApp account you control. Follow the instructions to request and enter the pairing code.

## Important deployment note
WhatsApp session credentials are stored in `sessions/`. Use a persistent disk mounted for this directory on a host that supports it, or you may need to pair again after a redeploy/restart. Never upload `sessions/` or `.env` to GitHub.

## Connection notice
After WhatsApp successfully connects, the bot attempts to send a confirmation message to `OWNER_NUMBER`. WhatsApp's own security notifications are controlled by WhatsApp and cannot be forced by this bot.

## Commands
Prefix is `.` by default. `.menu` lists commands included in this project. Not every command shown in a large menu necessarily has a full implementation; add/test command handlers before relying on them.

## Optional AI
For `.gpt`, set `OPENAI_API_KEY` in Render's Environment settings. Keep keys private; do not commit them to GitHub.

## Troubleshooting
- If the page only shows a status string, verify the deployed commit contains `pair.html` and that `GET /` serves that file.
- If pairing fails, check Render Logs, confirm the number includes the country code, and retry after a short wait.
- Never share pairing codes or session files.
