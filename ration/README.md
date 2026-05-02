# THE RATION OFFICE

**APPROVE. DENY. SURVIVE.**

`THE RATION OFFICE` is a short mobile-first browser game about a ration clerk in the fictional Directorate. The game is not about discovering the truth. It is about creating the official record.

## Campaign

- Two in-world weeks.
- 10 working shifts: Week 1 Shift 1-5, Weekend at Home, Week 2 Shift 6-10.
- Shift 5 always leads to a household event.
- Shift 10 leads to Final Audit, then an ending.
- One run processes about 55 citizens, with 80 citizen records available in `data.js`.

## Body Classification Setting

All citizens, clerks, auditors, and officials in this fiction belong to non-human civic body classes. The current MVP includes:

- Scaled
- Felid
- Canid
- Avian
- Horned
- Amphibian
- Mothkin

These Kinds are not one-to-one metaphors for real races, ethnicities, religions, nationalities, or cultures. The satire targets bureaucratic classification, registration, rationing, and state record-making. The data intentionally avoids making any Kind inherently good, evil, loyal, suspicious, wealthy, violent, or helpless.

## Documents

Citizen cards use cold office language:

- Kind
- Body Permit
- Ration Book
- Kind-specific documents such as Scale Inspection, Flight Permit, Horn Registration, Moisture Ration Permit, Night Labor Permit, and Feather Renewal Record

Directives use `ruleTags` in `data.js`; the game logic checks those tags against citizen traits instead of parsing directive text.

## Controls

On first launch, the default language is selected from the browser language when it matches English, Japanese, French, German, Chinese, Spanish, Portuguese, Russian, or Korean; unsupported browser languages fall back to English. Use the language tabs in the footer or cover controls to change it. The current language is shown as the selected tab. The choice is saved in `localStorage` under `settings.lang`, and the game still runs by directly opening `index.html`.

For each citizen, choose one action:

- `APPROVE`: issue rations. This can lower Unrest and protect Conscience, but costs stock and can raise Audit Risk.
- `DENY`: refuse the request. This preserves stock, but raises Unrest and hurts Conscience.
- `REPORT`: record the citizen as suspicious. This helps quota and State Trust, but damages Conscience and public calm.
- `LOSE FILE`: quietly misplace the record. This may help someone, but creates severe audit exposure.

## Stats

- `State Trust`: reaches 0 for a state arrest ending.
- `Unrest`: reaches 100 for district unrest ending.
- `Family Food`: reaches 0 for an empty home ending.
- `Conscience`: reaches 0 for a loyal-but-empty clerk ending.
- `Audit Risk`: reaches 100 for audit disappearance.
- `Ration Stock`: daily stock for the current shift.

## Weekend and Final Audit

The weekend event reflects earlier decisions: reports, lost files, low food, low conscience, or a helped furnace worker can change the household scene. Shift 10 leads to Final Audit, where the auditor calls out body records, missing documents, quota performance, Flight Permit issues, Heat Tokens, Horn Registration, Lamp Oil, and Moisture Ration approvals.

## Files

- `index.html`: static entry point.
- `style.css`: mobile UI, paper texture, stamps, compact HUD, directive overlay, body-class portraits.
- `data.js`: campaign config, Kind definitions, shifts, citizens, weekend events, final audit notes, endings.
- `game.js`: state management, rendering, action evaluation, directives, save data, share handling.
- `assets/prologue/window-12-arrival.webp`: prologue illustration shown before Shift 1, with PNG fallback.
- `assets/portraits/*.webp`: generated portrait assets for citizen records.
- `README.md`: this document.

## Run

Open `index.html` directly in a browser.

If a browser behaves differently with local files, run a tiny static server from this folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

No backend, login, database, build tool, external library, external image, external font, API call, or `fetch()` is used.

## Saving and Sharing

The game uses `localStorage` for:

- `totalRuns`
- `bestSurvivedShift`
- `unlockedEndings`
- `lastEnding`
- `settings`
- `tutorialSeen`
- `theRationOfficeCurrentRun`

`settings.lang` stores `en`, `ja`, `fr`, `de`, `zh`, `es`, `pt`, `ru`, or `ko` for the language tabs after automatic browser-language selection or manual changes.
The active run is saved separately under `theRationOfficeCurrentRun`, so reopening the same browser returns to the current shift, report, weekend, audit, or ending screen.

`SHARE` uses `navigator.share` when available. Otherwise it copies the result text to the clipboard.

## Balance Notes

The main formulas are documented with `Dev balance note` comments in `game.js`.

- Repeating one action creates same-day pressure.
- Report quotas tempt the player into harming Conscience and Unrest.
- Body-specific necessities make denial more morally costly.
- Directive violations convert mercy into audit liability.
- Lost files are powerful but dangerous, especially near the first audit and final audit.

## Future Ideas

- Add a fifth `FORGE RECORD` action with extreme audit risk.
- Add more conditional citizen substitutions based on flags.
- Add ending hints after multiple runs.
- Add a small in-game dossier archive for previously seen citizens.
- Add more body-class document variants without adding stereotypes.

## Fiction Notice

This work is set in a fictional state, The Directorate. It does not depict or target any real country, ethnic group, religion, political party, leader, or real-world political symbol.
