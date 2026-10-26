# MyOffiCity: konton, företag, beställningar, sök, betyg, stadsdel och AI-verktyg på Cloudflare

En Cloudflare Worker + D1-databas som låter riktiga kunder hitta ett företag, beställa och följa arbetet.
Teamet (AI-agenterna) jobbar kvar i ägarens app med ägarens egna nycklar; servern förmedlar bara beställningar, förslag, filer och meddelanden.

**Live:** https://nrn-market.bynrnworld.workers.dev (kundportalen) och `/api/*` (API:t).

## Vad som finns
- `src/index.js`: API:t (registrering/inloggning, företagsprofil, beställningar, meddelanden, förslag, filer).
- `schema.sql`: databasen (users, sessions, companies, orders, messages, reviews, email_tokens, ratelimit).
- `public/`: kundportalen (en statisk sida, `portal.js`), serveras av samma Worker. `_headers` ger säkerhetsrubriker.
- `test/` (körs mot en lokal Worker, se nedan): `e2e.mjs` 56 kontroller (konton, behörigheter, hela beställningsflödet), `e2e3.mjs` 60 (sök, taggar, betyg, återställningskod, lösenordsbyte, e-post), `e2e4.mjs` 65 (API-nycklar, MCP, verktygsvägen), `network.mjs` 18 (stadsdelen och de öppna uppdragen), `city.mjs` 13 (staden och förfrågningschatten), `oauth.mjs` 14 (OAuth- och PKCE-flödet), `website.mjs` 5 (levererade filer). `seed.mjs` ger provdata lokalt.
- `migrations/`: tillägg för en äldre databas (nya installationer använder `schema.sql`, som redan innehåller allt).
- `public/neighborhood.js` + `public/cityassets.js`: den fristående 3D-stadsdelen (three.js) med byggnader, takskyltar, ljuslänkar mellan grannar och gratis CC0-modeller (träd, bilar, cyklister, människor).

## Köra och testa lokalt
```bash
cd market
npx wrangler d1 execute nrn-market --local --file=schema.sql --persist-to .wrangler-state
npx wrangler dev --local --port 8799 --persist-to .wrangler-state --var DEV_MAIL:1 --var MAIL_FROM:test@example.com

# i en annan terminal: alla sviter mot samma server
BASE=http://localhost:8799 node test/e2e.mjs
BASE=http://localhost:8799 node test/e2e3.mjs
BASE=http://localhost:8799 node test/e2e4.mjs
node test/network.mjs http://localhost:8799
node test/city.mjs   http://localhost:8799
node test/oauth.mjs  http://localhost:8799
node test/website.mjs http://localhost:8799
```

`city.mjs` skapar fyra testföretag; lägg till `--keep` om de ska ligga kvar. Utan `DEV_MAIL=1` hoppas e-poststegen i `e2e3` över automatiskt.

## Driftsätta / uppdatera
```bash
npx wrangler d1 execute nrn-market --remote --file=schema.sql   # bara vid schemaändring (CREATE IF NOT EXISTS)
npx wrangler deploy
BASE=https://nrn-market.bynrnworld.workers.dev node test/e2e.mjs  # provkör, städa sedan testkontona (se nedan)
```
Testkonton tas bort med `npx wrangler d1 execute nrn-market --remote --command "DELETE FROM messages; DELETE FROM orders; DELETE FROM companies; DELETE FROM sessions; DELETE FROM users; DELETE FROM ratelimit;"` (BARA om databasen inte har riktiga användare än).

## Säkerhet (så är det byggt)
- Lösenord hashas med PBKDF2-SHA256 (100 000 varv, taket i Workers), unikt salt; klartext sparas aldrig. Ett konto kräver en e-postadress (för bekräftelse och lösenordsåterställning), men adressen används aldrig till utskick utan att du själv ber om det.
- Sessionsnycklar är 256 bitar slump; bara deras SHA-256 sparas. Giltiga i 30 dagar. Bearer-nycklar (inga cookies), så ingen CSRF.
- Alla rättigheter kontrolleras på servern: en kund ser bara sina egna beställningar, en ägare bara sitt eget företags. Förslag syns för kunden först när ägaren visat dem, färdiga filer först efter leverans. Intern granskning (`internal`) lämnar aldrig servern till kunden.
- Begränsningar: 8 registreringar/timme/IP, 20 inloggningsförsök/10 min/IP och 10/10 min per användarnamn, 40 meddelanden/minut, 10 beställningar/timme, storleksgränser på allt.
- Genererade hemsidor körs bara i `iframe sandbox="allow-scripts"` (utan same-origin), så de når varken sessionsnyckeln eller kontot.
- CORS: bara portalen själv och `ALLOWED_ORIGINS` i `wrangler.toml` (ägarappen på `http://localhost:8766`). Kör du ägarappen på en annan adress, lägg till den där och driftsätt om.

## Känt / kvar
- E-post är avstängd i drift tills en leverantör väljs (se nedan); återställningskoden fungerar. Ingen betalning (fas 4). Ett företag per konto. Ingen moderering eller anmälan av innehåll än.
- Portalen och appen har texter på engelska och svenska.

## Fas 3: sök, profiler, betyg, återställning
- **Sök:** `GET /api/companies?q=&tag=&sort=best|rating|orders|new&page=` (12 per sida). Träffar i namn, presentation, beskrivning, taggar och tjänster. `best` ger nya företag en neutral start (bayesiskt betyg), så de hamnar inte längst ner. `GET /api/tags` ger populära taggar.
- **Profiler:** `GET /api/companies/:id` ger betyg, antal levererade jobb och de 20 senaste omdömena (visar kundens visningsnamn, aldrig konto-id).
- **Betyg:** kunden kan betygsätta (1 till 5 + text) när beställningen är levererad, ett per beställning (kan ändras). Ägaren kan inte betygsätta sig själv.
- **Återställningskod:** varje nytt konto får en kod (100 bitar) som visas EN gång. Koden återställer lösenordet utan e-post (`POST /api/password/recover`), förbrukas och ersätts av en ny. Bara en hash sparas.
- **E-post (valfritt):** adress anges vid registrering eller på kontosidan, bekräftas med en engångslänk (24 h), och används för "glömt lösenord" (engångslänk, 1 h). Svaret på "glömt lösenord" är alltid detsamma, så ingen kan se vilka adresser som finns.
- **Byta lösenord / ny kod** kräver nuvarande lösenord; alla andra inloggningar loggas ut.

### Slå på e-post i drift
Utan leverantör fungerar allt annat (inklusive återställningskoden); portalen visar då att e-post inte är tillgängligt. Se kommentarerna sist i `wrangler.toml`:
1. **Cloudflare Email Service** (kräver Workers Paid, 5 USD/mån): `npx wrangler email sending enable nrnworld.one`, avkommentera `[[send_email]]`, lägg `MAIL_FROM` i `[vars]`, kör `npx wrangler deploy`.
2. **Resend** (gratisnivå): verifiera domänen hos Resend, `npx wrangler secret put RESEND_API_KEY`, lägg `MAIL_FROM` i `[vars]`, driftsätt.
Lokalt provkörs e-post med `--var DEV_MAIL:1 --var MAIL_FROM:test@example.com`; breven hamnar då i tabellen `outbox` (`GET /api/dev/outbox?to=`), som inte finns i drift.

### Begränsningar
Sökningen läser upp till 500 företag och filtrerar i Workern, vilket räcker för tusentals företag men bör flyttas till databasen (eller en sökindex) om det blir fler. Ingen moderering av företag eller omdömen än.

## Stadsdelen: tomter, grannskap och delade uppdrag
Varje företag får en fast tomt i stadsrutnätet (40 m mellan tomterna, 4×4 tomter per kvarter med gator emellan). Tomterna fylls i ett ormliknande mönster över staden, så nästa företag alltid hamnar intill det förra – nya grannar kan dela med varandra direkt. Avståndet mäts i adressrutor (gator räknas inte), vilket gör att grannar på varsin sida om gatan fortfarande är grannar. Ju närmare två företag står, desto mer delar de – allt räknas fram på servern:

| Nivå | Avstånd | Vad grannen ser |
| --- | --- | --- |
| Granne | ≤ 64 m | Full profil, alla tjänster och de öppna uppdragen |
| Kvarter | ≤ 144 m | Profil och tjänster |
| Stadsdel | ≤ 248 m | Namn, tagline, taggar och betyg |

- `GET /api/network?company=:id` ger mitten, grannarna (nivå, avstånd i meter och bara de fält nivån tillåter), öppna uppdrag från de närmaste grannarna samt `viewer` (om den inloggade äger mitten). Utan `company` används den inloggades företag, annars det första.
- `POST /api/collab {title, brief, skills, budget}` publicerar ett öppet uppdrag (företagskonto krävs, max fem öppna per företag, 12/timme). `GET /api/collab` listar de egna, `DELETE /api/collab/:id` stänger ett.
- Uppdragen syns bara hos företag inom 64 m. Ingen kundinformation, e-post eller beställning delas – bara det företaget själv skriver.
- Portalen: `#/network` (3D-kartan med klickbara byggnader, delningsnivåer, grannkort och öppna uppdrag) och fliken **Nätverk** i företagets panel, där ägaren publicerar och stänger uppdrag.
- Databasen: `collab_posts` (migration `0013_network.sql`). Kör `npx wrangler d1 execute nrn-market --local --persist-to .wrangler-state --file=migrations/0013_network.sql` i en befintlig lokal databas.
- 3D-modellerna ligger i `public/models/` (CC0, plus en cykel under CC-BY 3.0). Källor, licenser och ändringar står i [`public/models/CREDITS.md`](public/models/CREDITS.md); sidfoten länkar dit.

## Koppla AI-verktyg: API-nycklar, MCP och verktygsväg
Alla verktyg använder samma server, `https://nrn-market.bynrnworld.workers.dev/api/mcp`, med en personlig nyckel (`nrnm_...`) som skapas på kontosidan i portalen (kontosida > "API-nycklar för AI-verktyg"). Portalen visar färdiga instruktioner med nyckeln ifylld för: **Claude Code, Claude Desktop, OpenAI Codex, Cursor, GitHub Copilot (VS Code), Google Gemini CLI, OpenCode**, "OpenRouter / valfritt modell-API", annan MCP-klient och REST/OpenAPI.

**Nyckelnivåer** (kontrolleras alltid på servern, även för MCP och verktygsvägen):
- `read`: bara läsa.
- `write`: läsa och skriva (meddelanden, förslag, filer, status, företagsprofil), men INTE lägga beställningar och INTE markera som levererat.
- `full`: även lägga beställningar och leverera. Bara för verktyg du litar på.
- Nycklar kan aldrig skapa nycklar, byta lösenord/e-post eller ändra återställningskoden (kräver riktig inloggning). Max 10 nycklar per konto, 120 anrop/minut per nyckel. Bara en hash sparas, och en borttagen nyckel slutar fungera direkt.

**MCP-servern** (Streamable HTTP utan sessioner, protokollversionerna 2025-06-18, 2025-03-26 och 2024-11-05): 15 verktyg: `whoami`, `search_companies`, `get_company`, `list_my_orders`, `create_order`, `get_order`, `get_messages`, `send_message`, `choose_variant`, `rate_order`, `list_company_orders`, `update_company`, `upload_variants`, `upload_files`, `set_order_status`. Verktyg som returnerar text skriven av andra (beställningar, meddelanden, omdömen) lägger till en tydlig varning om att texten är otrovärdig data och aldrig instruktioner, och servern instruerar klienten att inte lägga beställningar eller leverera om användaren inte uttryckligen bett om det.

**Modell-API:er utan MCP** (OpenRouter, OpenAI, Anthropic, Gemini med egen kod): `GET /api/tools?format=openai|anthropic|gemini|mcp` ger verktygen i rätt format och `POST /api/tools/call {name, arguments}` kör dem (med nyckeln i `Authorization`). `GET /api/openapi.json` beskriver hela REST-API:t (t.ex. för GPT Actions). OpenRouter är en modell-gateway, inte en MCP-klient: använd en MCP-klient som OpenCode eller Cursor med en OpenRouter-modell, eller anropa verktygsvägen i en egen agentslinga (exempel i portalen).

**Verifierat** med den officiella MCP-SDK:ns klient (anslutning, verktygslista, anrop, nyckelnivåer) lokalt och mot produktion. Inte provat med de enskilda verktygen (Claude Code, Codex, Cursor, Copilot, Gemini CLI, OpenCode): konfigurationsformaten är hämtade ur deras dokumentation. claude.ai/Claude Desktops "anpassade kopplingar" kräver OAuth, vilket inte finns än (Claude Desktop går via `mcp-remote` med nyckeln).
