async function runAdmin({ command, args, msg, sock, jid, senderNumber, isOwner }) {
  const groupOnly = ['add','kick','promote','demote','tagall','tag','hidetag','groupinfo','invitelink','mute','unmute','welcome','goodbye','antilink','antispam','antibadword','warn','ban','unban'];
  if (!groupOnly.includes(command)) return null;
  if (!jid.endsWith('@g.us')) return '⚠️ Kòmand sa a fèt pou gwoup WhatsApp.';
  let metadata;
  try { metadata = await sock.groupMetadata(jid); } catch (_) { return 'Mwen pa ka li enfòmasyon gwoup la.'; }
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderMember = metadata.participants.find(p => p.id === sender);
  const senderIsAdmin = !!senderMember?.admin;
  if (!senderIsAdmin && !isOwner) return '⛔ Se admin gwoup la oswa owner bot la ki ka itilize kòmand sa a.';

  if (command === 'groupinfo') return `👥 Gwoup: ${metadata.subject}\n👤 Manm: ${metadata.participants.length}`;
  if (command === 'invitelink') {
    try { return `🔗 https://chat.whatsapp.com/${await sock.groupInviteCode(jid)}`; }
    catch (_) { return 'Mwen pa gen dwa jwenn lyen envitasyon an.'; }
  }
  if (command === 'tagall' || command === 'tag' || command === 'hidetag') {
    const mentions = metadata.participants.map(p => p.id);
    const body = args.join(' ') || 'Bonjou tout moun!';
    await sock.sendMessage(jid, { text: body, mentions });
    return '__SENT__';
  }
  if (command === 'add' || command === 'kick' || command === 'promote' || command === 'demote') {
    const number = (args[0] || '').replace(/\D/g, '');
    if (!number) return `Itilizasyon: .${command} 509XXXXXXXX`;
    const target = `${number}@s.whatsapp.net`;
    const action = command === 'add' ? 'add' : command === 'kick' ? 'remove' : command;
    try {
      await sock.groupParticipantsUpdate(jid, [target], action);
      return `✅ Aksyon ${command} la voye pou +${number}.`;
    } catch (_) { return '❌ Aksyon an echwe. Verifye dwa admin bot la ak nimewo a.'; }
  }
  return `ℹ️ .${command} poko aktive nan vèsyon sa a; pa egzanp, anti-link bezwen yon sistèm konfigirasyon ak tès anplis.`;
}
module.exports = { runAdmin };
