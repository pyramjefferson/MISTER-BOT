require('dotenv').config();
const path = require('path');
const express = require('express');
const pino = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const { handleCommand } = require('./lib/handler');

const app = express();
app.use(express.json({ limit: '20kb' }));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'pair.html')));
app.get('/pair', (_req, res) => res.sendFile(path.join(__dirname, 'pair.html')));
app.get('/health', (_req, res) => res.json({ ok: true, bot: 'MISTER-BOT', whatsapp: sock?.user ? 'connected' : 'not_connected' }));

const PORT = Number(process.env.PORT || 3000);
const OWNER_NUMBER = String(process.env.OWNER_NUMBER || '50940217685').replace(/\D/g, '');
const logger = pino({ level: process.env.LOG_LEVEL || 'silent' });
let sock = null;
let starting = false;
let pairingInProgress = false;
let reconnectTimer = null;
let lastConnectedNotice = '';

app.post('/api/pair', async (req, res) => {
  const number = String(req.body?.number || '').replace(/\D/g, '');
  if (number.length < 8 || number.length > 15) {
    return res.status(400).json({ ok: false, error: 'Antre nimewo a ak kòd peyi a, san + ni espas.' });
  }
  if (!sock) return res.status(503).json({ ok: false, error: 'WhatsApp ap demare. Tann yon ti moman epi eseye ankò.' });
  if (sock.authState.creds.registered || sock.user) {
    return res.status(409).json({ ok: false, error: 'Bot la deja konekte. Dekonekte sesyon an anvan ou fè pairing ankò.' });
  }
  if (pairingInProgress) return res.status(429).json({ ok: false, error: 'Yon demann pairing deja ap fèt. Tann kèk segonn.' });
  pairingInProgress = true;
  try {
    const code = await sock.requestPairingCode(number);
    return res.json({ ok: true, code: String(code).match(/.{1,4}/g)?.join('-') || code, message: 'Antre kòd sa a nan WhatsApp > Linked devices > Link a device > Link with phone number.' });
  } catch (error) {
    console.error('Pairing request failed:', error?.message || error);
    return res.status(500).json({ ok: false, error: 'WhatsApp pa t kapab kreye kòd la. Verifye nimewo a, tann yon ti moman, epi eseye ankò.' });
  } finally {
    setTimeout(() => { pairingInProgress = false; }, 8000);
  }
});

app.listen(PORT, '0.0.0.0', () => console.log(`MISTER-BOT web server listening on ${PORT}`));

async function startBot() {
  if (starting) return;
  starting = true;
  try {
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'sessions'));
    let version;
    try { ({ version } = await fetchLatestBaileysVersion()); } catch (_) { /* use Baileys default */ }
    sock = makeWASocket({
      logger,
      auth: state,
      version,
      printQRInTerminal: false,
      browser: ['MISTER-BOT', 'Chrome', '1.0.0'],
      markOnlineOnConnect: false,
      syncFullHistory: false
    });
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
      if (qr) {
        console.log('QR pairing available in terminal (if supported):');
        qrcode.generate(qr, { small: true });
      }
      if (connection === 'open') {
        console.log('MISTER-BOT connected to WhatsApp.');
        const connectedJid = sock?.user?.id || '';
        const noticeKey = `${connectedJid}:${new Date().toISOString().slice(0, 10)}`;
        if (OWNER_NUMBER && lastConnectedNotice !== noticeKey) {
          lastConnectedNotice = noticeKey;
          try {
            await sock.sendMessage(`${OWNER_NUMBER}@s.whatsapp.net`, {
              text: '╭━━〔 🇭🇹 MISTER-BOT 〕━━╮\n┃ ✅ WHATSAPP CONNECTED\n┃ 🤖 Bot la konekte avèk siksè!\n┃ 📡 Estati: ONLINE\n╰━━━━━━━━━━━━━━━━━━━━╯'
            });
          } catch (err) {
            console.error('Could not send connection notice to owner:', err?.message || err);
          }
        }
      }
      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const loggedOut = statusCode === DisconnectReason.loggedOut;
        console.log('WhatsApp connection closed:', statusCode || 'unknown');
        sock = null;
        if (!loggedOut && !reconnectTimer) {
          reconnectTimer = setTimeout(() => { reconnectTimer = null; starting = false; startBot(); }, 3000);
        }
      }
      if (connection === 'connecting') console.log('Connecting to WhatsApp...');
    });
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;
      for (const msg of messages) {
        try {
          if (!msg.message || msg.key.fromMe) continue;
          await handleCommand(sock, msg, { OWNER_NUMBER });
        } catch (err) {
          console.error('Message handler error:', err?.message || err);
        }
      }
    });
  } catch (err) {
    console.error('Bot startup error:', err?.message || err);
    sock = null;
    setTimeout(() => { starting = false; startBot(); }, 5000);
  }
}
startBot();
