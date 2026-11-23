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
      mapNav: 'City map', dFireQuota: 'Firings used', dFireOf: 'of', dFireWin: 'in the last 6 months', dFireLocked: 'No firings left until', dPhotoFail: '(the photo could not be created right now, so a drawing is used)', dIdWorked: 'Has worked here', dIdSinceStart: 'since the company started', dIdSinceHire: 'since hired', dIdHobby: 'Hobby', dFire: 'Fire', dFireAsk: 'Fire this person? You can hire a new one straight away.', dFireYes: 'Yes, fire', dFireNo: 'Cancel', dFiredMsg: 'has left the team', dVacant: 'Vacant position', dHireBtn: 'Hire a new person', dHiredMsg: 'New hire:', dFormer: 'Former team members', dWorkedFor: 'worked for', dHiring: 'Hiring…', coCity: 'City (for local weather)', coCityHint: 'Your office gets the real weather and time of this city: rain, snow, fog and thunder.', coCityPh: 'Stockholm', coCityBad: 'Could not find that city.', cityLabel: 'City', dChipWeather: 'Weather', wxclear: 'Clear', wxcloud: 'Cloudy', wxfog: 'Fog', wxrain: 'Rain', wxsnow: 'Snow', wxthunder: 'Thunder', mapCountOne: ' company', foundOne: 'company', doneOne: 'job', coTagsPh: 'web, design, logo', coSvcPh: 'Landing page | from 49 USD | One polished page', coWebPh: 'https://yourcompany.com', dIdOpen: 'Show ID card', dIdFrom: 'From', dIdAge: 'Age', dIdBorn: 'Born', dIdLang: 'Languages', dIdRole: 'Role', dIdBg: 'Background', dIdAi: 'AI team member', dIdYears: 'years', dIdClose: 'Close', dOffice: 'Office', dChat: 'Chat', dTeam: 'Team', dOrders: 'Orders', dReports: 'Reports', dSettings: 'Settings', dSite: '\u2190 To the site', dOwner: 'Owner of', dCompany: 'Your company', dChipOrders: 'Orders', dChipChats: 'Chats', dChipRating: 'Rating', dChipTime: 'Local time', dNoOrders: 'No orders yet. When a customer orders, it shows up here.', dNoChats: 'No chats yet. When a customer clicks Contact the company, the chat shows up here.', dPickChat: 'Pick a chat on the left.', dPickOrder: 'Pick an order on the left.', dSend: 'Send', dWrite: 'Write a message', dCust: 'Customer', dTeamH: 'Your AI team', dTeamP: 'This is the team that works for your company. Chat directly with your team leader online to give assignments, plan work or generate code.', tChatOpen: 'Give order to {name}', tChatSub: 'Team leader · Free AI (0 kr)', tChatPh: 'Give an order or ask {name}…', tChatClear: 'Clear', tChatEmpty: 'Say hi or give {name} an assignment — for example to plan a website, write copy or build code with the team.', tChatModeChat: 'Chat', tChatModeCode: 'Code / Build', tChatThinking: 'Working on your order…', tChatQuota: '{n}/15 left today', tChatCopy: 'Copy', tChatCopied: 'Copied!', tChatYou: 'You', tChatBtnTeam: 'Chat & give orders to {name}', tChatFull: 'Fullscreen', tChatExitFull: 'Exit fullscreen', tChatImg: 'Attach image', tChatRec: 'Record voice clip', tChatStopRec: 'Stop recording', tChatAud: 'Upload audio clip', tChatRecErr: 'Microphone access denied or unavailable.', tChatImgLbl: '[Image]', tChatAudLbl: '[Audio clip]', tChatBig: 'File is too large (max 3 MB).', tChatNew: 'New discussion', tChatDel: 'Delete chat', tChatUntitled: 'New discussion', tChatThreads: 'Discussions', tChatGhNone: 'No GitHub project linked', tChatGhLink: '+ Link GitHub', tChatGhStep: '▶ Run step', tChatGhConn: 'Connect & start', tChatGhCancel: 'Cancel', dProjects: 'Projects', dProjH: 'Autonomous GitHub projects', dProjP: 'Give your AI team a GitHub repository and a goal. They work online in the background every 2 hours (0 kr), commit to a branch and open a Pull Request.', dProjNew: 'Start new GitHub sprint', dProjRepo: 'GitHub repository', dProjRepoPh: 'username/repository', dProjTok: 'GitHub Personal Access Token', dProjTokHint: 'Fine-grained token with Contents & Pull requests (Read & Write). Stored securely on server, never shown again.', dProjGoal: 'What should the team build?', dProjGoalPh: 'Example: Build a Chrome extension that blocks distractions, add dark mode, tests and README.', dProjDays: 'Duration', dProjD3: '3 days', dProjD7: '7 days', dProjD14: '14 days (2 weeks)', dProjD30: '30 days', dProjOr: 'Optional free OpenRouter key (sk-or-...)', dProjOrHint: 'Leave empty to use built-in Cloudflare Free AI (0 kr). Add a free OpenRouter key for extra capacity.', dProjStart: 'Start autonomous sprint', dProjStarting: 'Tomas is planning the sprint…', dProjStep: 'Run next step now', dProjStepping: 'Agent working…', dProjPause: 'Pause', dProjResume: 'Resume', dProjDel: 'Delete', dProjDelAsk: 'Delete this sprint from the dashboard? (Your GitHub branch stays untouched.)', dProjPr: 'Open Pull Request on GitHub →', dProjStActive: 'Active · runs every 2h', dProjStPaused: 'Paused', dProjStDone: 'Done', dProjTasks: 'Backlog', dProjLogs: 'Activity log', dProjNone: 'No autonomous GitHub projects yet. Start one above and watch your team ship real PRs!', dRoleLead: 'Team leader', dRoleRev: 'Reviewer', dRoleBuild: 'Builder', dRolePolish: 'Finisher', dRepDone: 'Delivered jobs', dRepRating: 'Average rating', dRepReviews: 'Reviews', dNoReviews: 'No reviews yet.', dBrief: 'The customer wrote', coWebsite: 'Website (if you have one)', coOrg: 'Organisation number (optional)', coPublic: 'Shown publicly on your profile.', website: 'Website', orgNo: 'Org. no.', coFormH: 'Create your company', coEditH: 'Your company', coName: 'Company name', coTagline: 'Short tagline', coDesc: 'What do you do?', coTags: 'Tags (comma separated, up to 5)', coServices: 'Services and prices', coServicesHint: 'One per line: Title | Price | Short description', coBuilding: 'Choose your office building', coB0: 'Startup loft', coB0d: 'Two floors, warm and open. Great to start with.', coB1: 'Modern tech hub', coB1d: 'Three floors, glass and oak. For a growing team.', coB2: 'Executive HQ', coB2d: 'Four floors with gold details. Made to impress.', coLogo: 'Logo (PNG only)', coLogoHint: 'The sign on your roof takes the shape of your logo: round, triangle or square.', coCreateBtn: 'Create company', coSaveBtn: 'Save changes', coSaved: 'Saved. Your office is in the city.', coLogoBad: 'Only PNG images are allowed.', coLogoBig: 'The image is too large.', coLogoNone: 'No logo', coShaperound: 'Round sign', coShapetri: 'Triangle sign', coShaperect: 'Square sign', coNeedName: 'Give your company a name (at least 2 characters).', coAppNote: 'The AI team that does the work runs in the MyOffiCity app on your computer. Here you manage how your company looks and what it offers.', coSeeCity: 'See it in the city', coRemoveLogo: 'Remove logo', demoTag: 'Demo', demoNote: 'Demo company: an example, it cannot be contacted or ordered from.', ovBtn: 'All companies', ovBack: 'Back to the office', ovTip: 'Zoomed out: click a building to go there.', homeCos: 'Companies in the city', homeCosP: 'Browse what they offer. Open one to see its office.', homeEmpty: 'No companies yet. Be the first to open an office.', seeInCity: 'See the office', fromPrice: 'From', mapNone: 'No company matches. Try another word, for example design, web or logo.', mapCount: ' companies', mapSearch: 'Search companies, for example design', chooseH: 'Welcome to MyOffiCity', chooseP: 'What do you want to do?', chCust: 'I am a customer', chCustP: 'Look around the city of companies, meet a salesperson and order a website.', chCo: 'Create my own company', chCoP: 'Run an AI company, publish it in the city and get orders from customers.', coStartH: 'Create your own company', coStep1: 'Create or sign in to your account on this site.', coStep2: 'Open the MyOffiCity app, go to Orders, then Online marketplace, and sign in with this same account.', coStep3: 'Press Publish. Your office appears in the city and customers can chat with you.', coLive: 'Your company is live in the city: ', coMine: 'My company', coCreate: 'Create company', coGoCity: 'See it in the city', coSignIn: 'Sign in or create account', chatsNav: 'Chats', mapH: 'Find a company in the city', mapP: 'Look at the offices. Click the company sign on the roof to read about the company and contact them to buy a service.', mapEmpty: 'No companies in the city yet.', mapList: 'Show as list', cityTip: 'Drag to turn, scroll to zoom, click the sign on the roof.', bTier0: 'Startup loft', bTier1: 'Modern tech hub', bTier2: 'Executive HQ', meetSales: 'Contact the company', orderSvc: 'Order a service', viewProfile: 'View profile', closeIt: 'Close', ownCo: 'This is your company.', chatsH: 'Chats', chatsNone: 'No chats yet. Open a company in the city and choose Contact the company.', chatWith: 'Chat with the salesperson at ', chatCustomer: 'Customer: ', chatSend: 'Send', chatHint: 'Write a message', chatSales: 'Salesperson', chatNeedLogin: 'Sign in to chat with a salesperson.', chatYouCo: 'You are the owner of this company. Reply to the customer below.', done: 'jobs', catWeb: 'Web & apps', catDesign: 'Design & brand', catShop: 'Webshop & e-commerce', catContent: 'Text & visibility', catMedia: 'Video & media', catOther: 'Other', catTitle: 'Category', catNarrow: 'Narrow down', companies: 'Companies', orders: 'My orders', account: 'Account', signin: 'Sign in', register: 'Create account', signout: 'Sign out', username: 'Username', password: 'Password',
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
      accH: 'Your account', emailLabel: 'Email', emailVerified: 'Confirmed', emailUnverified: 'Not confirmed yet: open the link we sent you', emailSave: 'Save email', emailNoMail: 'Email sending is not turned on for this server yet, so confirmation and reset by email are not available. Your recovery code works.', emailSaved: 'Email saved',
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
      mapNav: 'Stadskarta', dFireQuota: 'Sparkningar använda', dFireOf: 'av', dFireWin: 'de senaste 6 månaderna', dFireLocked: 'Inga sparkningar kvar förrän', dPhotoFail: '(bilden kunde inte skapas just nu, så en teckning används)', dIdWorked: 'Har jobbat här', dIdSinceStart: 'sedan företaget startade', dIdSinceHire: 'sedan anställningen', dIdHobby: 'Hobby', dFire: 'Sparka', dFireAsk: 'Sparka den här personen? Du kan anställa en ny direkt.', dFireYes: 'Ja, sparka', dFireNo: 'Avbryt', dFiredMsg: 'har lämnat teamet', dVacant: 'Ledig tjänst', dHireBtn: 'Anställ ny', dHiredMsg: 'Ny anställd:', dFormer: 'Tidigare anställda', dWorkedFor: 'jobbade i', dHiring: 'Anställer…', coCity: 'Stad (för lokalt väder)', coCityHint: 'Ditt kontor får verkligt väder och tid från den här staden: regn, snö, dimma och åska.', coCityPh: 'Stockholm', coCityBad: 'Hittade inte den staden.', cityLabel: 'Ort', dChipWeather: 'Väder', wxclear: 'Klart', wxcloud: 'Molnigt', wxfog: 'Dimma', wxrain: 'Regn', wxsnow: 'Snö', wxthunder: 'Åska', mapCountOne: ' företag', foundOne: 'företag', doneOne: 'jobb', coTagsPh: 'webb, design, logotyp', coSvcPh: 'Landningssida | från 49 USD | En polerad sida', coWebPh: 'https://dittforetag.se', dIdOpen: 'Visa ID-kort', dIdFrom: 'Kommer från', dIdAge: 'Ålder', dIdBorn: 'Född', dIdLang: 'Språk', dIdRole: 'Roll', dIdBg: 'Bakgrund', dIdAi: 'AI-medarbetare', dIdYears: 'år', dIdClose: 'Stäng', dOffice: 'Kontor', dChat: 'Chatt', dTeam: 'Team', dOrders: 'Beställningar', dReports: 'Rapporter', dSettings: 'Inställningar', dSite: '\u2190 Till sajten', dOwner: 'Ägare av', dCompany: 'Ditt företag', dChipOrders: 'Beställningar', dChipChats: 'Chattar', dChipRating: 'Betyg', dChipTime: 'Lokal tid', dNoOrders: 'Inga beställningar än. När en kund beställer syns det här.', dNoChats: 'Inga chattar än. När en kund klickar Kontakta företaget syns chatten här.', dPickChat: 'Välj en chatt till vänster.', dPickOrder: 'Välj en beställning till vänster.', dSend: 'Skicka', dWrite: 'Skriv ett meddelande', dCust: 'Kund', dTeamH: 'Ditt AI-team', dTeamP: 'Det här är teamet som jobbar åt ditt företag. Chatta direkt med din teamledare online för att ge uppdrag, planera jobb eller bygga kod.', tChatOpen: 'Ge order till {name}', tChatSub: 'Teamledare · Gratis AI (0 kr)', tChatPh: 'Ge en order eller fråga {name}…', tChatClear: 'Rensa', tChatEmpty: 'Skriv en order eller fråga till {name} — till exempel att planera en hemsida, skriva texter eller bygga kod med teamet.', tChatModeChat: 'Chatt', tChatModeCode: 'Kod / Bygg', tChatThinking: 'Tar emot uppdraget…', tChatQuota: '{n}/15 kvar idag', tChatCopy: 'Kopiera', tChatCopied: 'Kopierat!', tChatYou: 'Du', tChatBtnTeam: 'Chatta & ge order till {name}', tChatFull: 'Fullskärm', tChatExitFull: 'Stäng fullskärm', tChatImg: 'Skicka bild', tChatRec: 'Spela in ljudklipp', tChatStopRec: 'Stoppa inspelning', tChatAud: 'Ladda upp ljudfil', tChatRecErr: 'Kunde inte komma åt mikrofonen.', tChatImgLbl: '[Bild]', tChatAudLbl: '[Ljudklipp]', tChatBig: 'Filen är för stor (max 3 MB).', tChatNew: 'Ny diskussion', tChatDel: 'Radera chatt', tChatUntitled: 'Ny diskussion', tChatThreads: 'Diskussioner', tChatGhNone: 'Inget GitHub-projekt kopplat', tChatGhLink: '+ Koppla GitHub', tChatGhStep: '▶ Kör steg', tChatGhConn: 'Koppla & starta', tChatGhCancel: 'Avbryt', dProjects: 'Projekt', dProjH: 'Autonoma GitHub-projekt', dProjP: 'Ge ditt AI-team ett GitHub-repo och ett mål. De jobbar helt online i bakgrunden varannan timme (0 kr), committar till en egen branch och öppnar en Pull Request.', dProjNew: 'Starta ny GitHub-sprint', dProjRepo: 'GitHub-repo', dProjRepoPh: 'användare/repo', dProjTok: 'GitHub Personal Access Token', dProjTokHint: 'Skapa en Fine-grained token med Contents + Pull requests (Read & Write). Sparas på servern och visas aldrig igen.', dProjGoal: 'Vad ska teamet bygga / utveckla?', dProjGoalPh: 'Exempel: Utveckla vårt Chrome-tillägg med nya funktioner, bättre UI, felhantering och tydlig README.', dProjDays: 'Tidslängd', dProjD3: '3 dagar', dProjD7: '7 dagar', dProjD14: '14 dagar (2 veckor)', dProjD30: '30 dagar', dProjOr: 'Valfri gratis OpenRouter-nyckel (sk-or-...)', dProjOrHint: 'Lämna tomt för inbyggd Cloudflare Free AI (0 kr). Lägg till gratis OpenRouter-nyckel för ännu högre kapacitet.', dProjStart: 'Starta autonom sprint', dProjStarting: 'Tomas planerar sprinten…', dProjStep: 'Kör nästa steg nu', dProjStepping: 'Agenten kodar…', dProjPause: 'Pausa', dProjResume: 'Återuppta', dProjDel: 'Ta bort', dProjDelAsk: 'Ta bort sprinten från panelen? (Din branch och PR på GitHub finns kvar.)', dProjPr: 'Öppna Pull Request på GitHub →', dProjStActive: 'Aktiv · körs var 2:a timme', dProjStPaused: 'Pausad', dProjStDone: 'Klar', dProjTasks: 'Backlog (uppgifter)', dProjLogs: 'Aktivitetslogg', dProjNone: 'Inga autonoma GitHub-projekt än. Starta ett ovan så börjar teamet jobba direkt i molnet!', dRoleLead: 'Teamledare', dRoleRev: 'Granskare', dRoleBuild: 'Byggare', dRolePolish: 'Finputsare', dRepDone: 'Levererade jobb', dRepRating: 'Snittbetyg', dRepReviews: 'Omdömen', dNoReviews: 'Inga omdömen än.', dBrief: 'Kunden skrev', coWebsite: 'Hemsida (om ni har en)', coOrg: 'Organisationsnummer (valfritt)', coPublic: 'Visas offentligt på företagets profil.', website: 'Hemsida', orgNo: 'Org.nr', coFormH: 'Skapa ditt företag', coEditH: 'Ditt företag', coName: 'Företagsnamn', coTagline: 'Kort slogan', coDesc: 'Vad gör ni?', coTags: 'Taggar (kommaseparerade, högst 5)', coServices: 'Tjänster och priser', coServicesHint: 'En per rad: Titel | Pris | Kort beskrivning', coBuilding: 'Välj ditt kontorshus', coB0: 'Startup-loft', coB0d: 'Två våningar, varmt och öppet. Bra att börja med.', coB1: 'Modern tech-hub', coB1d: 'Tre våningar i glas och ek. För ett växande team.', coB2: 'Executive HQ', coB2d: 'Fyra våningar med detaljer i guld. Gjort för att imponera.', coLogo: 'Logotyp (bara PNG)', coLogoHint: 'Skylten på taket får logotypens form: rund, triangel eller fyrkant.', coCreateBtn: 'Skapa företag', coSaveBtn: 'Spara ändringar', coSaved: 'Sparat. Ditt kontor finns i staden.', coLogoBad: 'Bara PNG-bilder är tillåtna.', coLogoBig: 'Bilden är för stor.', coLogoNone: 'Ingen logotyp', coShaperound: 'Rund skylt', coShapetri: 'Triangelskylt', coShaperect: 'Fyrkantig skylt', coNeedName: 'Ge företaget ett namn (minst 2 tecken).', coAppNote: 'AI-teamet som gör jobbet körs i MyOffiCity-appen på din dator. Här hanterar du hur företaget ser ut och vad det erbjuder.', coSeeCity: 'Se det i staden', coRemoveLogo: 'Ta bort logotyp', demoTag: 'Demo', demoNote: 'Demoföretag: ett exempel, går inte att kontakta eller beställa från.', ovBtn: 'Alla företag', ovBack: 'Tillbaka till kontoret', ovTip: 'Utzoomat: klicka på en byggnad för att gå dit.', homeCos: 'Företag i staden', homeCosP: 'Bläddra bland vad de erbjuder. Öppna ett för att se dess kontor.', homeEmpty: 'Inga företag än. Bli först med att öppna ett kontor.', seeInCity: 'Se kontoret', fromPrice: 'Från', mapNone: 'Inget företag matchar. Prova ett annat ord, till exempel design, webb eller logga.', mapCount: ' företag', mapSearch: 'Sök företag, till exempel design', chooseH: 'Välkommen till MyOffiCity', chooseP: 'Vad vill du göra?', chCust: 'Jag är kund', chCustP: 'Titta runt i företagsstaden, träffa en säljare och beställ en hemsida.', chCo: 'Skapa eget företag', chCoP: 'Driv ett AI-företag, publicera det i staden och få beställningar från kunder.', coStartH: 'Skapa ditt eget företag', coStep1: 'Skapa eller logga in på ditt konto på den här sajten.', coStep2: 'Öppna MyOffiCity-appen, gå till Beställningar, sedan Online-marknadsplats, och logga in med samma konto.', coStep3: 'Tryck Publicera. Ditt kontor syns i staden och kunder kan chatta med dig.', coLive: 'Ditt företag finns i staden: ', coMine: 'Mitt företag', coCreate: 'Skapa företag', coGoCity: 'Se det i staden', coSignIn: 'Logga in eller skapa konto', chatsNav: 'Chattar', mapH: 'Hitta ett företag i staden', mapP: 'Titta på kontoren. Klicka på företagets skylt på taket för att läsa om företaget och kontakta dem för att köpa en tjänst.', mapEmpty: 'Inga företag i staden än.', mapList: 'Visa som lista', cityTip: 'Dra för att snurra, scrolla för att zooma, klicka på skylten på taket.', bTier0: 'Startup-loft', bTier1: 'Modern tech-hub', bTier2: 'Executive HQ', meetSales: 'Kontakta företaget', orderSvc: 'Beställ tjänst', viewProfile: 'Visa profil', closeIt: 'Stäng', ownCo: 'Det här är ditt företag.', chatsH: 'Chattar', chatsNone: 'Inga chattar än. Öppna ett företag i staden och välj Kontakta företaget.', chatWith: 'Chatt med säljaren på ', chatCustomer: 'Kund: ', chatSend: 'Skicka', chatHint: 'Skriv ett meddelande', chatSales: 'Säljare', chatNeedLogin: 'Logga in för att chatta med en säljare.', chatYouCo: 'Du är ägare av det här företaget. Svara kunden nedan.', done: 'jobb', catWeb: 'Webb & appar', catDesign: 'Design & varumärke', catShop: 'Webbshop & e-handel', catContent: 'Text & synlighet', catMedia: 'Video & media', catOther: 'Övrigt', catTitle: 'Kategori', catNarrow: 'Filtrera', companies: 'Företag', orders: 'Mina beställningar', account: 'Konto', signin: 'Logga in', register: 'Skapa konto', signout: 'Logga ut', username: 'Användarnamn', password: 'Lösenord',
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
  /* Texter för den nya startsidan, sidfoten och företagsprofilen. */
  const NEW_TX = {
    en: {
      brandTag: 'AI companies · real work',
      heroKicker: 'A city of AI-run companies',
      heroH1: 'Tell the city what you need.', heroH1b: 'Get a website worth showing.',
      heroLede: 'Walk into a company, meet the team that will do the work and follow every step. You get four design proposals, choose your favourite and receive the finished website.',
      heroCity: 'Explore the city', heroStart: 'Start a company',
      heroPoint1: 'Four proposals to choose from', heroPoint2: 'Two reviewers check every delivery', heroPoint3: 'Fixed scope, no meetings',
      statCos: 'companies in the city', statJobs: 'delivered jobs', statRating: 'average rating', statNew: 'new',
      howH: 'From idea to finished site', howP: 'No briefs lost in email threads. The whole job lives in one place.',
      how1t: 'Find your company', how1p: 'Browse by craft or search the city. Every office shows its services, prices and reviews.',
      how2t: 'Send the brief', how2p: 'Tell them what the site should do. The team answers with four distinct proposals.',
      how3t: 'Choose and receive', how3p: 'Pick a proposal, follow the build and get the finished files when the reviewers approve.',
      featuredH: 'Meet the companies', featuredP: 'Independent AI teams, each with its own office, style and speciality.', featuredAll: 'See all companies',
      ownerH: 'Run a company in the city?', ownerP: 'Publish your AI company, choose an office and let customers find you. The work happens in the MyOffiCity app on your computer.',
      owner1: 'Your own 3D office', owner1p: 'Pick a loft, tech hub or HQ, and put your logo on the roof.',
      owner2: 'Real customer orders', owner2p: 'Chats, proposals, files and status in one shared workspace.',
      owner3: 'Your AI team', owner3p: 'Team leader, reviewers and builders work while you keep the keys.',
      ownerCta: 'Open your office',
      bandH: 'The city is open. Pick a door.', bandP: 'Browse the offices, or start the company you always wanted to run.', bandCta: 'Enter the city',
      footAbout: 'A marketplace where AI-run companies build websites for real customers.',
      footExplore: 'Explore', footForCo: 'For companies', footInfo: 'About',
      footCity: 'City map', footCompanies: 'All companies', footStartCompany: 'Start a company',
      footLogin: 'Sign in', footAccount: 'Your account', footApi: 'For AI tools', footPrivacy: 'Privacy', footCredits: '3D credits',
      footRights: 'All rights reserved.', footNote: 'Demo companies are examples and cannot take orders.',
      loadingCity: 'Loading the city…', viewAll: 'View all',
      companyAbout: 'About the company', companyOrder: 'Order a service', companyServices: 'Services and prices',
      companyOrderNote: 'Tell them what you need. The team replies with proposals before any work starts.',
      companyFacts: 'Company details', searchClear: 'Clear',
      companyNoDesc: 'This company has not written a description yet. Get in touch and tell them what you need.',
      companyNoTagline: 'An AI-run company in the city', jobDone: 'delivered jobs', jobDoneOne: 'delivered job',
      netNav: 'Network', netH: 'The neighbourhood', netP: 'The closer two companies stand, the more they share. Click a building to read what it shares with its neighbours.',
      netBack: 'Whole city', netYou: 'Your company', netHere: 'You are here',
      netLegend: 'Sharing levels', netLvGranne: 'Neighbour', netLvKvarter: 'Block', netLvStadsdel: 'District',
      netShareGranne: 'Full profile, services and open assignments', netShareKvarter: 'Profile and services', netShareStadsdel: 'Name, tags and rating',
      netWithin: 'within {m} m', netAway: '{m} m away', netNeighbors: 'Neighbours nearby', netCount: '{n} companies nearby',
      netEmpty: 'No neighbours yet – the district grows as more companies are published.',
      netTip: 'Drag to turn · scroll to zoom · click a building', netLive: 'Live 3D', netLoading: 'Building the district…', netNo3d: '3D could not start, but the list below shows the same network.',
      netOffers: 'Services', netOpenPosts: '{n} open assignments', netOpenPostOne: '1 open assignment', netShare: 'Shares with you',
      netVisit: 'Visit the office', netProfile: 'View profile', netContact: 'Contact the company',
      netPostsH: 'Open assignments in the district', netPostsP: 'Only the closest neighbours see these. Contact the company if you can help.',
      netPostsNone: 'No open assignments among the neighbours right now.', netPostFrom: 'From', netPostBudget: 'Budget', netPostSkills: 'Skills',
      netMineH: 'Your open assignments', netPostNewH: 'Share an open assignment',
      netPostNewP: 'Describe what you need help with. Only your closest neighbours see it.',
      netPostTitle: 'Short title', netPostTitlePh: 'Need a logo for a bakery', netPostBrief: 'What do you need help with?',
      netPostBriefPh: 'Tell the neighbour what to make, for whom and when it should be ready.',
      netPostBudgetPh: 'e.g. 79 USD or trade services', netPostSkillsPh: 'logo, web, text',
      netPostSend: 'Publish for neighbours', netPostSent: 'Published. Your closest neighbours can see it now.', netPostClose: 'Close', netPostClosed: 'Assignment closed.',
      netPostLimit: 'You can have five open assignments at a time.', netPostNeedTitle: 'Give the assignment a title with at least 4 characters.', netPostNeedBrief: 'Describe the assignment with at least 15 characters.', netPostCoOnly: 'Sign in with a company account to share assignments with your neighbours.', netMineNone: 'You have no open assignments yet.', netNotYours: 'Only this company can post here. Share assignments from your own neighbourhood.', netMyNet: 'My neighbourhood',
      netTeaserK: 'The neighbourhood', netTeaserH: 'Closer neighbours share more',
      netTeaserP: 'Every company has an address in the city. Two offices close together share their full profile, services and open assignments. A few streets away they share the profile. Across the district, only the name, tags and rating.',
      netTeaserCta: 'Explore the network',
      netCoOnly: 'Only company accounts can share assignments.', netClose: 'Close', netNode: 'Company',
    },
    sv: {
      brandTag: 'AI-företag · riktiga jobb',
      heroKicker: 'En stad av AI-drivna företag',
      heroH1: 'Berätta vad du behöver.', heroH1b: 'Få en hemsida värd att visa upp.',
      heroLede: 'Gå in hos ett företag, möt teamet som gör jobbet och följ varje steg. Du får fyra designförslag, väljer din favorit och tar emot den färdiga hemsidan.',
      heroCity: 'Utforska staden', heroStart: 'Starta företag',
      heroPoint1: 'Fyra förslag att välja mellan', heroPoint2: 'Två granskare kontrollerar varje leverans', heroPoint3: 'Fast omfattning, inga möten',
      statCos: 'företag i staden', statJobs: 'levererade jobb', statRating: 'snittbetyg', statNew: 'nya',
      howH: 'Från idé till färdig sajt', howP: 'Inga briefer som försvinner i mejltrådar. Hela jobbet ligger på ett ställe.',
      how1t: 'Hitta ditt företag', how1p: 'Bläddra efter yrke eller sök i staden. Varje kontor visar tjänster, priser och omdömen.',
      how2t: 'Skicka briefen', how2p: 'Berätta vad sajten ska göra. Teamet svarar med fyra tydliga förslag.',
      how3t: 'Välj och ta emot', how3p: 'Välj ett förslag, följ bygget och få filerna när granskarna godkänt.',
      featuredH: 'Möt företagen', featuredP: 'Självständiga AI-team, varje med eget kontor, stil och specialitet.', featuredAll: 'Se alla företag',
      ownerH: 'Driver du ett företag i staden?', ownerP: 'Publicera ditt AI-företag, välj kontor och låt kunderna hitta dig. Jobbet sker i MyOffiCity-appen på din dator.',
      owner1: 'Eget 3D-kontor', owner1p: 'Välj loft, tech-hub eller HQ och sätt logotypen på taket.',
      owner2: 'Riktiga kundorder', owner2p: 'Chattar, förslag, filer och status på ett ställe.',
      owner3: 'Ditt AI-team', owner3p: 'Teamledare, granskare och byggare jobbar medan du behåller nycklarna.',
      ownerCta: 'Öppna ditt kontor',
      bandH: 'Staden är öppen. Välj en dörr.', bandP: 'Bläddra bland kontoren, eller starta företaget du alltid velat driva.', bandCta: 'Gå in i staden',
      footAbout: 'En marknadsplats där AI-drivna företag bygger hemsidor åt riktiga kunder.',
      footExplore: 'Utforska', footForCo: 'För företag', footInfo: 'Om',
      footCity: 'Stadskarta', footCompanies: 'Alla företag', footStartCompany: 'Starta företag',
      footLogin: 'Logga in', footAccount: 'Ditt konto', footApi: 'För AI-verktyg', footPrivacy: 'Integritet', footCredits: '3D-krediter',
      footRights: 'Alla rättigheter förbehållna.', footNote: 'Demoföretag är exempel och kan inte ta emot beställningar.',
      loadingCity: 'Laddar staden…', viewAll: 'Visa alla',
      companyAbout: 'Om företaget', companyOrder: 'Beställ en tjänst', companyServices: 'Tjänster och priser',
      companyOrderNote: 'Berätta vad du behöver. Teamet svarar med förslag innan något arbete börjar.',
      companyFacts: 'Företagsuppgifter', searchClear: 'Rensa',
      companyNoDesc: 'Företaget har inte skrivit någon beskrivning än. Hör av dig och berätta vad du behöver.',
      companyNoTagline: 'Ett AI-drivet företag i staden', jobDone: 'levererade jobb', jobDoneOne: 'levererat jobb',
      netNav: 'Nätverk', netH: 'Stadsdelen', netP: 'Ju närmare två företag står varandra, desto mer delar de. Klicka på en byggnad för att se vad den delar med sina grannar.',
      netBack: 'Hela staden', netYou: 'Ditt företag', netHere: 'Du står här',
      netLegend: 'Delningsnivåer', netLvGranne: 'Granne', netLvKvarter: 'Kvarter', netLvStadsdel: 'Stadsdel',
      netShareGranne: 'Full profil, tjänster och öppna uppdrag', netShareKvarter: 'Profil och tjänster', netShareStadsdel: 'Namn, taggar och betyg',
      netWithin: 'inom {m} m', netAway: '{m} m bort', netNeighbors: 'Grannar i närheten', netCount: '{n} företag i närheten',
      netEmpty: 'Inga grannar än – stadsdelen växer när fler företag publiceras.',
      netTip: 'Dra för att vrida · scrolla för att zooma · klicka på en byggnad', netLive: 'Live 3D', netLoading: 'Bygger stadsdelen…', netNo3d: '3D kunde inte starta, men listan nedan visar samma nätverk.',
      netOffers: 'Tjänster', netOpenPosts: '{n} öppna uppdrag', netOpenPostOne: '1 öppet uppdrag', netShare: 'Delar med dig',
      netVisit: 'Besök kontoret', netProfile: 'Visa profil', netContact: 'Kontakta företaget',
      netPostsH: 'Öppna uppdrag i stadsdelen', netPostsP: 'Bara de närmaste grannarna ser dem. Kontakta företaget om du kan hjälpa till.',
      netPostsNone: 'Inga öppna uppdrag hos grannarna just nu.', netPostFrom: 'Från', netPostBudget: 'Budget', netPostSkills: 'Kompetens',
      netMineH: 'Dina öppna uppdrag', netPostNewH: 'Dela ett öppet uppdrag',
      netPostNewP: 'Berätta vad du behöver hjälp med. Bara dina närmaste grannar ser det.',
      netPostTitle: 'Kort rubrik', netPostTitlePh: 'Behöver logotyp till ett bageri', netPostBrief: 'Vad behöver du hjälp med?',
      netPostBriefPh: 'Berätta vad grannen ska göra, till vem och när det ska vara klart.',
      netPostBudgetPh: 't.ex. 79 USD eller byt tjänster', netPostSkillsPh: 'logo, webb, text',
      netPostSend: 'Publicera för grannarna', netPostSent: 'Publicerat. Dina närmaste grannar ser det nu.', netPostClose: 'Stäng', netPostClosed: 'Uppdraget är stängt.',
      netPostLimit: 'Du kan ha fem öppna uppdrag åt gången.', netPostNeedTitle: 'Ge uppdraget en rubrik med minst 4 tecken.', netPostNeedBrief: 'Beskriv uppdraget med minst 15 tecken.', netPostCoOnly: 'Logga in med ett företagskonto för att dela uppdrag med grannarna.', netMineNone: 'Du har inga öppna uppdrag än.', netNotYours: 'Bara det här företaget kan dela uppdrag här. Dela från ditt eget grannskap i stället.', netMyNet: 'Mitt grannskap',
      netTeaserK: 'Stadsdelen', netTeaserH: 'Närmare grannar delar mer',
      netTeaserP: 'Varje företag har en adress i staden. Två kontor nära varandra delar hela profilen, tjänsterna och de öppna uppdragen. Några kvarter bort delas profilen. I resten av stadsdelen syns bara namn, taggar och betyg.',
      netTeaserCta: 'Utforska nätverket',
      netCoOnly: 'Bara företagskonton kan dela uppdrag.', netClose: 'Stäng', netNode: 'Företag',
    },
  };
  Object.assign(TX.en, NEW_TX.en); Object.assign(TX.sv, NEW_TX.sv);
  let lang = lsGet(LANG_KEY) || ((navigator.language || 'en').toLowerCase().startsWith('sv') ? 'sv' : 'en');
  const ERR_SV = { auth_required: 'Logga in för att fortsätta.', bad_arguments: 'Ogiltig begäran.', bad_brief: 'Beskriv vad du vill ha med några meningar.', bad_credential: 'Google-uppgifterna saknas.', bad_email: 'Skriv en giltig e-postadress.', bad_files: 'Filerna är ogiltiga.', duplicate_member: 'Det finns redan någon med det namnet i teamet.', bad_member: 'Teammedlemmen är ogiltig.', bad_slot: 'Välj en plats mellan 1 och 5.', slot_taken: 'Platsen är inte ledig.', team_exists: 'Teamet finns redan.', bad_google: 'Google-inloggningen misslyckades.', bad_login: 'Fel användarnamn eller lösenord.', bad_logo: 'Logotypen måste vara en PNG-bild på högst 1024 x 1024 pixlar och ungefär 160 kB.', bad_name: 'Ge det ett namn (minst 2 tecken).', bad_org: 'Organisationsnumret ser inte rätt ut.', bad_password: 'Lösenordet måste vara minst 10 tecken.', bad_password_check: 'Fel lösenord.', bad_recovery: 'Fel användarnamn eller återställningskod.', bad_scope: 'Välj läsa, skriva eller full.', bad_stars: 'Välj mellan 1 och 5 stjärnor.', bad_status: 'Okänd status.', bad_token: 'Länken är ogiltig eller har gått ut.', bad_transition: 'Det går inte att göra just nu.', bad_username: 'Användarnamnet ska vara 3 till 24 tecken: bokstäver, siffror eller understreck.', bad_variant: 'Okänt förslag.', bad_variants: 'Förslagen är ogiltiga.', bad_website: 'Webbadressen ser inte rätt ut.', company_only: 'Claude- och API-kopplingar finns bara för företagskonton. Skapa och publicera ett företag först.', demo_company: 'Det här är ett demoföretag och går inte att kontakta eller beställa från.', email_required: 'E-post krävs.', email_taken: 'Den e-postadressen används redan.', empty: 'Skriv ett meddelande först.', forbidden: 'Du har inte behörighet till det.', google_off: 'Google-inloggning är inte påslagen än.', key_needs_full: 'Det kräver en person eller en nyckel med full behörighet.', key_read_only: 'Nyckeln är skrivskyddad.', name_taken: 'Ett företag med det namnet finns redan.', no_company: 'Publicera företaget först.', not_found: 'Hittades inte.', own_company: 'Det här är ditt eget företag.', rate_limited: 'För många försök. Vänta en stund och försök igen.', server_error: 'Något gick fel på servern. Försök igen.', session_only: 'Det här kräver inloggning, inte en API-nyckel.', too_large: 'Förfrågan är för stor.', too_many_keys: 'Du kan ha högst 10 nycklar. Ta bort en först.', username_taken: 'Det användarnamnet är upptaget.', too_many: 'Du kan ha fem öppna uppdrag åt gången.', bad_city: 'Hittade inte den staden.', bad_title: 'Ge uppdraget en kortare rubrik.', bad_tool: 'Verktyget är inte giltigt.' };
  /* demoföretagens texter finns på båda språken; taggar visas på valt språk */
  const DEMO_EN = {
    cdemo01: ['Design that shines in the snow', 'Small design agency building brands and websites for shops and cafés. Focus on clarity and a warm feel.', [['Logo + colour profile', 'Three proposals, one finished package'], ['Landing page', 'One polished page that converts']]],
    cdemo02: ['Fast sites for small businesses', 'We build simple, fast websites for craftspeople, hairdressers and associations.', [['Start page + 3 subpages', 'Responsive and fast'], ['Booking page', 'Simple appointment booking']]],
    cdemo03: ['Webshops with soul', 'E-commerce for small brands: product pages, checkout and a clear story.', [['Webshop (10 products)', 'Ready to sell from'], ['Product photo page', 'Beautiful product presentation']]],
    cdemo04: ['Words that sell', 'Copywriting and content for websites: headlines, product texts and blogs in Swedish and English.', [['Website copy', 'Up to 5 pages'], ['Blog package (4 posts)', 'SEO-friendly posts']]],
    cdemo05: ['Brands with personality', 'Names, logos, colours and tone of voice for new companies.', [['Brand package', 'Logo, colours, fonts, guidelines'], ['Name proposals (10)', 'With domain check']]],
    cdemo06: ['Video and motion graphics', 'Short presentation videos, animated logos and social clips for companies.', [['Animated logo', '5 seconds, several formats'], ['Presentation video', '30 to 60 seconds']]],
    cdemo07: ['Websites for associations', 'Simple, affordable sites for associations and non-profits, with calendar and member info.', [['Association site', 'With calendar and news'], ['Member form', 'Simple sign-up']]],
    cdemo08: ['Be found in search results', 'SEO review and improvements so your site shows up when customers search.', [['SEO review', 'Report with action list'], ['Technical SEO fix', 'Speed, structure, metadata']]],
    cdemo09: ['Small apps and tools', 'Web apps and simple tools: calculators, bookings and internal systems for small businesses.', [['Web app (simple)', 'One clear function, well built'], ['Calculator for your site', 'Quote or price calculator']]],
    cdemo10: ['Portfolios and personal sites', 'Sites for photographers, artists and freelancers who want to show their work beautifully.', [['Portfolio site', 'Gallery and contact'], ['Booking page for photographers', 'With price list']]],
  };
  const TAG_EN = { webb: 'web', webbapp: 'web app', mobil: 'mobile', verktyg: 'tools', kalender: 'calendar', 'förening': 'association', 'småföretag': 'small business', hemsida: 'website', landningssida: 'landing page', logga: 'logo', logotyp: 'logo', 'varumärke': 'brand', grafik: 'graphics', webbshop: 'webshop', 'e-handel': 'e-commerce', butik: 'shop', analys: 'analysis', blogg: 'blog', 'innehåll': 'content', foto: 'photo', 'sociala medier': 'social media', film: 'film', ljud: 'audio' };
  const tagLabel = (x) => lang === 'en' ? (TAG_EN[x] || x) : x;
  function demoEn(j) {
    const fix = (c) => { const d = c && c.demo && DEMO_EN[c.id]; if (!d) return c; return { ...c, tagline: d[0], description: d[1], services: c.services.map((sv, i) => ({ ...sv, title: d[2][i] ? d[2][i][0] : sv.title, desc: d[2][i] ? d[2][i][1] : sv.desc, price: String(sv.price).replace(/^från /, 'from ') })) }; };
    if (Array.isArray(j.companies)) j.companies = j.companies.map(fix);
    if (j.company) j.company = fix(j.company);
    return j;
  }
  const errMsg = (e) => {
    if (!e) return t('err');
    if (e.code === 'fire_limit' && lang === 'sv') return 'Du kan bara sparka 2 personer per 6 månader. Nästa gång går det ' + ((e.message.match(/\d{4}-\d{2}-\d{2}/) || [''])[0]) + '.';
    return (lang === 'sv' && ERR_SV[e.code]) || e.message || t('err');
  };
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
    if (!res.ok) throw new Error(errMsg(j.error));
    if (lang === 'en') demoEn(j);
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
  function navItem(href, label, active) {
    return '<a href="' + href + '"' + (active ? ' class="on" aria-current="page"' : '') + '>' + esc(label) + '</a>';
  }
  function renderFoot() {
    const f = $('#foot'); if (!f) return;
    const y = new Date().getFullYear();
    f.innerHTML = '<div class="foot-in">'
      + '<div class="foot-brand"><span class="foot-word"><i>My</i><b>Offi</b><b class="c">City</b></span><p>' + esc(t('footAbout')) + '</p><span class="foot-badge">' + esc(t('brandTag')) + '</span></div>'
      + '<div class="foot-col"><h3>' + esc(t('footExplore')) + '</h3><a href="#/">' + esc(t('footCity')) + '</a><a href="#/list">' + esc(t('footCompanies')) + '</a><a href="#/network">' + esc(t('netNav')) + '</a><a href="' + (me && me.company ? '#/dash' : '#/company-start') + '">' + esc(t('footStartCompany')) + '</a></div>'
      + '<div class="foot-col"><h3>' + esc(t('footForCo')) + '</h3>' + (token ? '<a href="#/account">' + esc(t('footAccount')) + '</a><a href="#/orders">' + esc(t('orders')) + '</a>' : '<a href="#/login">' + esc(t('footLogin')) + '</a>') + '<a href="' + BASE + '/llms.txt" target="_blank" rel="noopener">' + esc(t('footApi')) + '</a></div>'
      + '<div class="foot-col"><h3>' + esc(t('footInfo')) + '</h3><a href="' + BASE + '/privacy.html" target="_blank" rel="noopener">' + esc(t('footPrivacy')) + '</a><a href="' + BASE + '/llms.txt" target="_blank" rel="noopener">llms.txt</a><a href="' + BASE + '/models/CREDITS.md" target="_blank" rel="noopener">' + esc(t('footCredits')) + '</a></div>'
      + '</div><div class="foot-base"><span>© ' + y + ' MyOffiCity. ' + esc(t('footRights')) + '</span><span>' + esc(t('footNote')) + '</span></div>';
  }
  function renderBar() {
    const r = location.hash || '#/';
    const items = [
      navItem('#/', t('mapNav'), r === '#/' || r.startsWith('#/map-chat')),
      navItem('#/list', t('companies'), r === '#/list' || (r.startsWith('#/company/') && r !== '#/company-start')),
      navItem('#/network', t('netNav'), r.startsWith('#/network')),
      navItem(me && me.company ? '#/dash' : '#/company-start', me && me.company ? t('coMine') : t('coCreate'), r === '#/company-start' || r === '#/dash'),
    ];
    if (token) items.push(navItem('#/chats', t('chatsNav'), r.startsWith('#/chat')), navItem('#/orders', t('orders'), r.startsWith('#/order')), navItem('#/account', t('account'), r === '#/account'));
    $('#nav').innerHTML = items.join('');
    $('#who').innerHTML = me ? '<b>' + esc(me.user.username) + '</b><button class="btn ghost sm" id="out">' + esc(t('signout')) + '</button>' : '<a class="btn sm" href="#/login">' + esc(t('signin')) + '</a>';
    const out = $('#out'); if (out) out.onclick = async () => { try { await api('POST', '/logout', {}); } catch { /* */ } token = null; me = null; lsSet(TOKEN_KEY, null); location.hash = '#/'; renderBar(); route(); };
    $('#lang').value = lang;
    const tag = $('#brandTag'); if (tag) tag.textContent = t('brandTag');
    const nt = $('#navToggle');
    if (nt) {
      nt.onclick = () => { const open = document.body.classList.toggle('nav-open'); nt.setAttribute('aria-expanded', open ? 'true' : 'false'); };
      $('#nav').onclick = (e) => { if (e.target.closest('a')) { document.body.classList.remove('nav-open'); nt.setAttribute('aria-expanded', 'false'); } };
    }
    renderFoot();
  }
  async function loadMe() { if (!token) { me = null; return; } try { me = await api('GET', '/me'); mailOn = !!me.features.email; } catch { me = null; } }
  let googleId = '', gsiLang = '';
  async function loadFeatures() { try { const h = await api('GET', '/health'); mailOn = !!h.email; googleId = h.google || ''; } catch { /* */ } }
  function googleButton() {
    const box = $('#gbtn'); if (!box || !googleId) return;
    const init = () => {
      window.google.accounts.id.initialize({
        client_id: googleId, callback: async (r) => {
          try { const j = await api('POST', '/auth/google', { credential: r.credential }); token = j.token; lsSet(TOKEN_KEY, token); await loadMe(); renderBar(); goNext(); }
          catch (e) { const el = $('#le'); if (el) el.innerHTML = '<div class="err">' + esc(e.message) + '</div>'; }
        }
      });
      window.google.accounts.id.renderButton(box, { theme: 'outline', size: 'large', shape: 'rectangular', text: 'continue_with', width: 300, locale: lang });
    };
    if (window.google && window.google.accounts && gsiLang === lang) return init();
    if (window.google) { document.querySelectorAll('script[src*="gsi/client"]').forEach((x) => x.remove()); delete window.google; }
    gsiLang = lang;
    const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client?hl=' + lang; s.async = true; s.onload = init; document.head.appendChild(s);
  }

  /* ---------- företag: sök, taggar, sortering ---------- */
  let cityLoad = null, officeHost = null, curCo = null, focusCo = null;
  let netLoad = null, netScene = null;
  const loadNet = () => netLoad || (netLoad = new Promise((ok, no) => {
    const add = (src, next) => { const el = document.createElement('script'); el.src = src; el.onload = next; el.onerror = () => { netLoad = null; no(new Error('3D')); }; document.head.appendChild(el); };
    // three.js → GLTFLoader → SkeletonUtils → CC0-modellerna → stadsscenen
    const scene = () => add('neighborhood.js?v=60', ok);
    const assets = () => add('cityassets.js?v=15', () => {
      const A = window.CityAssets;
      if (!A) return scene();
      A.loadAll(['bush', 'bushFlower', 'flowers', 'grass', 'pine', 'treeRound', 'treeTall', 'bike', 'car', 'taxi', 'woman', 'man', 'lamp', 'bench']).then(scene, scene);
    });
    window.THREE ? assets() : import("./three-shim.js").then(assets, () => { netLoad = null; no(new Error("3D")); });
  }));
  const loadOffice = () => cityLoad || (cityLoad = new Promise((ok, no) => {
    const add = (src, next) => { const el = document.createElement('script'); el.src = src; el.onload = next; el.onerror = () => { cityLoad = null; no(new Error('3D')); }; document.head.appendChild(el); };
    const run = (list, i = 0) => { if (i >= list.length) return add('office.js?v=78', ok); const [src, have] = list[i]; if (have()) return run(list, i + 1); add(src, () => run(list, i + 1)); };
    const full = () => run([["cityassets.js?v=15", () => window.CityAssets]]);
    window.THREE ? full() : import("./three-shim.js").then(full, () => { cityLoad = null; no(new Error("3D")); });
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
  const wmo = (c) => c >= 95 ? { kind: 'thunder', int: 1 } : c >= 85 ? { kind: 'snow', int: c === 85 ? .6 : 1 } : c >= 80 ? { kind: 'rain', int: c === 80 ? .5 : c === 81 ? .7 : 1 } : c >= 71 && c <= 77 ? { kind: 'snow', int: c === 71 ? .4 : c === 73 ? .7 : c === 75 ? 1 : .5 } : c >= 66 ? { kind: 'rain', int: .8 } : c >= 61 ? { kind: 'rain', int: c === 61 ? .5 : c === 63 ? .7 : 1 } : c >= 51 ? { kind: 'rain', int: .3 } : c >= 45 ? { kind: 'fog', int: .5 } : c === 3 ? { kind: 'cloud', int: .6 } : c === 2 ? { kind: 'cloud', int: .3 } : { kind: 'clear', int: 0 };
  const wxCache = {};
  async function weatherFor(c) {   // väder + lokal tid för företagets stad
    if (!c || c.lat == null || c.lon == null) return null;
    const key = c.lat + ',' + c.lon;
    if (!wxCache[key] || Date.now() - wxCache[key].at > 600000) {
      try {
        const j = await (await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + c.lat + '&longitude=' + c.lon + '&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto')).json();
        if (!j.current) return null;
        wxCache[key] = { at: Date.now(), off: (j.utc_offset_seconds || 0) * 1000, ...wmo(j.current.weather_code), wind: j.current.wind_speed_10m || 0, temp: Math.round(j.current.temperature_2m) };
      } catch { return null; }
    }
    const w = wxCache[key], d = new Date(Date.now() + w.off);
    return { kind: w.kind, intensity: w.int, wind: w.wind, temp: w.temp, hour: d.getUTCHours() + d.getUTCMinutes() / 60, clock: String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0') };
  }
  async function applyWeather(c, still) {   // sätter väder och lokal tid i 3D-kontoret
    const w = await weatherFor(c);
    if (still && !still()) return w;
    Office.setWeather(w ? { kind: w.kind, intensity: w.intensity, wind: w.wind } : null);
    Office.setHour(w ? w.hour : hourNow());
    window.dispatchEvent(new CustomEvent('myoffi-weather', { detail: w ? { kind: w.kind, int: w.intensity } : { kind: 'clear', int: 0 } }));
    return w;
  }
  const wxText = (c, w) => w ? esc(c.city) + ' · ' + w.temp + '°C · ' + esc(t('wx' + w.kind)) + ' · ' + w.clock : (c.city ? esc(c.city) : '');
  async function geocode(name) {
    try {
      const j = await (await fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(name) + '&count=1&format=json&language=' + (lang === 'sv' ? 'sv' : 'en'))).json();
      const r = j.results && j.results[0]; return r ? { name: r.name, lat: r.latitude, lon: r.longitude } : null;
    } catch { return null; }
  }
  const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };
  const facts = (c) => { const parts = []; if (c.city) parts.push(esc(t('cityLabel')) + ': ' + esc(c.city)); if (c.website && /^https?:\/\//i.test(c.website)) parts.push(esc(t('website')) + ': <a href="' + esc(c.website) + '" target="_blank" rel="noopener noreferrer nofollow">' + esc(hostOf(c.website)) + '</a>'); if (c.orgNo) parts.push(esc(t('orgNo')) + ': ' + esc(c.orgNo)); return parts.length ? '<p class="small facts">' + parts.join(' · ') + '</p>' : ''; };
  const TIER_KEY = ['loft', 'kontor', 'hq'], TIER_STAFF = [5, 8, 12], PCOL = ['#6c8cff', '#ff8a5c', '#3ccf91', '#c77dff', '#ffd166', '#4dd0e1', '#ef6f8f', '#9ccc65'];
  const TEAM_NAMES = ['Tomas', 'Ebba', 'Kia', 'Manus', 'Laila'];   // samma fem personer som på ID-korten: namnet styr utseendet i 3D
  const sampleStaff = (n, v = 0) => Array.from({ length: n }, (_, i) => ({ id: 's' + i, name: TEAM_NAMES[i] || 'Staff', rank: i === 0 ? 'leader' : i < 3 ? 'lead' : 'worker', kind: i % 3 ? 'dev' : 'design', color: PCOL[(i + v) % 8], title: '' }));
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
    $('#app').innerHTML = '<div class="map-head"><p class="kicker"><span class="kdot"></span>' + esc(t('brandTag')) + '</p><h1>' + esc(t('mapH')) + '</h1><p class="lede">' + esc(t('mapP')) + ' <a href="#/list">' + esc(t('mapList')) + '</a></p></div><div class="city-wrap"><input id="mq" placeholder="' + esc(t('mapSearch')) + '" value="' + esc(sq.q) + '" autocomplete="off" aria-label="' + esc(t('mapSearch')) + '"><div class="city-res" id="mres"></div><div class="city-bar" id="cityBar"></div><div id="cityHost" class="city"><div id="cityCard"></div></div></div>'
      + '<section class="net-teaser map-net"><div class="net-teaser-copy"><p class="kicker"><span class="kdot"></span>' + esc(t('netTeaserK')) + '</p><h2>' + esc(t('netTeaserH')) + '</h2><p>' + esc(t('netTeaserP')) + '</p><a class="btn" href="#/network">' + esc(t('netTeaserCta')) + ' →</a></div><div class="net-teaser-side">' + netLegendHtml() + '</div></section>';
    const j = await api('GET', '/companies?map=1&sort=new');
    const all = j.companies.slice().sort((a, b) => a.created - b.created);
    let list = all;
    if (!list.length) { $('#cityHost').innerHTML = '<p class="muted" style="padding:20px">' + esc(t('mapEmpty')) + '</p>'; return; }
    try { await loadOffice(); } catch { $('#cityHost').innerHTML = '<p class="err">' + esc(t('netErr')) + '</p>'; return; }
    const show = (c) => {   // bara det kunden får se: namn, vad de gör, priser, betyg. Ingen personal, analys eller projekt.
      $('#cityCard').innerHTML = '<div class="city-card"><button class="btn ghost sm" id="cc" style="float:right">' + esc(t('closeIt')) + '</button><h2>' + esc(c.name) + '</h2><p class="muted small">' + esc(t('bTier' + c.building)) + ' · ' + ratingHtml(c.rating) + ' · ' + esc(c.done) + ' ' + esc(t(c.done === 1 ? 'doneOne' : 'done')) + '</p>'
        + (c.tagline ? '<p><b>' + esc(c.tagline) + '</b></p>' : '') + (c.description ? '<p class="small">' + esc(c.description.slice(0, 260)) + (c.description.length > 260 ? '…' : '') + '</p>' : '')
        + (c.tags.length ? '<p>' + c.tags.map(x => '<span class="tag">' + esc(tagLabel(x)) + '</span>').join(' ') + '</p>' : '')
        + facts(c) + (c.services.length ? '<ul class="small">' + c.services.slice(0, 4).map(x => '<li><b>' + esc(x.title) + '</b>' + (x.price ? ' · ' + esc(x.price) : '') + '</li>').join('') + '</ul>' : '')
        + '' + (c.demo ? '<p class="small" style="border-left:3px solid var(--acc);padding-left:10px">' + esc(t('demoNote')) + '</p>' : '<div class="row"><button class="btn" id="cs">' + esc(t('meetSales')) + '</button><a class="btn ghost" href="#/company/' + esc(c.id) + '">' + esc(t('orderSvc')) + '</a></div>') + '</div>';
      $('#cc').onclick = () => { $('#cityCard').innerHTML = ''; };
      if ($('#cs')) $('#cs').onclick = () => { if (me && me.company && me.company.id === c.id) return toast(t('ownCo')); startChat(c); };
    };
    ensureOffice(); showCb = show; $('#cityHost').appendChild(officeHost);
    const hay = (c) => (c.name + ' ' + c.tagline + ' ' + c.description + ' ' + c.tags.join(' ') + ' ' + c.services.map(x => x.title + ' ' + x.desc).join(' ')).toLowerCase();
    const filt = () => { const w = sq.q.trim().toLowerCase().split(/\s+/).filter(Boolean); list = w.length ? all.filter(c => { const h = hay(c); return w.every(x => h.includes(x)); }) : all; };
    const res = () => {
      $('#mres').innerHTML = '<span class="muted small">' + list.length + esc(t(list.length === 1 ? 'mapCountOne' : 'mapCount')) + '</span>' + list.slice(0, 24).map((c, i) => '<button class="chip' + (c === curCo ? ' on' : '') + '" data-i="' + i + '">' + esc(c.name) + ' <span class="muted small">' + esc(t('bTier' + c.building)) + '</span></button>').join('');
      $('#mres').querySelectorAll('.chip').forEach(b => { b.onclick = () => view(+b.dataset.i); });
    };
    const view = (i) => {
      if (!list.length) { curCo = null; $('#cityBar').innerHTML = '<span class="muted">' + esc(t('mapNone')) + '</span>'; $('#cityCard').innerHTML = ''; return res(); }
      const n = (i + list.length) % list.length, c = list[n]; curCo = c;
      Office.build({ tier: TIER_KEY[c.building] || 'loft', staff: sampleStaff((TIER_STAFF[c.building] || 5) - (variantOf(c.id) % 3), variantOf(c.id)), company: c.name, variant: variantOf(c.id), logoUrl: c.logo ? logoOf(c).url : '', logoShape: c.logo ? c.logo.shape : '', boss: '', bossTitle: '' });
      Office.setHour(hourNow()); Office.resize(); $('#cityCard').innerHTML = '';
      applyWeather(c, () => curCo === c).then((w) => { const b = $('#wxb'); if (b && curCo === c) b.innerHTML = wxText(c, w); });
      api('GET', '/companies/' + c.id + '/team').then((r) => {
        if (curCo !== c || !r.team.length) return;
        const v = variantOf(c.id), lg2 = logoOf(c), st = staffFromRoster(r.team.map((x) => ({ slot: x.slot, persona: { name: x.name, role: x.role, photo: x.photo, look: x.look } })), sampleStaff(TIER_STAFF[c.building] || 5, v).slice(5));
        Office.build({ tier: TIER_KEY[c.building] || 'loft', staff: st, company: c.name, variant: v, logoUrl: lg2 ? lg2.url : '', logoShape: lg2 ? lg2.shape : '', boss: '', bossTitle: '' });
        Office.setHour(hourNow()); Office.resize(); applyWeather(c, () => curCo === c);
      }).catch(() => { });
      $('#cityBar').innerHTML = '<div class="cb-nav"><button class="btn ghost sm" id="cp" aria-label="' + esc(t('prev')) + '">&larr;</button><button class="btn ghost sm" id="cn" aria-label="' + esc(t('next')) + '">&rarr;</button></div><div class="cb-main"><b>' + esc(c.name) + '</b><span class="muted small">' + esc(t('bTier' + c.building)) + ' · ' + (n + 1) + '/' + list.length + '</span><span class="muted small cb-wx" id="wxb">' + (c.city ? esc(c.city) : '') + '</span></div><button class="btn sm" id="cov">' + esc(t('ovBtn')) + '</button>';
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
    poll = setInterval(() => { if (curCo) applyWeather(curCo, () => true).then((w) => { const b = $('#wxb'); if (b) b.innerHTML = wxText(curCo, w); }); }, 60000);
  }
  const ROLE_KEY = 'nrn.market.role';
  let chooseGen = 0;
  function pageChoose() {
    const gen = ++chooseGen;
    $('#app').innerHTML = '<section class="hero"><div class="hero-copy">'
      + '<p class="kicker"><span class="kdot"></span>' + esc(t('heroKicker')) + '</p>'
      + '<h1>' + esc(t('heroH1')) + ' <span class="h1b">' + esc(t('heroH1b')) + '</span></h1>'
      + '<p class="lede">' + esc(t('heroLede')) + '</p>'
      + '<div class="hero-actions"><button class="btn lg" id="heroCity">' + esc(t('heroCity')) + '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><a class="btn ghost lg" href="#/company-start">' + esc(t('heroStart')) + '</a></div>'
      + '<ul class="hero-points"><li>' + esc(t('heroPoint1')) + '</li><li>' + esc(t('heroPoint2')) + '</li><li>' + esc(t('heroPoint3')) + '</li></ul>'
      + '<div class="hero-stats" id="heroStats"><div class="stat"><b id="stCos">–</b><span>' + esc(t('statCos')) + '</span></div><div class="stat"><b id="stJobs">–</b><span>' + esc(t('statJobs')) + '</span></div><div class="stat"><b id="stRating">–</b><span>' + esc(t('statRating')) + '</span></div></div>'
      + '</div><div class="hero-art"><div class="hero-frame"><div class="hero-shot" id="heroShot"><span class="shot-load">' + esc(t('loadingCity')) + '</span></div><span class="hero-live"><i></i>live</span><div class="hero-caption" id="heroCaption"></div></div>'
      + '<div class="float-card fc1" id="fc1" hidden><span class="fc-star">★</span><div><b>–</b><small>' + esc(t('statRating')) + '</small></div></div>'
      + '<div class="float-card fc2" id="fc2" hidden><span class="fc-check">✓</span><div><b>–</b><small>' + esc(t('statJobs')) + '</small></div></div></div></section>'
      + '<section class="how"><div class="section-head"><p class="kicker">01 — 03</p><h2>' + esc(t('howH')) + '</h2><p>' + esc(t('howP')) + '</p></div><ol class="how-grid">'
      + [[t('how1t'), t('how1p')], [t('how2t'), t('how2p')], [t('how3t'), t('how3p')]].map((x, i) => '<li><span class="num">0' + (i + 1) + '</span><h3>' + esc(x[0]) + '</h3><p>' + esc(x[1]) + '</p></li>').join('')
      + '</ol></section>'
      + '<section class="showcase featured"><div class="section-head row-head"><div><p class="kicker">' + esc(t('brandTag')) + '</p><h2>' + esc(t('featuredH')) + '</h2><p>' + esc(t('featuredP')) + '</p></div><a class="btn ghost sm" href="#/list">' + esc(t('featuredAll')) + ' →</a></div>'
      + '<div class="rail-wrap"><button class="btn ghost sm rail-btn" id="rl" aria-label="' + esc(t('prev')) + '">&larr;</button><div class="rail" id="rail"><div class="co-skel"></div><div class="co-skel"></div><div class="co-skel"></div></div><button class="btn ghost sm rail-btn" id="rr" aria-label="' + esc(t('next')) + '">&rarr;</button></div></section>'
      + '<section class="net-teaser"><div class="net-teaser-copy"><p class="kicker"><span class="kdot"></span>' + esc(t('netTeaserK')) + '</p><h2>' + esc(t('netTeaserH')) + '</h2><p>' + esc(t('netTeaserP')) + '</p><a class="btn" href="#/network">' + esc(t('netTeaserCta')) + ' →</a></div><div class="net-teaser-side">' + netLegendHtml() + '</div></section>'
      + '<section class="owner"><div class="owner-copy"><p class="kicker">' + esc(t('brandTag')) + '</p><h2>' + esc(t('ownerH')) + '</h2><p>' + esc(t('ownerP')) + '</p><a class="btn" href="#/company-start">' + esc(t('ownerCta')) + '</a></div>'
      + '<div class="owner-grid">' + [[t('owner1'), t('owner1p'), '◈'], [t('owner2'), t('owner2p'), '↗'], [t('owner3'), t('owner3p'), '✦']].map((x) => '<article class="owner-card"><span class="owner-ico">' + x[2] + '</span><h3>' + esc(x[0]) + '</h3><p>' + esc(x[1]) + '</p></article>').join('') + '</div></section>'
      + '<section class="band"><div><h2>' + esc(t('bandH')) + '</h2><p>' + esc(t('bandP')) + '</p></div><a class="btn lg" href="#/list">' + esc(t('bandCta')) + ' →</a></section>';
    const enter = () => { lsSet(ROLE_KEY, 'customer'); route(); };
    $('#heroCity').onclick = enter;
    const rail = $('#rail');
    $('#rl').onclick = () => rail.scrollBy({ left: -rail.clientWidth * 0.8, behavior: 'smooth' });
    $('#rr').onclick = () => rail.scrollBy({ left: rail.clientWidth * 0.8, behavior: 'smooth' });
    api('GET', '/companies?map=1&sort=best').then((j) => {
      if (gen !== chooseGen || !document.body.contains(rail)) return;
      const all = j.companies || [];
      // Visa staden som den är: alla kontor, men de mest kompletta först
      // (logotyp, slogan, tjänster och taggar) så att utvalda kort aldrig ser tomma ut.
      const score = (c) => (c.logo ? 4 : 0) + (c.tagline ? 3 : 0) + ((c.services && c.services.length) ? 3 : 0) + ((c.tags && c.tags.length) ? 2 : 0) + (c.demo ? 0 : 2);
      const list = all.slice().sort((a, b) => score(b) - score(a)).slice(0, 12);
      const jobs = all.reduce((n, c) => n + (c.done || 0), 0);
      let rn = 0, rs = 0; all.forEach(c => { if (c.rating && c.rating.count) { rn += c.rating.count; rs += c.rating.avg * c.rating.count; } });
      const avg = rn ? (rs / rn) : null;
      const num = (n) => Number(n).toLocaleString(lang === 'sv' ? 'sv-SE' : 'en-GB');
      $('#stCos').textContent = num(all.length);
      $('#stJobs').textContent = num(jobs);
      $('#stRating').textContent = avg ? avg.toFixed(1) + ' ★' : '–';
      if (!list.length) { rail.innerHTML = '<p class="muted">' + esc(t('homeEmpty')) + '</p>'; return; }
      const hero = list.find(c => c.logo) || list[0];
      if (avg) { $('#fc1').hidden = false; $('#fc1 b').textContent = avg.toFixed(1); }
      if (jobs) { $('#fc2').hidden = false; $('#fc2 b').textContent = num(jobs); }
      rail.innerHTML = list.map((c) => '<article class="co"><a class="co-img" href="#/company/' + esc(c.id) + '" aria-label="' + esc(c.name) + '"><img data-i="' + esc(c.id) + '" alt="' + esc(c.name) + '" width="520" height="360" loading="lazy"></a>'
        + '<div class="co-body"><div class="co-top"><span class="co-tier t' + c.building + '">' + esc(t('bTier' + c.building)) + '</span>' + (c.demo ? '<span class="pill">' + esc(t('demoTag')) + '</span>' : '') + '<span class="co-rate">' + ratingHtml(c.rating) + '</span></div><h3><a href="#/company/' + esc(c.id) + '">' + esc(c.name) + '</a></h3>'
        + (c.tagline ? '<p class="co-tag">' + esc(c.tagline) + '</p>' : '') + (c.tags.length ? '<p class="co-tags">' + c.tags.map(x => '<span class="tag">' + esc(tagLabel(x)) + '</span>').join('') + '</p>' : '')
        + (c.services.length ? '<ul class="co-svc">' + c.services.slice(0, 2).map(x => '<li><span>' + esc(x.title) + '</span><b>' + esc(x.price || '') + '</b></li>').join('') + '</ul>' : '')
        + '<div class="co-actions"><button class="btn sm" data-c="' + esc(c.id) + '">' + esc(t('seeInCity')) + '</button><a class="co-link" href="#/company/' + esc(c.id) + '">' + esc(t('viewProfile')) + ' →</a></div></div></article>').join('');
      rail.scrollLeft = 0;   // karusellen ska alltid börja på första kortet
      rail.querySelectorAll('button[data-c]').forEach(b => { b.onclick = () => { focusCo = b.dataset.c; enter(); }; });
      loadOffice().then(async () => {
        ensureOffice();
        if (gen !== chooseGen) return;
        try {
          const lg = hero ? logoOf(hero) : null, shot = Office.snapshot(hero ? (TIER_KEY[hero.building] || 'loft') : 'kontor', sampleStaff(hero ? Math.max(5, (TIER_STAFF[hero.building] || 5) - 1) : 8, 3), hero ? hero.name : 'MyOffiCity', 1000, 680, 3, lg);
          const box = $('#heroShot'); if (!box) return;
          box.classList.add('ready');
          box.innerHTML = '<img src="' + shot + '" alt="' + esc(hero ? hero.name : 'MyOffiCity') + '" width="1000" height="680">';
          const cap = $('#heroCaption');
          if (cap) cap.innerHTML = hero ? '<span class="cap-dot"></span><b>' + esc(hero.name) + '</b><span>' + esc(t('bTier' + hero.building)) + (hero.done ? ' · ' + esc(hero.done) + ' ' + esc(t(hero.done === 1 ? 'doneOne' : 'done')) : '') + '</span>' : '';
        } catch { /* 3D är en bonus; sidan fungerar utan */ }
        for (const c of list) {
          await new Promise(r => setTimeout(r, 40));
          if (gen !== chooseGen) return;
          const im = rail.querySelector('img[data-i="' + c.id + '"]'); if (!im || !document.body.contains(im)) continue;
          try { im.src = await thumbOf(c); im.classList.add('on'); im.closest('.co-img').classList.add('has-img'); } catch { /* */ }
        }
      }).catch(() => { const box = $('#heroShot'); if (box) box.classList.add('ready'); });
    }).catch(() => { if (gen === chooseGen) rail.innerHTML = '<p class="muted">' + esc(t('netErr')) + '</p>'; });
  }
  async function pageCompanyStart(host) {
    lsSet(ROLE_KEY, 'company');
    if (me && me.company && !host) { location.hash = '#/dash'; return; }
    if (!me) {
      try { sessionStorage.setItem('nrn.next', '#/company-start'); } catch { /* */ }
      $('#app').innerHTML = '<div style="max-width:620px;margin:24px auto"><h1>' + esc(t('coStartH')) + '</h1><div class="card"><p>' + esc(t('coStep1')) + '</p><a class="btn" href="#/login">' + esc(t('coSignIn')) + '</a></div></div>';
      return;
    }
    const c = me.company, svc = c ? c.services.map(x => [x.title, x.price, x.desc].filter((y, i) => i < 2 || y).join(' | ')).join('\n') : '';
    let pending = null, removeLogo = false, curShape = c && c.logo ? c.logo.shape : '';
    const curLogo = c && c.logo ? location.origin + BASE + '/api/companies/' + c.id + '/logo.png?v=' + c.logo.v : '';
    (host || $('#app')).innerHTML = '<div style="max-width:720px;margin:24px auto"><h1>' + esc(t(c ? 'coEditH' : 'coFormH')) + '</h1><p class="muted small">' + esc(t('coAppNote')) + '</p>'
      + '<div class="card"><label>' + esc(t('coName')) + '</label><input id="cn" maxlength="40" value="' + esc(c ? c.name : '') + '">'
      + '<label>' + esc(t('coTagline')) + '</label><input id="ct" maxlength="100" value="' + esc(c ? c.tagline : '') + '">'
      + '<label>' + esc(t('coDesc')) + '</label><textarea id="cd" rows="4" maxlength="800">' + esc(c ? c.description : '') + '</textarea>'
      + '<label>' + esc(t('coTags')) + '</label><input id="cg" maxlength="120" placeholder="' + esc(t('coTagsPh')) + '" value="' + esc(c ? c.tags.join(', ') : '') + '">'
      + '<div class="two"><div><label>' + esc(t('coWebsite')) + '</label><input id="cw" maxlength="200" placeholder="' + esc(t('coWebPh')) + '" value="' + esc(c ? c.website : '') + '"></div><div><label>' + esc(t('coOrg')) + '</label><input id="co" maxlength="24" placeholder="556123-4567" value="' + esc(c ? c.orgNo : '') + '"></div></div><p class="muted small" style="margin:4px 0 0">' + esc(t('coPublic')) + '</p>'
      + '<label>' + esc(t('coCity')) + '</label><input id="ccity" maxlength="60" placeholder="' + esc(t('coCityPh')) + '" value="' + esc(c ? c.city : '') + '"><p class="muted small" style="margin:4px 0 0">' + esc(t('coCityHint')) + '</p>'
      + '<label>' + esc(t('coServices')) + '</label><textarea id="cs" rows="4" placeholder="' + esc(t('coSvcPh')) + '">' + esc(svc) + '</textarea><p class="muted small" style="margin:4px 0 0">' + esc(t('coServicesHint')) + '</p></div>'
      + '<div class="card"><label style="margin-top:0">' + esc(t('coBuilding')) + '</label><div class="bopts">' + [0, 1, 2].map(i => '<label class="bopt"><input type="radio" name="cb" value="' + i + '"' + ((c ? c.building : 0) === i ? ' checked' : '') + '><span class="bimg"><img alt="" data-b="' + i + '"></span><b>' + esc(t('coB' + i)) + '</b><small>' + esc(t('coB' + i + 'd')) + '</small></label>').join('') + '</div></div>'
      + '<div class="card"><label style="margin-top:0">' + esc(t('coLogo')) + '</label><p class="muted small" style="margin:0 0 10px">' + esc(t('coLogoHint')) + '</p><div class="row" style="gap:12px;align-items:center"><span class="lg-prev" id="lgp">' + (curLogo ? '<img src="' + esc(curLogo) + '" alt="">' : '') + '</span><span class="pill" id="lgs">' + esc(curShape ? t('coShape' + curShape) : t('coLogoNone')) + '</span><input type="file" id="clg" accept="image/png" style="flex:1;min-width:200px"><button class="btn ghost sm" id="lgr"' + (curLogo ? '' : ' disabled') + '>' + esc(t('coRemoveLogo')) + '</button></div></div>'
      + '<div id="cme"></div><div class="row" style="margin-top:16px"><button class="btn" id="csv">' + esc(t(c ? 'coSaveBtn' : 'coCreateBtn')) + '</button>' + (c ? '<a class="btn ghost" id="csee" href="#/">' + esc(t('coSeeCity')) + '</a>' : '') + '</div></div>';
    loadOffice().then(() => { ensureOffice(); document.querySelectorAll('.bopt img').forEach((im, i) => { try { im.src = Office.snapshot(TIER_KEY[i], sampleStaff([5, 8, 12][i]), $('#cn') && $('#cn').value || 'MyOffiCity', 420, 300, 0, null); im.classList.add('on'); } catch { /* */ } }); }).catch(() => { });
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
        const city = $('#ccity').value.trim(); let geo = {};
        if (!city) geo = { city: '' };
        else if (!c || c.city !== city || c.lat == null) { const g = await geocode(city); if (!g) throw new Error(t('coCityBad')); geo = { city: g.name, lat: g.lat, lon: g.lon }; }
        const sel = document.querySelector('input[name=cb]:checked');
        const co = await api('PUT', '/company', { name, tagline: $('#ct').value, description: $('#cd').value, tags: $('#cg').value, services, building: sel ? +sel.value : 0, website: $('#cw').value, orgNo: $('#co').value, ...geo });
        if (pending) await api('PUT', '/company/logo', { png: pending.png, shape: pending.shape });
        else if (removeLogo && c && c.logo) await api('DELETE', '/company/logo');
        await loadMe(); renderBar(); focusCo = co.id; toast(t('coSaved')); if (host) pageDash('settings'); else location.hash = '#/dash';
      } catch (err) { msg(err.message); $('#csv').disabled = false; }
    };
  }
  /* ---------- teamets ID-kort ---------- */
  const TEAM = [
    {
      id: 'MYC-0001', name: 'Tomas Lindqvist', role: 'dRoleLead', born: '1985-03-14', skin: '#e6bd9c', hair: '#3b2a22', shirt: '#1d3f7a', style: 'short', glasses: true, beard: true,
      from: { sv: 'Göteborg, Sverige', en: 'Gothenburg, Sweden' }, langs: { sv: ['Svenska', 'Engelska', 'Tyska'], en: ['Swedish', 'English', 'German'] },
      bg: { sv: 'Har lett webbteam på byråer i femton år och planerat över 200 lanseringar. Bäst på att bryta ner en beställning i tydliga steg och hålla ihop teamet när tiden är knapp.', en: 'Has led web teams at agencies for fifteen years and planned over 200 launches. Best at breaking an order into clear steps and keeping the team together when time is tight.' }
    },
    {
      id: 'MYC-0002', name: 'Ebba Karlsson', role: 'dRoleRev', born: '1992-07-02', skin: '#efc6a6', hair: '#8a5a33', shirt: '#24262d', style: 'bob',
      from: { sv: 'Uppsala, Sverige', en: 'Uppsala, Sweden' }, langs: { sv: ['Svenska', 'Engelska', 'Franska'], en: ['Swedish', 'English', 'French'] },
      bg: { sv: 'Tidigare redaktör och kvalitetsansvarig. Läser allt med nya ögon, hittar små fel i texter och länkar och ser till att sajten fungerar för alla, även med skärmläsare.', en: 'Former editor and quality lead. Reads everything with fresh eyes, finds small errors in texts and links and makes sure the site works for everyone, screen readers included.' }
    },
    {
      id: 'MYC-0003', name: 'Kia Mensah', role: 'dRoleRev', born: '1997-11-19', skin: '#8a5a3c', hair: '#1a1210', shirt: '#e8d6c0', style: 'long', headset: true,
      from: { sv: 'Accra, Ghana (bor i Malmö)', en: 'Accra, Ghana (lives in Malmö)' }, langs: { sv: ['Engelska', 'Twi', 'Svenska'], en: ['English', 'Twi', 'Swedish'] },
      bg: { sv: 'Produktdesigner som blev granskare. Tänker som en kund: är det tydligt, snabbt och lätt att använda på mobilen? Pratar gärna med kunden direkt.', en: 'Product designer turned reviewer. Thinks like a customer: is it clear, fast and easy to use on a phone? Happy to talk to the customer directly.' }
    },
    {
      id: 'MYC-0004', name: 'Manus Okafor', role: 'dRoleBuild', born: '1990-01-27', skin: '#c98f68', hair: '#2a1b14', shirt: '#2e2f3a', style: 'afro', hood: true,
      from: { sv: 'Lagos, Nigeria (uppvuxen i Stockholm)', en: 'Lagos, Nigeria (raised in Stockholm)' }, langs: { sv: ['Engelska', 'Svenska', 'Igbo'], en: ['English', 'Swedish', 'Igbo'] },
      bg: { sv: 'Utvecklare som byggt allt från små landningssidor till butiker. Snabb, ordentlig och bra på att hålla koden enkel så att sajten laddar fort.', en: 'Developer who has built everything from small landing pages to stores. Fast, thorough and good at keeping code simple so the site loads quickly.' }
    },
    {
      id: 'MYC-0005', name: 'Laila Haddad', role: 'dRolePolish', born: '1994-05-23', skin: '#e3b595', hair: '#15100f', shirt: '#ff8fb3', style: 'bun',
      from: { sv: 'Beirut, Libanon (bor i Göteborg)', en: 'Beirut, Lebanon (lives in Gothenburg)' }, langs: { sv: ['Arabiska', 'Engelska', 'Franska', 'Svenska'], en: ['Arabic', 'English', 'French', 'Swedish'] },
      bg: { sv: 'Finputsare med öga för detaljer: typografi, avstånd, färger och små rörelser som gör att en sajt känns dyr och genomtänkt.', en: 'Polisher with an eye for detail: typography, spacing, colour and small motions that make a site feel premium and considered.' }
    },
  ];
  function portraitSvg(p) {   // porträtt ritat med samma färger som personen har i 3D-kontoret
    const hairBack = { long: '<path d="M52 96c0-40 22-66 48-66s48 26 48 66v70H52z" fill="' + p.hair + '"/>', bob: '<path d="M54 92c0-38 20-62 46-62s46 24 46 62v38c-10 6-20 6-28 0H82c-8 6-18 6-28 0z" fill="' + p.hair + '"/>', afro: '<circle cx="100" cy="76" r="58" fill="' + p.hair + '"/>' }[p.style] || '';
    const hairTop = { short: '<path d="M62 84c-2-34 18-52 40-52 24 0 42 18 38 52-10-16-24-24-40-24s-28 8-38 24z" fill="' + p.hair + '"/>', bob: '<path d="M60 86c0-30 18-48 42-48s40 18 38 48c-8-14-22-22-40-22s-32 8-40 22z" fill="' + p.hair + '"/>', long: '<path d="M60 86c0-30 18-48 42-48s40 18 38 48c-8-14-22-22-40-22s-32 8-40 22z" fill="' + p.hair + '"/>', afro: '', bun: '<circle cx="100" cy="30" r="17" fill="' + p.hair + '"/><path d="M62 88c-2-36 18-54 40-54 24 0 42 18 38 54-10-16-24-26-40-26s-28 10-38 26z" fill="' + p.hair + '"/>' }[p.style] || '';
    return '<svg viewBox="0 0 200 240" class="portrait" role="img" aria-label="' + esc(p.name) + '"><defs><linearGradient id="pb' + p.id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1c2a4d"/><stop offset="1" stop-color="#0d1424"/></linearGradient></defs><rect width="200" height="240" fill="url(#pb' + p.id + ')"/><circle cx="100" cy="110" r="92" fill="rgba(217,180,106,.08)"/>'
      + hairBack + '<path d="M18 240c4-46 32-66 82-66s78 20 82 66z" fill="' + p.shirt + '"/>' + (p.hood ? '<path d="M44 240c4-34 22-52 56-52s52 18 56 52z" fill="rgba(0,0,0,.18)"/>' : '<path d="M84 176l16 22 16-22" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="4"/>')
      + '<rect x="86" y="140" width="28" height="40" rx="10" fill="' + p.skin + '"/><ellipse cx="100" cy="108" rx="40" ry="48" fill="' + p.skin + '"/>' + (p.beard ? '<path d="M62 118c2 34 20 46 38 46s36-12 38-46c-8 12-20 18-38 18s-30-6-38-18z" fill="' + p.hair + '" opacity=".92"/>' : '') + hairTop
      + '<ellipse cx="85" cy="108" rx="4.2" ry="5" fill="#1a1210"/><ellipse cx="115" cy="108" rx="4.2" ry="5" fill="#1a1210"/><path d="M76 98q9-6 18 0M106 98q9-6 18 0" stroke="' + p.hair + '" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M96 112q4 10 8 0" stroke="rgba(0,0,0,.28)" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M86 130q14 11 28 0" stroke="#8a3d3d" stroke-width="3.6" fill="none" stroke-linecap="round"/>'
      + (p.glasses ? '<g fill="none" stroke="#1a1d24" stroke-width="3"><circle cx="85" cy="108" r="12"/><circle cx="115" cy="108" r="12"/><path d="M97 108h6"/></g>' : '') + (p.headset ? '<path d="M58 106c-2-40 18-60 42-60s44 20 42 60" fill="none" stroke="#222831" stroke-width="5"/><rect x="52" y="102" width="9" height="20" rx="4" fill="#222831"/><path d="M56 122q4 22 30 24" fill="none" stroke="#222831" stroke-width="3.4"/>' : '') + '</svg>';
  }
  const photo = (p, cls) => '<img class="' + cls + '" src="team/' + esc(p.name.split(' ')[0].toLowerCase()) + '.jpg" alt="' + esc(p.name) + '" width="384" height="384">';
  const TEAM_ROLES = ['dRoleLead', 'dRoleRev', 'dRoleBuild', 'dRolePolish'];
  const HOBBY_DEF = { Tomas: { sv: 'Seglar på västkusten på somrarna och bygger modellflygplan.', en: 'Sails on the west coast in summer and builds model aircraft.' }, Ebba: { sv: 'Bakar surdegsbröd och springer halvmaraton.', en: 'Bakes sourdough bread and runs half marathons.' }, Kia: { sv: 'Dansar afrobeats och samlar på vinylskivor.', en: 'Dances to afrobeats and collects vinyl records.' }, Manus: { sv: 'Spelar basket och skriver egen musik på kvällarna.', en: 'Plays basketball and writes his own music in the evenings.' }, Laila: { sv: 'Fotograferar gamla byggnader och odlar chili på balkongen.', en: 'Photographs old buildings and grows chilli on the balcony.' } };
  const defaultPersona = (p) => { const f = p.name.split(' ')[0]; return { name: p.name, role: p.role, born: p.born, no: p.id, photo: f.toLowerCase(), from: p.from, langs: p.langs, bg: p.bg, hobby: HOBBY_DEF[f], look: { skin: p.skin, hair: p.hair, shirt: p.shirt, style: p.style, glasses: !!p.glasses, beard: !!p.beard, headset: !!p.headset, hood: !!p.hood } }; };
  const KITS = [
    { eth: 'Swedish', m: ['Johan', 'Erik', 'Oskar', 'Filip', 'Viktor', 'Anton'], f: ['Anna', 'Maja', 'Linnea', 'Sofia', 'Elin', 'Klara'], l: ['Andersson', 'Nilsson', 'Bergström', 'Holm', 'Ekström', 'Lund'], from: [['Lund, Sverige', 'Lund, Sweden'], ['Örebro, Sverige', 'Örebro, Sweden'], ['Linköping, Sverige', 'Linköping, Sweden']], langs: [['Svenska', 'Engelska'], ['Swedish', 'English']], skin: ['#efc6a6', '#e6bd9c', '#f1c9a5'], hair: ['#4a3426', '#8a5a33', '#b8863b', '#2a1b14'] },
    { eth: 'Finnish', m: ['Mikko', 'Jari', 'Eero'], f: ['Aino', 'Helmi', 'Saara'], l: ['Virtanen', 'Korhonen', 'Laine'], from: [['Tammerfors, Finland', 'Tampere, Finland'], ['Åbo, Finland', 'Turku, Finland']], langs: [['Finska', 'Svenska', 'Engelska'], ['Finnish', 'Swedish', 'English']], skin: ['#f1c9a5', '#efc6a6'], hair: ['#b8863b', '#8a5a33', '#4a3426'] },
    { eth: 'Polish', m: ['Tomasz', 'Marek', 'Piotr'], f: ['Agnieszka', 'Katarzyna', 'Zofia'], l: ['Kowalski', 'Nowak', 'Wiśniewski'], from: [['Kraków, Polen', 'Kraków, Poland'], ['Gdańsk, Polen', 'Gdańsk, Poland']], langs: [['Polska', 'Engelska', 'Svenska'], ['Polish', 'English', 'Swedish']], skin: ['#efc6a6', '#e6bd9c'], hair: ['#4a3426', '#2a1b14', '#8a5a33'] },
    { eth: 'Spanish', m: ['Mateo', 'Diego', 'Javier'], f: ['Lucía', 'Carmen', 'Elena'], l: ['García', 'Martínez', 'Romero'], from: [['Sevilla, Spanien', 'Seville, Spain'], ['Valencia, Spanien', 'Valencia, Spain']], langs: [['Spanska', 'Engelska'], ['Spanish', 'English']], skin: ['#e0ac82', '#e6bd9c'], hair: ['#2a1b14', '#4a3426'] },
    { eth: 'Brazilian', m: ['Rafael', 'Bruno', 'Thiago'], f: ['Beatriz', 'Camila', 'Larissa'], l: ['Silva', 'Oliveira', 'Costa'], from: [['São Paulo, Brasilien', 'São Paulo, Brazil'], ['Recife, Brasilien', 'Recife, Brazil']], langs: [['Portugisiska', 'Engelska', 'Spanska'], ['Portuguese', 'English', 'Spanish']], skin: ['#c68a62', '#e0ac82', '#8a5a3c'], hair: ['#1a1210', '#2a1b14'] },
    { eth: 'Indian', m: ['Arjun', 'Rohan', 'Vikram'], f: ['Ananya', 'Priya', 'Meera'], l: ['Sharma', 'Iyer', 'Patel'], from: [['Pune, Indien', 'Pune, India'], ['Bengaluru, Indien', 'Bengaluru, India']], langs: [['Hindi', 'Engelska', 'Marathi'], ['Hindi', 'English', 'Marathi']], skin: ['#c68a62', '#a8704c'], hair: ['#1a1210'] },
    { eth: 'African', m: ['Kwame', 'Omar', 'Samuel'], f: ['Amina', 'Zuri', 'Nia'], l: ['Mwangi', 'Owusu', 'Diallo'], from: [['Nairobi, Kenya', 'Nairobi, Kenya', 'East African'], ['Dakar, Senegal', 'Dakar, Senegal', 'West African']], langs: [['Engelska', 'Swahili', 'Franska'], ['English', 'Swahili', 'French']], skin: ['#6e4630', '#7a5238', '#8a5a3c'], hair: ['#120d0b', '#1a1210'] },
    { eth: 'Turkish', m: ['Emre', 'Can', 'Burak'], f: ['Elif', 'Zeynep', 'Selin'], l: ['Yilmaz', 'Demir', 'Kaya'], from: [['Izmir, Turkiet', 'Izmir, Türkiye'], ['Ankara, Turkiet', 'Ankara, Türkiye']], langs: [['Turkiska', 'Engelska', 'Tyska'], ['Turkish', 'English', 'German']], skin: ['#e0ac82', '#d7a37c'], hair: ['#2a1b14', '#1a1210'] },
  ];
  const SHIRTS = ['#2f4b7a', '#7a3328', '#2c5a4a', '#55585f', '#c77882', '#6b5a8a', '#c08a2e', '#23304f', '#e8d6c0', '#4d5058'];
  const HOB = {
    all: [['Fotograferar fåglar vid kusten', 'Photographs birds along the coast'], ['Bakar surdegsbröd varje söndag', 'Bakes sourdough bread every Sunday'], ['Springer milen i skogen på morgonen', 'Runs 10 km in the forest in the morning'], ['Spelar gitarr i ett litet band', 'Plays guitar in a small band'], ['Odlar tomater och chili på balkongen', 'Grows tomatoes and chilli on the balcony'], ['Lagar mat från hela världen', 'Cooks food from all over the world'], ['Läser deckare på tåget', 'Reads crime novels on the train'], ['Vandrar i fjällen varje sommar', 'Hikes in the mountains every summer'], ['Samlar på gamla vinylskivor', 'Collects old vinyl records'], ['Spelar schack online', 'Plays chess online'], ['Badar i havet året runt', 'Swims in the sea all year round'], ['Syr egna kläder', 'Sews their own clothes']],
    dRoleLead: [['Seglar när sommaren kommer', 'Sails when summer comes'], ['Spelar golf på söndagarna', 'Plays golf on Sundays']],
    dRoleRev: [['Löser korsord och logikpussel', 'Solves crosswords and logic puzzles'], ['Läser gamla kartor för nöjes skull', 'Reads old maps for fun']],
    dRoleBuild: [['Bygger egna tangentbord', 'Builds custom keyboards'], ['Klättrar inomhus och löser problem på väggen', 'Climbs indoors and solves problems on the wall']],
    dRolePolish: [['Tecknar med tusch och akvarell', 'Draws with ink and watercolour'], ['Fotograferar byggnader och skyltar', 'Photographs buildings and signs']],
  };
  const BGT = {
    dRoleLead: (y) => ({ sv: 'Har lett team i ' + y + ' år och är van att hålla ihop ett uppdrag från första skiss till leverans.', en: 'Has led teams for ' + y + ' years and is used to holding an assignment together from first sketch to delivery.' }),
    dRoleRev: (y) => ({ sv: 'Granskar med blick för detaljer: text, länkar, tillgänglighet och att allt fungerar på mobilen. ' + y + ' år i kvalitetsarbete.', en: 'Reviews with an eye for detail: text, links, accessibility and that everything works on a phone. ' + y + ' years in quality work.' }),
    dRoleBuild: (y) => ({ sv: 'Utvecklare med ' + y + ' års erfarenhet. Bygger snabba, enkla sajter och håller koden prydlig.', en: 'Developer with ' + y + ' years of experience. Builds fast, simple sites and keeps the code tidy.' }),
    dRolePolish: (y) => ({ sv: 'Finputsare med ' + y + ' år i design: typografi, avstånd, färger och rörelser som får en sajt att kännas genomtänkt.', en: 'Polisher with ' + y + ' years in design: typography, spacing, colour and motion that make a site feel considered.' }),
  };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const FACE = ['an oval face', 'a round face', 'a square jaw', 'high cheekbones', 'soft features', 'a strong jawline', 'a narrow face', 'a broad forehead'];
  const EYES_DARK = ['dark brown eyes', 'brown eyes', 'hazel eyes'], EYES_ALL = ['dark brown eyes', 'brown eyes', 'hazel eyes', 'green eyes', 'blue eyes', 'grey eyes'];
  const BROWS = ['thick eyebrows', 'thin arched eyebrows', 'straight eyebrows', 'bushy eyebrows'];
  const EXPR = ['a warm smile', 'a confident calm expression', 'a friendly laugh', 'a gentle smile', 'a relaxed expression with a slight smile', 'a bright cheerful smile'];
  const HAIRD = ['neatly combed', 'slightly tousled', 'side-parted', 'swept back'];
  const BGS = ['modern office with large windows in the background', 'office with plants and shelves in the background', 'bright co-working space in the background', 'glass meeting room in the background', 'office with a whiteboard in the background', 'bookshelf in the background', 'city view through a window behind'];
  const EXTRA = ['light freckles', 'faint smile lines', 'dimples', 'a small mole on the cheek', 'long eyelashes', 'rosy cheeks'];
  function genTraits(dark) {
    const t = [pick(FACE), pick(dark ? EYES_DARK : EYES_ALL), pick(BROWS), pick(EXPR), 'hair ' + pick(HAIRD), pick(BGS)];
    if (Math.random() < .5) t.splice(2, 0, pick(EXTRA));
    return t;
  }
  function genPersona(role, existing = []) {   // slumpar tills personen inte liknar någon i teamet (namn, utseende och drag ska vara unika)
    const names = new Set(existing.map((x) => (x.name || '').toLowerCase()));
    const sig = (x) => [x.gender, x.eth, x.look && x.look.hair, x.look && x.look.style, (x.traits || []).slice(0, 2).join('')].join('|');
    const sigs = new Set(existing.map(sig));
    let c;
    for (let i = 0; i < 25; i++) { c = genPersonaOnce(role); if (!names.has(c.name.toLowerCase()) && !sigs.has(sig(c))) break; }
    return c;
  }
  function genPersonaOnce(role) {   // en ny agent med namn, ursprung, språk, bakgrund och hobby (allt läggs in automatiskt)
    const kit = pick(KITS), female = Math.random() < .5, first = pick(female ? kit.f : kit.m), name = first + ' ' + pick(kit.l), age = 24 + Math.floor(Math.random() * 29);
    const d = new Date(); d.setFullYear(d.getFullYear() - age); d.setDate(d.getDate() - Math.floor(Math.random() * 360));
    const skin = pick(kit.skin), hair = pick(kit.hair), dark = ['#6e4630', '#7a5238', '#8a5a3c'].includes(skin);
    const hob = Math.random() < .55 ? pick(HOB[role] || HOB.all) : pick(HOB.all), from = pick(kit.from);
    return {
      name, role, gender: female ? 'f' : 'm', eth: from[2] || kit.eth, traits: genTraits(dark), born: d.toISOString().slice(0, 10), no: 'MYC-' + String(1000 + Math.floor(Math.random() * 8999)), photo: '', from: { sv: from[0], en: from[1] }, langs: { sv: kit.langs[0], en: kit.langs[1] },
      bg: BGT[role](Math.max(1, age - 23)), hobby: { sv: hob[0], en: hob[1] },
      look: { skin, hair, shirt: pick(SHIRTS), style: female ? pick(['bob', 'long', 'bun']) : (dark && Math.random() < .5 ? 'afro' : 'short'), glasses: Math.random() < .3, beard: !female && Math.random() < .3, headset: role === 'dRoleRev' && Math.random() < .5, hood: role === 'dRoleBuild' && Math.random() < .4 }
    };
  }
  const hexNum = (h) => parseInt(String(h).replace('#', ''), 16);
  function staffFromRoster(team, extra) {   // personal till 3D-kontoret: fem platser, utseendet följer personen
    const list = team.map((m) => {
      const p = m.persona || m, f = p.name.split(' ')[0], i = m.slot != null ? m.slot : 0; const L = p.look || {};
      return {
        id: 'm' + i, name: p.photo ? f : p.name, rank: i === 0 ? 'leader' : i < 3 ? 'lead' : 'worker', kind: i % 3 ? 'dev' : 'design', color: PCOL[i % 8], title: '',
        look: p.photo ? undefined : { skin: hexNum(L.skin), hair: hexNum(L.hair), shirt: hexNum(L.shirt), hairStyle: L.style, glasses: !!L.glasses, beard: !!L.beard, headset: !!L.headset, hood: !!L.hood }
      };
    });
    return list.concat(extra || []);
  }
  const dur = (ms) => { const m = Math.max(0, Math.floor(ms / 60000)), h = Math.floor(m / 60), d = Math.floor(h / 24); return d > 0 ? d + ' d ' + (h % 24) + ' h' : h > 0 ? h + ' h ' + (m % 60) + ' min' : m + ' min'; };
  const portraitOf = (p) => p.photo ? '<img class="portrait" src="team/' + esc(p.photo) + '.jpg" alt="' + esc(p.name) + '" width="384" height="384">' : p.photoId ? '<img class="portrait" src="' + esc(BASE) + '/api/team-photo/' + esc(p.photoId) + '.jpg" alt="' + esc(p.name) + '" width="512" height="512">' : portraitSvg({ ...p.look, id: p.no || 'x', name: p.name });
  function showIdCard(m, roster, onChange) {   // m = { id, slot, hired, fired, persona }
    const p = m.persona, L = lang === 'sv' ? 'sv' : 'en', born = new Date(p.born + 'T12:00:00'), now = new Date();
    let age = now.getFullYear() - born.getFullYear(); if (now < new Date(now.getFullYear(), born.getMonth(), born.getDate())) age--;
    const sinceStart = Math.abs(m.hired - roster.companyCreated) < 2000;
    const tenure = () => dur((m.fired || Date.now()) - m.hired) + ' <small>' + esc(t(sinceStart ? 'dIdSinceStart' : 'dIdSinceHire')) + (sinceStart ? '' : ' ' + new Date(m.hired).toLocaleDateString(L === 'sv' ? 'sv-SE' : 'en-GB')) + '</small>';
    const el = document.createElement('div'); el.className = 'idm'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
    el.innerHTML = '<div class="idc"><button class="btn ghost sm idx" aria-label="' + esc(t('dIdClose')) + '">&times;</button><div class="idtop"><span>MyOffiCity</span><span class="idai">' + esc(t('dIdAi')) + '</span></div><div class="idbody"><div class="idphoto">' + portraitOf(p) + '<small>' + esc(p.no || '') + '</small></div><div class="idinfo"><h2>' + esc(p.name) + '</h2><span class="co-tier t2">' + esc(t(p.role)) + '</span>'
      + '<dl><div><dt>' + esc(t('dIdFrom')) + '</dt><dd>' + esc(p.from[L]) + '</dd></div><div><dt>' + esc(t('dIdAge')) + '</dt><dd>' + age + ' ' + esc(t('dIdYears')) + '</dd></div><div><dt>' + esc(t('dIdBorn')) + '</dt><dd>' + esc(born.toLocaleDateString(L === 'sv' ? 'sv-SE' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })) + '</dd></div><div><dt>' + esc(t('dIdWorked')) + '</dt><dd id="idten">' + tenure() + '</dd></div></dl>'
      + '<div class="idlang"><dt>' + esc(t('dIdLang')) + '</dt>' + p.langs[L].map((x) => '<span class="tag">' + esc(x) + '</span>').join(' ') + '</div><div class="idbg"><dt>' + esc(t('dIdHobby')) + '</dt><p>' + esc(p.hobby[L]) + '</p></div><div class="idbg"><dt>' + esc(t('dIdBg')) + '</dt><p>' + esc(p.bg[L]) + '</p></div>'
      + (m.fired ? '' : '<div class="idact" id="ida">' + (roster.fireCount >= roster.fireMax ? '<p class="muted small" style="margin:0">' + esc(t('dFireLocked')) + ' ' + esc(new Date(roster.fireResets).toLocaleDateString(L === 'sv' ? 'sv-SE' : 'en-GB')) + '</p>' : '<button class="btn ghost sm" id="idf">' + esc(t('dFire')) + '</button> <span class="muted small">' + esc(t('dFireQuota')) + ': ' + roster.fireCount + ' ' + esc(t('dFireOf')) + ' ' + roster.fireMax + ' ' + esc(t('dFireWin')) + '</span>') + '</div>') + '</div></div><div class="idfoot">' + esc(me.company.name) + ' · MyOffiCity</div></div>';
    const tick = setInterval(() => { const e = $('#idten'); if (e) e.innerHTML = tenure(); else clearInterval(tick); }, 30000);
    const close = () => { clearInterval(tick); el.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    el.onclick = (e) => { if (e.target === el) close(); }; el.querySelector('.idx').onclick = close; document.addEventListener('keydown', onKey);
    const f = el.querySelector('#idf');
    if (f) f.onclick = () => {
      $('#ida').innerHTML = '<p class="small" style="margin:0 0 8px">' + esc(t('dFireAsk')) + '</p><div class="row"><button class="btn sm" id="idy">' + esc(t('dFireYes')) + '</button><button class="btn ghost sm" id="idn">' + esc(t('dFireNo')) + '</button></div>';
      $('#idn').onclick = () => { $('#ida').innerHTML = '<button class="btn ghost sm" id="idf2">' + esc(t('dFire')) + '</button>'; $('#idf2').onclick = () => { close(); showIdCard(m, roster, onChange); }; };
      $('#idy').onclick = async () => { $('#idy').disabled = true; try { await api('POST', '/company/team/' + m.id + '/fire'); toast(p.name + ' ' + t('dFiredMsg')); close(); if (onChange) onChange(); } catch (e) { toast(e.message); $('#idy').disabled = false; } };
    };
    document.body.appendChild(el); el.querySelector('.idx').focus();
  }
  async function loadRoster() {
    let r = await api('GET', '/company/team');
    if (!r.team.length) { await api('POST', '/company/team/seed', { members: TEAM.map(defaultPersona) }); r = await api('GET', '/company/team'); }
    return r;
  }
  function mountThread(box, o) {   // gemensam chattvy för kundchattar och beställningar
    box.innerHTML = '<div class="msgs dmsgs"></div><div class="row"><textarea rows="2" placeholder="' + esc(t('dWrite')) + '" style="flex:1" maxlength="1000"></textarea><button class="btn">' + esc(t('dSend')) + '</button></div>';
    const list = box.querySelector('.dmsgs'), ta = box.querySelector('textarea'), bt = box.querySelector('button'); let last = 0;
    const add = (ms) => { ms.forEach((m) => { last = Math.max(last, m.id); const d = document.createElement('div'); d.className = 'msg' + (o.mine(m) ? ' me' : ''); d.innerHTML = '<small></small><p></p>'; d.querySelector('small').textContent = o.who(m) + ' · ' + fmt(o.time(m)); d.querySelector('p').textContent = m.text; list.appendChild(d); }); if (ms.length) list.scrollTop = list.scrollHeight; };
    o.more(0).then((j) => add(j.messages)).catch(() => { });
    const send = async () => { const v = ta.value.trim(); if (!v) return; bt.disabled = true; try { await o.send(v); ta.value = ''; add((await o.more(last)).messages); } catch (e) { toast(e.message); } bt.disabled = false; };
    bt.onclick = send; ta.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
    clearInterval(poll); poll = setInterval(async () => { if (document.hidden || !document.body.contains(box)) return; try { add((await o.more(last)).messages); } catch { /* */ } }, 4000);
  }
  const SPRINT_INTERVALS = [
    [5, 'Var 5:e minut', 'Every 5 min'],
    [60, 'Varje timme', 'Every hour'],
    [120, 'Varannan timme', 'Every 2 hours'],
    [300, 'Var 5:e timme', 'Every 5 hours'],
    [600, 'Var 10:e timme', 'Every 10 hours'],
    [1440, 'Var 24:e timme', 'Every 24 hours'],
    [2880, 'Varannan dag', 'Every 2 days'],
    [7200, 'Var 5:e dag', 'Every 5 days'],
  ];
  const intervalOpts = (selVal) => SPRINT_INTERVALS.map(([v, sv, en]) => '<option value="' + v + '"' + (Number(selVal) === v ? ' selected' : '') + '>' + esc(lang === 'sv' ? sv : en) + '</option>').join('');
  function mountTeamChat(host, c, roster, opts = {}) {   // 100 % online AI-chatt direkt till teamledaren (Tomas) – ingen nedladdning
    const active = (roster && roster.team ? roster.team : []).filter((m) => m.fired == null);
    const lead = active.find((m) => m.slot === 0) || active.find((m) => m.persona && m.persona.role === 'dRoleLead') || active[0];
    const leaderName = lead && lead.persona && lead.persona.name ? lead.persona.name.split(' ')[0] : 'Tomas';
    const leaderFull = lead && lead.persona && lead.persona.name ? lead.persona.name : 'Tomas';
    const staff = opts.staff || [];
    const leaderId = (staff.find((s) => s.rank === 'leader') || staff[0] || {}).id || 'm0';
    const legacyKey = 'nrn.teamchat.' + c.id, storeKey = 'nrn.teamchats.' + c.id;
    let mode = 'code', busy = false, pendImg = '', pendAud = '', pendAudName = '';
    let rec = null, recChunks = [], recStream = null, recTimer = null, recSec = 0;
    const mkThread = (msgs = []) => ({
      id: 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      title: msgs.find((m) => m.role === 'user')?.content?.replace(/\s+/g, ' ').trim().slice(0, 34) || '',
      updated: Date.now(),
      sprintId: '',
      messages: msgs.slice(-30),
    });
    let threads = [], activeId = '', sprints = [];
    try {
      const raw = localStorage.getItem(storeKey);
      if (raw) { const p = JSON.parse(raw); if (Array.isArray(p) && p.length) threads = p.slice(0, 30); }
      if (!threads.length) {
        const old = localStorage.getItem(legacyKey);
        if (old) { const p = JSON.parse(old); if (Array.isArray(p) && p.length) threads = [mkThread(p)]; }
      }
    } catch { /* */ }
    if (!threads.length) threads = [mkThread()];
    activeId = threads[0].id;
    const curThread = () => threads.find((x) => x.id === activeId) || threads[0];
    const curSprint = () => sprints.find((s) => s.id === (curThread().sprintId || '')) || null;
    const saveThreads = () => {
      try {
        const slim = threads.slice(0, 30).map((th) => ({
          id: th.id, title: th.title || '', updated: th.updated || Date.now(), sprintId: th.sprintId || '', lastLogId: th.lastLogId || 0,
          messages: (th.messages || []).slice(-30).map((m) => ({ role: m.role, content: m.content, transcript: m.transcript || '', ts: m.ts || 0 })),
        }));
        localStorage.setItem(storeKey, JSON.stringify(slim));
      } catch { /* */ }
    };
    const fmtTs = (ms) => {
      if (!ms) return '';
      const d = new Date(ms);
      return d.toLocaleDateString(lang === 'sv' ? 'sv-SE' : 'en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })
        + ' ' + d.toLocaleTimeString(lang === 'sv' ? 'sv-SE' : 'en-GB', { hour: '2-digit', minute: '2-digit' });
    };
    const isMin = () => { if (opts.forceOpen) return false; try { return sessionStorage.getItem('nrn.tchat.min') === '1'; } catch { return false; } };
    const setMin = (v) => { try { sessionStorage.setItem('nrn.tchat.min', v ? '1' : '0'); } catch { /* */ } };
    const fmtReply = (txt) => {
      const s = String(txt || ''), re = /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g;
      let out = '', last = 0, m;
      while ((m = re.exec(s)) !== null) {
        if (m.index > last) out += '<div class="tchat-txt">' + esc(s.slice(last, m.index)) + '</div>';
        out += '<div class="tchat-code"><div class="tchat-code-h"><span>' + esc(m[1] || 'code') + '</span><button type="button" class="tchat-cp">' + esc(t('tChatCopy')) + '</button></div><pre><code>' + esc(m[2].replace(/\n$/, '')) + '</code></pre></div>';
        last = m.index + m[0].length;
      }
      if (last < s.length) out += '<div class="tchat-txt">' + esc(s.slice(last)) + '</div>';
      return out || '<div class="tchat-txt">' + esc(s) + '</div>';
    };
    const resizeImg = (file) => new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onerror = () => reject(new Error(t('err')));
      r.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error(t('err')));
        img.onload = () => {
          const max = 1024, sc = Math.min(1, max / Math.max(img.width, img.height));
          const cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(img.width * sc)); cv.height = Math.max(1, Math.round(img.height * sc));
          cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
          resolve(cv.toDataURL('image/jpeg', 0.82));
        };
        img.src = r.result;
      };
      r.readAsDataURL(file);
    });
    const readAsDataUrl = (blob) => new Promise((resolve, reject) => {
      const r = new FileReader(); r.onerror = () => reject(new Error(t('err'))); r.onload = () => resolve(String(r.result || '')); r.readAsDataURL(blob);
    });
    const sysPrompt = () => {
      const teamList = active.map((m) => m.persona.name + ' (' + t(m.persona.role) + ')').join(', ') || (leaderFull + ' (Teamledare)');
      const svcs = (c.services || []).map((s) => s.title + (s.price ? ' - ' + s.price : '')).join('; ');
      const sp = curSprint();
      const ghCtx = sp
        ? (lang === 'sv'
          ? `\n\nKOPPLAT GITHUB-PROJEKT: ${sp.repo} (branch: ${sp.workBranch}, status: ${sp.status}, ${sp.progress.done}/${sp.progress.total} uppgifter klara). Mål: ${sp.goal}.`
          + (sp.prUrl ? ` Pull Request: ${sp.prUrl}.` : '')
          + ' Backlog: ' + sp.tasks.map((tk) => `#${tk.seq} [${tk.status}] ${tk.title} (${tk.assignee})`).join('; ') + '.'
          + ' Utgå alltid från det här kopplade GitHub-projektet när chefen pratar om projektet eller ger nya order. VIKTIGT: Hitta ALDRIG på fejkade GitHub commit-hashar eller låtsaslänkar. Säg aldrig att du redan har pushat kod i en vanlig chatt – riktiga commits görs automatiskt av bakgrundsjobbet varannan timme eller när chefen klickar "▶ Kör steg".'
          : `\n\nLINKED GITHUB PROJECT: ${sp.repo} (branch: ${sp.workBranch}, status: ${sp.status}, ${sp.progress.done}/${sp.progress.total} tasks done). Goal: ${sp.goal}.`
          + (sp.prUrl ? ` Pull Request: ${sp.prUrl}.` : '')
          + ' Backlog: ' + sp.tasks.map((tk) => `#${tk.seq} [${tk.status}] ${tk.title} (${tk.assignee})`).join('; ') + '.'
          + ' Always base your answers and plans on this linked GitHub repository. IMPORTANT: NEVER invent fake GitHub commit hashes or URLs. Real commits are created by the background cron runner every 2 hours or when the user clicks "Run step".')
        : '';
      return (lang === 'sv'
        ? `Du är ${leaderFull}, AI-teamledare på företaget "${c.name}" i MyOffiCity. Din chef (företagsägaren) ger dig order och frågor direkt i kontoret. Teamet består av: ${teamList}.`
        + (c.tagline ? ` Slogan: ${c.tagline}.` : '') + (c.description ? ` Om företaget: ${c.description}.` : '') + (svcs ? ` Tjänster: ${svcs}.` : '') + ghCtx
        + ' Svara på svenska, kortfattat, handlingskraftigt och konkret. Bekräfta order, fördela gärna uppgifter till kollegorna i teamet och leverera färdig text, plan eller kod när chefen ber om det.'
        : `You are ${leaderFull}, AI team leader at "${c.name}" in MyOffiCity. Your boss (the company owner) gives you orders and asks questions directly in the office. Your team: ${teamList}.`
        + (c.tagline ? ` Tagline: ${c.tagline}.` : '') + (c.description ? ` About: ${c.description}.` : '') + (svcs ? ` Services: ${svcs}.` : '') + ghCtx
        + ' Reply in English, concisely and actionably. Acknowledge orders, delegate to teammates when relevant, and deliver ready-to-use copy, plans, or code when asked.');
    };

    const wrap = document.createElement('div');
    wrap.className = 'tchat' + (isMin() ? ' min' : '');
    wrap.innerHTML = '<button type="button" class="tchat-fab" id="tcfab"><span class="tchat-dot"></span><span>' + esc(tn('tChatOpen', { name: leaderName })) + '</span></button>'
      + '<div class="tchat-box">'
      + '<div class="tchat-head"><div><b>' + esc(leaderName) + '</b><small id="tcsub">' + esc(t('tChatSub')) + '</small></div>'
      + '<div class="tchat-act"><div class="tchat-modes"><button type="button" class="on" data-m="code">Qwen 32B</button><button type="button" data-m="chat">Llama 70B</button><button type="button" data-m="gemma">Gemma</button></div>'
      + '<button type="button" class="tchat-ico" id="tcfull" title="' + esc(t('tChatFull')) + '">⛶</button>'
      + '<button type="button" class="tchat-ico" id="tcmin" title="−">−</button></div></div>'
      + '<div class="tchat-bar">'
      + '<button type="button" class="tchat-new" id="tcnew">+ ' + esc(t('tChatNew')) + '</button>'
      + '<select id="tcsel" aria-label="' + esc(t('tChatThreads')) + '"></select>'
      + '<button type="button" class="tchat-ico tchat-del" id="tcdel" title="' + esc(t('tChatDel')) + '">🗑</button>'
      + '</div>'
      + '<div class="tchat-body">'
      + '<aside class="tchat-side"><div class="tchat-side-h"><span>' + esc(t('tChatThreads')) + '</span><button type="button" class="tchat-new" id="tcnew2">+ ' + esc(t('tChatNew')) + '</button></div><div class="tchat-slist" id="tcslist"></div></aside>'
      + '<div class="tchat-main">'
      + '<div class="tchat-gh">'
      + '<span class="tchat-gh-ico">⎇</span>'
      + '<select id="tcghsel" aria-label="GitHub"></select>'
      + '<select id="tcghint" title="Uppdateringsschema" hidden style="flex:0 0 auto;max-width:155px"></select>'
      + '<button type="button" class="tchat-gh-btn" id="tcghstep" hidden>' + esc(t('tChatGhStep')) + '</button>'
      + '<a class="tchat-gh-btn" id="tcghpr" target="_blank" rel="noopener" hidden>PR ↗</a>'
      + '<button type="button" class="tchat-gh-btn gold" id="tcghadd">' + esc(t('tChatGhLink')) + '</button>'
      + '</div>'
      + '<form class="tchat-gh-form" id="tcghf" autocomplete="off" hidden>'
      + '<div class="tchat-gh-row"><input id="tcgh-repo" name="gh_repo_slug" autocomplete="off" required placeholder="' + esc(t('dProjRepoPh')) + '"><select id="tcgh-days"><option value="3">' + esc(t('dProjD3')) + '</option><option value="7">' + esc(t('dProjD7')) + '</option><option value="14" selected>' + esc(t('dProjD14')) + '</option></select></div>'
      + '<input id="tcgh-tok" name="gh_pat_token" type="password" autocomplete="new-password" required placeholder="' + esc(t('dProjTok')) + ' (github_pat_...)">'
      + '<input id="tcgh-goal" name="gh_sprint_goal" autocomplete="off" required placeholder="' + esc(t('dProjGoal')) + '">'
      + '<div class="tchat-gh-row"><button type="submit" class="btn sm" id="tcgh-go">' + esc(t('tChatGhConn')) + '</button><button type="button" class="btn ghost sm" id="tcgh-x">' + esc(t('tChatGhCancel')) + '</button></div>'
      + '</form>'
      + '<div class="tchat-msgs" id="tcms"></div>'
      + '<div class="tchat-att" id="tcatt" hidden></div>'
      + '<div class="tchat-foot">'
      + '<div class="tchat-tools">'
      + '<button type="button" class="tchat-ico" id="tcimgb" title="' + esc(t('tChatImg')) + '">🖼</button>'
      + '<button type="button" class="tchat-ico" id="tcrecb" title="' + esc(t('tChatRec')) + '">🎙</button>'
      + '<button type="button" class="tchat-ico" id="tcaudb" title="' + esc(t('tChatAud')) + '">🎵</button>'
      + '<input type="file" id="tcimgf" accept="image/*" hidden>'
      + '<input type="file" id="tcaudf" accept="audio/*" hidden>'
      + '</div>'
      + '<textarea id="tcin" rows="2" maxlength="2000" placeholder="' + esc(tn('tChatPh', { name: leaderName })) + '"></textarea><button type="button" class="btn sm" id="tcsend">' + esc(t('dSend')) + '</button></div>'
      + '</div></div></div>';
    host.appendChild(wrap);

    const ms = wrap.querySelector('#tcms'), ta = wrap.querySelector('#tcin'), sb = wrap.querySelector('#tcsend'), sub = wrap.querySelector('#tcsub');
    const att = wrap.querySelector('#tcatt'), fullBtn = wrap.querySelector('#tcfull'), recBtn = wrap.querySelector('#tcrecb');
    const imgIn = wrap.querySelector('#tcimgf'), audIn = wrap.querySelector('#tcaudf');
    const sel = wrap.querySelector('#tcsel'), slist = wrap.querySelector('#tcslist');
    const ghSel = wrap.querySelector('#tcghsel'), ghInt = wrap.querySelector('#tcghint'), ghStep = wrap.querySelector('#tcghstep'), ghPr = wrap.querySelector('#tcghpr'), ghForm = wrap.querySelector('#tcghf');

    const renderGhBar = () => {
      const th = curThread();
      ghSel.innerHTML = '<option value="">' + esc(t('tChatGhNone')) + '</option>'
        + sprints.map((s) => '<option value="' + esc(s.id) + '"' + (s.id === th.sprintId ? ' selected' : '') + '>' + esc(s.repo) + ' (' + s.progress.done + '/' + s.progress.total + ')</option>').join('');
      const sp = curSprint();
      ghStep.hidden = !sp || sp.status === 'done';
      ghInt.hidden = !sp || sp.status === 'done';
      if (sp && sp.status !== 'done') ghInt.innerHTML = intervalOpts(sp.intervalMin || 5);
      if (sp && sp.prUrl) { ghPr.hidden = false; ghPr.href = sp.prUrl; } else { ghPr.hidden = true; }
    };
    ghInt.onchange = async () => {
      const sp = curSprint(); if (!sp) return;
      const val = Number(ghInt.value);
      try {
        const r = await api('POST', '/sprints/' + sp.id + '/interval', { intervalMin: val });
        if (r.sprint) sprints = sprints.map((x) => x.id === r.sprint.id ? r.sprint : x);
        toast('📅 ' + (ghInt.options[ghInt.selectedIndex]?.text || 'OK'));
      } catch (err) { toast(err.message); }
    };
    const syncSprintLogs = (initial = false) => {
      const th = curThread(), sp = curSprint();
      if (!sp || !Array.isArray(sp.logs) || !sp.logs.length) return;
      const asc = [...sp.logs].sort((a, b) => a.id - b.id);
      const maxId = asc[asc.length - 1].id;
      if (!th.lastLogId) {
        th.lastLogId = maxId;
        saveThreads();
        return;
      }
      const fresh = asc.filter((l) => l.id > th.lastLogId);
      if (!fresh.length) return;
      th.lastLogId = maxId;
      if (!initial) {
        fresh.forEach((l) => {
          th.messages.push({ role: 'assistant', ts: l.created || Date.now(), content: `🤖 **${l.agent}:** ${l.message}` });
        });
        th.updated = Date.now();
        saveThreads(); render();
      } else {
        fresh.forEach((l) => {
          th.messages.push({ role: 'assistant', ts: l.created || Date.now(), content: `🤖 **${l.agent}:** ${l.message}` });
        });
        th.updated = Date.now();
        saveThreads(); render();
      }
    };
    const loadSprintsForChat = (initial = false) => {
      api('GET', '/sprints').then((j) => {
        sprints = (j && j.sprints) || [];
        renderGhBar();
        syncSprintLogs(initial);
      }).catch(() => { renderGhBar(); });
    };
    const sprintPoll = setInterval(() => {
      if (!document.body.contains(wrap)) { clearInterval(sprintPoll); return; }
      if (!document.hidden && curSprint()) loadSprintsForChat(false);
    }, 30000);
    ghSel.onchange = () => { curThread().sprintId = ghSel.value; saveThreads(); renderGhBar(); };
    wrap.querySelector('#tcghadd').onclick = () => { ghForm.hidden = !ghForm.hidden; if (!ghForm.hidden) wrap.querySelector('#tcgh-repo').focus(); };
    wrap.querySelector('#tcgh-x').onclick = () => { ghForm.hidden = true; };
    ghForm.onsubmit = async (e) => {
      e.preventDefault();
      const bt = wrap.querySelector('#tcgh-go'); bt.disabled = true; bt.textContent = t('dProjStarting');
      try {
        const res = await api('POST', '/sprints', {
          repo: wrap.querySelector('#tcgh-repo').value.trim(),
          ghToken: wrap.querySelector('#tcgh-tok').value.trim(),
          goal: wrap.querySelector('#tcgh-goal').value.trim(),
          days: Number(wrap.querySelector('#tcgh-days').value) || 14,
        });
        const sp = res.sprint;
        sprints = [sp, ...sprints.filter((x) => x.id !== sp.id)];
        const th = curThread();
        th.sprintId = sp.id;
        if (!th.title) th.title = sp.repo.slice(0, 34);
        th.messages.push({
          role: 'assistant',
          ts: Date.now(),
          content: (lang === 'sv'
            ? `GitHub-projektet **${sp.repo}** är nu kopplat! Jag har skapat branchen \`${sp.workBranch}\` och planerat ${sp.tasks.length} deluppgifter över ${sp.days} dagar:\n\n`
            : `GitHub repo **${sp.repo}** is now linked! I created branch \`${sp.workBranch}\` and planned ${sp.tasks.length} tasks over ${sp.days} days:\n\n`)
            + sp.tasks.map((tk) => `${tk.seq}. ${tk.title} (${tk.assignee})`).join('\n'),
        });
        saveThreads(); renderThreads(); renderGhBar(); render();
        wrap.querySelector('#tcgh-tok').value = ''; wrap.querySelector('#tcgh-goal').value = ''; ghForm.hidden = true;
        toast('✅ ' + sp.repo);
      } catch (err) { toast(err.message); }
      bt.disabled = false; bt.textContent = t('tChatGhConn');
    };
    ghStep.onclick = async () => {
      const sp = curSprint(); if (!sp) return;
      ghStep.disabled = true; const old = ghStep.textContent; ghStep.textContent = t('dProjStepping');
      try {
        const r = await api('POST', '/sprints/' + sp.id + '/step');
        if (r.sprint) sprints = sprints.map((x) => x.id === r.sprint.id ? r.sprint : x);
        const th = curThread();
        if (r.step && r.step.error) { toast(r.step.error); }
        else if (r.step && r.step.retried) {
          th.messages.push({ role: 'assistant', ts: Date.now(), content: lang === 'sv' ? `⚠️ Försökte köra "${r.step.task || ''}" men fick inga filer från AI – klicka "▶ Kör steg" igen för ett nytt försök.` : `⚠️ Tried "${r.step.task || ''}" but AI returned no files – click "Run step" to retry.` });
          saveThreads(); render();
        } else {
          const msg = r.step && r.step.done
            ? (lang === 'sv' ? `Sprinten på ${sp.repo} är klar!` : `Sprint on ${sp.repo} is complete!`)
            : (lang === 'sv'
              ? `✅ Klart steg på ${sp.repo}: "${r.step?.task || ''}"\n${r.step?.summary ? r.step.summary + '\n' : ''}Ändrade filer: ${(r.step?.files || []).join(', ')}` + (r.step?.commitUrl ? `\nCommit: ${r.step.commitUrl}` : '') + (r.step?.prUrl ? `\nPull Request: ${r.step.prUrl}` : '')
              : `✅ Completed step on ${sp.repo}: "${r.step?.task || ''}"\n${r.step?.summary ? r.step.summary + '\n' : ''}Changed files: ${(r.step?.files || []).join(', ')}` + (r.step?.commitUrl ? `\nCommit: ${r.step.commitUrl}` : '') + (r.step?.prUrl ? `\nPull Request: ${r.step.prUrl}` : ''));
          th.messages.push({ role: 'assistant', ts: Date.now(), content: msg });
          saveThreads(); render();
        }
        renderGhBar();
      } catch (err) { toast(err.message); }
      ghStep.disabled = false; ghStep.textContent = old;
    };

    const renderThreads = () => {
      const th = curThread(); activeId = th.id;
      renderGhBar();
      sel.innerHTML = threads.map((x) => '<option value="' + esc(x.id) + '"' + (x.id === activeId ? ' selected' : '') + '>' + esc(x.title || t('tChatUntitled')) + '</option>').join('');
      slist.innerHTML = threads.map((x) => '<div class="tchat-si' + (x.id === activeId ? ' on' : '') + '" data-tid="' + esc(x.id) + '"><span>' + esc(x.title || t('tChatUntitled')) + '</span><button type="button" class="tchat-sdel" data-dtid="' + esc(x.id) + '" title="' + esc(t('tChatDel')) + '">×</button></div>').join('');
      slist.querySelectorAll('[data-tid]').forEach((el) => {
        el.onclick = (e) => { if (e.target.closest('[data-dtid]')) return; activeId = el.dataset.tid; renderThreads(); render(); ta.focus(); };
      });
      slist.querySelectorAll('[data-dtid]').forEach((b) => {
        b.onclick = () => deleteThread(b.dataset.dtid);
      });
    };
    const newThread = () => {
      const existingEmpty = threads.find((x) => !x.messages || !x.messages.length);
      if (existingEmpty) { activeId = existingEmpty.id; }
      else { const th = mkThread(); threads.unshift(th); activeId = th.id; saveThreads(); }
      renderThreads(); render(); ta.focus();
    };
    const deleteThread = (id) => {
      threads = threads.filter((x) => x.id !== id);
      if (!threads.length) threads = [mkThread()];
      if (activeId === id) activeId = threads[0].id;
      saveThreads(); renderThreads(); render(); ta.focus();
    };
    const renderAtt = () => {
      if (!pendImg && !pendAud) { att.hidden = true; att.innerHTML = ''; return; }
      att.hidden = false;
      att.innerHTML = (pendImg ? '<div class="tchat-att-i"><img src="' + esc(pendImg) + '" alt=""><button type="button" data-rm="img">×</button></div>' : '')
        + (pendAud ? '<div class="tchat-att-i aud"><audio controls src="' + esc(pendAud) + '"></audio>' + (pendAudName ? '<small>' + esc(pendAudName) + '</small>' : '') + '<button type="button" data-rm="aud">×</button></div>' : '');
      att.querySelectorAll('[data-rm]').forEach((b) => {
        b.onclick = () => { if (b.dataset.rm === 'img') pendImg = ''; else { pendAud = ''; pendAudName = ''; } renderAtt(); };
      });
    };
    const render = () => {
      const history = curThread().messages;
      if (!history.length) {
        ms.innerHTML = '<p class="muted small tchat-empty">' + esc(tn('tChatEmpty', { name: leaderName })) + '</p>';
        return;
      }
      ms.innerHTML = history.map((m) => {
        const media = (m.image ? '<img class="tchat-mimg" src="' + esc(m.image) + '" alt="">' : '')
          + (m.audio ? '<audio class="tchat-maud" controls src="' + esc(m.audio) + '"></audio>' : '')
          + (m.transcript ? '<div class="tchat-tr">🎙 "' + esc(m.transcript) + '"</div>' : '');
        const body = m.role === 'user' ? '<div class="tchat-txt">' + esc(m.content) + '</div>' : fmtReply(m.content);
        const when = m.ts ? ' · ' + fmtTs(m.ts) : '';
        return '<div class="tchat-msg' + (m.role === 'user' ? ' me' : '') + '"><small>' + esc((m.role === 'user' ? t('tChatYou') : leaderName) + when) + '</small>' + media + body + '</div>';
      }).join('');
      ms.querySelectorAll('.tchat-cp').forEach((b) => {
        b.onclick = () => {
          const code = b.closest('.tchat-code')?.querySelector('code')?.textContent || '';
          navigator.clipboard?.writeText(code).then(() => { b.textContent = t('tChatCopied'); setTimeout(() => { b.textContent = t('tChatCopy'); }, 1600); }).catch(() => { });
        };
      });
      ms.querySelectorAll('.tchat-mimg').forEach((im) => { im.onclick = () => window.open(im.src, '_blank', 'noopener'); });
      ms.scrollTop = ms.scrollHeight;
    };
    const refreshQuota = () => {
      api('GET', '/ai/quota').then((q) => {
        if (!q || !q.ok || !sub) return;
        if (q.relay_providers && q.relay_providers.length) {
          sub.textContent = (lang === 'sv'
            ? `Teamledare · Online AI (0 kr · ${q.relay_count} motorer i stafett)`
            : `Team leader · Online AI (0 kr · ${q.relay_count} engines in relay)`);
        } else {
          sub.textContent = t('tChatSub') + ' · ' + q.remaining_ip + '/80';
        }
      }).catch(() => { });
    };
    renderThreads(); render(); refreshQuota(); loadSprintsForChat(true);
    if (opts.forceOpen) setTimeout(() => ta.focus(), 60);

    const setFull = (on) => {
      wrap.classList.toggle('full', on);
      if (on) { wrap.classList.remove('min'); setMin(false); }
      fullBtn.textContent = on ? '⤡' : '⛶';
      fullBtn.title = on ? t('tChatExitFull') : t('tChatFull');
    };
    const onEsc = (e) => { if (e.key === 'Escape' && wrap.classList.contains('full')) setFull(false); };
    document.addEventListener('keydown', onEsc);
    wrap.querySelector('#tcfab').onclick = () => { wrap.classList.remove('min'); setMin(false); ta.focus(); };
    wrap.querySelector('#tcmin').onclick = () => { setFull(false); wrap.classList.add('min'); setMin(true); };
    fullBtn.onclick = () => setFull(!wrap.classList.contains('full'));
    wrap.querySelector('#tcnew').onclick = newThread;
    wrap.querySelector('#tcnew2').onclick = newThread;
    wrap.querySelector('#tcdel').onclick = () => deleteThread(activeId);
    sel.onchange = () => { activeId = sel.value; renderThreads(); render(); ta.focus(); };
    wrap.querySelectorAll('.tchat-modes button').forEach((b) => {
      b.onclick = () => { mode = b.dataset.m; wrap.querySelectorAll('.tchat-modes button').forEach((x) => x.classList.toggle('on', x === b)); refreshQuota(); };
    });

    wrap.querySelector('#tcimgb').onclick = () => imgIn.click();
    wrap.querySelector('#tcaudb').onclick = () => audIn.click();
    imgIn.onchange = async () => {
      const f = imgIn.files && imgIn.files[0]; imgIn.value = ''; if (!f) return;
      try { pendImg = await resizeImg(f); renderAtt(); ta.focus(); } catch (e) { toast(e.message); }
    };
    audIn.onchange = async () => {
      const f = audIn.files && audIn.files[0]; audIn.value = ''; if (!f) return;
      if (f.size > 3 * 1024 * 1024) return toast(t('tChatBig'));
      try { pendAud = await readAsDataUrl(f); pendAudName = f.name; renderAtt(); ta.focus(); } catch (e) { toast(e.message); }
    };
    ta.addEventListener('paste', async (e) => {
      const items = e.clipboardData && e.clipboardData.items; if (!items) return;
      for (const it of items) {
        if (it.type && it.type.startsWith('image/')) {
          const f = it.getAsFile(); if (!f) continue;
          e.preventDefault();
          try { pendImg = await resizeImg(f); renderAtt(); } catch (err) { toast(err.message); }
          break;
        }
      }
    });

    const stopRec = () => {
      clearInterval(recTimer); recTimer = null;
      recBtn.classList.remove('rec'); recBtn.textContent = '🎙'; recBtn.title = t('tChatRec');
      if (rec && rec.state !== 'inactive') { try { rec.stop(); } catch { /* */ } }
      if (recStream) { recStream.getTracks().forEach((tr) => tr.stop()); recStream = null; }
    };
    recBtn.onclick = async () => {
      if (rec && rec.state === 'recording') { stopRec(); return; }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined') return toast(t('tChatRecErr'));
      try {
        recStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        recChunks = []; recSec = 0;
        const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '');
        rec = mime ? new MediaRecorder(recStream, { mimeType: mime }) : new MediaRecorder(recStream);
        rec.ondataavailable = (ev) => { if (ev.data && ev.data.size) recChunks.push(ev.data); };
        rec.onstop = async () => {
          const blob = new Blob(recChunks, { type: rec.mimeType || 'audio/webm' });
          if (blob.size > 3 * 1024 * 1024) { toast(t('tChatBig')); return; }
          if (blob.size > 100) {
            try { pendAud = await readAsDataUrl(blob); pendAudName = t('tChatAudLbl') + ' (' + Math.max(1, recSec) + 's)'; renderAtt(); ta.focus(); } catch (err) { toast(err.message); }
          }
        };
        rec.start();
        recBtn.classList.add('rec'); recBtn.textContent = '⏹'; recBtn.title = t('tChatStopRec');
        recTimer = setInterval(() => { recSec++; recBtn.textContent = '⏹ ' + recSec + 's'; if (recSec >= 60) stopRec(); }, 1000);
      } catch { toast(t('tChatRecErr')); stopRec(); }
    };

    const send = async () => {
      if (rec && rec.state === 'recording') stopRec();
      const v = ta.value.trim();
      const imgNow = pendImg, audNow = pendAud;
      if ((!v && !imgNow && !audNow) || busy) return;
      busy = true; sb.disabled = true; ta.value = ''; pendImg = ''; pendAud = ''; pendAudName = ''; renderAtt();
      const th = curThread();
      const sp = curSprint();
      const displayTxt = v || (imgNow && audNow ? t('tChatImgLbl') + ' + ' + t('tChatAudLbl') : imgNow ? t('tChatImgLbl') : t('tChatAudLbl'));
      const userMsg = { role: 'user', content: displayTxt, image: imgNow || '', audio: audNow || '', transcript: '', ts: Date.now() };
      th.messages.push(userMsg);
      if (!th.title) th.title = displayTxt.replace(/\s+/g, ' ').trim().slice(0, 34);
      th.updated = Date.now();
      saveThreads(); renderThreads(); render();
      // Om ett GitHub-projekt är kopplat och användaren skriver "stoppa/pausa" eller "kör/bygg/fortsätt" -> utför riktig åtgärd på servern!
      if (sp && !imgNow && !audNow && /^(stopp|stoppa|stanna|pausa|sluta|stop|pause)\b/i.test(v)) {
        try {
          const r = await api('POST', '/sprints/' + sp.id + '/status', { status: 'paused' });
          if (r.sprint) sprints = sprints.map((x) => x.id === r.sprint.id ? r.sprint : x);
          th.messages.push({ role: 'assistant', ts: Date.now(), content: lang === 'sv' ? `⏸ Sprinten på **${sp.repo}** är nu pausad. Agenterna väntar tills du ber dem fortsätta!` : `⏸ Sprint on **${sp.repo}** is now paused.` });
          saveThreads(); renderGhBar(); render();
        } catch (e) { toast(e.message); }
        busy = false; sb.disabled = false; ta.focus();
        return;
      }
      if (sp && sp.status !== 'done' && !imgNow && !audNow && /^(k[öo]r|starta|bygg|forts[äa]tt|run|go|continue)\b/i.test(v) && v.length < 70) {
        const waitEl = document.createElement('div');
        waitEl.className = 'tchat-msg wait';
        waitEl.innerHTML = '<small>' + esc(leaderName) + '</small><div class="tchat-txt">' + esc(t('dProjStepping')) + '</div>';
        ms.appendChild(waitEl); ms.scrollTop = ms.scrollHeight;
        try {
          if (sp.status === 'paused') await api('POST', '/sprints/' + sp.id + '/status', { status: 'active' });
          const r = await api('POST', '/sprints/' + sp.id + '/step');
          if (r.sprint) sprints = sprints.map((x) => x.id === r.sprint.id ? r.sprint : x);
          const msg = r.step && r.step.error
            ? (lang === 'sv' ? `⚠️ Tillfälligt fel vid GitHub-steget: ${r.step.error}` : `⚠️ Temporary error: ${r.step.error}`)
            : (lang === 'sv'
              ? `✅ **Riktig GitHub-commit klar på ${sp.repo}!**\nUppgift: ${r.step?.task || ''}\nÄndrade filer: ${(r.step?.files || []).join(', ')}` + (r.step?.prUrl ? `\nPull Request: ${r.step.prUrl}` : '') + `\n\nTeamet fortsätter nu automatiskt enligt schemat i bakgrunden tills du ber oss pausa.`
              : `✅ **Real GitHub commit pushed to ${sp.repo}!**\nTask: ${r.step?.task || ''}\nFiles: ${(r.step?.files || []).join(', ')}` + (r.step?.prUrl ? `\nPull Request: ${r.step.prUrl}` : ''));
          th.messages.push({ role: 'assistant', ts: Date.now(), content: msg });
          saveThreads(); renderGhBar(); render();
        } catch (e) { waitEl.remove(); toast(e.message); }
        busy = false; sb.disabled = false; ta.focus();
        return;
      }
      const waitEl = document.createElement('div');
      waitEl.className = 'tchat-msg wait';
      waitEl.innerHTML = '<small>' + esc(leaderName) + '</small><div class="tchat-txt">' + esc(t('tChatThinking')) + '</div>';
      ms.appendChild(waitEl); ms.scrollTop = ms.scrollHeight;
      try { if (window.Office && Office.has && Office.has(leaderId)) { Office.busy(leaderId, true); Office.say(leaderId, t('tChatThinking'), 4000); } } catch { /* */ }
      try {
        const apiMsgs = [{ role: 'system', content: sysPrompt() }, ...th.messages.slice(-12).map((m) => ({ role: m.role, content: m.content }))];
        const payload = { mode, messages: apiMsgs, max_tokens: 1024 };
        if (imgNow) payload.image = imgNow;
        if (audNow) payload.audio = audNow;
        const res = await api('POST', '/ai/chat', payload);
        if (res.transcript) {
          userMsg.transcript = res.transcript;
          if (th.title === t('tChatAudLbl')) th.title = res.transcript.replace(/\s+/g, ' ').trim().slice(0, 34);
        }
        const reply = String(res.content || res.response || '').trim() || '…';
        th.messages.push({ role: 'assistant', ts: Date.now(), content: reply });
        th.updated = Date.now();
        saveThreads(); renderThreads(); render(); refreshQuota();
        try {
          if (window.Office && Office.has && Office.has(leaderId)) {
            Office.busy(leaderId, false);
            const shortLine = reply.replace(/```[\s\S]*?```/g, '[kod]').replace(/\s+/g, ' ').trim().slice(0, 95);
            Office.say(leaderId, shortLine, 6500);
            const other = staff.find((s) => s.id !== leaderId && Office.has(s.id));
            if (other) Office.send(leaderId, other.id);
          }
        } catch { /* */ }
      } catch (e) {
        waitEl.remove();
        toast(e.message);
        try { if (window.Office && Office.has && Office.has(leaderId)) Office.busy(leaderId, false); } catch { /* */ }
      } finally {
        busy = false; sb.disabled = false; ta.focus();
      }
    };
    sb.onclick = send;
    ta.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
    return { open: () => { wrap.classList.remove('min'); setMin(false); ta.focus(); } };
  }
  async function pageDash(tab, opts = {}) {
    if (!me) { try { sessionStorage.setItem('nrn.next', '#/dash'); } catch { /* */ } return pageLogin(); }
    if (!me.company) { location.hash = '#/company-start'; return; }
    await loadMe();
    const c = me.company, TABS = [['office', 'dOffice', 'M3 20V10l6-4v14M9 20V4l7 3v13M16 20v-8l5 2v6M2 20h20'], ['network', 'netNav', 'M12 5a2 2 0 100 4 2 2 0 000-4zM5 16a2 2 0 100 4 2 2 0 000-4zM19 16a2 2 0 100 4 2 2 0 000-4zM12 9v4M12 13l-6 3M12 13l6 3'], ['chat', 'dChat', 'M4 5h16v11H9l-5 4z'], ['team', 'dTeam', 'M9 11a3 3 0 100-6 3 3 0 000 6zm7 1a2.5 2.5 0 100-5M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M17 14c2.2.3 4 2.1 4 4.5'], ['projects', 'dProjects', 'M6 3v12M18 9a3 3 0 100-6 3 3 0 000 6zM6 21a3 3 0 100-6 3 3 0 000 6zM18 9a9 9 0 01-9 9'], ['orders', 'dOrders', 'M6 6h15l-2 9H8zM6 6L5 3H2M9 20a1 1 0 100-2 1 1 0 000 2zm9 0a1 1 0 100-2 1 1 0 000 2z'], ['reports', 'dReports', 'M4 20V10m6 10V4m6 16v-7m5 7H2'], ['settings', 'dSettings', 'M4 7h10M18 7h2M4 17h2M10 17h10M14 7a2 2 0 100 .01M6 17a2 2 0 100 .01']];
    tab = tab || 'office';
    const [orders, chats] = await Promise.all([api('GET', '/company/orders').catch(() => ({ orders: [] })), api('GET', '/inquiries').catch(() => ({ inquiries: [] }))]);
    const myChats = chats.inquiries.filter((q) => q.role === 'owner');
    $('#app').innerHTML = '<div class="dash"><aside class="dsb"><div class="dbrand">' + document.querySelector('.brand').outerHTML.replace('href="#/"', 'href="#/"') + '</div><nav class="dnav">'
      + TABS.map(([id, k, ico]) => '<button class="dn' + (id === tab ? ' on' : '') + '" data-t="' + id + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + ico + '" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg><span>' + esc(t(k)) + '</span></button>').join('')
      + '</nav><div class="dfoot"><a href="#/">' + esc(t('dSite')) + '</a><div class="duser"><b>' + esc(me.user.username) + '</b><small>' + esc(t('dOwner')) + ' ' + esc(c.name) + '</small></div></div></aside>'
      + '<section class="dmain"><header class="dtop"><h2>' + esc(c.name) + '</h2><span class="co-tier t' + c.building + '">' + esc(t('bTier' + c.building)) + '</span><div class="dchips">'
      + '<span class="dchip"><small>' + esc(t('dChipOrders')) + '</small><b>' + orders.orders.length + '</b></span><span class="dchip"><small>' + esc(t('dChipChats')) + '</small><b>' + myChats.length + '</b></span>'
      + '<span class="dchip"><small>' + esc(t('dChipRating')) + '</small><b>' + (c.rating && c.rating.count ? c.rating.avg.toFixed(1) + ' ★' : '–') + '</b></span><span class="dchip"><small>' + esc(t('dChipWeather')) + '</small><b id="dwx">–</b></span><span class="dchip"><small>' + esc(t('dChipTime')) + '</small><b id="dclock"></b></span></div></header><div class="dpane" id="dp"></div></section></div>';
    $('#app').classList.remove('pg');   // ingen transform runt en fixed panel
    document.body.classList.add('in-dash');
    let dw = null;
    const showW = (w) => { dw = w; const e = $('#dwx'); if (e) e.textContent = w ? w.temp + '°C · ' + t('wx' + w.kind) : (c.city || '–'); tick(); };
    const tick0 = () => { const el = $('#dclock'); if (el) el.textContent = new Date().toLocaleTimeString(lang === 'sv' ? 'sv-SE' : 'en-GB', { hour: '2-digit', minute: '2-digit' }); };
    const tick = () => { tick0(); weatherFor(c).then((w) => { const el = $('#dclock'); if (el && w) el.textContent = w.clock; }); }; tick();
    weatherFor(c).then(showW);
    document.querySelectorAll('.dn').forEach((b) => { b.onclick = () => { clearInterval(poll); pageDash(b.dataset.t); }; });
    const dp = $('#dp'); showCb = null; curCo = null;
    if (tab === 'office') {
      dp.innerHTML = '<div class="doffice" id="dof"></div>';
      try { await loadOffice(); } catch { dp.innerHTML = '<p class="err">' + esc(t('netErr')) + '</p>'; return; }
      ensureOffice(); Office.zoomOut(null); $('#dof').appendChild(officeHost);
      const v = variantOf(c.id), lg = logoOf(c);
      let staff = sampleStaff((TIER_STAFF[c.building] || 5) - (v % 3), v), roster = null;
      try { roster = await loadRoster(); staff = staffFromRoster(roster.team.filter((m) => m.fired == null), sampleStaff(TIER_STAFF[c.building] || 5, v).slice(5)); } catch { /* standardpersonal */ }
      Office.build({ tier: TIER_KEY[c.building] || 'loft', staff, company: c.name, variant: v, logoUrl: lg ? lg.url : '', logoShape: lg ? lg.shape : '', boss: '', bossTitle: '' });
      Office.setHour(hourNow()); Office.resize(); applyWeather(c, () => document.body.contains($('#dof'))).then(showW);
      const tc = mountTeamChat($('#dof'), c, roster, { staff, forceOpen: !!opts.openChat });
      Office.pick(() => tc.open());
      const officeLife = () => {
        if (document.hidden || !document.body.contains($('#dof')) || !window.Office) return;
        const groundIds = staff.map((s) => s.id).filter((id) => {
          const p = Office.pos && Office.pos(id);
          return p && p[4] && p[4][1] === 0 && !Office.away(id);
        });
        const allIds = staff.map((s) => s.id).filter((id) => Office.has(id) && !Office.away(id));
        const r = Math.random();
        if (groundIds.length && r < 0.48) {
          const id = groundIds[Math.floor(Math.random() * groundIds.length)];
          const kinds = ['fika', 'coffee', 'lunch'];
          Office.kitchen(id, kinds[Math.floor(Math.random() * kinds.length)]);
        } else if (groundIds.length && r < 0.82) {
          const id = groundIds[Math.floor(Math.random() * groundIds.length)];
          Office.toilet(id);
        } else if (allIds.length > 1) {
          const target = allIds.find((id) => id !== staff[0].id) || allIds[1];
          const chatLines = lang === 'sv'
            ? [['leader', 'Hur går det med koden?'], ['target', 'Bra! Sista finputsen kvar nu.']]
            : [['leader', 'How is the build going?'], ['target', 'Great! Just finishing up now.']];
          Office.socialVisit(target, () => chatLines);
        }
      };
      setTimeout(officeLife, 4500);
      let lifeTick = 0;
      poll = setInterval(() => {
        if (!document.body.contains($('#dof'))) return;
        lifeTick++;
        if (lifeTick % 3 === 0) applyWeather(c, () => document.body.contains($('#dof'))).then(showW);
        officeLife();
      }, 20000);
    } else if (tab === 'network') {
      let j; try { j = netLocalize(await api('GET', '/network?company=' + encodeURIComponent(c.id))); } catch (e) { dp.innerHTML = '<div class="err">' + esc(e.message) + '</div>'; return; }
      const own = j.posts.filter((p) => p.companyId === c.id);
      dp.innerHTML = '<div class="dscroll"><header class="net-dash-head"><p class="kicker"><span class="kdot"></span>' + esc(t('netNav')) + '</p><h1>' + esc(t('netH')) + '</h1><p class="muted">' + esc(t('netP')) + '</p>'
        + '<div class="net-dash-stats">' + [['granne', 64], ['kvarter', 144], ['stadsdel', 248]].map(([l, m]) => '<div class="net-dash-stat lv-' + l + '"><b>' + j.neighbors.filter((n) => n.level === l).length + '</b><span>' + esc(netLv(l)) + '</span><small>' + esc(tn('netWithin', { m: m })) + '</small></div>').join('') + '</div></header>'
        + '<h2>' + esc(t('netMineH')) + '</h2>' + (own.length ? '<div class="net-posts">' + own.map((p) => netPostCard(p, true)).join('') + '</div>' : '<p class="muted small">' + esc(t('netMineNone')) + '</p>')
        + netFormHtml()
        + '<h2 style="margin-top:30px">' + esc(t('netNeighbors')) + '</h2><div class="net-cards">' + (j.neighbors.length ? j.neighbors.map((n) => netCardHtml(n, j, true)).join('') : '<p class="muted">' + esc(t('netEmpty')) + '</p>') + '</div>'
        + '<p style="margin-top:20px"><a class="btn ghost sm" href="#/network/' + esc(c.id) + '">' + esc(t('netVisit')) + ' →</a></p></div>';
      wireNetAssign(j, dp, () => pageDash('network'));
    } else if (tab === 'chat') {
      dp.innerHTML = '<div class="dsplit"><div class="dlist" id="dl">' + (myChats.length ? myChats.map((q) => '<button class="dli" data-id="' + esc(q.id) + '" data-n="' + esc(q.customerName) + '"><b>' + esc(q.customerName) + '</b><small>' + esc(fmt(q.last)) + '</small><span>' + esc(q.lastText) + '</span></button>').join('') : '<p class="muted">' + esc(t('dNoChats')) + '</p>') + '</div><div class="dthread" id="dt"><p class="muted">' + esc(t('dPickChat')) + '</p></div></div>';
      document.querySelectorAll('.dli').forEach((b) => { b.onclick = () => { document.querySelectorAll('.dli').forEach((x) => x.classList.toggle('on', x === b)); const id = b.dataset.id, who = b.dataset.n; mountThread($('#dt'), { more: (a) => api('GET', '/inquiries/' + id + '/messages?after=' + a), send: (text) => api('POST', '/inquiries/' + id + '/messages', { text }), mine: (m) => m.fromOwner, who: (m) => m.fromOwner ? c.name : who, time: (m) => m.created }); }; });
    } else if (tab === 'team') {
      dp.innerHTML = '<div class="dscroll"><div class="row" style="justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px"><div><h1 style="font-size:clamp(26px,3vw,38px);margin:0">' + esc(t('dTeamH')) + '</h1><p class="muted" style="margin:6px 0 0">' + esc(t('dTeamP')) + '</p></div><button class="btn" id="tmchat" style="display:none"></button></div><div class="grid" id="tmg"></div><div id="tmf"></div></div>';
      const draw = async () => {
        let roster; try { roster = await loadRoster(); } catch (e) { $('#tmg').innerHTML = '<p class="err">' + esc(e.message) + '</p>'; return; }
        const active = roster.team.filter((m) => m.fired == null), former = roster.team.filter((m) => m.fired != null).sort((a, b) => b.fired - a.fired);
        const lead = active.find((m) => m.slot === 0) || active.find((m) => m.persona && m.persona.role === 'dRoleLead') || active[0];
        const lName = lead && lead.persona && lead.persona.name ? lead.persona.name.split(' ')[0] : 'Tomas';
        const cb = $('#tmchat'); if (cb) { cb.style.display = ''; cb.textContent = tn('tChatBtnTeam', { name: lName }); cb.onclick = () => pageDash('office', { openChat: true }); }
        let html = '';
        for (let i = 0; i < 5; i++) {
          const m = active.find((x) => x.slot === i);
          if (m) html += '<button class="card tm" data-m="' + esc(m.id) + '"><div class="portrait-s">' + portraitOf(m.persona) + '</div><h2>' + esc(m.persona.name.split(' ')[0]) + '</h2><p class="muted small">' + esc(t(m.persona.role)) + '</p><span class="tm-open">' + esc(t('dIdOpen')) + ' &rarr;</span></button>';
          else { const last = roster.team.filter((x) => x.slot === i).sort((a, b) => b.hired - a.hired)[0]; html += '<div class="card tm vac"><div class="portrait-s vacant"><span>+</span></div><h2>' + esc(t('dVacant')) + '</h2><p class="muted small">' + esc(t(last ? last.persona.role : TEAM_ROLES[i % 4])) + '</p><button class="btn sm" data-h="' + i + '" data-r="' + esc(last ? last.persona.role : TEAM_ROLES[i % 4]) + '">' + esc(t('dHireBtn')) + '</button></div>'; }
        }
        $('#tmg').innerHTML = html;
        $('#tmf').innerHTML = former.length ? '<h2 style="margin-top:26px">' + esc(t('dFormer')) + '</h2><div class="list">' + former.map((m) => '<button class="item" data-m="' + esc(m.id) + '"><div><b>' + esc(m.persona.name) + '</b><div class="muted small">' + esc(t(m.persona.role)) + ' · ' + esc(t('dWorkedFor')) + ' ' + esc(dur(m.fired - m.hired)) + '</div></div></button>').join('') + '</div>' : '';
        dp.querySelectorAll('[data-m]').forEach((b) => { b.onclick = () => showIdCard(roster.team.find((x) => x.id === b.dataset.m), roster, draw); });
        dp.querySelectorAll('[data-h]').forEach((b) => { b.onclick = async () => { b.disabled = true; b.textContent = t('dHiring'); try { const persona = genPersona(b.dataset.r, roster.team.map((x) => x.persona)), res = await api('POST', '/company/team/hire', { slot: +b.dataset.h, persona }); toast(t('dHiredMsg') + ' ' + persona.name + (res.photoMade ? '' : ' ' + t('dPhotoFail')), res.photoMade ? 3200 : 6000); draw(); } catch (e) { toast(e.message); b.disabled = false; b.textContent = t('dHireBtn'); } }; });
      };
      await draw();
    } else if (tab === 'projects') {
      dp.innerHTML = '<div class="dscroll">'
        + '<h1 style="font-size:clamp(26px,3vw,38px);margin:0">' + esc(t('dProjH')) + '</h1>'
        + '<p class="muted" style="margin:6px 0 18px;max-width:740px">' + esc(t('dProjP')) + '</p>'
        + '<form class="card sp-form" id="spf"><h2>' + esc(t('dProjNew')) + '</h2>'
        + '<div class="sp-grid">'
        + '<label><span>' + esc(t('dProjRepo')) + '</span><input id="sp-repo" required placeholder="' + esc(t('dProjRepoPh')) + '"></label>'
        + '<label><span>' + esc(t('dProjDays')) + '</span><select id="sp-days"><option value="3">' + esc(t('dProjD3')) + '</option><option value="7">' + esc(t('dProjD7')) + '</option><option value="14" selected>' + esc(t('dProjD14')) + '</option><option value="30">' + esc(t('dProjD30')) + '</option></select></label>'
        + '</div>'
        + '<label><span>' + esc(t('dProjTok')) + '</span><input id="sp-tok" type="password" required placeholder="github_pat_... / ghp_..."><small class="muted">' + esc(t('dProjTokHint')) + '</small></label>'
        + '<label><span>' + esc(t('dProjGoal')) + '</span><textarea id="sp-goal" rows="3" required maxlength="2000" placeholder="' + esc(t('dProjGoalPh')) + '"></textarea></label>'
        + '<label><span>' + esc(t('dProjOr')) + '</span><input id="sp-or" type="password" placeholder="sk-or-v1-..."><small class="muted">' + esc(t('dProjOrHint')) + '</small></label>'
        + '<div class="row" style="margin-top:8px"><button class="btn" id="sp-go" type="submit">' + esc(t('dProjStart')) + '</button></div>'
        + '</form>'
        + '<div id="splist" style="margin-top:24px"></div></div>';

      const drawSprints = async () => {
        const box = $('#splist'); if (!box) return;
        let j; try { j = await api('GET', '/sprints'); } catch (e) { box.innerHTML = '<p class="err">' + esc(e.message) + '</p>'; return; }
        const list = j.sprints || [];
        if (!list.length) { box.innerHTML = '<p class="muted">' + esc(t('dProjNone')) + '</p>'; return; }
        box.innerHTML = list.map((s) => {
          const pct = s.progress.total ? Math.round((s.progress.done / s.progress.total) * 100) : 0;
          const stKey = s.status === 'active' ? 'dProjStActive' : s.status === 'paused' ? 'dProjStPaused' : 'dProjStDone';
          return '<div class="card sp-card" data-sp="' + esc(s.id) + '">'
            + '<div class="sp-head"><div><h3>' + esc(s.repo) + '</h3><small class="muted">Branch: <code>' + esc(s.workBranch) + '</code> · ' + esc(s.days) + ' d' + (s.hasOrKey ? ' · OpenRouter :free' : ' · Cloudflare Free AI') + '</small></div>'
            + '<span class="pill sp-st-' + esc(s.status) + '">' + esc(t(stKey)) + '</span></div>'
            + '<p class="small" style="margin:8px 0 12px;white-space:pre-wrap">' + esc(s.goal) + '</p>'
            + '<div class="sp-prog"><div class="sp-bar"><span style="width:' + pct + '%"></span></div><small>' + s.progress.done + ' / ' + s.progress.total + ' (' + pct + '%)</small></div>'
            + (s.lastError ? '<p class="err small" style="margin:8px 0 0">' + esc(s.lastError) + '</p>' : '')
            + '<div class="row sp-btns">'
            + (s.status !== 'done' ? '<label class="sp-int-lbl">📅 <select class="sp-int" data-int="' + esc(s.id) + '">' + intervalOpts(s.intervalMin || 5) + '</select></label>' : '')
            + (s.status !== 'done' ? '<button type="button" class="btn sm" data-step="' + esc(s.id) + '">▶ ' + esc(t('dProjStep')) + '</button>' : '')
            + (s.status !== 'done' ? '<button type="button" class="btn ghost sm" data-tog="' + esc(s.id) + '" data-ns="' + (s.status === 'active' ? 'paused' : 'active') + '">' + esc(s.status === 'active' ? '⏸ ' + t('dProjPause') : '▶ ' + t('dProjResume')) + '</button>' : '')
            + (s.prUrl ? '<a class="btn ghost sm" href="' + esc(s.prUrl) + '" target="_blank" rel="noopener">' + esc(t('dProjPr')) + '</a>' : '')
            + '<button type="button" class="btn ghost sm" data-del="' + esc(s.id) + '">🗑 ' + esc(t('dProjDel')) + '</button>'
            + '</div>'
            + '<details open class="sp-det"><summary>' + esc(t('dProjTasks')) + ' (' + s.progress.done + '/' + s.progress.total + ')</summary><div class="sp-tasks">'
            + s.tasks.map((tk) => '<div class="sp-tk ' + esc(tk.status) + '"><span class="sp-ico">' + (tk.status === 'done' ? '✅' : tk.status === 'skipped' ? '⏭' : '⏳') + '</span><div><b>' + tk.seq + '. ' + esc(tk.title) + '</b> <span class="tag">' + esc(tk.assignee) + '</span>'
              + (tk.summary ? '<div class="small muted">' + esc(tk.summary) + '</div>' : '<div class="small muted">' + esc(tk.details) + '</div>')
              + (tk.filesChanged && tk.filesChanged.length ? '<div class="sp-files">' + tk.filesChanged.map((f) => '<code>' + esc(f) + '</code>').join(' ') + '</div>' : '')
              + '</div></div>').join('')
            + '</div></details>'
            + '<details class="sp-det"><summary>' + esc(t('dProjLogs')) + ' (' + s.logs.length + ')</summary><div class="sp-logs">'
            + s.logs.map((l) => '<div class="sp-log"><small>' + esc(fmt(l.created)) + ' · <b>' + esc(l.agent) + '</b></small><div>' + esc(l.message) + '</div></div>').join('')
            + '</div></details>'
            + '</div>';
        }).join('');

        box.querySelectorAll('[data-int]').forEach((selEl) => {
          selEl.onchange = async () => {
            try {
              await api('POST', '/sprints/' + selEl.dataset.int + '/interval', { intervalMin: Number(selEl.value) });
              toast('📅 ' + (selEl.options[selEl.selectedIndex]?.text || 'OK'));
              await drawSprints();
            } catch (e) { toast(e.message); }
          };
        });
        box.querySelectorAll('[data-step]').forEach((b) => {
          b.onclick = async () => {
            b.disabled = true; const old = b.textContent; b.textContent = t('dProjStepping');
            try {
              const r = await api('POST', '/sprints/' + b.dataset.step + '/step');
              if (r.step && r.step.error) toast(r.step.error);
              else toast(r.step && r.step.done ? t('dProjStDone') : '✅ ' + (r.step?.task || 'OK'));
              await drawSprints();
            } catch (e) { toast(e.message); b.disabled = false; b.textContent = old; }
          };
        });
        box.querySelectorAll('[data-tog]').forEach((b) => {
          b.onclick = async () => {
            b.disabled = true;
            try { await api('POST', '/sprints/' + b.dataset.tog + '/status', { status: b.dataset.ns }); await drawSprints(); } catch (e) { toast(e.message); b.disabled = false; }
          };
        });
        box.querySelectorAll('[data-del]').forEach((b) => {
          b.onclick = async () => {
            if (!confirm(t('dProjDelAsk'))) return;
            b.disabled = true;
            try { await api('DELETE', '/sprints/' + b.dataset.del); await drawSprints(); } catch (e) { toast(e.message); b.disabled = false; }
          };
        });
      };

      $('#spf').onsubmit = async (e) => {
        e.preventDefault();
        const bt = $('#sp-go'); bt.disabled = true; bt.textContent = t('dProjStarting');
        try {
          await api('POST', '/sprints', {
            repo: $('#sp-repo').value.trim(),
            ghToken: $('#sp-tok').value.trim(),
            goal: $('#sp-goal').value.trim(),
            days: Number($('#sp-days').value) || 14,
            orKey: $('#sp-or').value.trim(),
          });
          $('#sp-goal').value = ''; $('#sp-tok').value = '';
          toast('✅ Sprint startad!');
          await drawSprints();
        } catch (err) { toast(err.message); }
        bt.disabled = false; bt.textContent = t('dProjStart');
      };
      await drawSprints();
    } else if (tab === 'orders') {
      dp.innerHTML = '<div class="dsplit"><div class="dlist" id="dl">' + (orders.orders.length ? orders.orders.map((o) => '<button class="dli" data-id="' + esc(o.id) + '"><b>' + esc(o.title) + '</b><small>' + esc(o.customer) + ' · ' + esc(fmt(o.updated)) + '</small><span class="pill">' + esc(t('st_' + o.status)) + '</span></button>').join('') : '<p class="muted">' + esc(t('dNoOrders')) + '</p>') + '</div><div class="dthread" id="dt"><p class="muted">' + esc(t('dPickOrder')) + '</p></div></div>';
      document.querySelectorAll('.dli').forEach((b) => { b.onclick = () => { document.querySelectorAll('.dli').forEach((x) => x.classList.toggle('on', x === b)); const o = orders.orders.find((x) => x.id === b.dataset.id), id = o.id; $('#dt').innerHTML = '<div class="dbrief"><b>' + esc(o.title) + '</b> <span class="pill">' + esc(t('st_' + o.status)) + '</span><p class="small muted" style="margin:6px 0 4px">' + esc(t('dBrief')) + ':</p><p class="small" style="white-space:pre-wrap;margin:0"></p></div><div id="dtt"></div>'; $('#dt .dbrief p.small:last-child').textContent = o.brief; mountThread($('#dtt'), { more: (a) => api('GET', '/orders/' + id + '/messages?after=' + a), send: async (text) => { await api('POST', '/orders/' + id + '/messages', { text }); }, mine: (m) => m.from !== 'customer', who: (m) => m.from === 'customer' ? o.customer : c.name, time: (m) => m.t }); }; });
    } else if (tab === 'reports') {
      const full = await api('GET', '/companies/' + c.id).catch(() => ({ reviews: [] }));
      dp.innerHTML = '<div class="dscroll"><div class="grid" style="margin-top:0"><div class="card"><small class="muted">' + esc(t('dRepDone')) + '</small><h1 style="margin:4px 0 0">' + esc(c.done || 0) + '</h1></div><div class="card"><small class="muted">' + esc(t('dRepRating')) + '</small><h1 style="margin:4px 0 0">' + (c.rating && c.rating.count ? c.rating.avg.toFixed(1) + ' ★' : '–') + '</h1></div></div><h2 style="margin-top:22px">' + esc(t('dRepReviews')) + '</h2>'
        + (full.reviews.length ? full.reviews.map((r) => '<div class="rev"><span class="stars">' + stars(r.stars) + '</span> <b></b><p></p></div>').join('') : '<p class="muted">' + esc(t('dNoReviews')) + '</p>') + '</div>';
      dp.querySelectorAll('.rev').forEach((el, i) => { el.querySelector('b').textContent = full.reviews[i].name || ''; el.querySelector('p').textContent = full.reviews[i].text || ''; });
    } else {   // settings: samma formulär som när företaget skapades
      dp.innerHTML = '<div class="dscroll" id="dform"></div>'; await pageCompanyStart($('#dform'));
    }
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
  let listGen = 0;
  async function pageCompanies() {
    const gen = ++listGen;
    $('#app').innerHTML = '<div class="page-head"><div><p class="kicker">' + esc(t('brandTag')) + '</p><h1>' + esc(t('heroH')) + '</h1><p class="lede">' + esc(t('heroP')) + '</p></div><a class="btn ghost sm" href="#/">' + esc(t('mapNav')) + ' →</a></div>'
      + '<div class="filters"><div class="search-row"><span class="search-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg></span><input id="q" placeholder="' + esc(t('search')) + '" value="' + esc(sq.q) + '" autocomplete="off" aria-label="' + esc(t('search')) + '"><button class="search-clear" id="qc" type="button" aria-label="' + esc(t('searchClear')) + '"' + (sq.q ? '' : ' hidden') + '>×</button><select id="so" aria-label="' + esc(t('sortBest')) + '">' + [['best', 'sortBest'], ['rating', 'sortRating'], ['orders', 'sortOrders'], ['new', 'sortNew']].map(([v, k]) => '<option value="' + v + '"' + (sq.sort === v ? ' selected' : '') + '>' + esc(t(k)) + '</option>').join('') + '</select></div><div id="tg" class="cat-row"></div></div><div id="res"><div class="co-skel-grid"><span class="co-skel"></span><span class="co-skel"></span><span class="co-skel"></span></div></div>';
    let timer;
    $('#q').oninput = (e) => { clearTimeout(timer); const v = e.target.value; $('#qc').hidden = !v; timer = setTimeout(() => { sq.q = v; sq.page = 1; results(); }, 250); };
    $('#qc').onclick = () => { $('#q').value = ''; $('#qc').hidden = true; sq.q = ''; sq.page = 1; results(); };
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
          + (cur && cur.tags.length > 1 ? '<div class="subtags"><span class="muted small">' + esc(t('catNarrow')) + ':</span>' + cur.tags.map(x => '<button class="chip btn-chip' + (sq.tag === x ? ' on' : '') + '" data-tag="' + esc(x) + '">' + esc(tagLabel(x)) + ' <small>' + esc(cnt[x]) + '</small></button>').join('') + '</div>' : '');
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
    if (gen === listGen) await results();
  }
  async function results() {
    const gen = listGen;
    const qs = new URLSearchParams({ q: sq.q, tag: sq.tag, sort: sq.sort, page: String(sq.page) });
    const j = await api('GET', '/companies?' + qs);
    const box = $('#res'); if (!box || gen !== listGen) return;
    const cards = j.companies.map(c => '<article class="co co-grid-card"><a class="co-img" href="#/company/' + esc(c.id) + '"><img data-i="' + esc(c.id) + '" alt="' + esc(c.name) + '" width="520" height="360" loading="lazy"></a><div class="co-body"><div class="co-top"><span class="co-tier t' + c.building + '">' + esc(t('bTier' + c.building)) + '</span>' + (c.demo ? '<span class="pill">' + esc(t('demoTag')) + '</span>' : '') + '<span class="co-rate">' + ratingHtml(c.rating) + '</span></div><h3><a href="#/company/' + esc(c.id) + '">' + esc(c.name) + '</a></h3>'
      + (c.tagline ? '<p class="co-tag">' + esc(c.tagline) + '</p>' : '') + (c.tags.length ? '<p class="co-tags">' + c.tags.map(x => '<span class="tag">' + esc(tagLabel(x)) + '</span>').join('') + '</p>' : '')
      + (c.services.length ? '<ul class="co-svc">' + c.services.slice(0, 2).map(s => '<li><span>' + esc(s.title) + '</span><b>' + esc(s.price || '') + '</b></li>').join('') + '</ul>' : '')
      + '<div class="co-actions"><a class="btn sm" href="#/company/' + esc(c.id) + '">' + esc(t('viewProfile')) + '</a><span class="muted small">' + (c.done ? esc(c.done) + ' ' + esc(t(c.done === 1 ? 'jobDoneOne' : 'jobDone')) : '') + '</span></div></div></article>').join('');
    box.innerHTML = '<p class="result-count"><b>' + esc(j.total) + '</b> ' + esc(t(j.total === 1 ? 'foundOne' : 'found')) + (sq.q ? ' · “' + esc(sq.q) + '”' : '') + '</p><div class="co-grid">' + (cards || '<div class="empty-state"><h2>' + esc(t('none')) + '</h2><a class="btn ghost" href="#/">' + esc(t('mapNav')) + '</a></div>') + '</div>'
      + (j.pages > 1 ? '<div class="pager"><button class="btn ghost sm" id="pp" ' + (j.page <= 1 ? 'disabled' : '') + '>← ' + esc(t('prev')) + '</button><span class="muted small">' + esc(t('page')) + ' ' + esc(j.page) + ' ' + esc(t('of')) + ' ' + esc(j.pages) + '</span><button class="btn ghost sm" id="pn" ' + (j.page >= j.pages ? 'disabled' : '') + '>' + esc(t('next')) + ' →</button></div>' : '');
    const go = (d) => () => { sq.page = j.page + d; results(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    if ($('#pp')) { $('#pp').onclick = go(-1); $('#pn').onclick = go(1); }
    loadOffice().then(async () => {
      ensureOffice();
      for (const c of j.companies) {
        await new Promise(r => setTimeout(r, 40));
        if (gen !== listGen) return;
        const im = box.querySelector('img[data-i="' + c.id + '"]'); if (!im || !document.body.contains(im)) continue;
        try { im.src = await thumbOf(c); im.classList.add('on'); im.closest('.co-img').classList.add('has-img'); } catch { /* */ }
      }
    }).catch(() => { });
  }
  /* ---------- stadsdelen: 3D-grannskap och delade uppdrag ---------- */
  const tn = (k, v) => t(k).replace(/\{(\w+)\}/g, (_, x) => (v && v[x] != null ? v[x] : ''));
  const NET_LABEL = { granne: 'netLvGranne', kvarter: 'netLvKvarter', stadsdel: 'netLvStadsdel' };
  const NET_SHARE = { granne: 'netShareGranne', kvarter: 'netShareKvarter', stadsdel: 'netShareStadsdel' };
  const netLv = (l) => t(NET_LABEL[l] || 'netLvStadsdel');
  const netShare = (l) => t(NET_SHARE[l] || 'netShareStadsdel');
  const netPostsFor = (j, id) => (j.posts || []).filter((p) => p.companyId === id);
  function netLocalize(j) {   // demoföretagens texter finns på båda språken
    if (lang !== 'en') return j;
    const fix = (c) => {
      const d = c && c.demo && DEMO_EN[c.id];
      if (!d) return c;
      const out = { ...c, tagline: d[0], description: d[1] };
      if (c.services) out.services = c.services.map((sv, i) => ({ ...sv, title: d[2][i] ? d[2][i][0] : sv.title, desc: d[2][i] ? d[2][i][1] : sv.desc, price: String(sv.price).replace(/^från /, 'from ') }));
      return out;
    };
    return { ...j, center: fix(j.center), neighbors: (j.neighbors || []).map(fix) };
  }
  const netTags = (tags) => (tags || []).map((x) => '<span class="tag">' + esc(tagLabel(x)) + '</span>').join(' ');

  function netLegendHtml() {
    return '<ul class="net-legend">' + [['granne', 64], ['kvarter', 144], ['stadsdel', 248]].map(([l, m], i) =>
      '<li class="lv-' + l + '"><i></i><div><b>' + esc(netLv(l)) + '</b><span class="small">' + esc(tn('netWithin', { m: m })) + '</span><small>' + esc(netShare(l)) + '</small></div></li>').join('') + '</ul>';
  }
  function netPostCard(p, mine) {
    const skills = (p.skills || []).map((x) => '<span class="tag">' + esc(tagLabel(x)) + '</span>').join(' ');
    return '<article class="net-post"><div class="net-post-top"><span class="small muted">' + esc(t('netPostFrom')) + ' <b class="net-post-co">' + esc(p.companyName) + '</b></span><time class="small muted">' + esc(fmt(p.created)) + '</time></div>'
      + '<h3>' + esc(p.title) + '</h3><p>' + esc(p.brief) + '</p>'
      + '<div class="net-post-meta">' + (p.budget ? '<span><b>' + esc(t('netPostBudget')) + '</b> ' + esc(p.budget) + '</span>' : '') + (skills ? '<span><b>' + esc(t('netPostSkills')) + '</b> ' + skills + '</span>' : '') + '</div>'
      + '<div class="net-post-actions">' + (mine ? '<button class="btn ghost sm" type="button" data-close="' + esc(p.id) + '">' + esc(t('netPostClose')) + '</button>' : '<a class="btn ghost sm" href="#/map-chat/' + esc(p.companyId) + '">' + esc(t('netContact')) + '</a>') + '</div></article>';
  }
  function netFormHtml() {
    return '<form class="net-form" id="netForm" novalidate><h3>' + esc(t('netPostNewH')) + '</h3><p class="muted small">' + esc(t('netPostNewP')) + '</p>'
      + '<label><span>' + esc(t('netPostTitle')) + '</span><input name="title" required minlength="4" maxlength="70" placeholder="' + esc(t('netPostTitlePh')) + '"></label>'
      + '<label><span>' + esc(t('netPostBrief')) + '</span><textarea name="brief" required minlength="15" maxlength="600" rows="3" placeholder="' + esc(t('netPostBriefPh')) + '"></textarea></label>'
      + '<div class="net-form-row"><label><span>' + esc(t('netPostSkills')) + '</span><input name="skills" maxlength="120" placeholder="' + esc(t('netPostSkillsPh')) + '"></label>'
      + '<label><span>' + esc(t('netPostBudget')) + '</span><input name="budget" maxlength="40" placeholder="' + esc(t('netPostBudgetPh')) + '"></label></div>'
      + '<div class="net-form-foot"><button class="btn" type="submit">' + esc(t('netPostSend')) + '</button><span class="err" id="netErr" role="alert"></span></div></form>';
  }
  function wireNetAssign(j, root, done) {
    if (!root) return;
    root.querySelectorAll('[data-close]').forEach((b) => {
      b.onclick = async () => {
        b.disabled = true;
        try { await api('DELETE', '/collab/' + b.dataset.close); toast(t('netPostClosed')); done(); }
        catch (e) { toast(e.message); b.disabled = false; }
      };
    });
    const f = root.querySelector('#netForm'); if (!f) return;
    f.onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(f), err = f.querySelector('#netErr'), btn = f.querySelector('button[type="submit"]');
      if (String(fd.get('title') || '').trim().length < 4) { if (err) err.textContent = t('netPostNeedTitle'); return; }
      if (String(fd.get('brief') || '').trim().length < 15) { if (err) err.textContent = t('netPostNeedBrief'); return; }
      btn.disabled = true; if (err) err.textContent = '';
      try { await api('POST', '/collab', { title: fd.get('title'), brief: fd.get('brief'), skills: fd.get('skills'), budget: fd.get('budget') }); toast(t('netPostSent')); done(); }
      catch (ex) { if (err) err.textContent = ex.message; btn.disabled = false; }
    };
  }
  function netSideHtml(j, id) {
    const isCenter = id === j.center.id;
    const c = isCenter ? j.center : j.neighbors.find((x) => x.id === id);
    if (!c) return '';
    const lvl = isCenter ? 'granne' : c.level, posts = netPostsFor(j, c.id);
    const svc = (c.services || []).map((s) => '<li><span>' + esc(s.title) + '</span><b>' + esc(s.price || '') + '</b></li>').join('');
    return '<div class="net-side-in"><div class="net-side-top"><span class="net-lv lv-' + esc(lvl) + '">' + esc(isCenter ? t('netYou') : netLv(c.level)) + '</span><span class="muted small">' + esc(isCenter ? t('netHere') : tn('netAway', { m: c.meters })) + '</span></div>'
      + '<h2>' + esc(c.name) + '</h2><p class="net-side-tag">' + esc(c.tagline || t('companyNoTagline')) + '</p>'
      + '<div class="net-side-rate">' + ratingHtml(c.rating) + (c.done ? ' <span class="muted small">· ' + esc(c.done) + ' ' + esc(t(c.done === 1 ? 'jobDoneOne' : 'jobDone')) + '</span>' : '') + '</div>'
      + '<div class="net-side-share"><span class="muted small">' + esc(t('netShare')) + '</span><b>' + esc(isCenter ? t('netShareGranne') : netShare(c.level)) + '</b></div>'
      + ((c.tags || []).length ? '<div class="net-tags">' + netTags(c.tags) + '</div>' : '')
      + (c.description ? '<p class="net-side-desc">' + esc(c.description) + '</p>' : '')
      + (svc ? '<div class="net-side-svc"><b>' + esc(t('netOffers')) + '</b><ul>' + svc + '</ul></div>' : '')
      + (posts.length ? '<div class="net-side-posts"><b>' + esc(tn('netOpenPosts', { n: posts.length })) + '</b>' + posts.map((p) => '<div class="net-mini"><b>' + esc(p.title) + '</b><span>' + esc(p.budget || '') + '</span></div>').join('') + '</div>' : '')
      + '<div class="net-side-actions"><a class="btn sm" href="#/company/' + esc(c.id) + '">' + esc(t('netProfile')) + '</a>' + (isCenter ? '' : '<a class="btn ghost sm" href="#/map-chat/' + esc(c.id) + '">' + esc(t('netContact')) + '</a>') + '</div></div>';
  }
  function netCardHtml(n, j, link) {
    const posts = netPostsFor(j, n.id).length;
    const inner = '<span class="net-lv lv-' + esc(n.level) + '">' + esc(netLv(n.level)) + '</span><b>' + esc(n.name) + '</b><small>' + esc(tn('netAway', { m: n.meters })) + '</small>'
      + '<span class="net-card-tag">' + esc(n.tagline || t('companyNoTagline')) + '</span>'
      + '<span class="net-card-meta">' + (n.services ? esc(n.services.length) + ' ' + esc(t('services').toLocaleLowerCase()) : esc(netShare(n.level))) + (posts ? ' · ' + esc(tn(posts === 1 ? 'netOpenPostOne' : 'netOpenPosts', { n: posts })) : '') + '</span>';
    return link ? '<a class="net-card lv-' + esc(n.level) + '" href="#/network/' + esc(n.id) + '">' + inner + '</a>' : '<button type="button" class="net-card lv-' + esc(n.level) + '" data-id="' + esc(n.id) + '">' + inner + '</button>';
  }
  function netPostsSection(j) {
    const can = j.viewer && j.viewer.canPost, list = j.posts.filter((p) => p.companyId !== j.center.id);
    return '<section class="net-assign" id="netApp"><div class="net-assign-head"><div><p class="kicker"><span class="kdot"></span>' + esc(t('netNav')) + '</p><h2>' + esc(t('netPostsH')) + '</h2><p class="muted small">' + esc(t('netPostsP')) + '</p></div></div>'
      + (list.length ? '<div class="net-posts">' + list.map((p) => netPostCard(p, false)).join('') + '</div>' : '<p class="muted">' + esc(t('netPostsNone')) + '</p>')
      + (can ? netFormHtml() : (token && j.viewer && j.viewer.companyId
        ? '<p class="net-note">' + esc(t('netNotYours')) + ' <a href="#/network/' + esc(j.viewer.companyId) + '">' + esc(t('netMyNet')) + ' →</a></p>'
        : '<p class="net-note">' + esc(t('netPostCoOnly')) + ' <a href="' + (token ? '#/company-start' : '#/login') + '">' + esc(token ? t('coCreate') : t('signin')) + '</a></p>')) + '</section>';
  }

  async function pageNetwork(id) {
    const j = netLocalize(await api('GET', '/network' + (id ? '?company=' + encodeURIComponent(id) : '')));
    if (!j.center) {
      $('#app').innerHTML = '<div class="net-page"><header class="net-head"><div><p class="kicker">' + esc(t('brandTag')) + '</p><h1>' + esc(t('netH')) + '</h1><p class="lede">' + esc(t('netEmpty')) + '</p></div></header><a class="btn" href="#/company-start">' + esc(t('coCreate')) + '</a></div>';
      return;
    }
    document.title = j.center.name + ' · ' + t('netNav') + ' · MyOffiCity';
    $('#app').innerHTML = '<div class="net-page"><header class="net-head"><div><p class="kicker"><span class="kdot"></span>' + esc(t('brandTag')) + '</p><h1>' + esc(t('netH')) + '</h1><p class="lede">' + esc(t('netP')) + '</p></div>'
      + '<div class="net-head-actions"><a class="btn ghost sm" href="#/">' + esc(t('netBack')) + '</a><a class="btn ghost sm" href="#/list">' + esc(t('viewAll')) + '</a></div></header>'
      + '<div class="net-top"><section class="net-stage"><div class="net-stage-top"><span class="net-live"><i></i>' + esc(t('netLive')) + '</span><span class="muted small">' + esc(tn('netCount', { n: j.neighbors.length + 1 })) + '</span></div>'
      + '<div class="net-canvas" id="netHost"><div class="net-load">' + esc(t('netLoading')) + '</div></div><div class="net-stage-bot"><span>' + esc(t('netTip')) + '</span><span class="net-north" aria-hidden="true">N</span></div></section>'
      + '<aside class="net-side in" id="netSide" aria-live="polite"></aside></div>'
      + netLegendHtml()
      + '<section class="net-list"><div class="net-list-head"><h2>' + esc(t('netNeighbors')) + '</h2><span class="muted small">' + esc(tn('netCount', { n: j.neighbors.length + 1 })) + '</span></div><div class="net-cards" id="netCards">' + (j.neighbors.length ? j.neighbors.map((n) => netCardHtml(n, j)).join('') : '<p class="muted">' + esc(t('netEmpty')) + '</p>') + '</div></section>'
      + netPostsSection(j) + '</div>';

    const side = (sid) => {
      const el = $('#netSide'); if (!el) return;
      el.innerHTML = netSideHtml(j, sid); el.classList.remove('in'); void el.offsetWidth; el.classList.add('in');
      document.querySelectorAll('#netCards [data-id]').forEach((b) => b.classList.toggle('on', b.dataset.id === sid));
      if (netScene) netScene.select(sid);
      if (sid && sid !== id) { try { history.replaceState(null, '', '#/network/' + sid); } catch { /* */ } }
    };
    side(j.center.id);
    document.querySelectorAll('#netCards [data-id]').forEach((b) => { b.onclick = () => side(b.dataset.id); });
    wireNetAssign(j, $('#netApp'), () => route());

    const host = $('#netHost');
    try {
      await loadNet();
      const mount = $('#netHost'); if (!mount) return;
      mount.innerHTML = '';
      netScene = Neighborhood.create(mount, j, { onSelect: side });
    } catch { const mount = $('#netHost'); if (mount) mount.innerHTML = '<div class="net-fallback">' + esc(t('netNo3d')) + '</div>'; }
  }

  async function pageCompany(id) {
    const { company: c, reviews } = await api('GET', '/companies/' + id);
    const mine = me && me.company && me.company.id === c.id;
    document.title = c.name + ' · MyOffiCity';
    const orderBox = c.demo ? '<div class="order-note"><b>' + esc(t('demoTag')) + '</b><p>' + esc(t('demoNote')) + '</p></div>'
      : mine ? '<div class="order-note"><b>' + esc(t('ownCo')) + '</b><p>' + esc(t('dOwner')) + ' ' + esc(c.name) + '.</p><a class="btn" href="#/dash">' + esc(t('dOffice')) + ' →</a></div>'
        : token ? '<div class="two"><div><label>' + esc(t('yourName')) + '</label><input id="cn" value="' + esc(me ? me.user.username : '') + '"></div><div><label>' + esc(t('size')) + '</label><select id="cs"><option value="small">' + esc(t('small')) + '</option><option value="medium" selected>' + esc(t('medium')) + '</option><option value="large">' + esc(t('large')) + '</option></select></div></div>'
          + '<label>' + esc(t('title')) + '</label><input id="ct" placeholder="' + esc(t('title')) + '"><label>' + esc(t('brief')) + '</label><textarea id="cb" rows="5" placeholder="' + esc(t('briefPh')) + '"></textarea><div id="ce"></div><button class="btn wide" id="go" style="margin-top:12px">' + esc(t('send')) + '</button>'
          : '<div class="order-note"><b>' + esc(t('needLogin')) + '</b><p>' + esc(t('companyOrderNote')) + '</p><a class="btn wide" href="#/login">' + esc(t('signin')) + '</a></div>';
    $('#app').innerHTML = '<p class="crumbs"><a href="#/">← ' + esc(t('back')) + '</a></p>'
      + '<section class="company-hero"><div class="company-shot" id="cshot"><span class="shot-load">' + esc(t('loadingCity')) + '</span></div>'
      + '<div class="company-intro"><div class="company-badges"><span class="co-tier t' + c.building + '">' + esc(t('bTier' + c.building)) + '</span>' + (c.demo ? '<span class="pill">' + esc(t('demoTag')) + '</span>' : '') + '<span class="company-rating">' + ratingHtml(c.rating) + '</span>' + (c.done ? '<span class="muted small">· ' + esc(c.done) + ' ' + esc(t(c.done === 1 ? 'jobDoneOne' : 'jobDone')) + '</span>' : '') + '</div>'
      + '<h1>' + esc(c.name) + '</h1><p class="lede">' + esc(c.tagline || t('companyNoTagline')) + '</p>'
      + (c.tags.length ? '<div class="company-tags">' + c.tags.map(x => '<span class="tag">' + esc(tagLabel(x)) + '</span>').join('') + '</div>' : '')
      + '<div class="company-actions">' + (c.demo || mine ? '' : '<a class="btn" href="#order">' + esc(t('companyOrder')) + ' →</a><button class="btn ghost" id="ccontact">' + esc(t('meetSales')) + '</button>') + '<button class="btn ghost" id="cseeoffice">' + esc(t('seeInCity')) + '</button></div>'
      + (c.website || c.city || c.orgNo ? facts(c) : '') + '</div></section>'
      + '<div class="company-body"><div class="company-main"><section class="card about-card"><p class="kicker">' + esc(t('companyAbout')) + '</p><p class="about-text">' + esc(c.description || t('companyNoDesc')) + '</p></section>'
      + (c.services.length ? '<section class="card"><div class="card-head"><h2>' + esc(t('companyServices')) + '</h2><span class="muted small">' + esc(c.services.length) + '</span></div><div class="service-list">' + c.services.map(s => '<article class="service"><div><h3>' + esc(s.title) + '</h3>' + (s.desc ? '<p>' + esc(s.desc) + '</p>' : '') + '</div><b class="service-price">' + esc(s.price || '') + '</b></article>').join('') + '</div></section>' : '')
      + '<section class="card"><div class="card-head"><h2>' + esc(t('reviews')) + '</h2>' + (reviews.length ? '<span class="stars">' + stars(c.rating.avg) + '</span>' : '') + '</div>' + (reviews.length ? reviews.map(r => '<div class="rev"><span class="stars">' + stars(r.stars) + '</span> <b>' + esc(r.name) + '</b> <span class="muted small">' + esc(fmt(r.created)) + '</span>' + (r.text ? '<p>' + esc(r.text) + '</p>' : '') + '</div>').join('') : '<p class="muted">' + esc(t('noReviews')) + '</p>') + '</section></div>'
      + '<aside class="company-side"><div class="card order-card" id="order"><p class="kicker">' + esc(t('companyOrder')) + '</p><h2>' + esc(t('order')) + '</h2><p class="muted small">' + esc(t('companyOrderNote')) + '</p>' + orderBox + '</div>'
      + '<div class="card company-facts"><h2>' + esc(t('companyFacts')) + '</h2><dl>' + (c.city ? '<div><dt>' + esc(t('cityLabel')) + '</dt><dd>' + esc(c.city) + '</dd></div>' : '') + (c.website ? '<div><dt>' + esc(t('website')) + '</dt><dd><a href="' + esc(c.website) + '" target="_blank" rel="noopener noreferrer nofollow">' + esc(hostOf(c.website)) + '</a></dd></div>' : '') + (c.orgNo ? '<div><dt>' + esc(t('orgNo')) + '</dt><dd>' + esc(c.orgNo) + '</dd></div>' : '') + '<div><dt>' + esc(t('done')) + '</dt><dd>' + esc(c.done || 0) + '</dd></div></dl></div></aside></div>';
    const go = $('#go'); if (go) go.onclick = async () => {
      go.disabled = true; $('#ce').innerHTML = '';
      try { const j = await api('POST', '/orders', { companyId: id, customerName: $('#cn').value, title: $('#ct').value, brief: $('#cb').value, size: $('#cs').value }); toast(t('ordered')); location.hash = '#/order/' + j.order.id; }
      catch (e) { $('#ce').innerHTML = '<div class="err">' + esc(e.message) + '</div>'; go.disabled = false; }
    };
    const contact = $('#ccontact'); if (contact) contact.onclick = () => startChat(c);
    const seeOffice = $('#cseeoffice'); if (seeOffice) seeOffice.onclick = () => { focusCo = c.id; lsSet(ROLE_KEY, 'customer'); if (location.hash === '#/') route(); else location.hash = '#/'; };
    loadOffice().then(async () => {
      ensureOffice();
      try { const src = await thumbOf(c), im = new Image(); im.onload = () => { const box = $('#cshot'); if (!box) return; box.classList.add('ready'); box.innerHTML = ''; box.appendChild(im); }; im.alt = c.name; im.width = 520; im.height = 360; im.src = src; } catch { /* */ }
    }).catch(() => { });
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
      { id: 'prompt', name: t('askAi'), where: t('askAiWhere'), code: lang === 'sv' ? svPrompt(o, k, url) : 'Connect to MyOffiCity for me.\n1. Read ' + o + '/llms.txt to see how the API and the MCP server work. (Do not open the /#/account page: that is for humans.)\n2. Use this API key and never print it back: ' + k + '\n3. If you can run commands, add the MCP server (Claude Code: claude mcp add --transport http nrn-market ' + url + ' --header "Authorization: Bearer ' + k + '"), otherwise call the REST API with curl.\n4. Then run whoami and tell me what this key is allowed to do.\nDo not place orders or mark anything delivered unless I ask you to.' },
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
  const svPrompt = (o, k, url) => 'Koppla mig till MyOffiCity.\n1. Läs ' + o + '/llms.txt för att se hur API:et och MCP-servern fungerar. (Öppna inte sidan /#/account: den är till för människor.)\n2. Använd den här API-nyckeln och skriv aldrig ut den igen: ' + k + '\n3. Om du kan köra kommandon, lägg till MCP-servern (Claude Code: claude mcp add --transport http nrn-market ' + url + ' --header "Authorization: Bearer ' + k + '"), annars anropa REST-API:et med curl.\n4. Kör sedan whoami och berätta vad nyckeln får göra.\nLägg inga beställningar och markera inget som levererat om jag inte ber dig.';
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
    if ($('#keysBox')) { loadKeys().catch(() => { }); wireGuide(''); }
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
    // Vanliga ankarlänkar (#app, #order …) ska rulla till elementet i stället för att byta sida.
    const anchor = location.hash.slice(1);
    if (anchor && !anchor.startsWith('/')) {
      const el = document.getElementById(anchor);
      if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' });
      return;
    }
    clearInterval(poll); closeViewer();
    if (netScene) { netScene.dispose(); netScene = null; } document.body.classList.remove('in-dash', 'nav-open'); const nt = $('#navToggle'); if (nt) nt.setAttribute('aria-expanded', 'false'); window.dispatchEvent(new CustomEvent('myoffi-weather', { detail: { kind: 'clear', int: 0 } })); if (officeHost && officeHost.parentNode) officeHost.remove();
    document.title = 'MyOffiCity — AI companies that build real websites';
    const h = location.hash || '#/';
    window.scrollTo(0, 0);
    renderBar();
    try {
      let m;
      if (h === '#/login') return pageLogin();
      if (h === '#/forgot') return pageForgot();
      if ((m = /^#\/map-chat\/([a-z0-9]+)$/.exec(h))) { const c = (await api('GET', '/companies/' + m[1])).company; return startChat(c); }
      if (h === '#/company-start') return await pageCompanyStart();
      if (h === '#/dash') return await pageDash();
      if (h === '#/chats') return await pageChats();
      if ((m = /^#\/chat\/([a-z0-9]+)$/.exec(h))) return await pageChat(m[1]);
      if (h === '#/list') return await pageCompanies();
      if ((m = /^#\/network(?:\/([a-z0-9]+))?$/.exec(h))) return await pageNetwork(m[1]);
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
