const { menuText } = require('../commands/menu');
const { ownerText } = require('../commands/owner');
const { runGeneral } = require('../commands/general');
const { runAdmin } = require('../commands/admin');

function getText(message) {
  const m = message.message || {};
  return m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    m.documentMessage?.caption ||
    '';
}

async function handleCommand(sock, msg, { OWNER_NUMBER }) {
  const jid = msg.key.remoteJid;
  const senderJid = msg.key.participant || msg.key.remoteJid;
  const senderNumber = (senderJid.split('@')[0] || '').replace(/\D/g, '');
  const text = getText(msg).trim();
  const prefix = process.env.PREFIX || '.';
  const mode = (process.env.BOT_MODE || 'public').toLowerCase();

  if (!text.startsWith(prefix)) return;
  const parts = text.slice(prefix.length).trim().split(/\s+/);
  const command = (parts.shift() || '').toLowerCase();
  const args = parts;
  const isOwner = senderNumber === OWNER_NUMBER;

  if (mode === 'private' && !isOwner) return;

  // React to every prefixed command, then reply to the original command message.
  try { await sock.sendMessage(jid, { react: { text: '🔥', key: msg.key } }); } catch (_) {}

  if (command === 'menu' || command === 'allmenu' || command === 'smenu') {
    const fs = require('fs');
    const path = require('path');
    const imagePath = path.join(__dirname, '..', 'public', 'mister-md-bot.png');
    if (fs.existsSync(imagePath)) {
      await sock.sendMessage(jid, { image: fs.readFileSync(imagePath), caption: '🤖 *MISTER-MD-BOT* 🔥\nOwner: +'+OWNER_NUMBER+'\nMode: '+mode.toUpperCase()+'\nPrefix: '+prefix }, { quoted: msg });
    }
    return sock.sendMessage(jid, { text: menuText({ OWNER_NUMBER, mode, prefix }) }, { quoted: msg });
  }

  if (command === 'owner') {
    return sock.sendMessage(jid, { text: ownerText(OWNER_NUMBER), mentions: [] }, { quoted: msg });
  }

  const generalResult = await runGeneral({ command, args, text, msg, sock, jid, senderNumber, isOwner, OWNER_NUMBER, mode, prefix });
  if (generalResult) return sock.sendMessage(jid, { text: generalResult }, { quoted: msg });

  const adminResult = await runAdmin({ command, args, msg, sock, jid, senderNumber, isOwner });
  if (adminResult === '__SENT__') return;
  if (adminResult) return sock.sendMessage(jid, { text: adminResult }, { quoted: msg });

  return sock.sendMessage(jid, {
    text: `❓ Kòmand *${prefix}${command}* poko disponib oswa li bezwen yon sèvis API.\nTape *${prefix}menu* pou wè kòmand yo.`
  }, { quoted: msg });
}

module.exports = { handleCommand };
