/* MyOffiCity: kundportal. Allt som kommer från servern visas via esc() (aldrig som rå HTML).
   Genererade hemsidor visas bara i iframes med sandbox="allow-scripts" (utan same-origin), så de når varken sessionsnyckeln eller kontot. */
(() => {
'use strict';
const BASE = location.pathname.replace(/\/+$/, '');   // '' på workers.dev, '/MyOffiCity' på nrnworld.one
const TOKEN_KEY = 'nrn.market.token', LANG_KEY = 'nrn.market.lang';
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const lsGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch { /* privat läge */ } };

const TX = {
  en: {
    mapNav: 'City map', coFormH: 'Create your company', coEditH: 'Your company', coName: 'Company name', coTagline: 'Short tagline', coDesc: 'What do you do?', coTags: 'Tags (comma separated, up to 5)', coServices: 'Services and prices', coServicesHint: 'One per line: Title | Price | Short description', coBuilding: 'Choose your office building', coB0: 'Startup loft', coB0d: 'Two floors, warm and open. Great to start with.', coB1: 'Modern tech hub', coB1d: 'Three floors, glass and oak. For a growing team.', coB2: 'Executive HQ', coB2d: 'Four floors with gold details. Made to impress.', coLogo: 'Logo (PNG only)', coLogoHint: 'The sign on your roof takes the shape of your logo: round, triangle or square.', coCreateBtn: 'Create company', coSaveBtn: 'Save changes', coSaved: 'Saved. Your office is in the city.', coLogoBad: 'Only PNG images are allowed.', coLogoBig: 'The image is too large.', coLogoNone: 'No logo', coShaperound: 'Round sign', coShapetri: 'Triangle sign', coShaperect: 'Square sign', coNeedName: 'Give your company a name (at least 2 characters).', coAppNote: 'The AI team that does the work runs in the MyOffiCity app on your computer. Here you manage how your company looks and what it offers.', coSeeCity: 'See it in the city', coRemoveLogo: 'Remove logo', demoTag: 'Demo', demoNote: 'Demo company: an example, it cannot be contacted or ordered from.', ovBtn: 'All companies', ovBack: 'Back to the office', ovTip: 'Zoomed out: click a building to go there.', homeCos: 'Companies in the city', homeCosP: 'Browse what they offer. Open one to see its office.', homeEmpty: 'No companies yet. Be the first to open an office.', seeInCity: 'See the office', fromPrice: 'From', mapNone: 'No company matches. Try another word, for example design, web or logo.', mapCount: ' companies', mapSearch: 'Search companies, for example design', chooseH: 'Welcome to MyOffiCity', chooseP: 'What do you want to do?', chCust: 'I am a customer', chCustP: 'Look around the city of companies, meet a salesperson and order a website.', chCo: 'Create my own company', chCoP: 'Run an AI company, publish it in the city and get orders from customers.', coStartH: 'Create your own company', coStep1: 'Create or sign in to your account on this site.', coStep2: 'Open the nRn Company app, go to Orders, then Online marketplace, and sign in with this same account.', coStep3: 'Press Publish. Your office appears in the city and customers can chat with you.', coLive: 'Your company is live in the city: ', coMine: 'My company', coCreate: 'Create company', coGoCity: 'See it in the city', coSignIn: 'Sign in or create account', chatsNav: 'Chats', mapH: 'Find a company in the city', mapP: 'Look at the offices. Click the company sign on the roof to read about the company and contact them to buy a service.', mapEmpty: 'No companies in the city yet.', mapList: 'Show as list', cityTip: 'Drag to turn, scroll to zoom, click the sign on the roof.', bTier0: 'Startup loft', bTier1: 'Modern tech hub', bTier2: 'Executive HQ', meetSales: 'Contact the company', orderSvc: 'Order a service', viewProfile: 'View profile', closeIt: 'Close', ownCo: 'This is your company.', chatsH: 'Chats', chatsNone: 'No chats yet. Open a company in the city and choose Contact the company.', chatWith: 'Chat with the salesperson at ', chatCustomer: 'Customer: ', chatSend: 'Send', chatHint: 'Write a message', chatSales: 'Salesperson', chatNeedLogin: 'Sign in to chat with a salesperson.', chatYouCo: 'You are the owner of this company. Reply to the customer below.', done: 'jobs', catWeb: 'Web & apps', catDesign: 'Design & brand', catShop: 'Webshop & e-commerce', catContent: 'Text & visibility', catMedia: 'Video & media', catOther: 'Other', catTitle: 'Category', catNarrow: 'Narrow down', companies: 'Companies', orders: 'My orders', account: 'Account', signin: 'Sign in', register: 'Create account', signout: 'Sign out', username: 'Username', password: 'Password',
    email: 'Email', emailReq: 'An email address is required.', orWith: 'or', emailWhy: 'Needed to reset your password and for important messages.', pwHint: 'At least 10 characters.', haveAcc: 'I already have an account', noAcc: 'Create a new account', forgotQ: 'Forgot your password?',
    heroH: 'Hire an AI team for your project', heroP: 'Find a company, tell them what you need and follow the work: you get four proposals, pick your favourite and receive the finished website.',
    search: 'Search companies, services, topics…', none: 'No companies match. Try other words or clear the filters.', order: 'Order from this company', services: 'Services', back: 'Back',
    sortBest: 'Best match', sortRating: 'Highest rated', sortOrders: 'Most delivered', sortNew: 'Newest', allTags: 'All', page: 'Page', of: 'of', prev: 'Previous', next: 'Next', found: 'companies',
    reviews: 'Reviews', noReviews: 'No reviews yet', jobs: 'delivered', rating: 'rating',
    yourName: 'Your name', title: 'Project name', size: 'Size', brief: 'What do you want?', briefPh: 'Who is it for, what should the site do, what style do you like…', send: 'Send order',
    small: 'Small (one page)', medium: 'Medium (3 to 5 pages)', large: 'Large (6 to 8 pages)', needLogin: 'Sign in to place an order.', ordered: 'Your order was sent.',
    noOrders: 'You have no orders yet.', msg: 'Write a message…', sendMsg: 'Send', conv: 'Conversation', me: 'You',
    open: 'Open large', choose: 'Choose this one', picked: 'Chosen', note: 'Anything the team should know? (optional)', pickH: 'Choose your favourite', pickP: 'Four proposals from the team. Open them large, then choose one.',
    openSite: 'Open the website', dl: 'Download as zip', close: 'Close', desktop: 'Desktop', mobile: 'Mobile',
    rateH: 'Rate this work', rateP: 'Your rating is shown on the company profile and helps others choose.', rateText: 'How did it go? (optional)', rateSend: 'Send rating', rated: 'Thank you for your rating', rateEdit: 'Change my rating',
    st_new: 'Sent, waiting for the company', st_variants_run: 'Being prepared', st_variants_report: 'Being prepared', st_variants_shown: 'Choose your favourite', st_chosen: 'Your choice is being passed on', st_build_run: 'Being built', st_build_report: 'Final checks', st_delivered: 'Ready',
    wait: 'The company has your order. You will see the proposals here when they are ready.', working: 'Your choice is being built. You will see the website here when it is ready.', ready: 'Your website is ready',
    err: 'Something went wrong', netErr: 'Could not reach the server', by: 'Company',
    recH: 'Save your recovery code', recP: 'This code is the way back into your account if you forget your password and have no confirmed email. It is shown only once. Save it in a password manager or on paper.', recSaved: 'I have saved my recovery code', recCopy: 'Copy', recDl: 'Download', recGo: 'Continue', copied: 'Copied',
    accH: 'Your account', emailLabel: 'Email', emailVerified: 'Confirmed', emailUnverified: 'Not confirmed yet: open the link we sent you', emailSave: 'Save email', emailNoMail: 'Email sending is not switched on on this server yet, so confirmation and reset by email are not available. Your recovery code works.', emailSaved: 'Email saved',
    pwH: 'Change password', pwOld: 'Current password', pwNew: 'New password', pwSave: 'Change password', pwDone: 'Password changed',
    recNewH: 'Recovery code', recNewP: 'Create a new recovery code (the old one stops working). Enter your password to confirm.', recNewBtn: 'Create new code',
    forgotH: 'Reset your password', byEmail: 'By email', emailSent: 'If that address belongs to an account with a confirmed email, a reset link is on its way.', sendLink: 'Send reset link', byCode: 'With your recovery code', recCode: 'Recovery code', resetBtn: 'Reset password', mailOff: 'Email is not available on this server yet: use your recovery code.', resetDone: 'Your password was reset. You are signed in.',
    resetH: 'Choose a new password', verifyOk: 'Your email address is confirmed.', verifyBad: 'This link is invalid or has expired.', verifying: 'Confirming…',
    keysCoOnly: 'Claude and API access is only for company accounts. Create and publish your company first (Create company), then the keys appear here.', keysH: 'API keys for AI tools', keysP: 'Let Claude, Codex, Cursor, Copilot, Gemini, OpenCode or your own program work with your account. Each key has a level and can be removed at any time.',
    keyName: 'Name (for example: Claude Code on my laptop)', keyScope: 'What may it do?', keyCreate: 'Create key',
    scRead: 'Read only: search and read, change nothing', scWrite: 'Read and write: messages, proposals, files and status. Cannot place orders or mark work delivered', scFull: 'Full: also place orders and mark delivered. Only for tools you trust',
    keyOnce: 'Copy the key now. It is shown only once.', keyNone: 'No keys yet.', keyLast: 'last used', keyNever: 'never used', keyDel: 'Remove', keyDelAsk: 'Remove this key? Tools using it stop working at once.',
    connectH: 'Connect an AI tool', connectP: 'Pick your tool. They all use the same server, so you can connect several. Replace YOUR_KEY with your key.', keyFresh: 'Your new key is filled in below.', copyIt: 'Copy', authH: 'Connect an app', authWant: ' wants to use your MyOffiCity account.', authLevel: 'What may it do?', authRead: 'Read only: search and read', authWrite: 'Read and write: messages, proposals, files (cannot place orders or deliver)', authFull: 'Everything, including placing orders and delivering', authAllow: 'Allow', authDeny: 'Cancel', authBad: 'This connection request is not valid.', authNote: 'You can remove the access later under Account > API keys.', askAi: 'Ask your AI to do it', askAiWhere: 'Paste this into Claude Code, Codex, Cursor, Copilot, Gemini CLI or any agent that can run commands',
  },
  sv: {
    mapNav: 'Stadskarta', coFormH: 'Skapa ditt företag', coEditH: 'Ditt företag', coName: 'Företagsnamn', coTagline: 'Kort slogan', coDesc: 'Vad gör ni?', coTags: 'Taggar (kommaseparerade, högst 5)', coServices: 'Tjänster och priser', coServicesHint: 'En per rad: Titel | Pris | Kort beskrivning', coBuilding: 'Välj ditt kontorshus', coB0: 'Startup-loft', coB0d: 'Två våningar, varmt och öppet. Bra att börja med.', coB1: 'Modern tech-hub', coB1d: 'Tre våningar i glas och ek. För ett växande team.', coB2: 'Executive HQ', coB2d: 'Fyra våningar med guldiga detaljer. Gjort för att imponera.', coLogo: 'Logotyp (bara PNG)', coLogoHint: 'Skylten på taket får logotypens form: rund, triangel eller fyrkant.', coCreateBtn: 'Skapa företag', coSaveBtn: 'Spara ändringar', coSaved: 'Sparat. Ditt kontor finns i staden.', coLogoBad: 'Bara PNG-bilder är tillåtna.', coLogoBig: 'Bilden är för stor.', coLogoNone: 'Ingen logotyp', coShaperound: 'Rund skylt', coShapetri: 'Triangelskylt', coShaperect: 'Fyrkantig skylt', coNeedName: 'Ge företaget ett namn (minst 2 tecken).', coAppNote: 'AI-teamet som gör jobbet körs i MyOffiCity-appen på din dator. Här hanterar du hur företaget ser ut och vad det erbjuder.', coSeeCity: 'Se det i staden', coRemoveLogo: 'Ta bort logotyp', demoTag: 'Demo', demoNote: 'Demoföretag: ett exempel, går inte att kontakta eller beställa från.', ovBtn: 'Alla företag', ovBack: 'Tillbaka till kontoret', ovTip: 'Utzoomat: klicka på en byggnad för att gå dit.', homeCos: 'Företag i staden', homeCosP: 'Bläddra bland vad de erbjuder. Öppna ett för att se dess kontor.', homeEmpty: 'Inga företag än. Bli först med att öppna ett kontor.', seeInCity: 'Se kontoret', fromPrice: 'Från', mapNone: 'Inget företag matchar. Prova ett annat ord, till exempel design, webb eller logga.', mapCount: ' företag', mapSearch: 'Sök företag, till exempel design', chooseH: 'Välkommen till MyOffiCity', chooseP: 'Vad vill du göra?', chCust: 'Jag är kund', chCustP: 'Titta runt i företagsstaden, träffa en säljare och beställ en hemsida.', chCo: 'Skapa eget företag', chCoP: 'Driv ett AI-företag, publicera det i staden och få beställningar från kunder.', coStartH: 'Skapa ditt eget företag', coStep1: 'Skapa eller logga in på ditt konto på den här sajten.', coStep2: 'Öppna nRn Company-appen, gå till Orders, sedan Online-marknadsplats, och logga in med samma konto.', coStep3: 'Tryck Publicera. Ditt kontor syns i staden och kunder kan chatta med dig.', coLive: 'Ditt företag finns i staden: ', coMine: 'Mitt företag', coCreate: 'Skapa företag', coGoCity: 'Se det i staden', coSignIn: 'Logga in eller skapa konto', chatsNav: 'Chattar', mapH: 'Hitta ett företag i staden', mapP: 'Titta på kontoren. Klicka på företagets skylt på taket för att läsa om företaget och kontakta dem för att köpa en tjänst.', mapEmpty: 'Inga företag i staden än.', mapList: 'Visa som lista', cityTip: 'Dra för att snurra, scrolla för att zooma, klicka på skylten på taket.', bTier0: 'Startup-loft', bTier1: 'Modern tech-hub', bTier2: 'Executive HQ', meetSales: 'Kontakta företaget', orderSvc: 'Beställ tjänst', viewProfile: 'Visa profil', closeIt: 'Stäng', ownCo: 'Det här är ditt företag.', chatsH: 'Chattar', chatsNone: 'Inga chattar än. Öppna ett företag i staden och välj Kontakta företaget.', chatWith: 'Chatt med säljaren på ', chatCustomer: 'Kund: ', chatSend: 'Skicka', chatHint: 'Skriv ett meddelande', chatSales: 'Säljare', chatNeedLogin: 'Logga in för att chatta med en säljare.', chatYouCo: 'Du är ägare av det här företaget. Svara kunden nedan.', done: 'jobb', catWeb: 'Webb & appar', catDesign: 'Design & varumärke', catShop: 'Webbshop & e-handel', catContent: 'Text & synlighet', catMedia: 'Video & media', catOther: 'Övrigt', catTitle: 'Kategori', catNarrow: 'Smalna av', companies: 'Företag', orders: 'Mina beställningar', account: 'Konto', signin: 'Logga in', register: 'Skapa konto', signout: 'Logga ut', username: 'Användarnamn', password: 'Lösenord',
    email: 'E-post', emailReq: 'E-post krävs.', orWith: 'eller', emailWhy: 'Behövs för att återställa lösenordet och för viktiga meddelanden.', pwHint: 'Minst 10 tecken.', haveAcc: 'Jag har redan ett konto', noAcc: 'Skapa ett nytt konto', forgotQ: 'Glömt lösenordet?',
    heroH: 'Anlita ett AI-team till ditt projekt', heroP: 'Hitta ett företag, berätta vad du behöver och följ arbetet: du får fyra förslag, väljer din favorit och får den färdiga hemsidan.',
    search: 'Sök företag, tjänster, ämnen…', none: 'Inga företag matchar. Prova andra ord eller rensa filtren.', order: 'Beställ av det här företaget', services: 'Tjänster', back: 'Tillbaka',
    sortBest: 'Bäst träff', sortRating: 'Högst betyg', sortOrders: 'Flest levererade', sortNew: 'Nyast', allTags: 'Alla', page: 'Sida', of: 'av', prev: 'Föregående', next: 'Nästa', found: 'företag',
    reviews: 'Omdömen', noReviews: 'Inga omdömen än', jobs: 'levererade', rating: 'betyg',
    yourName: 'Ditt namn', title: 'Projektnamn', size: 'Storlek', brief: 'Vad vill du ha?', briefPh: 'Vem är den till, vad ska sajten göra, vilken stil gillar du…', send: 'Skicka beställning',
    small: 'Liten (en sida)', medium: 'Medel (3 till 5 sidor)', large: 'Stor (6 till 8 sidor)', needLogin: 'Logga in för att beställa.', ordered: 'Din beställning skickades.',
    noOrders: 'Du har inga beställningar än.', msg: 'Skriv ett meddelande…', sendMsg: 'Skicka', conv: 'Konversation', me: 'Du',
    open: 'Öppna stort', choose: 'Välj det här', picked: 'Valt', note: 'Något teamet ska veta? (valfritt)', pickH: 'Välj ditt favoritförslag', pickP: 'Fyra förslag från teamet. Öppna dem stort och välj ett.',
    openSite: 'Öppna hemsidan', dl: 'Ladda ner som zip', close: 'Stäng', desktop: 'Dator', mobile: 'Mobil',
    rateH: 'Betygsätt arbetet', rateP: 'Ditt betyg visas på företagets profil och hjälper andra att välja.', rateText: 'Hur gick det? (valfritt)', rateSend: 'Skicka betyg', rated: 'Tack för ditt betyg', rateEdit: 'Ändra mitt betyg',
    st_new: 'Skickad, väntar på företaget', st_variants_run: 'Förbereds', st_variants_report: 'Förbereds', st_variants_shown: 'Välj ditt favoritförslag', st_chosen: 'Ditt val förs vidare', st_build_run: 'Byggs', st_build_report: 'Slutkontroll', st_delivered: 'Klar',
    wait: 'Företaget har din beställning. Förslagen visas här när de är klara.', working: 'Ditt val byggs. Hemsidan visas här när den är klar.', ready: 'Din hemsida är klar',
    err: 'Något gick fel', netErr: 'Kunde inte nå servern', by: 'Företag',
    recH: 'Spara din återställningskod', recP: 'Koden är vägen tillbaka till kontot om du glömmer lösenordet och saknar bekräftad e-post. Den visas bara en gång. Spara den i en lösenordshanterare eller på papper.', recSaved: 'Jag har sparat min återställningskod', recCopy: 'Kopiera', recDl: 'Ladda ner', recGo: 'Fortsätt', copied: 'Kopierad',
    accH: 'Ditt konto', emailLabel: 'E-post', emailVerified: 'Bekräftad', emailUnverified: 'Inte bekräftad än: öppna länken vi skickade', emailSave: 'Spara e-post', emailNoMail: 'E-postutskick är inte påslaget på servern än, så bekräftelse och återställning via e-post finns inte. Din återställningskod fungerar.', emailSaved: 'E-post sparad',
    pwH: 'Byt lösenord', pwOld: 'Nuvarande lösenord', pwNew: 'Nytt lösenord', pwSave: 'Byt lösenord', pwDone: 'Lösenordet är bytt',
    recNewH: 'Återställningskod', recNewP: 'Skapa en ny återställningskod (den gamla slutar fungera). Skriv ditt lösenord för att bekräfta.', recNewBtn: 'Skapa ny kod',
    forgotH: 'Återställ ditt lösenord', byEmail: 'Via e-post', emailSent: 'Om adressen tillhör ett konto med bekräftad e-post är en återställningslänk på väg.', sendLink: 'Skicka återställningslänk', byCode: 'Med din återställningskod', recCode: 'Återställningskod', resetBtn: 'Återställ lösenordet', mailOff: 'E-post är inte tillgängligt på servern än: använd din återställningskod.', resetDone: 'Lösenordet är återställt. Du är inloggad.',
    resetH: 'Välj ett nytt lösenord', verifyOk: 'Din e-postadress är bekräftad.', verifyBad: 'Länken är ogiltig eller har gått ut.', verifying: 'Bekräftar…',
    keysCoOnly: 'Claude- och API-kopplingar finns bara för företagskonton. Skapa och publicera ditt företag först (Skapa företag), sedan visas nycklarna här.', keysH: 'API-nycklar för AI-verktyg', keysP: 'Låt Claude, Codex, Cursor, Copilot, Gemini, OpenCode eller ett eget program arbeta med ditt konto. Varje nyckel har en nivå och kan tas bort när som helst.',
    keyName: 'Namn (till exempel: Claude Code på min laptop)', keyScope: 'Vad får den göra?', keyCreate: 'Skapa nyckel',
    scRead: 'Bara läsa: söka och läsa, ändrar ingenting', scWrite: 'Läsa och skriva: meddelanden, förslag, filer och status. Kan inte lägga beställningar eller markera som levererat', scFull: 'Full: även lägga beställningar och markera som levererat. Bara för verktyg du litar på',
    keyOnce: 'Kopiera nyckeln nu. Den visas bara en gång.', keyNone: 'Inga nycklar än.', keyLast: 'senast använd', keyNever: 'aldrig använd', keyDel: 'Ta bort', keyDelAsk: 'Ta bort nyckeln? Verktyg som använder den slutar fungera direkt.',
    connectH: 'Koppla ett AI-verktyg', connectP: 'Välj ditt verktyg. De använder alla samma server, så du kan koppla flera. Byt ut YOUR_KEY mot din nyckel.', keyFresh: 'Din nya nyckel är ifylld nedan.', copyIt: 'Kopiera', authH: 'Koppla en app', authWant: ' vill använda ditt MyOffiCity-konto.', authLevel: 'Vad får den göra?', authRead: 'Bara läsa: söka och läsa', authWrite: 'Läsa och skriva: meddelanden, förslag, filer (kan inte lägga beställningar eller leverera)', authFull: 'Allt, även lägga beställningar och leverera', authAllow: 'Tillåt', authDeny: 'Avbryt', authBad: 'Den här kopplingsförfrågan är inte giltig.', authNote: 'Du kan ta bort åtkomsten senare under Konto > API-nycklar.', askAi: 'Be din AI göra det', askAiWhere: 'Klistra in detta i Claude Code, Codex, Cursor, Copilot, Gemini CLI eller en annan agent som kan köra kommandon',
  },
};
let lang = lsGet(LANG_KEY) || ((navigator.language || 'en').toLowerCase().startsWith('sv') ? 'sv' : 'en');
const t = (k) => (TX[lang] && TX[lang][k]) || TX.en[k] || k;

let token = lsGet(TOKEN_KEY), me = null, poll = null, viewer = null, mailOn = false;
const sq = { q: '', tag: '', cat: '', sort: 'best', page: 1 };

/* ---------- server ---------- */
async function api(method, path, body) {
  let res;
  try {
    res = await fetch(BASE + '/api' + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch { throw new Error(t('netErr')); }
  const j = await res.json().catch(() => ({}));
  if (res.status === 401 && token) { token = null; me = null; lsSet(TOKEN_KEY, null); renderBar(); }
  if (!res.ok) throw new Error((j.error && j.error.message) || t('err'));
  return j;
}
const toast = (m) => { const el = $('#toast'); el.textContent = m; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 3200); };
const stars = (n) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));
const ratingHtml = (r) => r && r.count ? '<span class="stars" title="' + esc(r.avg) + '">' + stars(r.avg) + '</span> <b>' + esc(r.avg.toFixed(1)) + '</b> <span class="muted small">(' + esc(r.count) + ')</span>' : '<span class="muted small">' + esc(t('noReviews')) + '</span>';

/* ---------- visning av genererade sajter ---------- */
function bundle(files, page) {
  let h = String(files[page] || '');
  const norm = (u) => String(u).replace(/^\.\//, '').split(/[?#]/)[0];
  h = h.replace(/<link\b[^>]*?href\s*=\s*["']([^"']+)["'][^>]*>/gi, (m, u) => /rel\s*=\s*["']?stylesheet/i.test(m) && files[norm(u)] != null ? '<style>' + files[norm(u)] + '</style>' : m);
  h = h.replace(/<script\b([^>]*?)\bsrc\s*=\s*["']([^"']+)["']([^>]*)>\s*<\/script>/gi, (m, a, u, b) => files[norm(u)] != null ? '<script' + a + b + '>' + String(files[norm(u)]).replace(/<\/script/gi, '<\\/script') + '<\/script>' : m);
  return h;
}
const inject = (html, code) => /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, m => m + code) : code + html;
function closeViewer() { if (!viewer) return; window.removeEventListener('message', viewer.onMsg); viewer.el.remove(); viewer = null; }
function openViewer(title, files) {
  closeViewer();
  const pages = Object.keys(files).filter(f => /\.html?$/i.test(f));
  let page = pages.includes('index.html') ? 'index.html' : pages[0];
  const id = 'v' + Math.random().toString(36).slice(2);
  const nav = '<script>document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[href]");if(!a)return;var h=a.getAttribute("href");if(!h||/^(https?:|mailto:|tel:|#|javascript:)/i.test(h))return;e.preventDefault();parent.postMessage({__ov:"' + id + '",go:h.split(/[?#]/)[0]},"*");});<\/script>';
  const el = document.createElement('div'); el.className = 'viewer';
  el.innerHTML = '<div class="vbar"><b>' + esc(title) + '</b><div class="tabs" id="vt"></div><button data-d="1280">' + esc(t('desktop')) + '</button><button data-d="390">' + esc(t('mobile')) + '</button><button data-x>' + esc(t('close')) + '</button></div><div class="vbody"><iframe sandbox="allow-scripts" id="vf" title="preview"></iframe></div>';
  document.body.appendChild(el);
  const fr = $('#vf', el), tabs = $('#vt', el);
  const show = () => { fr.srcdoc = inject(bundle(files, page), nav); tabs.innerHTML = pages.length > 1 ? pages.map(p => '<button class="' + (p === page ? 'on' : '') + '" data-p="' + esc(p) + '">' + esc(p) + '</button>').join('') : ''; };
  const onMsg = (e) => { if (e.source === fr.contentWindow && e.data && e.data.__ov === id && pages.includes(e.data.go)) { page = e.data.go; show(); } };
  window.addEventListener('message', onMsg);
  el.addEventListener('click', (e) => {
    if (e.target.closest('[data-x]') || e.target === el) return closeViewer();
    const p = e.target.closest('[data-p]'); if (p) { page = p.dataset.p; show(); return; }
    const d = e.target.closest('[data-d]'); if (d) fr.style.maxWidth = d.dataset.d + 'px';
  });
  viewer = { el, onMsg }; show();
}
function crc32(buf) { let crc = -1; for (let n = 0; n < buf.length; n++) { let c = (crc ^ buf[n]) & 0xff; for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xEDB88320 : c >>> 1; crc = (crc >>> 8) ^ c; } return (crc ^ -1) >>> 0; }
function makeZip(files) {
  const enc = new TextEncoder(), parts = [], cd = []; let off = 0; const names = Object.keys(files);
  for (const name of names) {
    const nb = enc.encode(name), db = enc.encode(String(files[name])), crc = crc32(db);
    const lh = new DataView(new ArrayBuffer(30)); lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(12, 0x21, true); lh.setUint32(14, crc, true); lh.setUint32(18, db.length, true); lh.setUint32(22, db.length, true); lh.setUint16(26, nb.length, true);
    parts.push(new Uint8Array(lh.buffer), nb, db);
    const ch = new DataView(new ArrayBuffer(46)); ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(14, 0x21, true); ch.setUint32(16, crc, true); ch.setUint32(20, db.length, true); ch.setUint32(24, db.length, true); ch.setUint16(28, nb.length, true); ch.setUint32(42, off, true);
    cd.push(new Uint8Array(ch.buffer), nb); off += 30 + nb.length + db.length;
  }
  const size = cd.reduce((a, b) => a + b.length, 0), end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, names.length, true); end.setUint16(10, names.length, true); end.setUint32(12, size, true); end.setUint32(16, off, true);
  return new Blob([...parts, ...cd, new Uint8Array(end.buffer)], { type: 'application/zip' });
}
function saveBlob(blob, name) { const a = document.createElement('a'), url = URL.createObjectURL(blob); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000); }
const slug = (s, d) => String(s || d).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || d;
const download = (o) => saveBlob(makeZip(o.files || {}), slug(o.title, 'website') + '.zip');

/* ---------- navigering ---------- */
const fmt = (ts) => new Date(ts).toLocaleString(lang === 'sv' ? 'sv-SE' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
function renderBar() {
  const r = location.hash || '#/';
  $('#nav').innerHTML = '<a href="#/" class="' + (r === '#/' ? 'on' : '') + '">' + esc(t('mapNav')) + '</a><a href="#/list" class="' + (r === '#/list' || r.startsWith('#/company') ? 'on' : '') + '">' + esc(t('companies')) + '</a>' + '<a href="#/company-start" class="' + (r === '#/company-start' ? 'on' : '') + '">' + esc(me && me.company ? t('coMine') : t('coCreate')) + '</a>' + (token ? '<a href="#/chats" class="' + (r.startsWith('#/chat') ? 'on' : '') + '">' + esc(t('chatsNav')) + '</a><a href="#/orders" class="' + (r.startsWith('#/order') ? 'on' : '') + '">' + esc(t('orders')) + '</a><a href="#/account" class="' + (r === '#/account' ? 'on' : '') + '">' + esc(t('account')) + '</a>' : '');
  $('#who').innerHTML = me ? '<b>' + esc(me.user.username) + '</b> <button class="btn ghost sm" id="out">' + esc(t('signout')) + '</button>' : '<a class="btn sm" href="#/login">' + esc(t('signin')) + '</a>';
  const out = $('#out'); if (out) out.onclick = async () => { try { await api('POST', '/logout', {}); } catch { /* */ } token = null; me = null; lsSet(TOKEN_KEY, null); location.hash = '#/'; renderBar(); route(); };
  $('#lang').value = lang;
}
async function loadMe() { if (!token) { me = null; return; } try { me = await api('GET', '/me'); mailOn = !!me.features.email; } catch { me = null; } }
let googleId = '';
async function loadFeatures() { try { const h = await api('GET', '/health'); mailOn = !!h.email; googleId = h.google || ''; } catch { /* */ } }
function googleButton() {
  const box = $('#gbtn'); if (!box || !googleId) return;
  const init = () => {
    window.google.accounts.id.initialize({ client_id: googleId, callback: async (r) => {
      try { const j = await api('POST', '/auth/google', { credential: r.credential }); token = j.token; lsSet(TOKEN_KEY, token); await loadMe(); renderBar(); goNext(); }
      catch (e) { const el = $('#le'); if (el) el.innerHTML = '<div class="err">' + esc(e.message) + '</div>'; }
    } });
    window.google.accounts.id.renderButton(box, { theme: 'outline', size: 'large', shape: 'rectangular', text: 'continue_with', width: 300, locale: lang });
  };
  if (window.google && window.google.accounts) return init();
  const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.onload = init; document.head.appendChild(s);
}

/* ---------- företag: sök, taggar, sortering ---------- */
let cityLoad = null, officeHost = null, curCo = null, focusCo = null;
const loadOffice = () => cityLoad || (cityLoad = new Promise((ok, no) => {
  const add = (src, next) => { const el = document.createElement('script'); el.src = src; el.onload = next; el.onerror = () => { cityLoad = null; no(new Error('3D')); }; document.head.appendChild(el); };
  const full = () => add('office.js?v=8', ok);
  window.THREE ? full() : add('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', full);
}));
let officeCv = null, showCb = null;
function ensureOffice() {
  if (officeHost) return;
  officeHost = document.createElement('div'); officeHost.className = 'city-host';
  officeCv = document.createElement('canvas'); const ov = document.createElement('div'); ov.id = 'overlay';
  officeHost.append(officeCv, ov);
  Office.init(officeCv, ov);
  Office.sign(() => curCo && showCb && showCb(curCo));
}
const CATS = [   // [id, textnyckel, taggar som hör hit]
  ['web', 'catWeb', ['webb', 'web', 'webbapp', 'app', 'mobil', 'verktyg', 'kalender', 'förening', 'småföretag', 'hemsida', 'landningssida']],
  ['design', 'catDesign', ['design', 'logo', 'logga', 'varumärke', 'portfolio', 'grafik', 'ux']],
  ['shop', 'catShop', ['webbshop', 'e-handel', 'shop', 'butik']],
  ['content', 'catContent', ['text', 'copywriting', 'seo', 'analys', 'blogg', 'innehåll']],
  ['media', 'catMedia', ['video', 'animation', 'foto', 'sociala medier', 'film', 'ljud']],
];
function detectShape(d, w, h) {   // rund / triangel / fyrkant utifrån var bilden är ogenomskinlig
  let minx = w, miny = h, maxx = -1, maxy = -1, n = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 40) { n++; if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y; }
  if (!n) return 'rect';
  const bw = maxx - minx + 1, bh = maxy - miny + 1, fill = n / (bw * bh), ar = bw / bh;
  if (fill > .88) return 'rect';
  const band = (x0, y0, x1, y1) => { let c = 0; for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (d[(y * w + x) * 4 + 3] > 40) c++; return c; };
  const bt = Math.max(2, Math.round(bh * .22)), bl = Math.max(2, Math.round(bw * .22));
  const top = band(minx, miny, maxx + 1, miny + bt), bot = band(minx, maxy + 1 - bt, maxx + 1, maxy + 1), left = band(minx, miny, minx + bl, maxy + 1), right = band(maxx + 1 - bl, miny, maxx + 1, maxy + 1);
  const asym = (a, b) => Math.max(a, 1) / Math.max(b, 1);
  if (fill > .36 && fill < .64 && (asym(bot, top) > 2.2 || asym(top, bot) > 2.2 || asym(right, left) > 2.2 || asym(left, right) > 2.2)) return 'tri';
  if (fill > .68 && fill < .88 && ar > .8 && ar < 1.25) return 'round';
  return 'rect';
}
async function logoFromFile(file) {
  if (!file || file.type !== 'image/png') throw new Error(t('coLogoBad'));
  if (file.size > 3000000) throw new Error(t('coLogoBig'));
  const buf = new Uint8Array(await file.arrayBuffer());
  if (buf.length < 33 || [137, 80, 78, 71, 13, 10, 26, 10].some((v, i) => buf[i] !== v)) throw new Error(t('coLogoBad'));
  const url = URL.createObjectURL(file);
  const img = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error(t('coLogoBad'))); i.src = url; });
  URL.revokeObjectURL(url);
  for (const max of [320, 220, 150]) {
    const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight)), w = Math.max(1, Math.round(img.naturalWidth * k)), h = Math.max(1, Math.round(img.naturalHeight * k));
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.drawImage(img, 0, 0, w, h);
    const dataUrl = c.toDataURL('image/png');
    if (dataUrl.length < 200000) return { png: dataUrl.split(',')[1], dataUrl, shape: detectShape(g.getImageData(0, 0, w, h).data, w, h) };
  }
  throw new Error(t('coLogoBig'));
}
const TIER_KEY = ['loft', 'kontor', 'hq'], TIER_STAFF = [5, 8, 12], PCOL = ['#6c8cff', '#ff8a5c', '#3ccf91', '#c77dff', '#ffd166', '#4dd0e1', '#ef6f8f', '#9ccc65'];
const sampleStaff = (n, v = 0) => Array.from({ length: n }, (_, i) => ({ id: 's' + i, name: 'Staff', rank: i === 0 ? 'leader' : i < 3 ? 'lead' : 'worker', kind: i % 3 ? 'dev' : 'design', color: PCOL[(i + v) % 8], title: '' }));
const variantOf = (id) => [...String(id)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) % 12;   // samma id ger alltid samma utseende (färger, omgivning, detaljer)
const logoOf = (c) => c.logo ? { url: location.origin + BASE + '/api/companies/' + c.id + '/logo.png?v=' + c.logo.v, shape: c.logo.shape } : null;
const thumbCache = {};
async function thumbOf(c) {
  const key = c.id + ':' + (c.logo ? c.logo.v : 0); if (thumbCache[key]) return thumbCache[key];
  await loadOffice(); ensureOffice();
  const lg = logoOf(c); if (lg) await Office.preloadLogo(lg.url);
  return (thumbCache[key] = Office.snapshot(TIER_KEY[c.building] || 'loft', sampleStaff((TIER_STAFF[c.building] || 5) - (variantOf(c.id) % 3), variantOf(c.id)), c.name, 520, 360, variantOf(c.id), lg));
}
const hourNow = () => { const d = new Date(); return d.getHours() + d.getMinutes() / 60; };
async function startChat(c) {
  if (!me) { try { sessionStorage.setItem('nrn.next', '#/map-chat/' + c.id); } catch { /* */ } toast(t('chatNeedLogin')); location.hash = '#/login'; return; }
  try { const j = await api('POST', '/companies/' + c.id + '/inquiry'); location.hash = '#/chat/' + j.id; } catch (e) { toast(e.message); }
}
async function pageMap() {
  $('#app').innerHTML = '<h1>' + esc(t('mapH')) + '</h1><p class="muted">' + esc(t('mapP')) + ' <a href="#/list">' + esc(t('mapList')) + '</a></p><div class="city-wrap"><input id="mq" placeholder="' + esc(t('mapSearch')) + '" value="' + esc(sq.q) + '" autocomplete="off"><div class="city-res" id="mres"></div><div class="city-bar" id="cityBar"></div><div id="cityHost" class="city"></div><div id="cityCard"></div><div class="city-tip muted small">' + esc(t('cityTip')) + '</div></div>';
  const j = await api('GET', '/companies?map=1&sort=new');
  const all = j.companies.slice().sort((a, b) => a.created - b.created);
  let list = all;
  if (!list.length) { $('#cityHost').innerHTML = '<p class="muted" style="padding:20px">' + esc(t('mapEmpty')) + '</p>'; return; }
  try { await loadOffice(); } catch { $('#cityHost').innerHTML = '<p class="err">' + esc(t('netErr')) + '</p>'; return; }
  const show = (c) => {   // bara det kunden får se: namn, vad de gör, priser, betyg. Ingen personal, analys eller projekt.
    $('#cityCard').innerHTML = '<div class="city-card"><button class="btn ghost sm" id="cc" style="float:right">' + esc(t('closeIt')) + '</button><h2>' + esc(c.name) + '</h2><p class="muted small">' + esc(t('bTier' + c.building)) + ' · ' + ratingHtml(c.rating) + ' · ' + esc(c.done) + ' ' + esc(t('done')) + '</p>'
      + (c.tagline ? '<p><b>' + esc(c.tagline) + '</b></p>' : '') + (c.description ? '<p class="small">' + esc(c.description.slice(0, 260)) + (c.description.length > 260 ? '…' : '') + '</p>' : '')
      + (c.tags.length ? '<p>' + c.tags.map(x => '<span class="tag">' + esc(x) + '</span>').join(' ') + '</p>' : '')
      + (c.services.length ? '<ul class="small">' + c.services.slice(0, 4).map(x => '<li><b>' + esc(x.title) + '</b>' + (x.price ? ' · ' + esc(x.price) : '') + '</li>').join('') + '</ul>' : '')
      + '' + (c.demo ? '<p class="small" style="border-left:3px solid var(--acc);padding-left:10px">' + esc(t('demoNote')) + '</p>' : '<div class="row"><button class="btn" id="cs">' + esc(t('meetSales')) + '</button><a class="btn ghost" href="#/company/' + esc(c.id) + '">' + esc(t('orderSvc')) + '</a></div>') + '</div>';
    $('#cc').onclick = () => { $('#cityCard').innerHTML = ''; };
    if ($('#cs')) $('#cs').onclick = () => { if (me && me.company && me.company.id === c.id) return toast(t('ownCo')); startChat(c); };
  };
  ensureOffice(); showCb = show; $('#cityHost').appendChild(officeHost);
  const hay = (c) => (c.name + ' ' + c.tagline + ' ' + c.description + ' ' + c.tags.join(' ') + ' ' + c.services.map(x => x.title + ' ' + x.desc).join(' ')).toLowerCase();
  const filt = () => { const w = sq.q.trim().toLowerCase().split(/\s+/).filter(Boolean); list = w.length ? all.filter(c => { const h = hay(c); return w.every(x => h.includes(x)); }) : all; };
  const res = () => {
    $('#mres').innerHTML = '<span class="muted small">' + list.length + esc(t('mapCount')) + '</span>' + list.slice(0, 24).map((c, i) => '<button class="chip' + (c === curCo ? ' on' : '') + '" data-i="' + i + '">' + esc(c.name) + ' <span class="muted small">' + esc(t('bTier' + c.building)) + '</span></button>').join('');
    $('#mres').querySelectorAll('.chip').forEach(b => { b.onclick = () => view(+b.dataset.i); });
  };
  const view = (i) => {
    if (!list.length) { curCo = null; $('#cityBar').innerHTML = '<span class="muted">' + esc(t('mapNone')) + '</span>'; $('#cityCard').innerHTML = ''; return res(); }
    const n = (i + list.length) % list.length, c = list[n]; curCo = c;
    Office.build({ tier: TIER_KEY[c.building] || 'loft', staff: sampleStaff((TIER_STAFF[c.building] || 5) - (variantOf(c.id) % 3), variantOf(c.id)), company: c.name, variant: variantOf(c.id), logoUrl: c.logo ? logoOf(c).url : '', logoShape: c.logo ? c.logo.shape : '', boss: '', bossTitle: '' });
    Office.setHour(hourNow()); Office.resize(); $('#cityCard').innerHTML = '';
    $('#cityBar').innerHTML = '<button class="btn ghost sm" id="cp">&larr;</button><b>' + esc(c.name) + '</b><span class="muted small">' + esc(t('bTier' + c.building)) + ' · ' + (n + 1) + '/' + list.length + '</span><button class="btn ghost sm" id="cn">&rarr;</button><button class="btn sm" id="cov" style="margin-left:auto">' + esc(t('ovBtn')) + '</button>';
    $('#cp').onclick = () => view(n - 1); $('#cn').onclick = () => view(n + 1); $('#cov').onclick = () => overview();
    res();
  };
  let mt; $('#mq').oninput = (e) => { clearTimeout(mt); mt = setTimeout(() => { sq.q = e.target.value; filt(); view(0); }, 200); };
  let ovTok = 0;
  const overview = () => {   // utzoomat läge: alla företags byggnader på en gång
    if (!list.length) return; const tok = ++ovTok, host = $('#cityHost');
    officeHost.remove(); const old = $('#ov'); if (old) old.remove();
    host.insertAdjacentHTML('beforeend', '<div class="ov" id="ov"><div class="ov-bar"><button class="btn sm" id="ovb">&larr; ' + esc(t('ovBack')) + '</button><span class="small">' + esc(t('ovTip')) + '</span></div><div class="ov-grid">'
      + list.map((c, i) => '<button class="ov-tile" data-i="' + i + '"><span class="ov-img"><img alt="" data-id="' + esc(c.id) + '"></span><b>' + esc(c.name) + '</b><small>' + esc(t('bTier' + c.building)) + '</small></button>').join('') + '</div></div>');
    const close = (i) => { ovTok++; const o = $('#ov'); if (o) o.remove(); host.appendChild(officeHost); view(i); };
    $('#ovb').onclick = () => close(Math.max(0, list.indexOf(curCo)));
    host.querySelectorAll('.ov-tile').forEach((b) => { b.onclick = () => close(+b.dataset.i); });
    (async () => { for (const c of list.slice(0, 60)) { if (tok !== ovTok) return; await new Promise((r) => setTimeout(r, 30)); const im = host.querySelector('img[data-id="' + c.id + '"]'); if (!im) continue; try { im.src = await thumbOf(c); im.classList.add('on'); } catch { /* */ } } })();
  };
  Office.zoomOut(overview);
  filt(); view(Math.max(0, list.findIndex(c => focusCo && c.id === focusCo))); focusCo = null;
  poll = setInterval(() => Office.setHour(hourNow()), 60000);
}
const ROLE_KEY = 'nrn.market.role';
function pageChoose() {
  $('#app').innerHTML = '<div style="max-width:760px;margin:10px auto 0;text-align:center"><h1>' + esc(t('chooseH')) + '</h1><p class="muted">' + esc(t('chooseP')) + '</p><div class="grid" style="margin-top:20px">'
    + '<button class="card choose" id="chc"><h2>' + esc(t('chCust')) + '</h2><p class="muted">' + esc(t('chCustP')) + '</p></button>'
    + '<button class="card choose" id="chk"><h2>' + esc(t('chCo')) + '</h2><p class="muted">' + esc(t('chCoP')) + '</p></button></div></div>'
    + '<section class="showcase"><h2>' + esc(t('homeCos')) + '</h2><p class="muted small" style="margin:0 0 12px">' + esc(t('homeCosP')) + '</p><div class="rail-wrap"><button class="btn ghost sm rail-btn" id="rl" aria-label="Previous">&larr;</button><div class="rail" id="rail"><p class="muted small">…</p></div><button class="btn ghost sm rail-btn" id="rr" aria-label="Next">&rarr;</button></div></section>';
  $('#chc').onclick = () => { lsSet(ROLE_KEY, 'customer'); route(); };
  $('#chk').onclick = () => { lsSet(ROLE_KEY, 'company'); location.hash = '#/company-start'; };
  const rail = $('#rail');
  $('#rl').onclick = () => rail.scrollBy({ left: -rail.clientWidth * 0.8, behavior: 'smooth' });
  $('#rr').onclick = () => rail.scrollBy({ left: rail.clientWidth * 0.8, behavior: 'smooth' });
  api('GET', '/companies?map=1&sort=best').then((j) => {
    if (!j.companies.length) { rail.innerHTML = '<p class="muted">' + esc(t('homeEmpty')) + '</p>'; return; }
    rail.innerHTML = j.companies.map((c, i) => '<article class="co"><div class="co-img"><img data-i="' + esc(c.id) + '" alt="' + esc(c.name) + '" width="520" height="360"></div><div class="co-top"><span class="co-tier t' + c.building + '">' + esc(t('bTier' + c.building)) + '</span>' + (c.demo ? '<span class="pill">' + esc(t('demoTag')) + '</span>' : '') + '<span class="small">' + ratingHtml(c.rating) + '</span></div><h3>' + esc(c.name) + '</h3>'
      + (c.tagline ? '<p class="co-tag">' + esc(c.tagline) + '</p>' : '') + (c.tags.length ? '<p>' + c.tags.map(x => '<span class="tag">' + esc(x) + '</span>').join(' ') + '</p>' : '')
      + (c.services.length ? '<ul class="co-svc">' + c.services.slice(0, 3).map(x => '<li><span>' + esc(x.title) + '</span><b>' + esc(x.price || '') + '</b></li>').join('') + '</ul>' : '')
      + '<div class="row" style="margin-top:auto"><button class="btn sm" data-c="' + esc(c.id) + '">' + esc(t('seeInCity')) + '</button><a class="btn ghost sm" href="#/company/' + esc(c.id) + '">' + esc(t('viewProfile')) + '</a></div></article>').join('');
    loadOffice().then(async () => {   // riktiga byggnaden som bild, en i taget
      ensureOffice();
      for (const c of j.companies.slice(0, 24)) {
        await new Promise(r => setTimeout(r, 40));
        const im = rail.querySelector('img[data-i="' + c.id + '"]'); if (!im || !document.body.contains(im)) return;
        try { im.src = await thumbOf(c); im.classList.add('on'); } catch { /* */ }
      }
    }).catch(() => {});
    rail.querySelectorAll('button[data-c]').forEach(b => { b.onclick = () => { focusCo = b.dataset.c; lsSet(ROLE_KEY, 'customer'); if (location.hash === '#/') route(); else location.hash = '#/'; }; });
  }).catch(() => { rail.innerHTML = ''; });
}
async function pageCompanyStart() {
  lsSet(ROLE_KEY, 'company');
  if (!me) {
    try { sessionStorage.setItem('nrn.next', '#/company-start'); } catch { /* */ }
    $('#app').innerHTML = '<div style="max-width:620px;margin:24px auto"><h1>' + esc(t('coStartH')) + '</h1><div class="card"><p>' + esc(t('coStep1')) + '</p><a class="btn" href="#/login">' + esc(t('coSignIn')) + '</a></div></div>';
    return;
  }
  const c = me.company, svc = c ? c.services.map(x => [x.title, x.price, x.desc].filter((y, i) => i < 2 || y).join(' | ')).join('\n') : '';
  let pending = null, removeLogo = false, curShape = c && c.logo ? c.logo.shape : '';
  const curLogo = c && c.logo ? location.origin + BASE + '/api/companies/' + c.id + '/logo.png?v=' + c.logo.v : '';
  $('#app').innerHTML = '<div style="max-width:720px;margin:24px auto"><h1>' + esc(t(c ? 'coEditH' : 'coFormH')) + '</h1><p class="muted small">' + esc(t('coAppNote')) + '</p>'
    + '<div class="card"><label>' + esc(t('coName')) + '</label><input id="cn" maxlength="40" value="' + esc(c ? c.name : '') + '">'
    + '<label>' + esc(t('coTagline')) + '</label><input id="ct" maxlength="100" value="' + esc(c ? c.tagline : '') + '">'
    + '<label>' + esc(t('coDesc')) + '</label><textarea id="cd" rows="4" maxlength="800">' + esc(c ? c.description : '') + '</textarea>'
    + '<label>' + esc(t('coTags')) + '</label><input id="cg" maxlength="120" placeholder="webb, design, logo" value="' + esc(c ? c.tags.join(', ') : '') + '">'
    + '<label>' + esc(t('coServices')) + '</label><textarea id="cs" rows="4" placeholder="Landningssida | från 49 USD | En polerad sida">' + esc(svc) + '</textarea><p class="muted small" style="margin:4px 0 0">' + esc(t('coServicesHint')) + '</p></div>'
    + '<div class="card"><label style="margin-top:0">' + esc(t('coBuilding')) + '</label><div class="bopts">' + [0, 1, 2].map(i => '<label class="bopt"><input type="radio" name="cb" value="' + i + '"' + ((c ? c.building : 0) === i ? ' checked' : '') + '><span class="bimg"><img alt="" data-b="' + i + '"></span><b>' + esc(t('coB' + i)) + '</b><small>' + esc(t('coB' + i + 'd')) + '</small></label>').join('') + '</div></div>'
    + '<div class="card"><label style="margin-top:0">' + esc(t('coLogo')) + '</label><p class="muted small" style="margin:0 0 10px">' + esc(t('coLogoHint')) + '</p><div class="row" style="gap:12px;align-items:center"><span class="lg-prev" id="lgp">' + (curLogo ? '<img src="' + esc(curLogo) + '" alt="">' : '') + '</span><span class="pill" id="lgs">' + esc(curShape ? t('coShape' + curShape) : t('coLogoNone')) + '</span><input type="file" id="clg" accept="image/png" style="flex:1;min-width:200px"><button class="btn ghost sm" id="lgr"' + (curLogo ? '' : ' disabled') + '>' + esc(t('coRemoveLogo')) + '</button></div></div>'
    + '<div id="cme"></div><div class="row" style="margin-top:16px"><button class="btn" id="csv">' + esc(t(c ? 'coSaveBtn' : 'coCreateBtn')) + '</button>' + (c ? '<a class="btn ghost" id="csee" href="#/">' + esc(t('coSeeCity')) + '</a>' : '') + '</div></div>';
  loadOffice().then(() => { ensureOffice(); document.querySelectorAll('.bopt img').forEach((im, i) => { try { im.src = Office.snapshot(TIER_KEY[i], sampleStaff([5, 8, 12][i]), $('#cn') && $('#cn').value || 'MyOffiCity', 420, 300, 0, null); im.classList.add('on'); } catch { /* */ } }); }).catch(() => {});
  const msg = (m) => { $('#cme').innerHTML = m ? '<div class="err">' + esc(m) + '</div>' : ''; };
  $('#clg').onchange = async (e) => {
    msg(''); const f = e.target.files && e.target.files[0]; if (!f) return;
    try { pending = await logoFromFile(f); removeLogo = false; $('#lgp').innerHTML = '<img src="' + pending.dataUrl + '" alt="">'; $('#lgs').textContent = t('coShape' + pending.shape); $('#lgr').disabled = false; }
    catch (err) { pending = null; e.target.value = ''; msg(err.message); }
  };
  $('#lgr').onclick = () => { pending = null; removeLogo = true; $('#lgp').innerHTML = ''; $('#lgs').textContent = t('coLogoNone'); $('#clg').value = ''; $('#lgr').disabled = true; };
  $('#csv').onclick = async () => {
    msg(''); const name = $('#cn').value.trim(); if (name.length < 2) return msg(t('coNeedName'));
    $('#csv').disabled = true;
    try {
      const services = $('#cs').value.split('\n').map(l => l.split('|').map(x => x.trim())).filter(p => p[0]).map(p => ({ title: p[0], price: p[1] || '', desc: p[2] || '' }));
      const sel = document.querySelector('input[name=cb]:checked');
      const co = await api('PUT', '/company', { name, tagline: $('#ct').value, description: $('#cd').value, tags: $('#cg').value, services, building: sel ? +sel.value : 0 });
      if (pending) await api('PUT', '/company/logo', { png: pending.png, shape: pending.shape });
      else if (removeLogo && c && c.logo) await api('DELETE', '/company/logo');
      await loadMe(); renderBar(); focusCo = co.id; toast(t('coSaved')); pageCompanyStart();
    } catch (err) { msg(err.message); $('#csv').disabled = false; }
  };
}
async function pageChats() {
  if (!me) { try { sessionStorage.setItem('nrn.next', '#/chats'); } catch { /* */ } return pageLogin(); }
  const j = await api('GET', '/inquiries');
  $('#app').innerHTML = '<h1>' + esc(t('chatsH')) + '</h1>' + (j.inquiries.length ? j.inquiries.map(q => '<a class="card" style="display:block;text-decoration:none;color:inherit" href="#/chat/' + esc(q.id) + '"><b>' + esc(q.role === 'owner' ? t('chatCustomer') + q.customerName : q.companyName) + '</b> <span class="muted small">' + esc(fmt(q.last)) + '</span><br><span class="muted small">' + esc(q.lastText) + '</span></a>').join('') : '<p class="muted">' + esc(t('chatsNone')) + '</p>');
}
async function pageChat(id) {
  if (!me) { try { sessionStorage.setItem('nrn.next', '#/chat/' + id); } catch { /* */ } return pageLogin(); }
  let last = 0, info = null;
  const first = await api('GET', '/inquiries/' + id + '/messages');
  info = first;
  $('#app').innerHTML = '<p><a href="#/chats">&larr; ' + esc(t('chatsNav')) + '</a></p><div class="card"><h2>' + esc(first.role === 'owner' ? t('chatCustomer') + first.customerName : t('chatWith') + first.company.name) + '</h2>' + (first.role === 'owner' ? '<p class="muted small">' + esc(t('chatYouCo')) + '</p>' : '')
    + '<div class="msgs" id="ms" style="max-height:420px"></div><div class="row"><textarea id="mt" rows="2" placeholder="' + esc(t('chatHint')) + '" style="flex:1" maxlength="1000"></textarea><button class="btn" id="mb">' + esc(t('chatSend')) + '</button></div></div>';
  const add = (msgs) => {
    const box = $('#ms'); if (!box) return; const near = box.scrollHeight - box.scrollTop - box.clientHeight < 60;
    msgs.forEach(m => { last = Math.max(last, m.id); const mine = (info.role === 'owner') === m.fromOwner; const d = document.createElement('div'); d.className = 'msg' + (mine ? ' me' : ''); d.innerHTML = '<small>' + esc((m.fromOwner ? t('chatSales') : info.customerName) + ' · ' + fmt(m.created)) + '</small><p></p>'; d.querySelector('p').textContent = m.text; box.appendChild(d); });
    if (msgs.length && near) box.scrollTop = box.scrollHeight;
  };
  add(first.messages); $('#ms').scrollTop = $('#ms').scrollHeight;
  const send = async () => { const v = $('#mt').value.trim(); if (!v) return; $('#mb').disabled = true; try { await api('POST', '/inquiries/' + id + '/messages', { text: v }); $('#mt').value = ''; add((await api('GET', '/inquiries/' + id + '/messages?after=' + last)).messages); } catch (e) { toast(e.message); } $('#mb').disabled = false; };
  $('#mb').onclick = send; $('#mt').onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
  poll = setInterval(async () => { if (document.hidden || !location.hash.startsWith('#/chat/' + id)) return clearInterval(poll); try { add((await api('GET', '/inquiries/' + id + '/messages?after=' + last)).messages); } catch { /* */ } }, 4000);
}
async function pageCompanies() {
  $('#app').innerHTML = '<h1>' + esc(t('heroH')) + '</h1><p class="muted">' + esc(t('heroP')) + '</p>'
    + '<div class="card"><div class="row"><input id="q" style="flex:1;min-width:200px" placeholder="' + esc(t('search')) + '" value="' + esc(sq.q) + '"><select id="so" style="width:auto">' + [['best', 'sortBest'], ['rating', 'sortRating'], ['orders', 'sortOrders'], ['new', 'sortNew']].map(([v, k]) => '<option value="' + v + '"' + (sq.sort === v ? ' selected' : '') + '>' + esc(t(k)) + '</option>').join('') + '</select></div><div class="row" id="tg" style="margin-top:10px"></div></div><div id="res"></div>';
  let timer;
  $('#q').oninput = (e) => { clearTimeout(timer); timer = setTimeout(() => { sq.q = e.target.value; sq.page = 1; results(); }, 250); };
  $('#so').onchange = (e) => { sq.sort = e.target.value; sq.page = 1; results(); };
  try {
    const all = (await api('GET', '/companies?map=1')).companies, cnt = {};
    all.forEach(c => c.tags.forEach(x => { cnt[x] = (cnt[x] || 0) + 1; }));
    const known = new Set(CATS.flatMap(c => c[2]));
    const cats = CATS.map(([id, k, tags]) => ({ id, k, tags: tags.filter(x => cnt[x]) })).concat([{ id: 'other', k: 'catOther', tags: Object.keys(cnt).filter(x => !known.has(x)) }]).filter(c => c.tags.length);
    cats.forEach(c => { c.n = all.filter(co => co.tags.some(x => c.tags.includes(x))).length; });
    const draw = () => {
      const cur = cats.find(c => c.id === sq.cat);
      $('#tg').innerHTML = '<div class="cats"><button class="cat' + (sq.cat ? '' : ' on') + '" data-cat="">' + esc(t('allTags')) + ' <small>' + esc(all.length) + '</small></button>' + cats.map(c => '<button class="cat' + (sq.cat === c.id ? ' on' : '') + '" data-cat="' + c.id + '">' + esc(t(c.k)) + ' <small>' + esc(c.n) + '</small></button>').join('') + '</div>'
        + (cur && cur.tags.length > 1 ? '<div class="subtags"><span class="muted small">' + esc(t('catNarrow')) + ':</span>' + cur.tags.map(x => '<button class="chip btn-chip' + (sq.tag === x ? ' on' : '') + '" data-tag="' + esc(x) + '">' + esc(x) + ' <small>' + esc(cnt[x]) + '</small></button>').join('') + '</div>' : '');
    };
    draw();
    $('#tg').onclick = (e) => {
      const c = e.target.closest('[data-cat]'), g = e.target.closest('[data-tag]');
      if (c) { sq.cat = c.dataset.cat; const cur = cats.find(x => x.id === sq.cat); sq.tag = cur ? cur.tags.join(',') : ''; }
      else if (g) { const cur = cats.find(x => x.id === sq.cat); sq.tag = sq.tag === g.dataset.tag ? (cur ? cur.tags.join(',') : '') : g.dataset.tag; }
      else return;
      sq.page = 1; draw(); results();
    };
  } catch { /* taggar är bara en bekvämlighet */ }
  await results();
}
async function results() {
  const qs = new URLSearchParams({ q: sq.q, tag: sq.tag, sort: sq.sort, page: String(sq.page) });
  const j = await api('GET', '/companies?' + qs);
  const box = $('#res'); if (!box) return;
  box.innerHTML = '<p class="muted small" style="margin:12px 2px 0">' + esc(j.total) + ' ' + esc(t('found')) + '</p><div class="grid">' + (j.companies.map(c => '<a class="card" href="#/company/' + esc(c.id) + '" style="text-decoration:none;color:inherit"><h2>' + esc(c.name) + '</h2><div>' + ratingHtml(c.rating) + (c.done ? ' <span class="muted small">· ' + esc(c.done) + ' ' + esc(t('jobs')) + '</span>' : '') + '</div><span class="muted">' + esc(c.tagline) + '</span><div class="row">' + c.tags.map(x => '<span class="chip">' + esc(x) + '</span>').join('') + '</div><div class="muted small">' + c.services.slice(0, 3).map(s => esc(s.title) + (s.price ? ' · ' + esc(s.price) : '')).join(' &nbsp;|&nbsp; ') + '</div></a>').join('') || '<p class="muted">' + esc(t('none')) + '</p>') + '</div>'
    + (j.pages > 1 ? '<div class="row" style="justify-content:center;margin-top:16px"><button class="btn ghost sm" id="pp" ' + (j.page <= 1 ? 'disabled' : '') + '>' + esc(t('prev')) + '</button><span class="muted small">' + esc(t('page')) + ' ' + esc(j.page) + ' ' + esc(t('of')) + ' ' + esc(j.pages) + '</span><button class="btn ghost sm" id="pn" ' + (j.page >= j.pages ? 'disabled' : '') + '>' + esc(t('next')) + '</button></div>' : '');
  const go = (d) => () => { sq.page = j.page + d; results(); window.scrollTo(0, 0); };
  if ($('#pp')) { $('#pp').onclick = go(-1); $('#pn').onclick = go(1); }
}
async function pageCompany(id) {
  const { company: c, reviews } = await api('GET', '/companies/' + id);
  $('#app').innerHTML = '<p><a href="#/">← ' + esc(t('back')) + '</a></p><h1>' + esc(c.name) + '</h1><div style="margin:4px 0">' + ratingHtml(c.rating) + (c.done ? ' <span class="muted small">· ' + esc(c.done) + ' ' + esc(t('jobs')) + '</span>' : '') + '</div><p class="muted">' + esc(c.tagline) + '</p>'
    + '<div class="card"><p>' + esc(c.description) + '</p><div class="row">' + c.tags.map(x => '<span class="chip">' + esc(x) + '</span>').join('') + '</div>'
    + (c.services.length ? '<h2 style="margin-top:14px">' + esc(t('services')) + '</h2><div class="list">' + c.services.map(s => '<div class="item"><div><b>' + esc(s.title) + '</b><div class="muted small">' + esc(s.desc) + '</div></div><span class="chip">' + esc(s.price) + '</span></div>').join('') + '</div>' : '') + '</div>'
    + '<div class="card"><h2>' + esc(t('reviews')) + '</h2>' + (reviews.length ? reviews.map(r => '<div class="rev"><span class="stars">' + stars(r.stars) + '</span> <b>' + esc(r.name) + '</b> <span class="muted small">' + esc(fmt(r.created)) + '</span>' + (r.text ? '<p>' + esc(r.text) + '</p>' : '') + '</div>').join('') : '<p class="muted">' + esc(t('noReviews')) + '</p>') + '</div>'
    + (token ? '<div class="card"><h2>' + esc(t('order')) + '</h2><div class="two"><div><label>' + esc(t('yourName')) + '</label><input id="cn" value="' + esc(me ? me.user.username : '') + '"></div><div><label>' + esc(t('size')) + '</label><select id="cs"><option value="small">' + esc(t('small')) + '</option><option value="medium" selected>' + esc(t('medium')) + '</option><option value="large">' + esc(t('large')) + '</option></select></div></div>'
      + '<label>' + esc(t('title')) + '</label><input id="ct"><label>' + esc(t('brief')) + '</label><textarea id="cb" rows="5" placeholder="' + esc(t('briefPh')) + '"></textarea><div id="ce"></div><button class="btn" id="go" style="margin-top:12px">' + esc(t('send')) + '</button></div>'
      : '<div class="card"><p>' + esc(t('needLogin')) + '</p><a class="btn" href="#/login">' + esc(t('signin')) + '</a></div>');
  const go = $('#go'); if (go) go.onclick = async () => {
    go.disabled = true; $('#ce').innerHTML = '';
    try { const j = await api('POST', '/orders', { companyId: id, customerName: $('#cn').value, title: $('#ct').value, brief: $('#cb').value, size: $('#cs').value }); toast(t('ordered')); location.hash = '#/order/' + j.order.id; }
    catch (e) { $('#ce').innerHTML = '<div class="err">' + esc(e.message) + '</div>'; go.disabled = false; }
  };
}

/* ---------- konto ---------- */
function showRecovery(code, next) {
  $('#app').innerHTML = '<div class="card" style="max-width:520px;margin:30px auto"><h1>' + esc(t('recH')) + '</h1><p class="muted">' + esc(t('recP')) + '</p>'
    + '<div class="code" id="rc">' + esc(code) + '</div><div class="row" style="margin:10px 0"><button class="btn ghost sm" id="rcc">' + esc(t('recCopy')) + '</button><button class="btn ghost sm" id="rcd">' + esc(t('recDl')) + '</button></div>'
    + '<label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="rck" style="width:auto"> ' + esc(t('recSaved')) + '</label><button class="btn" id="rcg" style="margin-top:12px" disabled>' + esc(t('recGo')) + '</button></div>';
  $('#rcc').onclick = async () => { try { await navigator.clipboard.writeText(code); toast(t('copied')); } catch { /* markera själv */ } };
  $('#rcd').onclick = () => saveBlob(new Blob(['MyOffiCity recovery code\n' + code + '\n'], { type: 'text/plain' }), 'nrn-market-recovery-code.txt');
  $('#rck').onchange = (e) => { $('#rcg').disabled = !e.target.checked; };
  $('#rcg').onclick = next;
}
function pageLogin(mode = 'login') {
  $('#app').innerHTML = '<div class="card" style="max-width:420px;margin:30px auto"><h1>' + esc(mode === 'login' ? t('signin') : t('register')) + '</h1>'
    + '<label>' + esc(t('username')) + '</label><input id="lu" autocomplete="username" autocapitalize="none"><label>' + esc(t('password')) + '</label><input id="lp" type="password" autocomplete="' + (mode === 'login' ? 'current-password' : 'new-password') + '">'
    + (mode === 'register' ? '<p class="muted small">' + esc(t('pwHint')) + '</p><label>' + esc(t('email')) + '</label><input id="le2" type="email" autocomplete="email" required><p class="muted small">' + esc(t('emailWhy')) + '</p>' : '')
    + '<div id="le"></div><div class="row" style="margin-top:14px"><button class="btn" id="lg">' + esc(mode === 'login' ? t('signin') : t('register')) + '</button><a href="#" id="sw">' + esc(mode === 'login' ? t('noAcc') : t('haveAcc')) + '</a></div>'
    + (mode === 'login' ? '<p style="margin-top:12px"><a href="#/forgot">' + esc(t('forgotQ')) + '</a></p>' : '') + '</div>';
  $('#sw').onclick = (e) => { e.preventDefault(); pageLogin(mode === 'login' ? 'register' : 'login'); };
  const submit = async () => {
    $('#lg').disabled = true; $('#le').innerHTML = '';
    try {
      const body = { username: $('#lu').value, password: $('#lp').value };
      if (mode === 'register') { body.email = $('#le2').value; body.lang = lang; if (!body.email.trim()) throw new Error(t('emailReq')); }
      const j = await api('POST', mode === 'login' ? '/login' : '/register', body);
      token = j.token; lsSet(TOKEN_KEY, token); await loadMe(); renderBar();
      if (j.recoveryCode) showRecovery(j.recoveryCode, goNext); else goNext();
    } catch (e) { $('#le').innerHTML = '<div class="err">' + esc(e.message) + '</div>'; $('#lg').disabled = false; }
  };
  $('#app').querySelector('.card').insertAdjacentHTML('beforeend', '<div id="gb" style="margin-top:18px;display:' + (googleId ? 'block' : 'none') + '"><p class="muted small" style="text-align:center;margin:0 0 8px">' + esc(t('orWith')) + '</p><div id="gbtn" style="display:flex;justify-content:center"></div></div>');
  googleButton();
  $('#lg').onclick = submit; $('#lp').onkeydown = (e) => { if (e.key === 'Enter') submit(); };
}
const goNext = () => { let n = null; try { n = sessionStorage.getItem('nrn.next'); sessionStorage.removeItem('nrn.next'); } catch { /* */ } location.hash = n || '#/orders'; route(); };
async function pageAuthorize(h) {
  const q = new URLSearchParams(h.split('?')[1] || '');
  if (!me) { try { sessionStorage.setItem('nrn.next', h); } catch { /* */ } return pageLogin(); }
  if (!me.company) { $('#app').innerHTML = '<div class="card" style="max-width:480px;margin:30px auto"><div class="err">' + esc(t('keysCoOnly')) + '</div></div>'; return; }
  const bad = () => { $('#app').innerHTML = '<div class="card" style="max-width:480px;margin:30px auto"><div class="err">' + esc(t('authBad')) + '</div></div>'; };
  if (q.get('response_type') !== 'code' || q.get('code_challenge_method') !== 'S256') return bad();
  let c; try { c = await api('GET', '/oauth/client?client_id=' + encodeURIComponent(q.get('client_id') || '') + '&redirect_uri=' + encodeURIComponent(q.get('redirect_uri') || '')); } catch { return bad(); }
  const want = q.get('scope'), dflt = ['read', 'write', 'full'].includes(want) ? want : 'write';
  $('#app').innerHTML = '<div class="card" style="max-width:480px;margin:30px auto"><h1>' + esc(t('authH')) + '</h1><p><b>' + esc(c.name) + '</b>' + esc(t('authWant')) + '</p><h2>' + esc(t('authLevel')) + '</h2>'
    + ['read', 'write', 'full'].map(k => '<label class="row" style="gap:8px;align-items:flex-start;margin:8px 0"><input type="radio" name="sc" value="' + k + '"' + (k === dflt ? ' checked' : '') + ' style="width:auto;margin-top:4px"><span>' + esc(t('auth' + k[0].toUpperCase() + k.slice(1))) + '</span></label>').join('')
    + '<p class="muted small">' + esc(t('authNote')) + '</p><div id="ae"></div><div class="row" style="margin-top:14px"><button class="btn" id="aa">' + esc(t('authAllow')) + '</button><button class="btn ghost" id="ad">' + esc(t('authDeny')) + '</button></div></div>';
  const go = (deny) => async () => {
    $('#aa').disabled = $('#ad').disabled = true;
    try { const j = await api('POST', '/oauth/approve', { client_id: q.get('client_id'), redirect_uri: q.get('redirect_uri'), state: q.get('state'), code_challenge: q.get('code_challenge'), code_challenge_method: 'S256', scope: (document.querySelector('input[name=sc]:checked') || {}).value, deny }); location.href = j.redirect; }
    catch (e) { $('#ae').innerHTML = '<div class="err">' + esc(e.message) + '</div>'; $('#aa').disabled = $('#ad').disabled = false; }
  };
  $('#aa').onclick = go(false); $('#ad').onclick = go(true);
}
function pageForgot() {
  $('#app').innerHTML = '<div class="card" style="max-width:480px;margin:30px auto"><h1>' + esc(t('forgotH')) + '</h1>'
    + '<h2 style="margin-top:14px">' + esc(t('byEmail')) + '</h2>' + (mailOn ? '<label>' + esc(t('email').replace(' (optional)', '').replace(' (valfritt)', '')) + '</label><input id="fe" type="email"><div id="fm"></div><button class="btn" id="fs" style="margin-top:10px">' + esc(t('sendLink')) + '</button>' : '<p class="muted small">' + esc(t('mailOff')) + '</p>')
    + '<h2 style="margin-top:22px">' + esc(t('byCode')) + '</h2><label>' + esc(t('username')) + '</label><input id="fu" autocapitalize="none"><label>' + esc(t('recCode')) + '</label><input id="fc" placeholder="XXXX-XXXX-XXXX-XXXX-XXXX"><label>' + esc(t('pwNew')) + '</label><input id="fp" type="password" autocomplete="new-password"><p class="muted small">' + esc(t('pwHint')) + '</p><div id="fe2"></div><button class="btn" id="fr" style="margin-top:6px">' + esc(t('resetBtn')) + '</button></div>';
  if ($('#fs')) $('#fs').onclick = async () => { $('#fs').disabled = true; try { await api('POST', '/password/forgot', { email: $('#fe').value, lang }); $('#fm').innerHTML = '<p class="small">' + esc(t('emailSent')) + '</p>'; } catch (e) { $('#fm').innerHTML = '<div class="err">' + esc(e.message) + '</div>'; } $('#fs').disabled = false; };
  $('#fr').onclick = async () => {
    $('#fr').disabled = true; $('#fe2').innerHTML = '';
    try { const j = await api('POST', '/password/recover', { username: $('#fu').value, recoveryCode: $('#fc').value, newPassword: $('#fp').value }); token = j.token; lsSet(TOKEN_KEY, token); await loadMe(); renderBar(); toast(t('resetDone')); showRecovery(j.recoveryCode, () => { location.hash = '#/orders'; route(); }); }
    catch (e) { $('#fe2').innerHTML = '<div class="err">' + esc(e.message) + '</div>'; $('#fr').disabled = false; }
  };
}
function pageReset(tokenParam) {
  $('#app').innerHTML = '<div class="card" style="max-width:420px;margin:30px auto"><h1>' + esc(t('resetH')) + '</h1><label>' + esc(t('pwNew')) + '</label><input id="rp" type="password" autocomplete="new-password"><p class="muted small">' + esc(t('pwHint')) + '</p><div id="re"></div><button class="btn" id="rb">' + esc(t('resetBtn')) + '</button></div>';
  $('#rb').onclick = async () => {
    $('#rb').disabled = true;
    try { const j = await api('POST', '/password/reset', { token: tokenParam, newPassword: $('#rp').value }); token = j.token; lsSet(TOKEN_KEY, token); await loadMe(); renderBar(); toast(t('resetDone')); location.hash = '#/orders'; }
    catch (e) { $('#re').innerHTML = '<div class="err">' + esc(e.message) + '</div>'; $('#rb').disabled = false; }
  };
}
async function pageVerify(tokenParam) {
  $('#app').innerHTML = '<div class="card" style="max-width:480px;margin:30px auto"><p>' + esc(t('verifying')) + '</p></div>';
  try { await api('POST', '/email/verify', { token: tokenParam }); await loadMe(); $('#app').innerHTML = '<div class="card" style="max-width:480px;margin:30px auto"><h1>✓</h1><p>' + esc(t('verifyOk')) + '</p><a class="btn" href="#/">' + esc(t('companies')) + '</a></div>'; }
  catch { $('#app').innerHTML = '<div class="card" style="max-width:480px;margin:30px auto"><div class="err">' + esc(t('verifyBad')) + '</div></div>'; }
}

/* ---------- API-nycklar och koppling av AI-verktyg ---------- */
const NODE_AGENT = (o) => `// Funkar med OpenRouter, OpenAI och andra som följer OpenAI:s chat-API. Kör: node agent.mjs
// Kräver Node 18+, OPENROUTER_API_KEY och NRN_KEY (nyckeln från MyOffiCity) som miljövariabler.
const NRN = '${o}/api';
const tools = (await (await fetch(NRN + '/tools')).json()).tools;
const messages = [{ role: 'user', content: 'Find a web design company on MyOffiCity and summarise its best rated services.' }];
for (let i = 0; i < 8; i++) {
  const r = await (await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST', headers: { Authorization: 'Bearer ' + process.env.OPENROUTER_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'google/gemma-4-26b-a4b-it:free', messages, tools }),
  })).json();
  const m = r.choices[0].message; messages.push(m);
  if (!m.tool_calls || !m.tool_calls.length) { console.log(m.content); break; }
  for (const c of m.tool_calls) {
    const out = await (await fetch(NRN + '/tools/call', {
      method: 'POST', headers: { Authorization: 'Bearer ' + process.env.NRN_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: c.function.name, arguments: c.function.arguments }),
    })).json();
    messages.push({ role: 'tool', tool_call_id: c.id, content: out.text });
  }
}`;
function connectClients(key) {
  const o = location.origin + BASE, url = o + '/api/mcp', k = key || 'YOUR_KEY';
  const hdr = '"Authorization": "Bearer ' + k + '"';
  return [
    { id: 'prompt', name: t('askAi'), where: t('askAiWhere'), code: 'Connect to MyOffiCity for me.\n1. Read ' + o + '/llms.txt to see how the API and the MCP server work. (Do not open the /#/account page: that is for humans.)\n2. Use this API key and never print it back: ' + k + '\n3. If you can run commands, add the MCP server (Claude Code: claude mcp add --transport http nrn-market ' + url + ' --header "Authorization: Bearer ' + k + '"), otherwise call the REST API with curl.\n4. Then run whoami and tell me what this key is allowed to do.\nDo not place orders or mark anything delivered unless I ask you to.' },
    { id: 'claudecode', name: 'Claude Code', where: 'Terminal', code: 'claude mcp add --transport http nrn-market ' + url + ' --header "Authorization: Bearer ' + k + '"' },
    { id: 'claudedesk', name: 'Claude Desktop', where: 'claude_desktop_config.json (Settings > Developer > Edit config)', code: '{\n  "mcpServers": {\n    "nrn-market": {\n      "command": "npx",\n      "args": ["-y", "mcp-remote", "' + url + '", "--header", "Authorization:${NRN_AUTH}"],\n      "env": { "NRN_AUTH": "Bearer ' + k + '" }\n    }\n  }\n}' },
    { id: 'codex', name: 'OpenAI Codex', where: '~/.codex/config.toml, and set the key as an environment variable', code: '[mcp_servers.nrn_market]\nurl = "' + url + '"\nbearer_token_env_var = "NRN_MARKET_KEY"\n\n# PowerShell:  setx NRN_MARKET_KEY "' + k + '"\n# macOS/Linux: export NRN_MARKET_KEY="' + k + '"' },
    { id: 'cursor', name: 'Cursor', where: '~/.cursor/mcp.json (or .cursor/mcp.json in a project)', code: '{\n  "mcpServers": {\n    "nrn-market": {\n      "url": "' + url + '",\n      "headers": { ' + hdr + ' }\n    }\n  }\n}' },
    { id: 'copilot', name: 'GitHub Copilot (VS Code)', where: '.vscode/mcp.json, or Command Palette: MCP: Add Server', code: '{\n  "servers": {\n    "nrn-market": {\n      "type": "http",\n      "url": "' + url + '",\n      "headers": { ' + hdr + ' }\n    }\n  }\n}' },
    { id: 'gemini', name: 'Google Gemini CLI', where: '~/.gemini/settings.json', code: '{\n  "mcpServers": {\n    "nrn-market": {\n      "httpUrl": "' + url + '",\n      "headers": { ' + hdr + ' }\n    }\n  }\n}' },
    { id: 'opencode', name: 'OpenCode', where: 'opencode.json (works with any model, for example from OpenRouter)', code: '{\n  "$schema": "https://opencode.ai/config.json",\n  "mcp": {\n    "nrn-market": {\n      "type": "remote",\n      "url": "' + url + '",\n      "enabled": true,\n      "headers": { ' + hdr + ' }\n    }\n  }\n}' },
    { id: 'openrouter', name: 'OpenRouter / any model API', where: 'OpenRouter is a model gateway, not an MCP client. Use an MCP client above with an OpenRouter model, or call the tools yourself (works the same with OpenAI, Anthropic and Gemini: /api/tools?format=openai|anthropic|gemini)', code: NODE_AGENT(o) },
    { id: 'other', name: 'Other MCP client', where: 'Streamable HTTP, no sessions', code: 'URL:     ' + url + '\nHeader:  Authorization: Bearer ' + k + '\nTools:   ' + o + '/api/tools?format=mcp' },
    { id: 'rest', name: 'REST / OpenAPI', where: 'For services that can import an OpenAPI description (for example GPT Actions)', code: 'OpenAPI: ' + o + '/api/openapi.json\n\ncurl -H "Authorization: Bearer ' + k + '" ' + o + '/api/me' },
  ];
}
function connectGuide(key) {
  const list = connectClients(key);
  return '<div class="card"><h2>' + esc(t('connectH')) + '</h2><p class="muted small">' + esc(t('connectP')) + (key ? ' <b>' + esc(t('keyFresh')) + '</b>' : '') + '</p>'
    + '<div class="row" id="ctabs" style="margin:10px 0">' + list.map((c, i) => '<button class="chip btn-chip' + (i === 0 ? ' on' : '') + '" data-c="' + c.id + '">' + esc(c.name) + '</button>').join('') + '</div>'
    + '<p class="small muted" id="cwhere"></p><pre class="snip" id="ccode"></pre><button class="btn ghost sm" id="ccopy">' + esc(t('copyIt')) + '</button></div>';
}
function wireGuide(key) {
  const list = connectClients(key), box = $('#ctabs'); if (!box) return;
  const show = (id) => { const c = list.find(x => x.id === id) || list[0]; $('#cwhere').textContent = c.name + ' · ' + c.where; $('#ccode').textContent = c.code; box.querySelectorAll('.chip').forEach(b => b.classList.toggle('on', b.dataset.c === c.id)); };
  box.onclick = (e) => { const b = e.target.closest('[data-c]'); if (b) show(b.dataset.c); };
  $('#ccopy').onclick = async () => { try { await navigator.clipboard.writeText($('#ccode').textContent); toast(t('copied')); } catch { /* markera själv */ } };
  show(list[0].id);
}
async function loadKeys(fresh) {
  const box = $('#keysBox'); if (!box) return;
  const j = await api('GET', '/keys');
  box.innerHTML = '<div class="list">' + (j.keys.map(k => '<div class="item"><div><b>' + esc(k.name) + '</b> <span class="pill ' + (k.scope === 'full' ? 'warn' : k.scope === 'write' ? '' : 'ok') + '">' + esc(k.scope) + '</span><div class="muted small"><code>' + esc(k.prefix) + '…</code> · ' + esc(k.lastUsed ? t('keyLast') + ' ' + fmt(k.lastUsed) : t('keyNever')) + '</div></div><button class="btn ghost sm" data-delkey="' + esc(k.id) + '">' + esc(t('keyDel')) + '</button></div>').join('') || '<p class="muted small">' + esc(t('keyNone')) + '</p>') + '</div>'
    + (fresh ? '<div class="card" style="border-color:var(--warn)"><b>' + esc(t('keyOnce')) + '</b><div class="code" style="font-size:14px;margin-top:8px">' + esc(fresh) + '</div><button class="btn sm" id="kcopy" style="margin-top:8px">' + esc(t('copyIt')) + '</button></div>' : '');
  box.querySelectorAll('[data-delkey]').forEach(b => b.onclick = async () => { if (!confirm(t('keyDelAsk'))) return; try { await api('DELETE', '/keys/' + b.dataset.delkey); loadKeys(); } catch (e) { toast(e.message); } });
  if ($('#kcopy')) $('#kcopy').onclick = async () => { try { await navigator.clipboard.writeText(fresh); toast(t('copied')); } catch { /* */ } };
}

async function pageAccount() {
  if (!token) return pageLogin();
  await loadMe();
  const u = me.user;
  $('#app').innerHTML = '<h1>' + esc(t('accH')) + '</h1><p class="muted">' + esc(u.username) + '</p>'
    + '<div class="card"><h2>' + esc(t('emailLabel')) + '</h2>' + (u.email ? '<p>' + esc(u.email) + ' <span class="pill ' + (u.emailVerified ? 'ok' : 'warn') + '">' + esc(u.emailVerified ? t('emailVerified') : t('emailUnverified')) + '</span></p>' : '') + (mailOn ? '' : '<p class="muted small">' + esc(t('emailNoMail')) + '</p>')
    + '<div class="two"><div><input id="ae" type="email" placeholder="you@example.com" value="' + esc(u.email) + '"></div><div><input id="aep" type="password" placeholder="' + esc(t('password')) + '" autocomplete="current-password"></div></div><div id="aem"></div><button class="btn" id="aes" style="margin-top:10px">' + esc(t('emailSave')) + '</button></div>'
    + '<div class="card"><h2>' + esc(t('pwH')) + '</h2><div class="two"><div><label>' + esc(t('pwOld')) + '</label><input id="po" type="password" autocomplete="current-password"></div><div><label>' + esc(t('pwNew')) + '</label><input id="pn2" type="password" autocomplete="new-password"></div></div><div id="pm"></div><button class="btn" id="ps" style="margin-top:10px">' + esc(t('pwSave')) + '</button></div>'
    + '<div class="card"><h2>' + esc(t('keysH')) + '</h2><p class="muted small">' + esc(t('keysP')) + '</p><div id="keysBox"></div>'
    + '<div class="two"><div><label>' + esc(t('keyName')) + '</label><input id="kn" maxlength="40"></div><div><label>' + esc(t('keyScope')) + '</label><select id="ks"><option value="read">' + esc(t('scRead')) + '</option><option value="write" selected>' + esc(t('scWrite')) + '</option><option value="full">' + esc(t('scFull')) + '</option></select></div></div><div id="km"></div><button class="btn" id="kb" style="margin-top:10px">' + esc(t('keyCreate')) + '</button></div>'
    + '<div id="guide">' + connectGuide('') + '</div>'
    + '<div class="card"><h2>' + esc(t('recNewH')) + '</h2><p class="muted small">' + esc(t('recNewP')) + '</p><input id="rpw" type="password" placeholder="' + esc(t('password')) + '" autocomplete="current-password"><div id="rm"></div><button class="btn ghost" id="rs" style="margin-top:10px">' + esc(t('recNewBtn')) + '</button></div>';
  if (!me.company) { $('#keysBox').closest('.card').innerHTML = '<h2>' + esc(t('keysH')) + '</h2><p class="muted">' + esc(t('keysCoOnly')) + '</p>'; $('#guide').remove(); }
  const run = (btn, msg, fn) => btn.onclick = async () => { btn.disabled = true; $(msg).innerHTML = ''; try { await fn(); } catch (e) { $(msg).innerHTML = '<div class="err">' + esc(e.message) + '</div>'; } btn.disabled = false; };
  run($('#aes'), '#aem', async () => { await api('POST', '/email', { email: $('#ae').value, password: $('#aep').value, lang }); toast(t('emailSaved')); pageAccount(); });
  run($('#ps'), '#pm', async () => { const j = await api('POST', '/password/change', { oldPassword: $('#po').value, newPassword: $('#pn2').value }); token = j.token; lsSet(TOKEN_KEY, token); toast(t('pwDone')); $('#po').value = ''; $('#pn2').value = ''; });
  if ($('#kb')) run($('#kb'), '#km', async () => { const j = await api('POST', '/keys', { name: $('#kn').value, scope: $('#ks').value }); $('#kn').value = ''; await loadKeys(j.token); $('#guide').innerHTML = connectGuide(j.token); wireGuide(j.token); });
  if ($('#keysBox')) { loadKeys().catch(() => {}); wireGuide(''); }
  run($('#rs'), '#rm', async () => { const j = await api('POST', '/recovery', { password: $('#rpw').value }); showRecovery(j.recoveryCode, () => { location.hash = '#/account'; route(); }); });
}

/* ---------- beställningar ---------- */
async function pageOrders() {
  if (!token) return pageLogin();
  const j = await api('GET', '/orders');
  $('#app').innerHTML = '<h1>' + esc(t('orders')) + '</h1><div class="list">' + (j.orders.map(o => '<a class="item" href="#/order/' + esc(o.id) + '"><div><b>' + esc(o.title) + '</b><div class="muted small">' + esc(o.company) + ' · ' + esc(fmt(o.updated)) + '</div></div><span class="pill ' + (o.status === 'delivered' ? 'ok' : o.status === 'variants_shown' ? 'warn' : '') + '">' + esc(t('st_' + o.status)) + '</span></a>').join('') || '<p class="muted">' + esc(t('noOrders')) + '</p>') + '</div>';
}
function gallery(o) {
  return '<div class="gal">' + o.variants.map(v => '<article class="var' + (o.chosen === v.id ? ' chosen' : '') + '"><div class="prev"><iframe sandbox="allow-scripts" tabindex="-1" srcdoc="' + esc(v.html) + '" title="' + esc(v.name) + '"></iframe></div><div class="vinfo"><b>' + esc(v.name) + '</b><p class="muted small">' + esc(v.idea) + '</p><div class="row"><button class="btn ghost sm" data-open="' + esc(v.id) + '">' + esc(t('open')) + '</button>' + (o.status === 'variants_shown' ? '<button class="btn sm" data-pick="' + esc(v.id) + '">' + esc(t('choose')) + '</button>' : '') + (o.chosen === v.id ? '<span class="pill ok">' + esc(t('picked')) + '</span>' : '') + '</div></div></article>').join('') + '</div>';
}
function reviewBox(o) {
  const r = o.review;
  return '<div class="card"><h2>' + esc(t('rateH')) + '</h2>' + (r ? '<p><span class="stars">' + stars(r.stars) + '</span> ' + esc(r.text) + '</p><p class="muted small">' + esc(t('rated')) + '</p>' : '<p class="muted small">' + esc(t('rateP')) + '</p>')
    + '<div class="row" id="rst">' + [1, 2, 3, 4, 5].map(n => '<button class="star' + (r && r.stars >= n ? ' on' : '') + '" data-s="' + n + '" aria-label="' + n + '">★</button>').join('') + '</div><textarea id="rtx" rows="2" placeholder="' + esc(t('rateText')) + '" style="margin-top:8px">' + esc(r ? r.text : '') + '</textarea><div id="rem"></div><button class="btn" id="rsd" style="margin-top:8px">' + esc(r ? t('rateEdit') : t('rateSend')) + '</button></div>';
}
async function pageOrder(id) {
  if (!token) return pageLogin();
  const [{ order: o }, ms] = await Promise.all([api('GET', '/orders/' + id), api('GET', '/orders/' + id + '/messages')]);
  let last = ms.messages.reduce((a, m) => Math.max(a, m.id), 0), msgs = ms.messages, pick = o.review ? o.review.stars : 0;
  const msgHtml = () => msgs.map(m => '<div class="msg ' + (m.from === 'customer' ? 'me' : '') + '"><small>' + esc(m.from === 'customer' ? t('me') : o.company) + ' · ' + esc(fmt(m.t)) + '</small><p>' + esc(m.text) + '</p></div>').join('');
  let body = '';
  if (o.status === 'variants_shown' && o.variants) body = '<div class="card"><h2>' + esc(t('pickH')) + '</h2><p class="muted small">' + esc(t('pickP')) + '</p>' + gallery(o) + '<label>' + esc(t('note')) + '</label><textarea id="pn" rows="2"></textarea></div>';
  else if (o.status === 'delivered' && o.files) body = '<div class="card"><h2>' + esc(t('ready')) + '</h2><div class="row"><button class="btn" id="site">' + esc(t('openSite')) + '</button><button class="btn ghost" id="zip">' + esc(t('dl')) + '</button></div></div>' + reviewBox(o);
  else if (['chosen', 'build_run', 'build_report'].includes(o.status)) body = '<div class="card"><p>' + esc(t('working')) + '</p>' + (o.variants && o.chosen ? gallery({ ...o, variants: o.variants.filter(v => v.id === o.chosen), status: 'x' }) : '') + '</div>';
  else body = '<div class="card"><p>' + esc(t('wait')) + '</p></div>';
  $('#app').innerHTML = '<p><a href="#/orders">← ' + esc(t('back')) + '</a></p><div class="row sp"><div><h1>' + esc(o.title) + '</h1><p class="muted">' + esc(t('by')) + ': <a href="#/company/' + esc(o.companyId) + '">' + esc(o.company) + '</a> · ' + esc(t('st_' + o.status)) + '</p></div></div>'
    + '<div class="card"><p style="white-space:pre-wrap;margin:0">' + esc(o.brief) + '</p></div>' + body
    + '<div class="card"><h2>' + esc(t('conv')) + '</h2><div class="msgs" id="ms">' + msgHtml() + '</div><div class="row"><textarea id="mt" rows="2" placeholder="' + esc(t('msg')) + '" style="flex:1"></textarea><button class="btn" id="mb">' + esc(t('sendMsg')) + '</button></div></div>';
  const ms$ = $('#ms'); ms$.scrollTop = ms$.scrollHeight;
  document.querySelectorAll('.prev').forEach(p => p.style.setProperty('--s', (p.clientWidth / 1280).toFixed(3)));
  document.querySelectorAll('[data-open]').forEach(b => b.onclick = () => { const v = o.variants.find(x => x.id === b.dataset.open); if (v) openViewer(v.name, { 'index.html': v.html }); });
  document.querySelectorAll('[data-pick]').forEach(b => b.onclick = async () => { b.disabled = true; try { await api('POST', '/orders/' + id + '/choose', { variantId: b.dataset.pick, note: $('#pn').value }); toast('✓'); pageOrder(id); } catch (e) { toast(e.message); b.disabled = false; } });
  if ($('#site')) { $('#site').onclick = () => openViewer(o.title, o.files); $('#zip').onclick = () => download(o); }
  if ($('#rst')) {
    $('#rst').onclick = (e) => { const b = e.target.closest('[data-s]'); if (!b) return; pick = Number(b.dataset.s); document.querySelectorAll('#rst .star').forEach(s => s.classList.toggle('on', Number(s.dataset.s) <= pick)); };
    $('#rsd').onclick = async () => { if (!pick) { $('#rem').innerHTML = '<div class="err">★</div>'; return; } $('#rsd').disabled = true; try { await api('POST', '/orders/' + id + '/review', { stars: pick, text: $('#rtx').value }); toast(t('rated')); pageOrder(id); } catch (e) { $('#rem').innerHTML = '<div class="err">' + esc(e.message) + '</div>'; $('#rsd').disabled = false; } };
  }
  $('#mb').onclick = async () => { const el = $('#mt'), text = el.value.trim(); if (!text) return; $('#mb').disabled = true; try { const r = await api('POST', '/orders/' + id + '/messages', { text }); msgs.push(r.message); last = Math.max(last, r.message.id); el.value = ''; ms$.innerHTML = msgHtml(); ms$.scrollTop = ms$.scrollHeight; } catch (e) { toast(e.message); } $('#mb').disabled = false; };
  // nya meddelanden och statusändringar var 10:e sekund (pausar medan fliken är dold)
  clearInterval(poll);
  poll = setInterval(async () => {
    if (!location.hash.startsWith('#/order/' + id)) return clearInterval(poll);
    if (document.hidden) return;
    try {
      const n = await api('GET', '/orders/' + id + '/messages?after=' + last);
      if (n.messages.length) { msgs = msgs.concat(n.messages); last = Math.max(last, ...n.messages.map(m => m.id)); ms$.innerHTML = msgHtml(); ms$.scrollTop = ms$.scrollHeight; }
      const cur = (await api('GET', '/orders/' + id)).order;
      const typing = document.activeElement && ['mt', 'rtx', 'pn'].includes(document.activeElement.id);
      if (cur.status !== o.status && !typing) pageOrder(id);
    } catch { /* nästa varv */ }
  }, 10000);
}

async function route() {
  clearInterval(poll); closeViewer(); if (officeHost && officeHost.parentNode) officeHost.remove();
  const h = location.hash || '#/';
  renderBar();
  try {
    let m;
    if (h === '#/login') return pageLogin();
    if (h === '#/forgot') return pageForgot();
    if ((m = /^#\/map-chat\/([a-z0-9]+)$/.exec(h))) { const c = (await api('GET', '/companies/' + m[1])).company; return startChat(c); }
    if (h === '#/company-start') return await pageCompanyStart();
    if (h === '#/chats') return await pageChats();
    if ((m = /^#\/chat\/([a-z0-9]+)$/.exec(h))) return await pageChat(m[1]);
    if (h === '#/list') return await pageCompanies();
    if (h.startsWith('#/authorize?')) return await pageAuthorize(h);
    if (h === '#/account') return await pageAccount();
    if ((m = /^#\/reset\?token=([A-Za-z0-9_-]+)$/.exec(h))) return pageReset(m[1]);
    if ((m = /^#\/verify\?token=([A-Za-z0-9_-]+)$/.exec(h))) return await pageVerify(m[1]);
    if ((m = /^#\/company\/([a-z0-9]+)$/.exec(h))) return await pageCompany(m[1]);
    if ((m = /^#\/order\/([a-z0-9]+)$/.exec(h))) return await pageOrder(m[1]);
    if (h === '#/orders') return await pageOrders();
    if (!token && !lsGet(ROLE_KEY)) return pageChoose();
    return await pageMap();
  } catch (e) { $('#app').innerHTML = '<div class="err">' + esc(e.message) + '</div>'; }
}
$('#lang').onchange = (e) => { lang = e.target.value; lsSet(LANG_KEY, lang); document.documentElement.lang = lang; route(); };
window.addEventListener('hashchange', route);
document.documentElement.lang = lang;
Promise.all([loadMe(), loadFeatures()]).then(route);
})();
