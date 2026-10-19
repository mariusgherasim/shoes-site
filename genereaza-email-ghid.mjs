// genereaza-email-ghid.mjs — email educativ: „Ghid: cum îngrijești pantofii de piele peste iarnă"
//
// Rulare:   node genereaza-email-ghid.mjs
// Rezultat: email-ghid-output.html  (3 subiecte + 3 preheadere + codul HTML pentru MailerLite)
//           email-ghid-output-previzualizare.html  (îl deschizi în browser)
//
// Emailul are: rezumatul ghidului (cifre + 5 reguli) → butonul „Citește ghidul"
// (pagina /ghiduri/ingrijire-pantofi-piele-iarna/) → ghete din piele cu reducere,
// alese din products.json la momentul rulării (4 pentru ea + 4 pentru el).
import { incarcaProduse, reducereReala, scor, sectiune, email, scrieRezultat, utm, SITE } from './email-comun.mjs';

const CAMPANIE = 'ghid-pantofi-piele-iarna';
const GHID = utm(`${SITE}/ghiduri/ingrijire-pantofi-piele-iarna/`, CAMPANIE);
const KIT = utm(`${SITE}/genti-accesorii/tip/ingrijire-incaltaminte/`, CAMPANIE);

const C = { navy: '#14213D', ink: '#1B1F27', steel: '#7C8698', line: '#D8DBE0', brass: '#B8863A' };
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = 'Arial, Helvetica, sans-serif';

// ── Ghete din piele cu reducere reală, câte un model o singură dată ────────
const toate = incarcaProduse();
function alege(categorie, tip, n = 4) {
  const vazute = new Set(), peBrand = {}, out = [];
  const lista = toate.filter((p) => p.categorie === categorie && p.tip === tip && /piele/i.test(p.title) && reducereReala(p))
    .sort((a, b) => scor(b) - scor(a));
  for (const p of lista) {
    const k = p.title.toLowerCase().replace(/\s+/g, ' ');
    const b = (p.brand || '').toLowerCase();
    if (vazute.has(k) || (peBrand[b] || 0) >= 2) continue;
    vazute.add(k); peBrand[b] = (peBrand[b] || 0) + 1; out.push(p);
    if (out.length === n) break;
  }
  return out;
}
const ea = alege('incaltaminte-femei', 'ghete-botine');
const el = alege('incaltaminte-barbati', 'ghete-bocanci');

// ── Blocul ghidului ────────────────────────────────────────────────────────
const cifra = (mare, mic) => `<td width="25%" style="width:25%;padding:6px 4px;text-align:center;vertical-align:top;">
<div style="font-family:${SERIF};font-size:22px;font-weight:bold;color:${C.navy};">${mare}</div>
<div style="font-family:${SANS};font-size:11px;color:${C.steel};line-height:1.35;margin-top:2px;">${mic}</div></td>`;

const regula = (nr, titlu, text) => `<tr><td style="padding:0 0 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td width="34" style="width:34px;vertical-align:top;"><div style="width:26px;height:26px;line-height:26px;border-radius:13px;background:${C.navy};color:#fff;font-family:${SANS};font-size:13px;font-weight:bold;text-align:center;">${nr}</div></td>
<td style="font-family:${SANS};font-size:14px;color:${C.ink};line-height:1.55;"><strong>${titlu}</strong> ${text}</td>
</tr></table></td></tr>`;

const ghid = `<tr><td colspan="2" style="padding:20px 18px 6px;background:#fff;">
<p style="font-family:${SANS};font-size:15px;color:${C.ink};line-height:1.6;margin:0 0 14px;">
<strong>136 de tone de sare într-o singură zi</strong> — atât au împrăștiat 14 sărărițe pe străzile Brăilei, pe 15 decembrie 2018. Unde crezi că ajunge sarea aceea? Pe ghetele din piele cumpărate special pentru iarnă? Pe bocancii lăsați aseară la uscat pe calorifer? Și câte ierni mai rezistă ei așa?</p>
<p style="font-family:${SANS};font-size:15px;color:${C.ink};line-height:1.6;margin:0 0 16px;">Vestea bună: îți trebuie doar <strong>5 minute seara</strong> și câteva produse de sub 45 de lei. Am adunat sfaturile meșterilor cizmari într-un ghid scurt.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:3px solid ${C.brass};border-bottom:1px solid ${C.line};margin:0 0 18px;"><tr>
${cifra('1 : 2', 'oțet alb : apă pentru petele de sare')}
${cifra('20 h', 'până se usucă un pantof ud')}
${cifra('0', 'minute pe calorifer')}
${cifra('1 alună', 'atâta cremă pe pantof')}
</tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${regula(1, 'Pregătește-i acum.', 'Curățare, cremă cât o alună, apoi ceară pe vârf, călcâi și cusătura tălpii — pe acolo intră apa.')}
${regula(2, 'Perie sarea în fiecare seară,', 'cât e încă umedă. Uscată, intră în pori și crapă pielea.')}
${regula(3, 'Pete albe?', 'O parte oțet alb, două părți apă. Tamponezi, nu freci — apoi cremă, după ce s-a uscat.')}
${regula(4, 'Niciodată pe calorifer.', 'Ziar sau calapod din cedru, la temperatura camerei, până la 20 de ore.')}
${regula(5, 'Alternează două perechi.', 'Pielea are nevoie de o zi–două de pauză ca să se usuce complet.')}
</table>
<div style="text-align:center;padding:8px 0 18px;">
<a href="${GHID}" target="_blank" style="display:inline-block;background:${C.navy};color:#fff;font-family:${SANS};font-size:15px;font-weight:bold;text-decoration:none;padding:13px 30px;border-radius:3px;">Citește ghidul →</a>
<div style="font-family:${SANS};font-size:12px;color:${C.steel};margin-top:10px;">Pași detaliați, piele întoarsă, cele 7 greșeli frecvente · <a href="${KIT}" target="_blank" style="color:${C.navy};">Kitul de îngrijire →</a></div>
</div></td></tr>`;

const sectiuni = [ghid];
if (ea.length) sectiuni.push(sectiune('Ghete din piele cu reducere — pentru ea', ea, utm(`${SITE}/incaltaminte-femei/tip/ghete-botine/`, CAMPANIE), 'Toate ghetele și botinele pentru ea →'));
if (el.length) sectiuni.push(sectiune('Ghete din piele cu reducere — pentru el', el, utm(`${SITE}/incaltaminte-barbati/tip/ghete-bocanci/`, CAMPANIE), 'Toate ghetele și bocancii pentru el →'));

const toateAlese = [...ea, ...el];
const maxPct = toateAlese.length ? Math.max(...toateAlese.map((p) => p.pct)) : 0;

const subiecte = [
  'Ghid: cum îngrijești pantofii de piele peste iarnă',
  'Oțet, ziar și 5 minute: pantofii tăi de piele trec iarna?',
  'Îți pui ghetele pe calorifer? Uite de ce crapă pielea',
];
const preheadere = [
  '136 de tone de sare într-o zi pe străzile unui singur oraș. Ce faci ca să nu ajungă în pielea ghetelor?',
  'Rețeta 1:2 pentru petele albe, 20 de ore de uscare și greșeala pe care o facem toți.',
  `5 reguli simple de la cizmari + ghete din piele cu până la -${maxPct}%.`,
];

const html = email({
  titlu: 'Cum îngrijești pantofii de piele peste iarnă',
  subtitlu: 'Sare, zăpadă, calorifer — și cum îți protejezi pantofii în 5 minute pe seară.',
  banner: null,
  sectiuni,
  linkFinal: `${SITE}/oferte/`,
  campanie: CAMPANIE,
});

scrieRezultat('email-ghid-output.html', {
  subiecte, preheadere, html,
  nota: `GHID EDUCATIV — pantofii de piele iarna · campanie: ${CAMPANIE}
Pagina ghidului: ${SITE}/ghiduri/ingrijire-pantofi-piele-iarna/  (trebuie să fie publicată înainte de trimitere)
Pentru ea: ${ea.length} ghete · Pentru el: ${el.length} ghete
(Blocul Countdown NU e necesar la emailul educativ.)`,
});
