# MyOffiCity

Marknadsplats där kunder tittar runt i en 3D-stad av AI-drivna företag, kontaktar ett företag och beställer en hemsida. Företagen drivs av AI-team i appen i det här repot.

Staden har också ett **företagsnätverk**: varje företag har en fast tomt, och ju närmare två kontor står varandra, desto mer delar de – full profil, tjänster och öppna uppdrag för de närmaste grannarna, bara namn och betyg längre bort. Öppna `#/network` i portalen för 3D-kartan, eller fliken **Nätverk** i företagets panel för att dela ett uppdrag.

- **Sajt:** https://nrnworld.one/MyOffiCity/ (kundportal, API och MCP-server; Cloudflare Worker + D1, se `market/`)
- **Företagsappen:** körs lokalt (`start.bat` / `start.sh`) och publicerar företaget till staden
- **Koppla AI-verktyg (Claude, Codex m.fl.):** bara för företagskonton, se `market/README.md` och `/llms.txt`
- **Hemligheter:** `.env` är gitignorerad och lämnar aldrig datorn

---

## Företagsappen (tidigare "nRn Company")

AI-företag i en app: du är Boss, ger uppdrag till teamledaren, och teamet bygger åt dig med OpenRouter, OpenAI, Anthropic eller Ollama.

## Kör

```bash
# Windows
start.bat          # kräver Python 3

# macOS / Linux
./start.sh
```

Servern öppnar http://localhost:8765 automatiskt. Stoppa med Ctrl+C. Ingen build, inga npm-paket.

`server.py` gör tre saker:

1. serverar appens filer,
2. proxar alla AI-anrop (så att webbläsaren aldrig ser några nycklar),
3. proxar GitHub och hämtar den aktuella modellkatalogen live.

## Nycklar

Lägg nycklarna i `nrn-company/.env` (kopiera `.env.example`). Filen är gitignored och lämnar aldrig datorn.

```ini
OPENROUTER_API_KEY=sk-or-...
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GITHUB_TOKEN=
OLLAMA_URL=http://localhost:11434
PORT=8765
```

- Du kan också klistra in nyckeln i **Inställningar → AI** eller GitHub-token i **GitHub-vyn**. Servern testar den först och skriver bara till `.env` om leverantören accepterar den. Webbläsaren skickar den till localhost, aldrig till någon annan.
- Modeller som inte längre finns kan aldrig smyga sig in: listan hämtas från leverantörerna och cachas i 6 timmar. "Uppdatera modeller" i Inställningar tvingar en ny hämtning.
- "Testa anslutning" frågar servern om nyckeln fungerar och visar leverantörens eget felmeddelande.
- Gamla nycklar som låg i webbläsarens `localStorage` städas bort automatiskt vid start och följer aldrig med i exporten.

## Kontor och genvägar

- Klicka på statistik-TV:n i 3D-kontoret, eller på **Analys** uppe till vänster i kontorsvyn, för att öppna analyspanelen med intäkter, kostnader och grafer. **Esc** stänger den.
- **1–8** byter vy: Kontor, Chatt, Team, Beställningar, GitHub, Rapporter, Ekonomi och Inställningar. Genvägarna fungerar inte medan du skriver i ett fält.
- Hovra över en menyikon för att se dess siffra.

## Så arbetar teamet

Boss → **Tomas** (teamledare, din enda kontakt) → **Ebba** och **Kia** (två chefer med samma makt) → **Manus** (bygger) och **Laila** (putsar) → Ebba & Kia granskar varvet → Tomas bedömer om det är värt att meddela dig.

- Båda cheferna måste godkänna. Underkänner de går jobbet tillbaka till arbetarna, och Tomas får inget besked.
- Tomas kan bara meddela dig när han själv godkänt resultatet. Ett avvisat jobb blir status **Avvisad** och skapar ingen commit eller pull request.
- Bara Tomas tar emot uppdrag från dig. Övriga anställda kan du chatta med om deras arbete och mående, men de hänvisar dig till Tomas om du försöker ge dem ett uppdrag.
- Kärnteamet krävs för att starta ett uppdrag. Knappen **Fyll på kärnteamet** anställer de roller som saknas.
- Varje uppdrag har en kostnadsgräns (Inställningar → Max AI-kostnad per uppdrag). Anropet som skulle spränga gränsen körs aldrig.
- **Avbryt** stoppar ett pågående uppdrag. Stegen visas live i projektkortet.

## Dagliga granskningar (07:00)

Teamet kan granska ett repository varje morgon och rapportera till dig som Boss.

1. Öppna **GitHub**, klistra in din token och välj repository (**Use for daily audit**).
2. Öppna **Reports**, slå på **Daily audits** och välj starttid (standard 07:00).
3. Nästa morgon: öppna Reports (badgen visar nya rapporter) och läs **Found / Fixed / Skipped**.

Varje fynd har en status och en förklaring:

- **Fixed** — ändringen finns i en pull request på grenen `nrn/daily-…`. Ingenting mergas automatiskt; du granskar och mergar.
- **Skipped** — varför teamet lät det vara, till exempel att det kräver ett produktbeslut, är för riskabelt, eller att dagens gräns för antal fixar nåddes.

Du styr **Max fixes per day** och **Max findings** i Reports. Granskningen kan också köras manuellt med **Run audit now**. Schemat körs medan appen är öppen; öppnar du den senare samma dag körs den en gång och rapporterar vad som hände.

Dagliga granskningar rör aldrig hemliga filer, CI-konfiguration, licenser, containrar eller beroendefiler som `package.json` — sådana fynd rapporteras i stället med en anledning. Allt hamnar i en PR som du godkänner.

**Try a demo audit** i GitHub-vyn visar hela flödet med ett påhittat repo, utan GitHub-token. Den använder fortfarande teamets AI-modeller.

## GitHub

1. Skapa en **fine-grained token**: GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens.
   - Repository access: *Only select repositories* (eller *All repositories* om teamet ska få skapa nya repon).
   - Permissions: **Contents: Read and write**, **Pull requests: Read and write**, **Metadata: Read-only**. För nya repon även **Administration: Read and write**.
2. Klistra in token i **GitHub-vyn** (eller lägg den i `.env` som `GITHUB_TOKEN` och starta om servern).
3. **Testa anslutning** i GitHub-vyn eller Inställningar.
4. Nytt uppdrag → välj repo (eller "＋ Nytt repo"). Teamet läser relevanta filer, gör ändringarna, granskar, och Tomas öppnar en **pull request** på grenen `nrn/…`.
5. Du mergar med knappen **Merga** (eller på GitHub). `main` ändras aldrig utan ditt godkännande. "Bygg vidare" fortsätter på samma gren.

Hemliga filer (`.env*`, `*.pem`, `*.key`, `id_rsa*`, `secrets*`) skickas aldrig till AI och kan inte ändras. Max 200 kB per fil, 40 filer per uppdrag.

## Ekonomi

Kostnad per anrop beräknas från leverantörens tokenräkning (OpenRouter returnerar exakt kostnad i `usage.cost`). Priser per modell kommer från den live-hämtade katalogen och kan justeras per modell i Inställningar. Hyran är simulerad.

## Tester

```bash
node test/core.test.js     # JSON-utdragning, validering, importkontroll, i18n
node test/github.test.js   # grenskydd, hemliga filer, commit-flöde (mockad GitHub)
```

Portalen och API:t har egna sviter (kräver lokal Wrangler, se `market/README.md`): `e2e`, `e2e3`, `e2e4`, `network`, `city`, `oauth` och `website`.

## Filer

| Fil | Ansvar |
| --- | --- |
| `server.py` | statisk server, AI-proxy, GitHub-proxy, modellkatalog |
| `core.js` | ren logik: JSON-utdragning, schema- och importvalidering |
| `app.js` | företagslogik, uppdragsflöde, ekonomi, gränssnitt |
| `office.js` | 3D-kontoret (Three.js) |
| `orders.js` | beställningar, förslag och leverans till kunder |
| `github.js` | GitHub-anrop via proxyn, gren- och filskydd |
| `flags.js` | språk- och funktionsflaggor |
| `i18n.js` | 9 språk; nya nycklar faller tillbaka på engelska |
| `i18n-daily.js` | texter för GitHub, rapporter och dagliga granskningar |
| `i18n-orders.js` | texter för beställningar och kundchatten |
| `market/` | kundportalen, API:t och 3D-stadsdelen på Cloudflare (egen README) |

## Kända begränsningar

- Ingen riktig inloggning eller flera användare, inga riktiga betalningar.
- Den dagliga granskningen kräver att appen är öppen. Stängd app = ingen körning; öppnar du senare samma dag körs den en gång.
- AI-svaren streamas inte; ett anrop kan ta upp till två minuter innan det ger upp.
- `custom`-leverantörens valfria nyckel ligger kvar i webbläsaren (den skickas bara till localhost och till din egen server).
- `office.js` är fortfarande en stor fil; 3D-scenen byggs om vid våningsbyte och gamla GPU-resurser frigörs nu, men den kan delas upp mer.

Säkerhet: servern lyssnar bara på 127.0.0.1 och vägrar servera `.env`, `.env.example`, `.gitignore` eller `server.py` över HTTP. Nycklarna kan alltså inte hämtas från webbläsaren.
