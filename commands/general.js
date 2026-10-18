const { ownerText } = require('./owner');


async function askAI(prompt) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return '⚠️ IA a poko aktive. Mete OPENAI_API_KEY nan Environment Render pou aktive .gpt.';
  if (!prompt.trim()) return 'Itilizasyon: .gpt ekri kesyon ou';
  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4.1-mini', input: prompt })
    });
    const data = await response.json();
    if (!response.ok) return `❌ Erè sèvis IA (${response.status}). Verifye API key ak limit kont lan.`;
    const answer = data.output_text || (data.output || []).flatMap(x => x.content || []).map(x => x.text || '').join('\n');
    return answer ? `🤖 MISTER-MD-BOT IA\n\n${answer.slice(0, 3500)}` : 'IA a pa retounen yon repons.';
  } catch (_) { return '❌ Mwen pa rive kontakte sèvis IA a. Eseye ankò pita.'; }
}
async function wikiSearch(query) {
  if (!query.trim()) return 'Itilizasyon: .wiki sijè';
  try {
    const response = await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(query.trim().replace(/\s+/g, '_')));
    if (!response.ok) return 'Mwen pa jwenn atik Wikipedia sa a.';
    const data = await response.json();
    return `📚 ${data.title || query}\n\n${data.extract || 'Pa gen rezime disponib.'}\n\n${data.content_urls?.desktop?.page || ''}`.slice(0, 3500);
  } catch (_) { return '❌ Rechèch Wikipedia pa disponib kounye a.'; }
}
async function defineWord(word) {
  if (!word.trim()) return 'Itilizasyon: .define mo-angle';
  try {
    const response = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word.trim()));
    if (!response.ok) return 'Mwen pa jwenn definisyon mo sa a (API sa a sipòte angle).';
    const data = await response.json();
    const meanings = (data[0]?.meanings || []).slice(0, 3).map(m => `• ${m.partOfSpeech}: ${m.definitions?.[0]?.definition || ''}`);
    return `📖 ${data[0]?.word || word}\n${meanings.join('\n')}`.slice(0, 3000);
  } catch (_) { return '❌ Diksyonè a pa disponib kounye a.'; }
}


async function translateText(input) {
  const match = input.match(/^([a-z]{2,5})\s+([a-z]{2,5})\s+([\s\S]+)$/i);
  if (!match) return 'Itilizasyon: .translate ht en Bonjou | .translate en fr Hello';
  const [, from, to, text] = match;
  try {
    const url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) + '&langpair=' + encodeURIComponent(from + '|' + to);
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok || data.responseStatus !== 200 || !data.responseData?.translatedText) return 'Tradiksyon an pa disponib pou lang sa yo.';
    return `🌐 Tradiksyon (${from} → ${to})\n${data.responseData.translatedText}`.slice(0, 3000);
  } catch (_) { return '❌ Sèvis tradiksyon an pa disponib kounye a.'; }
}
async function weatherFor(place) {
  if (!place.trim()) return 'Itilizasyon: .weather Port-au-Prince';
  try {
    const geoRes = await fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(place) + '&count=1&language=fr&format=json');
    const geo = await geoRes.json();
    const loc = geo.results?.[0];
    if (!loc) return 'Mwen pa jwenn vil sa a.';
    const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,wind_speed_10m&timezone=auto`);
    const w = await wRes.json();
    const c = w.current;
    if (!c) return 'Done meteyo pa disponib pou kote sa a.';
    return `🌦️ METEYO — ${loc.name}, ${loc.country}\n🌡️ Tanperati: ${c.temperature_2m}°C\n🥵 Tanperati santi: ${c.apparent_temperature}°C\n💧 Imidite: ${c.relative_humidity_2m}%\n🌧️ Presipitasyon: ${c.precipitation} mm\n💨 Van: ${c.wind_speed_10m} km/h\n🕒 ${c.time}`;
  } catch (_) { return '❌ Sèvis meteyo a pa disponib kounye a.'; }
}
async function githubInfo(user) {
  if (!user.trim()) return 'Itilizasyon: .github non_itilizatè';
  try {
    const res = await fetch('https://api.github.com/users/' + encodeURIComponent(user.trim()), {headers:{'Accept':'application/vnd.github+json','User-Agent':'MISTER-MD-BOT'}});
    if (!res.ok) return res.status === 404 ? 'Mwen pa jwenn itilizatè GitHub sa a.' : 'GitHub pa disponib kounye a.';
    const d = await res.json();
    return `🐙 GITHUB — ${d.login}\n👤 Non: ${d.name || 'Pa bay'}\n📝 Bio: ${d.bio || 'Pa bay'}\n📦 Repozitwa piblik: ${d.public_repos}\n👥 Followers: ${d.followers}\n➡️ Following: ${d.following}\n🔗 ${d.html_url}`.slice(0,3000);
  } catch (_) { return '❌ Mwen pa ka kontakte GitHub kounye a.'; }
}
async function npmInfo(pkg) {
  if (!pkg.trim()) return 'Itilizasyon: .npmstalk non_pake';
  try {
    const res = await fetch('https://registry.npmjs.org/' + encodeURIComponent(pkg.trim()));
    if (!res.ok) return res.status === 404 ? 'Pake npm sa a pa jwenn.' : 'Rejis npm pa disponib kounye a.';
    const d = await res.json(); const v = d['dist-tags']?.latest; const latest = d.versions?.[v];
    return `📦 NPM — ${d.name}\n🔖 Dènye vèsyon: ${v || 'Pa konnen'}\n📝 ${latest?.description || 'Pa gen deskripsyon'}\n👤 Otè: ${latest?.author?.name || 'Pa bay'}\n🔗 https://www.npmjs.com/package/${encodeURIComponent(d.name)}`.slice(0,3000);
  } catch (_) { return '❌ Rejis npm pa disponib kounye a.'; }
}
async function whoisDomain(domain) {
  const clean = domain.trim().replace(/^https?:\/\//i,'').split('/')[0];
  if (!clean || !clean.includes('.') || clean.includes(' ')) return 'Itilizasyon: .whois example.com';
  try {
    const res = await fetch('https://rdap.org/domain/' + encodeURIComponent(clean));
    if (!res.ok) return 'Mwen pa jwenn done RDAP pou domèn sa a.';
    const d = await res.json();
    const events = (d.events || []).map(e => `${e.eventAction}: ${e.eventDate}`).join('\n');
    return `🌐 DOMÈN: ${d.ldhName || clean}\n🔒 Status: ${(d.status || []).join(', ') || 'Pa bay'}\n📅 Dat yo jwenn: ${events || 'Pa bay'}\n🔗 Sous RDAP: https://rdap.org/domain/${encodeURIComponent(clean)}`.slice(0,3000);
  } catch (_) { return '❌ Sèvis RDAP la pa disponib kounye a.'; }
}

async function runGeneral(ctx) {
  const { command, args, msg, sock, jid, senderNumber, OWNER_NUMBER, mode, prefix } = ctx;
  switch (command) {
    case 'translate': return await translateText(args.join(' '));
    case 'weather': return await weatherFor(args.join(' '));
    case 'github': return await githubInfo(args.join(' '));
    case 'npmstalk': return await npmInfo(args.join(' '));
    case 'whois': return await whoisDomain(args.join(' '));
    case 'gpt': return await askAI(args.join(' '));
    case 'wiki': return await wikiSearch(args.join(' '));
    case 'define': return await defineWord(args.join(' '));
    case 'fact': {
      const facts = ['🐙 Poulp gen twa kè.', '🌍 Latè yon ti jan aplati nan poto yo.', '🦈 Reken egziste depi anvan pyebwa yo.', '🌕 Limyè Lalin nan se limyè Solèy la ki reflete sou li.', '🐝 Myèl kominike kote manje ye atravè yon dans.'];
      return facts[Math.floor(Math.random() * facts.length)];
    }
    case 'units': {
      const m = args.join(' ').match(/^(-?\d+(?:\.\d+)?)\s*(km|mi|m|cm|kg|lb|c|f)\s*(?:to|en|in)?\s*(km|mi|m|cm|kg|lb|c|f)$/i);
      if (!m) return 'Itilizasyon: .units 10 km mi | 100 f c | 5 kg lb';
      const n = Number(m[1]), from = m[2].toLowerCase(), to = m[3].toLowerCase();
      const conversions = {
        'km:mi': n * 0.621371, 'mi:km': n / 0.621371, 'm:cm': n * 100,
        'cm:m': n / 100, 'kg:lb': n * 2.20462, 'lb:kg': n / 2.20462,
        'c:f': n * 9 / 5 + 32, 'f:c': (n - 32) * 5 / 9
      };
      const result = conversions[`${from}:${to}`];
      if (result === undefined) return 'Konvèsyon sa a poko sipòte. Egzanp: .units 10 km mi';
      return `🔄 ${n} ${from} = ${Number(result.toFixed(4))} ${to}`;
    }
    case 'tinyurl': {
      const url = args[0] || '';
      if (!/^https?:\/\//i.test(url)) return 'Itilizasyon: .tinyurl https://egzanp.com';
      try {
        const response = await fetch('https://tinyurl.com/api-create.php?url=' + encodeURIComponent(url));
        const short = await response.text();
        return response.ok && short.startsWith('https://') ? `🔗 ${short}` : 'Mwen pa rive kreye lyen kout la.';
      } catch (_) { return '❌ Sèvis TinyURL pa disponib kounye a.'; }
    }
    case 'alive':
      return '✅ MISTER-MD-BOT ap mache!';
    case 'ping':
    case 'perf':
      return `🏓 Pong!\n⏱️ Uptime: ${Math.floor(process.uptime())} seconds`;
    case 'uptime': {
      const s = Math.floor(process.uptime());
      return `⏱️ Uptime: ${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}m ${s%60}s`;
    }
    case 'echo':
      return args.join(' ') || 'Egzanp: .echo Bonjou';
    case 'calc': {
      const expr = args.join('').trim();
      if (!expr || !/^[0-9+\-*/().%\s]+$/.test(expr)) return 'Itilizasyon: .calc 12*(4+2)';
      try {
        // Only basic arithmetic characters are accepted.
        const result = Function(`"use strict"; return (${expr})`)();
        if (!Number.isFinite(result)) return 'Rezilta a pa yon nonb fini.';
        return `🧮 Rezilta: ${result}`;
      } catch (_) { return 'Ekspresyon matematik la pa valab.'; }
    }
    case 'owner':
      return ownerText(OWNER_NUMBER);
    case 'mode':
      if (senderNumber !== OWNER_NUMBER) return '⛔ Se owner la sèlman ki ka chanje mode.';
      if (!args[0] || !['public','private'].includes(args[0].toLowerCase())) return `Itilizasyon: ${prefix}mode public oswa ${prefix}mode private (mete BOT_MODE nan anviwònman Render pou konsève l).`;
      return `ℹ️ Pou kounye a mode ki konfigire a se ${args[0].toUpperCase()}. Chanje BOT_MODE nan Environment sou Render epi redeploy pou li rete konsa.`;
    case 'channelid':
      return '📣 Chanèl MISTER-MD-BOT:\nhttps://whatsapp.com/channel/0029Vb8oizBBKfi9ZF3urZ29';
    case 'privacy':
      return '🔐 Pa pataje kòd pairing, dosye session, modpas, oswa enfòmasyon prive. Pa mete sekrè nan GitHub.';
    case 'string':
      return args.join(' ') || 'Itilizasyon: .string tèks';
    case 'reverse':
      return args.join(' ').split('').reverse().join('') || 'Itilizasyon: .reverse tèks';
    case 'length':
      return `📏 Longè: ${args.join(' ').length} karaktè`;
    case 'base64':
      return `Base64: ${Buffer.from(args.join(' '), 'utf8').toString('base64')}`;
    case 'urldecode':
      try { return decodeURIComponent(args.join(' ')); } catch (_) { return 'Tèks URL la pa valab.'; }
    case 'smallcaps': {
      const map = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ꜰ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
      return args.join(' ').toLowerCase().split('').map(c => map[c] || c).join('');
    }
    case 'dado':
      return `🎲 Rezilta: ${1 + Math.floor(Math.random() * 6)}`;
    case '8ball': {
      const answers = ['Wi.','Non.','Sa posib.','Mwen pa sèten.','Eseye ankò pita.'];
      return `🎱 ${answers[Math.floor(Math.random()*answers.length)]}`;
    }
    case 'joke':
      return '😂 Poukisa òdinatè a te ale kay doktè? Paske li te gen yon viris!';
    case 'truth':
      return '🎯 Verite: Ki objektif ou ta renmen reyalize ane sa a?';
    case 'dare':
      return '🎯 Defi: Di yon bagay pozitif sou yon zanmi.';
    case 'groupinfo':
      if (!jid.endsWith('@g.us')) return 'Kòmand sa a mache sèlman nan gwoup.';
      try {
        const meta = await sock.groupMetadata(jid);
        return `👥 ${meta.subject}\nManm: ${meta.participants.length}\nID: ${jid}`;
      } catch (_) { return 'Mwen pa ka jwenn enfòmasyon gwoup la.'; }
    default:
      return null;
  }
}
module.exports = { runGeneral };
