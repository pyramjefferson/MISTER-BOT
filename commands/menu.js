const groups = {
  'OWNER': ['addreply','anticall','antidelete','archivechat','autoreact','autoread','autoreply','autostatus','autotyping','broadcast','broadcastdm','clear','clearchat','clearsession','cleartmp','cmdreact','delcmd','delplugin','delreply','gcleave','getfile','inspect','gitinfo','addplugin','joingroup','listcmd','listrent','listreplies','maintenance','manage','mention','mode','pinchat','pmblocker','gitpull','reload','rentbot','setbio','setcmd','setpp','settings','star','stealth','stoprent','sudo','sysinfo','update'],
  'AI': ['gpt','llama','mistral','dalle','flux','diffusion','sora'],
  'DOWNLOAD': ['alamy','apkdl','facebook','getty','gimage','gitclone','gitclone2','instagram','istock','mediafire','mega','sharechat','snack','snapchat','spotify','dlstatus','terabox','tiktok','twitter','video','vidsplay'],
  'GENERAL': ['alive','allmenu','channelid','echo','getpp','menu','pair','ping','pingweb','find','smenu','perf','uptime','viewonce'],
  'UTILITY': ['analyze','calc','cipher','crun','distance','dna','rle','schedule','schedulecancel','schedulelist','siminfo','speedtest','sudoku','units','urldecode','wordcloud'],
  'MENU': ['animes','audiofx','notes','privacy','images','stext','ephoto'],
  'ADMIN': ['antibadword','antilink','antispam','antitag','ban','chatbot','delete','demote','disappear','add','gcset','goodbye','hidetag','kick','mute','promote','resetlink','setgdesc','setgname','setgpp','tag','tagall','tagnotadmin','unban','unmute','warn','welcome'],
  'STICKERS': ['attp','emojimix','gif','igs','igsc','quoted','s2img','sticker','sticker2','crop','stickers','tgstk','take'],
  'TOOLS': ['base64','bfdecode','brainfuck','excard','fetch','flip','forwarded','grayscale','blur','invert','qrcode','qmaker','readmore','readqr','removebg','length','reverse','sepia','sharpen','getpage','screenshot','tinyurl','smallcaps','tourl','translate','tts','url','vnote'],
  'GROUP': ['character','compliment','gcmtdata','groupinfo','insult','invitelink','joinrequests','poll','rank','ship','simp','staff','stupid','warnings','wasted'],
  'IMAGES': ['coding','cyberimg','game','islamic','mountain','pies','tech'],
  'GAMES': ['dado','dare','hangman','math','tictactoe','trivia','truth'],
  'SEARCH': ['define','element','whoisip','wattpad','wiki'],
  'FUN': ['8ball','fact','flirt','hack','joke','joke2','meme','teddy','why'],
  'STALK': ['genshin','github','npmstalk','pinstalk','tgstalk','thrstalk','ttstalk','xstalk'],
  'INFO': ['script','imdb','itunes','medicine','momo','movie','news','owner','pokedex','quran','shazam','string','trends','weather','whois'],
  'QUOTES': ['goodnight','quote','quote2','roseday','shayari','wyr'],
  'MUSIC': ['lyrics','play','ringtone','scloud','song','ytsearch'],
  'UPLOAD': ['aupload','catbox','freeimage','litterbox','pixhost','pomf','quax','tmpfiles','uguu','xoat']
};

function menuText({ OWNER_NUMBER, mode, prefix }) {
  const uptime = process.uptime();
  const mins = Math.floor(uptime / 60);
  const secs = Math.floor(uptime % 60);
  const count = Object.values(groups).flat().length;
  const out = [
    '╭─〔 *MISTER-MD-BOT* 🤖〕➤',
    `╭┤ 👑 Owner : +${OWNER_NUMBER}`,
    `│◯ ⚙️ Mode : ${mode.toUpperCase()}`,
    `│◯ 🏷️ Prefix : ${prefix}`,
    `│◯ 📚 Commands listed : ${count}`,
    '╰━━━━━━━━━━━━━━━━━━➤',
    '',
    '╭─〔 SYSTEM STATS 〕➤',
    `│◯ ⏱️ Uptime : ${mins}m ${secs}s`,
    `│◯ 💻 Platform : ${process.platform}`,
    '│◯ 🤖 Version : 1.0.0',
    '╰━━━━━━━━━━━━━━━━━━➤',
    ''
  ];
  for (const [name, commands] of Object.entries(groups)) {
    out.push(`╭─❮ ⸸ 𝗖ᴏᴍᴍᴀɴᴅs · ${name} ⸸ ❯`);
    for (const cmd of commands) out.push(`│ 🝓 \`${prefix}${cmd}\``);
    out.push('╰─────────────────────────', '');
  }
  out.push('╭─〔 📣 CHANNEL 〕');
  out.push('│ Voir la chaîne : https://whatsapp.com/channel/0029Vb8oizBBKfi9ZF3urZ29');
  out.push('╰━━━━━━━━━━━━━━━━━━➤');
  out.push('', '> MISTER-MD-BOT by MISTER');
  return out.join('\n');
}
module.exports = { menuText };
