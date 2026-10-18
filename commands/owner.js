function ownerText(ownerNumber) {
  const digits = String(ownerNumber || '').replace(/\D/g, '');
  return [
    '╭─〔 👑 MISTER-MD-BOT OWNER 〕',
    '│',
    `│ 📞 Owner: +${digits}`,
    `│ 💬 WhatsApp: https://wa.me/${digits}`,
    '│',
    '╰─ MISTER-MD-BOT'
  ].join('\n');
}
module.exports = { ownerText };
