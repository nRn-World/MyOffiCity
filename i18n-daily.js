/* nRn Company – texter för daglig GitHub-granskning, rapporter och anslutningar.
   Laddas efter i18n.js. Övriga språk faller tillbaka på engelska. */
Object.assign(I18N.en,{
  nav_github:"GitHub",nav_reports:"Reports",
  ghw_eyebrow:"Workspace",ghw_h:"GitHub workspace",
  ghw_p:"Connect a repository and let the team audit it every morning. You get a clear report: what they found, what they fixed and what they left alone – with the reason.",
  ghw_connect:"Connect GitHub",ghw_setup_h:"Connect in three steps",
  ghw_step1:"Create a fine-grained token on GitHub with access to the repositories the team should work on.",
  ghw_step2:"Give it Contents: read & write and Pull requests: read & write. Metadata: read is added automatically.",
  ghw_step3:"Paste it below. It is stored only in .env on this computer, never in the browser.",
  ghw_token:"Personal access token",ghw_save:"Save token",ghw_replace:"Replace token",
  ghw_connected:"GitHub is connected",ghw_saved:"GitHub connected. Your repositories are ready.",
  ghw_rejected:"GitHub rejected the token: {d}",ghw_test:"Test connection",ghw_manage:"Connection",
  ghw_search:"Search repositories…",ghw_repos:"Your repositories",ghw_use:"Use for daily audit",
  ghw_selected:"Daily repository",ghw_audit:"Audit now",ghw_reload:"Reload",
  ghw_loading:"Loading repositories…",ghw_none:"No repositories match.",
  ghw_empty:"No repositories found. Check that the token can read repositories.",
  ghw_private:"Private",ghw_public:"Public",ghw_no_gh:"Connect GitHub to choose a repository.",
  ghw_recent:"Latest audits",ghw_no_reports:"No audits yet.",
  ghw_stat_repos:"Repositories",ghw_stat_audits:"Audits run",ghw_stat_prs:"Pull requests",
  ghw_stat_fixed:"Fixes shipped",ghw_open:"Open on GitHub",ghw_pick:"Choose a repository",
  ghw_token_note:"The token is only used by the local server. Replace it here whenever you rotate it.",
  ghw_scan:"Scanning repository",
  rep_eyebrow:"Autopilot",rep_h:"Daily audits",
  rep_p:"Every morning the team reads your repository, finds bugs and ideas, fixes what is safe and tells you exactly what was skipped and why.",
  rep_now:"Run audit now",rep_running:"Audit running…",rep_enable:"Daily routine",
  rep_enable_p:"The team starts on its own at the chosen time. Leave the app open – if you open it later, it catches up for the day.",
  rep_time:"Start time",rep_repo:"Repository",rep_norepo:"No repository selected",
  rep_fixes:"Max fixes per day",rep_findings:"Max findings",rep_next:"Next run",
  rep_last:"Last run",rep_never:"Not run yet",rep_tomorrow:"Tomorrow {t}",rep_today:"Today {t}",
  rep_in_hours:"In {n} h",rep_auto_saved:"Changes are saved automatically.",
  rep_empty_h:"Your first audit is waiting",rep_empty_p:"Connect GitHub and choose a repository. The next morning you get a report with everything the team found, fixed and skipped.",
  rep_found:"Found",rep_fixed:"Fixed",rep_skipped:"Skipped",rep_why:"Why skipped",
  rep_steps:"Run log",rep_pr:"Pull request",rep_demo:"Demo",rep_status_done:"Completed",
  rep_status_err:"Failed",rep_status_run:"Running",
  rep_note:"The audit runs while the app is open. It catches up if you open it after the scheduled time.",
  rep_kind_bug:"Bug",rep_kind_improvement:"Improvement",rep_kind_idea:"Idea",
  rep_sev_low:"Low",rep_sev_medium:"Medium",rep_sev_high:"High",
  rep_no_findings:"No findings recorded.",rep_cost:"Cost",rep_findings_n:"{n} findings",
  rep_fix_limit:"Fix limit",rep_schedule:"Schedule",rep_reports:"Reports",rep_repo_short:"Repository",
  rep_no_team:"Hire the core team first.",rep_need_repo:"Choose a repository first.",
  rep_need_gh:"Connect GitHub first.",rep_started:"Daily audit started.",
  rep_report_h:"Latest report",rep_open:"Open report",rep_runs:"{n} audits",rep_fixes_today:"Fixed today",
  rep_skip_limit:"Not selected – the daily fix limit was reached.",
  rep_skip_default:"Not safe to change automatically today.",
  rep_skip_rejected:"The reviewers rejected the fix: {r}",
  rep_skip_no_files:"The worker produced no file changes.",
  rep_skip_error:"The fix failed: {e}",rep_skip_demo:"Demo finding – no real repository change.",
  daily_name:"Daily audit · {d}",
  daily_brief:"Daily audit of {r}. Find bugs, improvements and new ideas. Fix the safest, highest-value issues and explain why anything else is skipped.",
  daily_step_read:"Reading {r}",daily_step_audit:"{n} is auditing the code",
  daily_step_found:"{n} findings · {f} to fix · {s} reported only",
  daily_step_fix:"Fixing: {t}",daily_step_polish:"{n} is polishing the fixes",
  daily_step_review:"{a} and {b} review the fixes",daily_step_commit:"Opening a pull request",
  daily_step_report:"{n} reports to you",
  daily_report_msg:"Daily audit of {r}: {f} findings, {x} fixed, {s} skipped. {summary}",
  daily_done:"Daily audit complete – {x} fixes.",daily_no_fixes:"No safe fixes today – the full report is ready.",
  daily_failed:"The audit could not finish: {e}",daily_started:"{n} starts the daily audit of {r}.",
  daily_auto:"Started automatically at {t}.",daily_budget:"Daily budget: {c}.",
  daily_chat:"Daily audit of {r}\n{f} findings · {x} fixed · {s} skipped\n\n{summary}",
  daily_demo:"Demo repository – no GitHub calls, no pull request.",
  daily_no_repo:"Choose a repository for the daily audit in Reports.",
  daily_team:"Hire the core team before the daily audit can run.",
  daily_skip_rejected:"Reviewers rejected the fix: {r}",
  daily_skip_limit:"Not fixed today – the limit of {n} fixes was reached.",
  daily_skip_files:"The worker did not return any file changes.",
  daily_skip_error:"The fix failed: {e}",daily_skip_default:"Not safe to fix automatically today.",
  set_conn:"Connections",
  set_conn_p:"Add or replace keys here. Every key is tested against the provider and stored only in .env on this computer.",
  save_key:"Save",saving:"Saving…",key_saved:"Saved and verified. The connection is live.",
  key_bad:"Not saved: {d}",key_ph:"Paste a new key to replace the saved one",
  key_server_note:"Sent only to localhost and written to .env. Never stored in the browser.",
  server_online:"Local server online",server_offline:"Local server offline",
  set_daily:"Daily automation",set_daily_p:"The team audits your repository every morning and reports back.",
  set_open_reports:"Open reports",stage_floor:"Live floor",close:"Close"
});
Object.assign(I18N.sv,{
  nav_github:"GitHub",nav_reports:"Rapporter",
  ghw_eyebrow:"Arbetsyta",ghw_h:"GitHub-arbetsyta",
  ghw_p:"Koppla ett repository och låt teamet granska det varje morgon. Du får en tydlig rapport: vad de hittade, vad de fixade och vad de lämnade – med orsak.",
  ghw_connect:"Koppla GitHub",ghw_setup_h:"Koppla på tre steg",
  ghw_step1:"Skapa en fine-grained token på GitHub med åtkomst till de repositories teamet ska jobba med.",
  ghw_step2:"Ge den Contents: read & write och Pull requests: read & write. Metadata: read läggs till automatiskt.",
  ghw_step3:"Klistra in den nedan. Den sparas bara i .env på den här datorn, aldrig i webbläsaren.",
  ghw_token:"Personlig åtkomsttoken",ghw_save:"Spara token",ghw_replace:"Byt token",
  ghw_connected:"GitHub är kopplat",ghw_saved:"GitHub är kopplat. Dina repositories är redo.",
  ghw_rejected:"GitHub nekade token: {d}",ghw_test:"Testa anslutningen",ghw_manage:"Anslutning",
  ghw_search:"Sök repositories…",ghw_repos:"Dina repositories",ghw_use:"Använd för daglig granskning",
  ghw_selected:"Dagligt repository",ghw_audit:"Granska nu",ghw_reload:"Ladda om",
  ghw_loading:"Hämtar repositories…",ghw_none:"Inga repositories matchar.",
  ghw_empty:"Inga repositories hittades. Kontrollera att token får läsa repositories.",
  ghw_private:"Privat",ghw_public:"Publikt",ghw_no_gh:"Koppla GitHub för att välja repository.",
  ghw_recent:"Senaste granskningarna",ghw_no_reports:"Inga granskningar än.",
  ghw_stat_repos:"Repositories",ghw_stat_audits:"Granskningar",ghw_stat_prs:"Pull requests",
  ghw_stat_fixed:"Fixar levererade",ghw_open:"Öppna på GitHub",ghw_pick:"Välj repository",
  ghw_token_note:"Token används bara av den lokala servern. Byt den här när du roterar den.",
  ghw_scan:"Skannar repository",
  rep_eyebrow:"Autopilot",rep_h:"Dagliga granskningar",
  rep_p:"Varje morgon läser teamet ditt repository, hittar buggar och idéer, fixar det som är säkert och berättar exakt vad som hoppades över och varför.",
  rep_now:"Kör granskning nu",rep_running:"Granskning pågår…",rep_enable:"Daglig rutin",
  rep_enable_p:"Teamet startar själv på vald tid. Låt appen vara öppen – öppnar du den senare tar den igen dagens granskning.",
  rep_time:"Starttid",rep_repo:"Repository",rep_norepo:"Inget repository valt",
  rep_fixes:"Max fixar per dag",rep_findings:"Max fynd",rep_next:"Nästa körning",
  rep_last:"Senaste körning",rep_never:"Inte körd än",rep_tomorrow:"Imorgon {t}",rep_today:"Idag {t}",
  rep_in_hours:"Om {n} h",rep_auto_saved:"Ändringar sparas automatiskt.",
  rep_empty_h:"Din första granskning väntar",
  rep_empty_p:"Koppla GitHub och välj ett repository. Nästa morgon får du en rapport med allt teamet hittat, fixat och hoppat över.",
  rep_found:"Hittade",rep_fixed:"Fixade",rep_skipped:"Överhoppade",rep_why:"Varför den hoppades över",
  rep_steps:"Körningslogg",rep_pr:"Pull request",rep_demo:"Demo",rep_status_done:"Klar",
  rep_status_err:"Misslyckades",rep_status_run:"Pågår",
  rep_note:"Granskningen körs medan appen är öppen. Den tar igen det om du öppnar appen efter utsatt tid.",
  rep_kind_bug:"Bugg",rep_kind_improvement:"Förbättring",rep_kind_idea:"Idé",
  rep_sev_low:"Låg",rep_sev_medium:"Medel",rep_sev_high:"Hög",
  rep_no_findings:"Inga fynd registrerade.",rep_cost:"Kostnad",rep_findings_n:"{n} fynd",
  rep_fix_limit:"Fixgräns",rep_schedule:"Schema",rep_reports:"Rapporter",rep_repo_short:"Repository",
  rep_no_team:"Anställ kärnteamet först.",rep_need_repo:"Välj ett repository först.",
  rep_need_gh:"Koppla GitHub först.",rep_started:"Daglig granskning startad.",
  rep_report_h:"Senaste rapporten",rep_open:"Öppna rapport",rep_runs:"{n} granskningar",rep_fixes_today:"Fixade idag",
  rep_skip_limit:"Inte vald – dagens fixgräns nåddes.",
  rep_skip_default:"Inte säkert att ändra automatiskt idag.",
  rep_skip_rejected:"Granskarna underkände fixen: {r}",
  rep_skip_no_files:"Arbetaren gav inga filändringar.",
  rep_skip_error:"Fixen misslyckades: {e}",rep_skip_demo:"Demofynd – ingen riktig ändring i repositoryt.",
  daily_name:"Daglig granskning · {d}",
  daily_brief:"Daglig granskning av {r}. Hitta buggar, förbättringar och nya idéer. Fixa det säkraste och mest värdefulla och förklara varför resten hoppas över.",
  daily_step_read:"Läser {r}",daily_step_audit:"{n} granskar koden",
  daily_step_found:"{n} fynd · {f} att fixa · {s} att bara rapportera",
  daily_step_fix:"Fixar: {t}",daily_step_polish:"{n} putsar fixarna",
  daily_step_review:"{a} och {b} granskar fixarna",daily_step_commit:"Öppnar en pull request",
  daily_step_report:"{n} rapporterar till dig",
  daily_report_msg:"Daglig granskning av {r}: {f} fynd, {x} fixade, {s} överhoppade. {summary}",
  daily_done:"Daglig granskning klar – {x} fixar.",daily_no_fixes:"Inga säkra fixar idag – hela rapporten finns klar.",
  daily_failed:"Granskningen kunde inte slutföras: {e}",daily_started:"{n} startar den dagliga granskningen av {r}.",
  daily_auto:"Startade automatiskt {t}.",daily_budget:"Dagens budget: {c}.",
  daily_chat:"Daglig granskning av {r}\n{f} fynd · {x} fixade · {s} överhoppade\n\n{summary}",
  daily_demo:"Demorepository – inga GitHub-anrop, ingen pull request.",
  daily_no_repo:"Välj ett repository för den dagliga granskningen i Rapporter.",
  daily_team:"Anställ kärnteamet innan den dagliga granskningen kan köra.",
  daily_skip_rejected:"Granskarna underkände fixen: {r}",
  daily_skip_limit:"Inte fixad idag – gränsen på {n} fixar nåddes.",
  daily_skip_files:"Arbetaren gav inga filändringar.",
  daily_skip_error:"Fixen misslyckades: {e}",daily_skip_default:"Inte säkert att fixa automatiskt idag.",
  set_conn:"Anslutningar",
  set_conn_p:"Lägg till eller byt nycklar här. Varje nyckel testas mot leverantören och sparas bara i .env på den här datorn.",
  save_key:"Spara",saving:"Sparar…",key_saved:"Sparat och verifierat. Anslutningen är live.",
  key_bad:"Sparades inte: {d}",key_ph:"Klistra in en ny nyckel för att byta den sparade",
  key_server_note:"Skickas bara till localhost och skrivs till .env. Sparas aldrig i webbläsaren.",
  server_online:"Lokal server online",server_offline:"Lokal server offline",
  set_daily:"Daglig automation",set_daily_p:"Teamet granskar ditt repository varje morgon och rapporterar tillbaka.",
  set_open_reports:"Öppna rapporter",stage_floor:"Live-våning",close:"Stäng"
});

Object.assign(I18N.en,{
  rep_demo_option:"Demo repository (no GitHub)",rep_on:"Daily audits on",rep_off:"Daily audits off",
  ghw_try_demo:"Try a demo audit",ghw_demo_p:"No GitHub needed. Watch the whole team run against a simulated repository and read the finished report.",
  rep_demo_started:"Demo audit started.",rep_fix_limit_n:"{n}",rep_show_all:"Show all findings",rep_hide:"Hide"
});
Object.assign(I18N.sv,{
  rep_demo_option:"Demorepository (utan GitHub)",rep_on:"Dagliga granskningar på",rep_off:"Dagliga granskningar avstängda",
  ghw_try_demo:"Prova en demogranskning",ghw_demo_p:"Ingen GitHub behövs. Se hela teamet jobba mot ett simulerat repository och läs den färdiga rapporten.",
  rep_demo_started:"Demogranskning startad.",rep_fix_limit_n:"{n}",rep_show_all:"Visa alla fynd",rep_hide:"Dölj"
});

Object.assign(I18N.en,{
  ghw_hero_off_h:"Your repository, audited every morning",
  ghw_hero_off_p:"The team finds bugs, ships the safe fixes and writes a report while you sleep.",
  ghw_hero_on_h:"Connected and ready",
  ghw_hero_on_p:"The team can read your repositories and open pull requests. You stay in control of every merge.",
  ghw_token_setup:"GitHub token",rep_all_time:"All time",rep_runs:"Runs: {n}",
  gh_panel_connect:"Connect GitHub in the GitHub view to let the team build real repositories.",
  gh_panel_btn:"Connect"
});
Object.assign(I18N.sv,{
  ghw_hero_off_h:"Ditt repository, granskat varje morgon",
  ghw_hero_off_p:"Teamet hittar buggar, levererar de säkra fixarna och skriver en rapport medan du sover.",
  ghw_hero_on_h:"Kopplat och redo",
  ghw_hero_on_p:"Teamet kan läsa dina repositories och öppna pull requests. Du behåller kontrollen över varje merge.",
  ghw_token_setup:"GitHub-token",rep_all_time:"All tid",rep_runs:"Körningar: {n}",
  gh_panel_connect:"Koppla GitHub i GitHub-vyn så kan teamet bygga riktiga repositories.",
  gh_panel_btn:"Koppla"
});

Object.assign(I18N.en,{
  set_p:"Company, connections and preferences. Everything is stored on this computer.",
  lang_p:"Nine languages, including right-to-left Arabic. The interface switches immediately.",
  key_ph_new:"Paste your key here"
});
Object.assign(I18N.sv,{
  set_p:"Företag, anslutningar och inställningar. Allt sparas på den här datorn.",
  lang_p:"Nio språk, inklusive arabiska från höger till vänster. Gränssnittet byts direkt.",
  key_ph_new:"Klistra in din nyckel här"
});

Object.assign(I18N.en,{team_eyebrow:"People",team_p:"Your team leader, the two reviewers and the people who build and polish the work."});
Object.assign(I18N.sv,{team_eyebrow:"Människor",team_p:"Din teamledare, de två granskarna och personerna som bygger och putsar arbetet."});

Object.assign(I18N.en,{fin_eyebrow:"Numbers",fin_p:"Every AI call is logged with real token usage. See what the team costs, what projects earn and when you break even."});
Object.assign(I18N.sv,{fin_eyebrow:"Siffror",fin_p:"Varje AI-anrop loggas med riktig tokenanvändning. Se vad teamet kostar, vad projekten tjänar och när du går plus."});

Object.assign(I18N.en,{rep_no_audits:"No audits yet"});
Object.assign(I18N.sv,{rep_no_audits:"Inga granskningar än"});

Object.assign(I18N.en,{chat_with:"Chat with"});
Object.assign(I18N.sv,{chat_with:"Chatta med"});
