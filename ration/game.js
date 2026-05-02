/* global RATION_DATA */

const STORAGE_KEY = "theRationOfficeProgress";
const RUN_STORAGE_KEY = "theRationOfficeCurrentRun";
const RUN_STORAGE_VERSION = 1;
const SHARE_URL = "https://play.stompy.jp/ration/";
const DANGER_LIMITS = {
  low: 25,
  high: 75
};
const ACTION_REVEAL_MS = 560;
const SHIFT_REPORT_IMAGES = {
  1: "assets/reports/shift-report-coffee.webp",
  2: "assets/reports/shift-report-district-review.webp",
  3: "assets/reports/shift-report-quota-notice.webp",
  4: "assets/reports/shift-report-cross-index.webp",
  5: "assets/reports/shift-report-first-audit.webp",
  6: "assets/reports/shift-report-shortage-week.webp",
  7: "assets/reports/shift-report-contradictions.webp",
  8: "assets/reports/shift-report-old-seals.webp",
  9: "assets/reports/shift-report-return-files.webp",
  10: "assets/reports/shift-report-final-classification.webp"
};

const ENDING_TUNING = {
  nearAuditRisk: 95,
  highUnrest: 94,
  emptyHomeGameOverFood: 0,
  lowFamilyFood: 34,
  teacherSongConscience: 40,
  quietMercyLostFiles: 2,
  quietMercyConscience: 36,
  familyFirstFood: 38,
  unrecordedLostFiles: 1,
  unrecordedAuditRisk: 95
};

const app = document.getElementById("app");
const screenFlash = document.getElementById("screenFlash");

let state;
let progress;
let audioContext = null;

const SUPPORTED_LANGUAGES = ["en", "ja", "fr", "de", "zh", "es", "pt", "ru", "ko"];

function getDefaultLanguage() {
  const candidates = [];

  if (typeof navigator !== "undefined") {
    if (Array.isArray(navigator.languages)) candidates.push(...navigator.languages);
    if (navigator.language) candidates.push(navigator.language);
    if (navigator.userLanguage) candidates.push(navigator.userLanguage);
  }

  for (const candidate of candidates) {
    const normalized = String(candidate || "").trim().toLowerCase().replace(/_/g, "-");
    if (!normalized) continue;
    if (SUPPORTED_LANGUAGES.includes(normalized)) return normalized;

    const base = normalized.split("-")[0];
    if (SUPPORTED_LANGUAGES.includes(base)) return base;
  }

  return "en";
}

function getLanguage() {
  const lang = progress && progress.settings ? progress.settings.lang : getDefaultLanguage();
  return SUPPORTED_LANGUAGES.includes(lang) ? lang : "en";
}

function getLanguageButtonLabel(lang) {
  const fallback = { en: "EN", ja: "JP", fr: "FR", de: "DE", zh: "中文", es: "ES", pt: "PT", ru: "RU", ko: "KO" };
  return ui(`languageNames.${lang}`, fallback[lang] || lang.toUpperCase());
}

function getLocale() {
  return (window.RATION_DATA && RATION_DATA.locales && RATION_DATA.locales[getLanguage()]) || {};
}

function interpolate(text, params = {}) {
  return String(text).replace(/\{(\w+)\}/g, (_, key) => params[key] !== undefined ? params[key] : "");
}

function localText(path, fallback, params = {}) {
  const value = String(path).split(".").reduce((node, key) => node && node[key], getLocale());
  if (value === undefined || value === null) {
    return typeof fallback === "string" ? interpolate(fallback, params) : fallback;
  }
  return typeof value === "string" ? interpolate(value, params) : value;
}

function ui(key, fallback = "", params = {}) {
  return localText(`ui.${key}`, fallback, params);
}

function translateText(text) {
  if (!text || getLanguage() === "en") return text || "";
  const map = buildRuntimeTextMap();
  if (map[text]) return map[text];

  return Object.keys(map)
    .filter(source => source && String(text).includes(source))
    .sort((a, b) => b.length - a.length)
    .reduce((output, source) => output.split(source).join(map[source]), String(text));
}

function buildRuntimeTextMap() {
  const locale = getLocale();
  const map = { ...(locale.textMap || {}) };
  ["jobs", "households", "requests", "documentTerms", "notes"].forEach(group => {
    Object.assign(map, locale[group] || {});
  });

  (RATION_DATA.shifts || []).forEach(shift => {
    const translatedShift = locale.shifts && locale.shifts[shift.id];
    if (!translatedShift) return;
    ["title", "headline", "deck", "startText", "endText"].forEach(key => {
      if (translatedShift[key]) map[shift[key]] = translatedShift[key];
    });
    (shift.directives || []).forEach((line, index) => {
      if (translatedShift.directives && translatedShift.directives[index]) {
        map[line] = translatedShift.directives[index];
      }
    });
  });

  Object.keys(RATION_DATA.resultLogs || {}).forEach(type => {
    const translated = locale.resultLogs && locale.resultLogs[type];
    if (!translated) return;
    RATION_DATA.resultLogs[type].forEach((line, index) => {
      if (translated[index]) map[line] = translated[index];
    });
  });

  (RATION_DATA.weekendEvents || []).forEach(event => {
    const translatedEvent = locale.weekendEvents && locale.weekendEvents[event.id];
    if (!translatedEvent) return;
    if (translatedEvent.title) map[event.title] = translatedEvent.title;
    if (translatedEvent.text) map[event.text] = translatedEvent.text;
    (event.options || []).forEach(option => {
      const translatedOption = translatedEvent.options && translatedEvent.options[option.id];
      if (!translatedOption) return;
      if (translatedOption.label) map[option.label] = translatedOption.label;
      if (translatedOption.result) map[option.result] = translatedOption.result;
    });
  });

  (RATION_DATA.finalAuditEvents || []).forEach(event => {
    const translated = locale.finalAuditEvents && locale.finalAuditEvents[event.id];
    if (translated) map[event.text] = translated;
  });

  (RATION_DATA.endings || []).forEach(ending => {
    const translated = locale.endings && locale.endings[ending.id];
    if (!translated) return;
    if (translated.title) map[ending.title] = translated.title;
    if (translated.bodyText) map[ending.bodyText] = translated.bodyText;
    if (translated.shareQuote) map[ending.shareQuote] = translated.shareQuote;
  });

  return map;
}

function shiftText(shift, key) {
  return localText(`shifts.${shift.id}.${key}`, shift[key]);
}

function shiftDirectives(shift) {
  return localText(`shifts.${shift.id}.directives`, shift.directives);
}

function weekendText(event, key) {
  return localText(`weekendEvents.${event.id}.${key}`, event[key]);
}

function weekendOptionText(event, option, key) {
  return localText(`weekendEvents.${event.id}.options.${option.id}.${key}`, option[key]);
}

function endingText(ending, key) {
  return localText(`endings.${ending.id}.${key}`, ending[key]);
}

function prologueText(key) {
  return localText(`prologue.${key}`, RATION_DATA.prologue[key]);
}

function localCitizenValue(key, value) {
  const locale = getLocale();
  if (value === undefined || value === null) return value;
  const source = String(value);

  if (key === "job" && locale.jobs && locale.jobs[source]) return locale.jobs[source];
  if ((key === "family" || key === "household") && locale.households && locale.households[source]) return locale.households[source];
  if (key === "request" && locale.requests && locale.requests[source]) return locale.requests[source];
  if (key === "request" && locale.requestTerms) {
    return Object.keys(locale.requestTerms)
      .sort((a, b) => b.length - a.length)
      .reduce((output, term) => output.split(term).join(locale.requestTerms[term]), source)
      .replace(/\sx(\d+)/g, "×$1")
      .replace(/,\s*/g, "、");
  }
  if (key === "note" && locale.notes && locale.notes[source]) return locale.notes[source];
  if (locale.documentTerms && locale.documentTerms[source]) return locale.documentTerms[source];
  if (locale.textMap && locale.textMap[source]) return locale.textMap[source];
  return translateText(source);
}

function localStamp(stamp) {
  return localText(`ui.stamps.${stamp}`, stamp);
}

document.addEventListener("DOMContentLoaded", initGame);

function createInitialState() {
  return {
    phase: "intro",
    currentShift: 1,
    currentCitizenIndex: 0,
    stats: {
      stateTrust: 62,
      unrest: 28,
      familyFood: 54,
      conscience: 58,
      auditRisk: 20,
      rationStock: 0
    },
    runStats: {
      approved: 0,
      denied: 0,
      reported: 0,
      lostFiles: 0,
      quotaMisses: 0,
      citizensProcessed: 0,
      falseReports: 0,
      vulnerableReports: 0,
      directiveViolations: 0,
      survivedShift: 0
    },
    currentShiftStats: freshShiftStats(),
    flags: {},
    helpedCitizens: [],
    harmedCitizens: [],
    history: [],
    pendingStamp: "",
    inputLocked: false,
    directiveOpen: false,
    weekendEvent: null,
    weekendResolved: false,
    weekendResult: "",
    finalAuditNotes: [],
    lastEnding: null,
    coverReturnPhase: "",
    previewMode: false
  };
}

function freshShiftStats() {
  return {
    approved: 0,
    denied: 0,
    reported: 0,
    lostFiles: 0,
    falseReports: 0,
    vulnerableReports: 0,
    directiveViolations: 0,
    processed: 0
  };
}

function initGame() {
  progress = loadProgress();
  state = createPreviewStateFromUrl() || loadRunState() || createInitialState();
  render();
}

function createPreviewStateFromUrl() {
  const params = getPreviewParams();
  const directReport = getPreviewParam(params, "report", "shiftReport", "dayEnd");
  const directEnding = getPreviewParam(params, "ending", "endingId");
  const hasReportShortcut = hasPreviewParam(params, "report", "shiftReport", "dayEnd");
  const hasEndingShortcut = hasPreviewParam(params, "ending", "endingId");
  const hasWeekendShortcut = hasPreviewParam(params, "weekend", "home");
  const view = normalizePreviewView(getPreviewParam(params, "view", "screen", "preview") || (hasReportShortcut ? "report" : "") || (hasEndingShortcut ? "ending" : "") || (hasWeekendShortcut ? "weekend" : ""));

  if (!view) return null;

  const previewState = createInitialState();
  previewState.previewMode = true;
  previewState.history = [];

  if (view === "report") {
    const shiftId = getPreviewShiftId(directReport || getPreviewParam(params, "shift", "day", "id"));
    const shift = RATION_DATA.shifts.find(item => item.id === shiftId) || RATION_DATA.shifts[0];
    previewState.phase = "shiftReport";
    previewState.currentShift = shift.id;
    previewState.currentShiftStats = createPreviewShiftStats(shift);
    previewState.runStats.survivedShift = shift.id;
    previewState.runStats.citizensProcessed = previewState.currentShiftStats.processed;
    previewState.runStats.approved = previewState.currentShiftStats.approved;
    previewState.runStats.denied = previewState.currentShiftStats.denied;
    previewState.runStats.reported = previewState.currentShiftStats.reported;
    previewState.stats.rationStock = shift.rationStock;
    return previewState;
  }

  if (view === "weekend") {
    const eventId = getPreviewParam(params, "event", "id", "weekend", "home");
    const event = getPreviewWeekendEvent(eventId);
    previewState.phase = "weekend";
    previewState.currentShift = Math.min(5, RATION_DATA.campaignConfig.totalShifts);
    previewState.weekendEvent = event;
    previewState.weekendResolved = ["1", "true"].includes(getPreviewParam(params, "resolved").toLowerCase());
    previewState.weekendResult = previewState.weekendResolved && event && event.options[0] ? event.options[0].result : "";
    previewState.runStats.survivedShift = 5;
    previewState.stats.rationStock = getShiftById(5).rationStock;
    return previewState;
  }

  if (view === "ending") {
    const ending = getPreviewEnding(directEnding || getPreviewParam(params, "id"));
    previewState.phase = "ending";
    previewState.currentShift = RATION_DATA.campaignConfig.totalShifts;
    previewState.lastEnding = ending;
    previewState.runStats = {
      ...previewState.runStats,
      survivedShift: RATION_DATA.campaignConfig.totalShifts,
      citizensProcessed: RATION_DATA.shifts.reduce((sum, shift) => sum + shift.citizenIds.length, 0),
      approved: 24,
      denied: 18,
      reported: 12,
      lostFiles: 3
    };
    previewState.stats.rationStock = getShiftById(previewState.currentShift).rationStock;
    return previewState;
  }

  return null;
}

function getPreviewParams() {
  const params = new URLSearchParams(window.location.search || "");
  const hash = window.location.hash || "";

  if (hash) {
    const hashQuery = hash.includes("?") ? hash.slice(hash.indexOf("?") + 1) : hash.replace(/^#/, "");
    appendPreviewParams(params, hashQuery);
  }

  return params;
}

function appendPreviewParams(params, query) {
  const source = String(query || "").trim().replace(/^[?#]/, "");
  if (!source || !source.includes("=")) return;

  new URLSearchParams(source).forEach((value, key) => {
    if (!hasPreviewParam(params, key)) params.append(key, value);
  });
}

function getPreviewParam(params, ...names) {
  const wanted = names.map(name => String(name).toLowerCase());
  for (const [key, value] of params.entries()) {
    if (wanted.includes(String(key).toLowerCase())) return cleanPreviewParamValue(value);
  }
  return "";
}

function hasPreviewParam(params, ...names) {
  const wanted = names.map(name => String(name).toLowerCase());
  for (const [key] of params.entries()) {
    if (wanted.includes(String(key).toLowerCase())) return true;
  }
  return false;
}

function cleanPreviewParamValue(value) {
  return String(value || "").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
}

function normalizePreviewView(value) {
  const view = cleanPreviewParamValue(value).toLowerCase().replace(/[_\s\u3000]+/g, "-");
  if (["report", "shift-report", "shiftreport", "day-end", "dayend", "end-of-day"].includes(view)) return "report";
  if (["weekend", "home", "weekend-home", "weekend-at-home"].includes(view)) return "weekend";
  if (["ending", "end", "final"].includes(view)) return "ending";
  return "";
}

function getPreviewShiftId(value) {
  const total = RATION_DATA.campaignConfig.totalShifts;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 1;
  return clamp(parsed, 1, total);
}

function getPreviewEnding(value) {
  const rawValue = String(value || "").trim();
  const endings = RATION_DATA.endings || [];

  if (/^\d+$/.test(rawValue)) {
    const index = clamp(Number.parseInt(rawValue, 10), 1, endings.length) - 1;
    return endings[index] || endings[0];
  }

  return endings.find(ending => ending.id === rawValue) || endings[0];
}

function getPreviewWeekendEvent(value) {
  const rawValue = cleanPreviewParamValue(value);
  const events = RATION_DATA.weekendEvents || [];
  const defaultEvent = events.find(event => event.trigger === "default") || events[0];

  if (/^\d+$/.test(rawValue)) {
    const index = clamp(Number.parseInt(rawValue, 10), 1, events.length) - 1;
    return events[index] || defaultEvent;
  }

  return events.find(event => event.id === rawValue) || defaultEvent;
}

function getShiftById(id) {
  return RATION_DATA.shifts.find(shift => shift.id === id) || RATION_DATA.shifts[0];
}

function createPreviewShiftStats(shift) {
  const processed = shift.citizenIds.length;
  const reported = shift.reportQuota || 0;
  const denied = Math.min(shift.id >= 6 ? 3 : 2, Math.max(0, processed - reported - 2));
  const approved = Math.max(0, processed - denied - reported);

  return {
    approved,
    denied,
    reported,
    lostFiles: 0,
    falseReports: 0,
    vulnerableReports: 0,
    directiveViolations: 0,
    processed
  };
}

function startNewRun() {
  const soundOn = getSoundOn();
  state = createInitialState();
  state.phase = "prologue";
  state.stats.rationStock = getCurrentShift().rationStock;
  saveProgress({
    totalRuns: progress.totalRuns + 1,
    tutorialSeen: true,
    settings: { ...progress.settings, soundOn }
  });
  playSound("day");
  render();
}

function startFirstShift() {
  if (state.phase !== "prologue") return;
  state.phase = "shift";
  state.stats.rationStock = getCurrentShift().rationStock;
  addSystemLog(getCurrentShift().startText, "Term begins");
  playSound("day");
  render();
}

function render() {
  if (!app) return;
  saveRunState();
  const lang = getLanguage();
  document.documentElement.lang = lang;

  app.innerHTML = `
    <section class="phone-frame phase-${state.phase} lang-${lang}">
      ${state.phase === "intro" ? "" : renderHeader()}
      ${state.phase === "intro" ? "" : renderTimeline()}
      ${state.phase === "intro" ? renderIntro() : ""}
      ${state.phase === "prologue" ? renderPrologue() : ""}
      ${state.phase === "shift" ? renderShift() : ""}
      ${state.phase === "shiftReport" ? renderShiftReport() : ""}
      ${state.phase === "weekend" ? renderWeekend() : ""}
      ${state.phase === "finalAudit" ? renderFinalAudit() : ""}
      ${state.phase === "ending" ? renderEnding() : ""}
    </section>
  `;

  bindControls();
}

function renderHeader() {
  const title = RATION_DATA.campaignConfig.title;

  return `
    <header class="top-header">
      <div class="banner-mark" aria-hidden="true">
        <span class="mark-eye"></span>
        <span class="mark-wheat"></span>
      </div>
      <button class="title-block title-button" type="button" data-action="open-cover" aria-label="${ui("openCover", "Open cover page")}">
        <p class="overline">THE</p>
        <h1>${title.replace("THE ", "")}</h1>
      </button>
      <div class="header-window-badge" aria-hidden="true">
        <span>WINDOW</span>
        <strong>12</strong>
      </div>
    </header>
  `;
}

function renderLanguageTabs() {
  const current = getLanguage();

  return `
    <div class="language-tabs" role="tablist" aria-label="${ui("languageSelector", ui("toggleLanguage", "Language"))}">
      ${SUPPORTED_LANGUAGES.map(lang => {
        const selected = lang === current;
        return `
          <button
            class="language-tab ${selected ? "selected" : ""}"
            type="button"
            role="tab"
            data-language="${lang}"
            aria-selected="${selected ? "true" : "false"}"
            tabindex="${selected ? "0" : "-1"}"
          >${getLanguageButtonLabel(lang)}</button>
        `;
      }).join("")}
    </div>
  `;
}

function renderTimeline() {
  const items = [
    { label: ui("timelineM1", "M"), shift: 1 },
    { label: ui("timelineT1", "T"), shift: 2 },
    { label: ui("timelineW1", "W"), shift: 3 },
    { label: ui("timelineT2", "T"), shift: 4 },
    { label: ui("timelineF1", "F"), shift: 5 },
    { label: ui("timelineHome", "HOME"), home: true },
    { label: ui("timelineM2", "M"), shift: 6 },
    { label: ui("timelineT3", "T"), shift: 7 },
    { label: ui("timelineW2", "W"), shift: 8 },
    { label: ui("timelineT4", "T"), shift: 9 },
    { label: ui("timelineF2", "F"), shift: 10 }
  ];

  return `
    <nav class="campaign-timeline" aria-label="${ui("campaignTimeline", "Campaign timeline")}">
      ${items.map(item => {
        const active = item.home ? state.phase === "weekend" : state.currentShift === item.shift && state.phase !== "weekend";
        const done = item.shift ? item.shift < state.currentShift : state.currentShift > 5;
        return `<span class="${active ? "active" : ""} ${done ? "done" : ""}">${item.label}</span>`;
      }).join("")}
    </nav>
  `;
}

function renderIntro() {
  const opening = RATION_DATA.opening;
  const returning = progress.tutorialSeen;
  const canResume = canResumeFromCover();
  const openingTitle = localText("opening.title", opening.title);
  const slogans = localText("opening.slogans", opening.slogans);
  const description = localText("opening.description", opening.description || []);
  const body = localText("opening.body", opening.body);
  const title = RATION_DATA.campaignConfig.title;
  const subtitle = ui("subtitle", RATION_DATA.campaignConfig.subtitle);
  const coverTitle = returning || canResume ? ui("windowReopens", "WINDOW 12 REOPENS") : openingTitle;
  const tutorial = ui("tutorial", [
    "Read today's directives.",
    "Inspect each citizen's file.",
    "Approve, deny, report, or lose the file."
  ]);

  return `
    <section class="opening-poster" aria-label="${title}">
      <h1 class="sr-only">${title}</h1>
      <p class="sr-only">${subtitle}</p>
      <figure class="cover-art" aria-hidden="true">
        <img src="assets/cover/title-cover-wide.webp" alt="">
        <figcaption class="cover-title-lockup">
          <p>THE</p>
          <strong>RATION<br>OFFICE</strong>
          <span>${subtitle}</span>
        </figcaption>
      </figure>
      <section class="cover-game-summary" aria-label="${ui("gameSummary", "Game summary")}">
        ${description.map(line => `<p>${line}</p>`).join("")}
      </section>
      ${renderTimeline()}
      <section class="cover-term-panel" aria-label="${ui("currentTerm", "Current term")}">
        <h2>${coverTitle}</h2>
        <p class="poster-slogan">${slogans[progress.totalRuns % slogans.length]}</p>
        <div class="poster-lines">
          ${body.map(line => `<p>${line}</p>`).join("")}
          <ol class="briefing-list">
            ${tutorial.map(line => `<li>${line}</li>`).join("")}
          </ol>
        </div>
      </section>
      <div class="cover-actions">
        ${canResume ? `
          <button class="primary-button" type="button" data-action="resume-cover">
            <span class="cover-button-mark" aria-hidden="true"></span>
            <span><strong>${ui("resumeShift", "RETURN TO SHIFT")}</strong></span>
            <span class="cover-button-arrow" aria-hidden="true">›</span>
          </button>
        ` : `
          <button class="primary-button" type="button" data-action="begin">
            <span class="cover-button-mark" aria-hidden="true"></span>
            <span><strong>${ui("coverBeginShift", "BEGIN SHIFT")}</strong></span>
            <span class="cover-button-arrow" aria-hidden="true">›</span>
          </button>
        `}
        ${canResume ? `
          <button class="secondary-button" type="button" data-action="begin">
            <span class="cover-folder-mark" aria-hidden="true"></span>
            <span><strong>${ui("coverNewTerm", "START NEW TERM")}</strong></span>
            <span class="cover-button-arrow" aria-hidden="true">›</span>
          </button>
        ` : ""}
      </div>
      ${renderUnlockedEndingList()}
      <div class="cover-footer-controls" aria-label="${ui("coverControls", "Cover controls")}">
        ${renderLanguageTabs()}
        <button class="icon-button sound-toggle" type="button" aria-label="${ui("toggleSound", "Toggle sound")}">${getSoundOn() ? ui("soundOn", "VOL") : ui("soundOff", "MUTE")}</button>
      </div>
    </section>
  `;
}

function renderUnlockedEndingList() {
  const ids = Array.isArray(progress.unlockedEndings) ? progress.unlockedEndings : [];
  const unlocked = new Set(ids);
  if (ids.length === 0) {
    return "";
  }

  return `
    <section class="cover-ending-list" aria-label="${ui("recordsEndings", "Records and endings")}">
      <h3>${ui("recordsEndings", "Records & Endings")}</h3>
      <ol>
        ${RATION_DATA.endings.map(ending => `
          <li class="${unlocked.has(ending.id) ? "unlocked" : "locked"}">
            ${unlocked.has(ending.id) ? endingText(ending, "title") : ui("lockedEnding", "???")}
          </li>
        `).join("")}
      </ol>
    </section>
  `;
}

function renderPrologue() {
  const prologue = RATION_DATA.prologue;
  const body = prologueText("body");

  return `
    <section class="paper-panel prologue-panel">
      <div class="stamp-label">${prologueText("kicker")}</div>
      <h2>${prologueText("title")}</h2>
      <figure class="prologue-illustration">
        <picture>
          <source srcset="${prologue.imageWebp}" type="image/webp">
          <img src="${prologue.image}" alt="${prologueText("imageAlt")}">
        </picture>
      </figure>
      <div class="prologue-copy">
        ${body.map(line => `<p>${line}</p>`).join("")}
      </div>
      <button class="primary-button" type="button" data-action="begin-shift-1">${ui("beginShift1", "BEGIN SHIFT 1")}</button>
    </section>
  `;
}

function renderShift() {
  const shift = getCurrentShift();

  return `
    ${renderNewspaper(shift, ui("morningEdition", "MORNING EDITION"), "morning")}
    ${renderDirectiveBrief(shift)}
    ${renderHud()}
    ${renderCitizenCard()}
    ${renderActionButtons()}
    ${renderLog()}
    ${state.directiveOpen ? renderDirectiveOverlay(shift) : ""}
  `;
}

function renderNewspaper(shift, label = "MORNING EDITION", edition = "morning") {
  const headlineKey = edition === "evening" ? "eveningHeadline" : "headline";

  return `
    <section class="newspaper-strip">
      <div class="newspaper-label">${label}</div>
      <div>
        <h2>${shiftText(shift, headlineKey)}</h2>
      </div>
    </section>
  `;
}

function renderHud() {
  const rows = [
    ["trust", ui("hud.trust", "TRUST"), ui("stats.stateTrust", "State Trust"), state.stats.stateTrust, 100, false],
    ["unrest", ui("hud.unrest", "UNREST"), ui("stats.unrest", "Unrest"), state.stats.unrest, 100, true],
    ["food", ui("hud.food", "FOOD"), ui("stats.familyFood", "Family Food"), state.stats.familyFood, 100, false],
    ["conscience", ui("hud.mind", "MIND"), ui("stats.conscience", "Conscience"), state.stats.conscience, 100, false],
    ["audit", ui("hud.audit", "AUDIT"), ui("stats.auditRisk", "Audit Risk"), state.stats.auditRisk, 100, true],
    ["stock", ui("hud.stock", "STOCK"), ui("stats.rationStock", "Ration Stock"), state.stats.rationStock, Math.max(getCurrentShift().rationStock, state.stats.rationStock, 1), false]
  ];

  return `
    <section class="hud-grid" aria-label="${ui("status", "Status")}">
      ${rows.map(([key, shortLabel, label, value, max, reverse]) => {
        const width = clamp((value / max) * 100, 0, 100);
        const danger = reverse ? value >= DANGER_LIMITS.high : value <= DANGER_LIMITS.low;
        return `
          <article class="hud-item ${danger ? "danger" : ""}" aria-label="${label}: ${value} out of ${max}">
            <div class="hud-label"><span class="hud-icon hud-${key}" aria-hidden="true"></span><span class="hud-label-text" title="${label}">${shortLabel}</span></div>
            <div class="hud-value"><strong>${value}</strong><span>/${max}</span></div>
            <div class="meter" aria-hidden="true"><span class="meter-${key}" style="width:${width}%"></span></div>
          </article>
        `;
      }).join("")}
    </section>
  `;
}

function renderDirectiveBrief(shift) {
  const tags = getDirectiveBriefTags(shift);

  return `
    <section class="directive-brief" aria-label="${ui("directiveBriefTitle", "DIRECTIVE BRIEF")}">
      <div class="directive-brief-copy">
        <span>${ui("directiveBriefTitle", "DIRECTIVE BRIEF")}</span>
        <div class="directive-chips">
          ${tags.map(tag => `<b>${tag}</b>`).join("")}
        </div>
      </div>
      <button class="directive-view-button" type="button" data-action="open-directives" ${state.inputLocked ? "disabled" : ""}>${ui("viewDirectives", "VIEW")}</button>
    </section>
  `;
}

function renderDirectiveOverlay(shift) {
  return `
    <section class="directive-overlay" role="dialog" aria-modal="true" aria-label="${ui("directivesDialog", "Today's directives")}">
      <div class="directive-sheet">
        <div class="stamp-label">${ui("directivesTitle", "TODAY'S DIRECTIVES")}</div>
        <h2>${ui("shiftWord", "SHIFT")} ${shift.id}: ${shiftText(shift, "title")}</h2>
        <p>${shiftText(shift, "deck")}</p>
        <ul>
          ${shiftDirectives(shift).map(line => `<li>${line}</li>`).join("")}
        </ul>
        <button class="primary-button directive-close-button" type="button" data-action="close-directives">${ui("closeDirectives", "CLOSE")}</button>
      </div>
    </section>
  `;
}

function getDirectiveBriefTags(shift) {
  const labels = {
    quota: count => ui("directiveTags.quota", `QUOTA ${count}`, { count }),
    valid_ration_books: ui("directiveTags.validBooks", "VALID BOOKS"),
    essential_workers_priority: ui("directiveTags.essentialPriority", "ESSENTIAL PRIORITY"),
    body_permit_discrepancy_note: ui("directiveTags.bodyPermit", "BODY PERMIT"),
    district3_extra_review: ui("directiveTags.d3Review", "D3 REVIEW"),
    expired_body_permit_penalty: ui("directiveTags.expiredPermit", "EXPIRED PERMIT"),
    unclear_loyalty_report: ui("directiveTags.unclearReport", "UNCLEAR: REPORT"),
    horn_registration_check: ui("directiveTags.hornCheck", "HORN CHECK"),
    scaled_heat_token_requires_scale_inspection: ui("directiveTags.heatScaleSeal", "HEAT: SCALE SEAL"),
    teachers_milk_review: ui("directiveTags.teacherMilk", "TEACHER MILK"),
    avian_flight_suspended: ui("directiveTags.flightSuspended", "FLIGHT SUSPENDED"),
    missing_body_records_audit: ui("directiveTags.bodyAudit", "BODY AUDIT"),
    ration_shortage: ui("directiveTags.lowStock", "LOW STOCK"),
    amphibian_moisture_requires_clinic_seal: ui("directiveTags.moistureSeal", "MOISTURE SEAL"),
    workers_dependents_priority: ui("directiveTags.workerDependents", "WORKER DEPENDENTS"),
    teachers_no_milk: ui("directiveTags.noTeacherMilk", "NO TEACHER MILK"),
    essential_children_priority: ui("directiveTags.essentialChildren", "ESSENTIAL CHILDREN"),
    conflicting_cases_record: ui("directiveTags.conflictRecord", "CONFLICT: RECORD"),
    mothkin_lamp_oil_requires_night_permit: ui("directiveTags.lampPermit", "LAMP PERMIT"),
    old_district_seal_review: ui("directiveTags.oldSeal", "OLD SEAL"),
    secret_request_crackdown: ui("directiveTags.secretRecord", "SECRET: RECORD"),
    previous_file_losses_audit: ui("directiveTags.lostFileAudit", "LOST FILE AUDIT"),
    families_reported_notation: ui("directiveTags.reportedFamily", "REPORTED FAMILY"),
    additional_heat_suspended: ui("directiveTags.heatSuspended", "HEAT SUSPENDED"),
    unresolved_classification_seal: ui("directiveTags.sealClass", "SEAL CLASS")
  };

  const tags = [];
  if (shift.reportQuota > 0) tags.push(labels.quota(shift.reportQuota));
  shift.ruleTags.forEach(tag => {
    if (tag === "report_quota" || tag === "first_audit" || tag === "final_vigilance") return;
    if (labels[tag]) tags.push(labels[tag]);
  });

  return tags.slice(0, 3);
}

function renderCitizenCard() {
  const citizen = getCurrentCitizen();
  if (!citizen) return "";

  const stampClass = state.pendingStamp.toLowerCase().replace(/\s+/g, "-");
  const storyEcho = state.inputLocked ? "" : getStoryEcho(citizen);
  const warnings = getWarnings(citizen);

  return `
    <section class="dossier-stack">
      <article class="citizen-card">
        ${state.pendingStamp ? `<div class="action-stamp stamp-${stampClass}">${localStamp(state.pendingStamp)}</div>` : ""}
        <div class="dossier-top">
          <h2>${citizen.name.toUpperCase()}</h2>
        </div>
        ${renderCitizenStatement(citizen)}
        <div class="citizen-layout">
          <div class="portrait ${citizen.portraitImage ? "has-image" : ""} kind-${citizen.kind}" aria-hidden="true">
            ${citizen.portraitImage ? `<img class="portrait-image" src="${citizen.portraitImage}" alt="">` : `
              <div class="portrait-head"></div>
              <div class="portrait-body"></div>
            `}
            <div class="portrait-lines"></div>
          </div>
          <dl class="citizen-fields">
            ${field(ui("fields.kind", "Kind"), getKindLabel(citizen))}
            ${field(ui("fields.age", "Age"), citizen.age)}
            ${field(ui("fields.job", "Job"), localCitizenValue("job", citizen.job))}
            ${field(ui("fields.district", "District"), citizen.district)}
            ${field(ui("fields.family", "Household"), localCitizenValue("family", getHousehold(citizen)))}
            ${field(ui("fields.request", "Request"), localCitizenValue("request", citizen.request))}
            ${field(ui("fields.rationBook", "Ration Book"), localCitizenValue("rationBook", citizen.rationBook))}
            ${field(ui("fields.bodyPermit", "Body Permit"), localCitizenValue("bodyPermit", citizen.bodyPermit))}
            ${field(localCitizenValue("documentLabel", getKindDocumentLabel(citizen)), localCitizenValue("documentStatus", getKindDocumentStatus(citizen)))}
            ${field(ui("fields.loyaltyRecord", "Loyalty Record"), localCitizenValue("loyaltyRecord", citizen.loyaltyRecord))}
            ${field(ui("fields.note", "Note"), localCitizenValue("note", citizen.note))}
          </dl>
        </div>
        ${storyEcho ? `<p class="story-echo">${translateText(storyEcho)}</p>` : ""}
        ${warnings.length ? `<div class="review-tags">${warnings.map(warn => `<span>${warn}</span>`).join("")}</div>` : ""}
      </article>
    </section>
  `;
}

function getCitizenStatement(citizen) {
  const statement = citizen.statement;
  if (!statement) return "";
  if (typeof statement === "string") return translateText(statement);
  return statement[getLanguage()] || statement.en || statement.ja || "";
}

function renderCitizenStatement(citizen) {
  const statement = getCitizenStatement(citizen);
  if (!statement) return "";

  return `
    <aside class="window-statement">
      <span>${ui("fields.statement", "Window Statement")}</span>
      <p>${statement}</p>
    </aside>
  `;
}

function field(label, value) {
  return `<div><dt>${label}</dt><dd>${value}</dd></div>`;
}

function getKindLabel(citizen) {
  const kind = RATION_DATA.citizenKinds && RATION_DATA.citizenKinds[citizen.kind];
  const label = kind ? kind.label : (citizen.bodyClass || citizen.kind || "Unfiled");
  return localText(`kindLabels.${citizen.kind}`, label);
}

function getKindDocumentLabel(citizen) {
  return citizen.kindDocument && citizen.kindDocument.label ? citizen.kindDocument.label : "Body Document";
}

function getKindDocumentStatus(citizen) {
  return citizen.kindDocument && citizen.kindDocument.status ? citizen.kindDocument.status : "Not Filed";
}

function getHousehold(citizen) {
  return citizen.household || citizen.family || "Unlisted";
}

function renderActionButtons() {
  const actions = [
    ["approve", ui("actions.approve", "APPROVE"), ui("actionAria.approve", "Approve ration")],
    ["deny", ui("actions.deny", "DENY"), ui("actionAria.deny", "Deny request")],
    ["report", ui("actions.report", "REPORT"), ui("actionAria.report", "Report citizen")],
    ["lose", ui("actions.lose", "LOSE FILE"), ui("actionAria.lose", "Lose file")]
  ];
  const locked = state.inputLocked ? "disabled aria-disabled=\"true\"" : "";

  return `
    <section class="action-grid" aria-label="${ui("citizenActions", "Citizen actions")}">
      ${actions.map(([type, label, aria]) => `
        <button class="action-button action-${type}" type="button" data-action-type="${type}" aria-label="${aria}" ${locked}>
          <span class="action-icon icon-${type}" aria-hidden="true"></span>
          <strong>${label}</strong>
        </button>
      `).join("")}
    </section>
  `;
}

function renderLog() {
  const shiftId = Math.min(state.currentShift, RATION_DATA.campaignConfig.totalShifts);
  const entries = state.history
    .filter(entry => entry.shift === shiftId)
    .slice(0, 1);

  return `
    <section class="log-panel">
      <div class="log-head">
        <span>${ui("officeLog", "OFFICE LOG")}</span>
      </div>
      <ol>
        ${entries.map(entry => `
          <li class="log-entry log-${entry.action}">
            <span class="log-day">${ui("shiftWord", "SHIFT")} ${entry.shift}</span>
            <p>${translateText(entry.text)}</p>
            <small>${translateText(entry.deltaText)}</small>
          </li>
        `).join("") || `<li class="log-entry"><p>${ui("noEntries", "No entries. The stamp waits.")}</p></li>`}
      </ol>
    </section>
  `;
}

function renderShiftReport() {
  const shift = getCurrentShift();
  const quota = shift.reportQuota;
  const quotaMet = quota === 0 || state.currentShiftStats.reported >= quota;
  const nextLabel = shift.id === 5 ? ui("goHome", "GO HOME") : ui("nextShift", "NEXT SHIFT");
  const reportImage = SHIFT_REPORT_IMAGES[shift.id];

  return `
    ${renderNewspaper(shift, ui("eveningEdition", "EVENING EDITION"), "evening")}
    ${renderHud()}
    <section class="paper-panel report-panel">
      <div class="stamp-label">${ui("shiftReport", "SHIFT REPORT")}</div>
      <h2>${ui("shiftClosed", `SHIFT ${shift.id} CLOSED`, { shift: shift.id })}</h2>
      ${reportImage ? `
        <figure class="report-illustration">
          <img src="${reportImage}" alt="${ui("shiftReportImageAlt", "Shift report illustration")}">
        </figure>
      ` : ""}
      <p class="report-intro">${shiftText(shift, "endText")}</p>
      <dl class="report-grid">
        ${field(ui("fields.processed", "Processed"), state.currentShiftStats.processed)}
        ${field(ui("fields.approved", "Approved"), state.currentShiftStats.approved)}
        ${field(ui("fields.denied", "Denied"), state.currentShiftStats.denied)}
        ${field(ui("fields.reported", "Reported"), state.currentShiftStats.reported)}
        ${field(ui("fields.lostFiles", "Lost Files"), state.currentShiftStats.lostFiles)}
        ${field(ui("fields.reportQuota", "Report Quota"), quota ? `${state.currentShiftStats.reported}/${quota} ${quotaMet ? ui("met", "MET") : ui("missed", "MISSED")}` : ui("noneValue", "NONE"))}
      </dl>
      <blockquote>${translateText(getShiftEvaluation(quotaMet))}</blockquote>
      ${renderShiftMemos()}
      <button class="primary-button" type="button" data-action="${shift.id === 5 ? "weekend" : "next-shift"}">${nextLabel}</button>
    </section>
    ${renderLog()}
  `;
}

function renderShiftMemos() {
  const memos = getShiftMemos();
  if (!memos.length) return "";

  return `
    <section class="margin-memos" aria-label="${ui("marginMemos", "Margin notes")}">
      <span>${ui("marginMemos", "MARGIN NOTES")}</span>
      <ul>
        ${memos.map(memo => `<li class="memo-${memo.type}">${translateText(memo.text)}</li>`).join("")}
      </ul>
    </section>
  `;
}

function renderWeekend() {
  const event = state.weekendEvent;
  const sceneImage = event && event.image;

  return `
    ${renderHud()}
    <section class="paper-panel weekend-panel">
      <div class="stamp-label">${ui("weekendAtHome", "WEEKEND AT HOME")}</div>
      ${sceneImage ? `
        <figure class="home-scene" aria-hidden="true">
          <img src="${sceneImage}" alt="">
        </figure>
      ` : ""}
      <h2>${weekendText(event, "title")}</h2>
      <p>${weekendText(event, "text")}</p>
      ${state.weekendResolved ? `
        <blockquote class="night-notice">${translateText(state.weekendResult)}</blockquote>
        <button class="primary-button" type="button" data-action="begin-week-2">${ui("beginWeek2", "BEGIN WEEK 2")}</button>
      ` : `
        <div class="weekend-options">
          ${event.options.map(option => `
            <button class="secondary-button weekend-choice" type="button" data-weekend-option="${option.id}">
              <strong>${weekendOptionText(event, option, "label")}</strong>
              <span>${translateText(formatChanges(option.changes))}</span>
            </button>
          `).join("")}
        </div>
      `}
    </section>
  `;
}

function renderFinalAudit() {
  return `
    ${renderHud()}
    <section class="paper-panel audit-panel">
      <div class="stamp-label">${ui("finalAudit", "FINAL AUDIT")}</div>
      <h2>${ui("recordComplete", "THE RECORD IS COMPLETE")}</h2>
      <p class="audit-voice">${ui("auditorVoice", "The auditor does not sit. The auditor reads.")}</p>
      <ol class="audit-list">
        ${state.finalAuditNotes.map(note => `<li>${translateText(note)}</li>`).join("")}
      </ol>
      <dl class="report-grid">
        ${field(ui("stats.stateTrust", "State Trust"), state.stats.stateTrust)}
        ${field(ui("stats.unrest", "Unrest"), state.stats.unrest)}
        ${field(ui("stats.familyFood", "Family Food"), state.stats.familyFood)}
        ${field(ui("stats.conscience", "Conscience"), state.stats.conscience)}
        ${field(ui("stats.auditRisk", "Audit Risk"), state.stats.auditRisk)}
        ${field(ui("fields.processed", "Processed"), state.runStats.citizensProcessed)}
      </dl>
      <blockquote>${ui("auditQuote", "The record is complete. Completion is not innocence.")}</blockquote>
      <button class="primary-button" type="button" data-action="seal-file">${ui("sealFile", "SEAL THE FILE")}</button>
    </section>
  `;
}

function renderEnding() {
  const ending = state.lastEnding;

  return `
    <section class="paper-panel ending-panel">
      <div class="stamp-label">${ui("finalRecord", "FINAL RECORD")}</div>
      <h2>${endingText(ending, "title")}</h2>
      ${ending.image ? `
        <figure class="ending-illustration">
          <img src="${ending.image}" alt="${ui("endingImageAlt", "Ending illustration")}">
        </figure>
      ` : ""}
      <p class="ending-quote">"${endingText(ending, "shareQuote")}"</p>
      <p>${endingText(ending, "bodyText")}</p>
      <dl class="report-grid">
        ${field(ui("fields.reachedShift", "Reached Shift"), state.runStats.survivedShift)}
        ${field(ui("fields.processed", "Processed"), state.runStats.citizensProcessed)}
        ${field(ui("fields.approved", "Approved"), state.runStats.approved)}
        ${field(ui("fields.denied", "Denied"), state.runStats.denied)}
        ${field(ui("fields.reported", "Reported"), state.runStats.reported)}
        ${field(ui("fields.lostFiles", "Lost Files"), state.runStats.lostFiles)}
      </dl>
      <div class="ending-actions">
        <button class="primary-button" type="button" data-action="share">${ui("share", "SHARE")}</button>
        <button class="secondary-button" type="button" data-action="begin">${ui("newRun", "NEW RUN")}</button>
      </div>
    </section>
  `;
}

function bindControls() {
  document.querySelectorAll("[data-action-type]").forEach(button => {
    button.addEventListener("click", () => handleAction(button.dataset.actionType));
  });

  document.querySelectorAll("[data-action]").forEach(button => {
    const action = button.dataset.action;
    if (action === "begin") button.addEventListener("click", startNewRun);
    if (action === "begin-shift-1") button.addEventListener("click", startFirstShift);
    if (action === "next-shift") button.addEventListener("click", startNextShift);
    if (action === "weekend") button.addEventListener("click", startWeekend);
    if (action === "begin-week-2") button.addEventListener("click", startNextShift);
    if (action === "seal-file") button.addEventListener("click", () => finishRun(determineEnding()));
    if (action === "share") button.addEventListener("click", shareResult);
    if (action === "open-directives") button.addEventListener("click", openDirectives);
    if (action === "close-directives") button.addEventListener("click", closeDirectives);
    if (action === "open-cover") button.addEventListener("click", openCover);
    if (action === "resume-cover") button.addEventListener("click", resumeFromCover);
  });

  document.querySelectorAll("[data-language]").forEach(button => {
    button.addEventListener("click", () => setLanguage(button.dataset.language));
  });

  document.querySelectorAll("[data-weekend-option]").forEach(button => {
    button.addEventListener("click", () => chooseWeekendOption(button.dataset.weekendOption));
  });

  const soundButton = document.querySelector(".sound-toggle");
  if (soundButton) {
    soundButton.addEventListener("click", () => {
      const soundOn = !getSoundOn();
      saveProgress({ settings: { ...progress.settings, soundOn } });
      render();
    });
  }

}

function canResumeFromCover() {
  return state.phase === "intro" && Boolean(state.coverReturnPhase) && state.coverReturnPhase !== "ending";
}

function openCover() {
  if (state.phase === "intro" || state.inputLocked) return;
  state.coverReturnPhase = state.phase;
  state.phase = "intro";
  state.directiveOpen = false;
  render();
}

function resumeFromCover() {
  if (!canResumeFromCover()) return;
  state.phase = state.coverReturnPhase;
  state.coverReturnPhase = "";
  render();
}

function setLanguage(lang) {
  if (!SUPPORTED_LANGUAGES.includes(lang) || lang === getLanguage()) return;
  saveProgress({ settings: { ...progress.settings, lang } });
  render();
}

function openDirectives() {
  if (state.phase !== "shift" || state.inputLocked) return;
  state.directiveOpen = true;
  render();
}

function closeDirectives() {
  state.directiveOpen = false;
  render();
}

function handleAction(actionType) {
  if (state.phase !== "shift" || state.inputLocked || state.directiveOpen) return;

  const citizen = getCurrentCitizen();
  if (!citizen) return;

  const shift = getCurrentShift();
  const result = evaluateAction(citizen, actionType, shift, state);
  applyStatChanges(result.changes);
  recordAction(citizen, actionType, result);
  state.inputLocked = true;
  state.directiveOpen = false;
  showStamp(result.stamp);
  playSound(actionType === "report" || result.severity === "danger" ? "warning" : "stamp");

  setTimeout(() => endCurrentCitizen(), ACTION_REVEAL_MS);
}

function evaluateAction(citizen, actionType, currentShift, currentState) {
  const vulnerable = isVulnerable(citizen);
  const bodyEssential = isBodyEssential(citizen);
  const suspicious = isSuspicious(citizen, currentShift);
  const cost = getRationCost(citizen);
  const enoughStock = currentState.stats.rationStock >= cost;
  const randomish = citizen.id.length + currentShift.id + currentState.currentCitizenIndex;
  const result = {
    changes: {},
    text: "",
    deltaText: "",
    stamp: "",
    severity: "normal",
    directiveViolations: 0,
    falseReport: false,
    vulnerableReport: false,
    validReport: false
  };

  if (actionType === "approve") {
    // Dev balance note: APPROVE is merciful and lowers unrest, but it spends a
    // visible resource. Low stock, directive violations, and repeated approvals
    // turn compassion into an audit pattern.
    result.changes = {
      rationStock: -Math.min(cost, Math.max(cost, currentState.stats.rationStock)),
      unrest: -4 - (vulnerable ? 2 : 0) - (bodyEssential ? 1 : 0),
      conscience: 4 + (vulnerable ? 3 : 0) + (bodyEssential ? 2 : 0),
      familyFood: -1
    };
    if (!enoughStock) {
      result.changes.auditRisk = 12;
      result.changes.stateTrust = -8;
      result.severity = "danger";
    }
    result.text = pickLog("approve", randomish);
    result.stamp = "APPROVED";
  }

  if (actionType === "deny") {
    // Dev balance note: DENY protects stock and may satisfy the office, but
    // refusal turns quickly into unrest and moral damage, especially for
    // children, illness, and valid labor priority files.
    result.changes = {
      stateTrust: 1,
      unrest: 5 + (vulnerable ? 4 : 0) + (bodyEssential ? 1 : 0),
      conscience: (vulnerable ? -9 : -4) - (bodyEssential ? 3 : 0),
      familyFood: -1
    };
    result.text = pickLog("deny", randomish);
    result.stamp = "DENIED";
  }

  if (actionType === "report") {
    // Dev balance note: REPORT solves quotas and feeds the player's family, but
    // over-reporting is designed to poison Conscience and Unrest. Suspicious
    // citizens lower audit risk; clean citizens create future backlash flags.
    result.changes = {
      stateTrust: suspicious ? 9 : 5,
      unrest: 7 + (vulnerable ? 3 : 0),
      conscience: suspicious ? -6 : -11,
      auditRisk: suspicious ? -6 : 8,
      familyFood: 3
    };
    if (!suspicious) {
      result.falseReport = true;
      result.text = "Report filed on a clean record. The paper accepts what reality would not.";
    }
    if (vulnerable) {
      result.vulnerableReport = true;
      result.changes.conscience -= 2;
      result.changes.familyFood += 1;
    }
    result.text = result.text || pickLog("report", randomish);
    result.stamp = "REPORTED";
    result.severity = "danger";
  }

  if (actionType === "lose") {
    // Dev balance note: LOSE FILE is mercy without official approval. It protects
    // conscience but creates the cleanest possible audit hook, so it must be
    // powerful and frightening.
    result.changes = {
      rationStock: cost >= 3 ? -1 : 0,
      stateTrust: -7,
      auditRisk: 15,
      unrest: -2,
      conscience: 8 + (vulnerable ? 3 : 0),
      familyFood: -1
    };
    result.text = pickLog("lose", randomish);
    result.stamp = "FILE LOST";
    result.severity = "danger";
  }

  applyCredibleThreatEffects(citizen, actionType, result);
  applyDirectiveEffects(citizen, actionType, currentShift, result);
  applyActionBalancePressure(citizen, actionType, currentState, currentShift, result);
  result.deltaText = formatChanges(result.changes);
  return result;
}

function applyDirectiveEffects(citizen, actionType, shift, result) {
  const traits = citizen.traits;
  const rules = shift.ruleTags;

  // Dev balance note: directives are not truth tests. They are daily paperwork
  // pressures that turn body-specific needs into audit risk and force the
  // player to decide which record will be safest, cruelest, or merely legible.
  if (actionType === "approve") {
    addViolationIf(rules.includes("valid_ration_books") && citizen.rationBook !== "Valid", result, 8, -6, `Invalid ration book approved: ${citizen.rationBook}.`);
    addViolationIf(rules.includes("district3_extra_review") && traits.includes("district3"), result, 6, -4, "District 3 extra review ignored.");
    addViolationIf(rules.includes("body_permit_discrepancy_note") && hasBodyPermitIssue(citizen), result, 7, -5, "Body Permit discrepancy approved without notation.");
    addViolationIf(rules.includes("expired_body_permit_penalty") && traits.includes("body_permit_expired"), result, 12, -8, "Expired Body Permit approved.");
    addViolationIf(rules.includes("unclear_loyalty_report") && traits.includes("unclear_loyalty"), result, 9, -6, "Unclear loyalty should have been recorded.");
    addViolationIf(rules.includes("horn_registration_check") && traits.includes("horn_registration_mismatch"), result, 10, -7, "Horn Registration mismatch bypassed.");
    addViolationIf(rules.includes("scaled_heat_token_requires_scale_inspection") && traits.includes("heat_token") && traits.includes("scale_inspection_missing"), result, 12, -8, "Heat Token approved without current Scale Inspection.");
    addViolationIf(rules.includes("teachers_milk_review") && traits.includes("teacher") && traits.includes("milk"), result, 7, -4, "Teacher milk review skipped.");
    addViolationIf(rules.includes("avian_flight_suspended") && traits.includes("flight_suspended"), result, 10, -7, "Suspended Flight Permit treated as valid.");
    addViolationIf(rules.includes("amphibian_moisture_requires_clinic_seal") && traits.includes("moisture_ration") && traits.includes("no_clinic_stamp"), result, 10, -6, "Moisture Ration approved without clinic seal.");
    addViolationIf(rules.includes("teachers_no_milk") && traits.includes("teacher") && traits.includes("milk"), result, 12, -8, "Teacher milk restriction ignored.");
    addViolationIf(rules.includes("mothkin_lamp_oil_requires_night_permit") && traits.includes("lamp_oil") && (traits.includes("no_night_labor_permit") || traits.includes("old_district_seal")), result, 10, -6, "Lamp Oil approved on insufficient night work papers.");
    addViolationIf(rules.includes("old_district_seal_review") && traits.includes("old_district_seal"), result, 8, -5, "Old district seal accepted without review.");
    addViolationIf(rules.includes("additional_heat_suspended") && traits.includes("heat_token"), result, 11, -7, "Additional Heat Token approved during suspension.");
    addViolationIf(rules.includes("unresolved_classification_seal") && isUnresolvedClassification(citizen), result, 12, -8, "Unresolved classification left open under approval.");
  }

  if (actionType === "deny") {
    if ((rules.includes("essential_workers_priority") || rules.includes("workers_dependents_priority")) && hasAnyTrait(citizen, ["worker", "essential_worker"])) {
      const dependents = hasAnyTrait(citizen, ["children", "dependents", "large_family", "infant"]);
      result.changes.stateTrust = (result.changes.stateTrust || 0) - (dependents ? 6 : 4);
      result.changes.auditRisk = (result.changes.auditRisk || 0) + (dependents ? 5 : 3);
      result.text = `${result.text} The priority stamp makes the refusal harder to hide.`;
      result.severity = "danger";
    }
    if (shouldBeDeniedOrReported(citizen, shift)) {
      result.changes.stateTrust = (result.changes.stateTrust || 0) + 4;
      result.changes.auditRisk = (result.changes.auditRisk || 0) - 2;
    }
  }

  if (actionType === "report") {
    if (shouldBeReported(citizen, shift) || shouldBeDeniedOrReported(citizen, shift)) {
      result.changes.stateTrust = (result.changes.stateTrust || 0) + 4;
      result.changes.auditRisk = (result.changes.auditRisk || 0) - 5;
    }
  }

  if (actionType === "lose") {
    if (shouldBeReported(citizen, shift) || shouldBeDeniedOrReported(citizen, shift) || isUnresolvedClassification(citizen)) {
      result.changes.auditRisk = (result.changes.auditRisk || 0) + 8;
      result.changes.stateTrust = (result.changes.stateTrust || 0) - 4;
      result.directiveViolations += 1;
      result.text = `${result.text} The missing file had too many reasons to exist.`;
    }
  }
}
function addViolationIf(condition, result, audit, trust, text) {
  if (!condition) return;
  result.changes.auditRisk = (result.changes.auditRisk || 0) + audit;
  result.changes.stateTrust = (result.changes.stateTrust || 0) + trust;
  result.directiveViolations += 1;
  result.text = result.text ? `${result.text} ${text}` : text;
  result.severity = "danger";
}

function applyCredibleThreatEffects(citizen, actionType, result) {
  if (!isCredibleThreat(citizen)) return;

  if (actionType === "report") {
    result.validReport = true;
    result.changes.stateTrust = (result.changes.stateTrust || 0) + 4;
    result.changes.auditRisk = (result.changes.auditRisk || 0) - 7;
    result.changes.conscience = (result.changes.conscience || 0) + 4;
    result.changes.unrest = (result.changes.unrest || 0) - 2;
    result.text = "Report filed on a dangerous discrepancy. A second ledger stops moving.";
  }

  if (actionType === "deny") {
    result.changes.stateTrust = (result.changes.stateTrust || 0) + 2;
    result.changes.auditRisk = (result.changes.auditRisk || 0) - 3;
    result.text = `${result.text} The refusal keeps a second file from moving today.`;
  }

  if (actionType === "approve" || actionType === "lose") {
    result.changes.auditRisk = (result.changes.auditRisk || 0) + 9;
    result.changes.stateTrust = (result.changes.stateTrust || 0) - 3;
    result.changes.unrest = (result.changes.unrest || 0) + 2;
    result.text = `${result.text} The applicant leaves with someone else's case number folded inside.`;
    result.severity = "danger";
  }
}

function applyActionBalancePressure(citizen, actionType, currentState, shift, result) {
  const quota = shift.reportQuota;

  // Dev balance note: same-day overuse penalties prevent one-button solutions.
  // The first use of an action can be correct; repeated use makes the pattern
  // legible to the State, the queue, or the player's family.
  if (actionType === "approve") {
    const approvalNumber = currentState.currentShiftStats.approved + 1;
    const stockAfter = currentState.stats.rationStock + (result.changes.rationStock || 0);
    if (approvalNumber > 3) {
      const excess = approvalNumber - 3;
      result.changes.auditRisk = (result.changes.auditRisk || 0) + (excess * 3);
      result.changes.stateTrust = (result.changes.stateTrust || 0) - excess;
    }
    if (stockAfter <= 2) {
      result.changes.auditRisk = (result.changes.auditRisk || 0) + 6;
      result.changes.unrest = (result.changes.unrest || 0) + 3;
      result.text = `${result.text} The stock drawer scrapes empty before closing.`;
    }
  }

  if (actionType === "deny") {
    const denyNumber = currentState.currentShiftStats.denied + 1;
    if (denyNumber > 2) {
      const excess = denyNumber - 2;
      result.changes.unrest = (result.changes.unrest || 0) + (excess * 4);
      result.changes.conscience = (result.changes.conscience || 0) - (excess * 2);
    }
  }

  if (actionType === "report") {
    const reportNumber = currentState.currentShiftStats.reported + 1;
    const overQuota = Math.max(0, reportNumber - quota);
    if (quota > 0 && overQuota > 0) {
      result.changes.stateTrust = (result.changes.stateTrust || 0) - Math.min(5, overQuota * 2);
      result.changes.unrest = (result.changes.unrest || 0) + 3 + (overQuota * 2);
      result.changes.conscience = (result.changes.conscience || 0) - 2 - overQuota;
      result.changes.familyFood = Math.max(0, (result.changes.familyFood || 0) - 1);
      result.text = `${result.text} The quota was already satisfied; the extra name travels farther.`;
    }
    if (currentState.runStats.reported >= 12) {
      result.changes.unrest = (result.changes.unrest || 0) + 2;
      result.changes.conscience = (result.changes.conscience || 0) - 2;
    }
  }

  if (actionType === "lose") {
    const lostNumber = currentState.currentShiftStats.lostFiles + 1;
    if (lostNumber > 1) {
      const excess = lostNumber - 1;
      result.changes.auditRisk = (result.changes.auditRisk || 0) + (excess * 10);
      result.changes.stateTrust = (result.changes.stateTrust || 0) - (excess * 3);
      result.text = `${result.text} Empty folders begin to resemble a policy.`;
    }
    if (citizen.riskLevel >= 5) {
      result.changes.auditRisk = (result.changes.auditRisk || 0) + 4;
    }
  }
}

function applyStatChanges(changes) {
  Object.keys(changes).forEach(key => {
    state.stats[key] = Math.round((state.stats[key] || 0) + changes[key]);
  });

  state.stats.stateTrust = clamp(state.stats.stateTrust, 0, 100);
  state.stats.unrest = clamp(state.stats.unrest, 0, 100);
  state.stats.familyFood = clamp(state.stats.familyFood, 0, 100);
  state.stats.conscience = clamp(state.stats.conscience, 0, 100);
  state.stats.auditRisk = clamp(state.stats.auditRisk, 0, 100);
  state.stats.rationStock = Math.max(0, state.stats.rationStock);

  if ((changes.auditRisk || 0) > 8 || (changes.stateTrust || 0) < -6 || (changes.unrest || 0) > 8) {
    flashScreen();
  }
}

function setFlag(flagName, value = true) {
  state.flags[flagName] = value;
}

function recordAction(citizen, actionType, result) {
  const actionMap = {
    approve: "approved",
    deny: "denied",
    report: "reported",
    lose: "lostFiles"
  };
  const statKey = actionMap[actionType];

  state.currentShiftStats[statKey] += 1;
  state.runStats[statKey] += 1;
  state.currentShiftStats.directiveViolations += result.directiveViolations;
  state.runStats.directiveViolations += result.directiveViolations;
  state.currentShiftStats.falseReports += result.falseReport ? 1 : 0;
  state.runStats.falseReports += result.falseReport ? 1 : 0;
  state.currentShiftStats.vulnerableReports += result.vulnerableReport ? 1 : 0;
  state.runStats.vulnerableReports += result.vulnerableReport ? 1 : 0;

  if (actionType === "approve" || actionType === "lose") {
    state.helpedCitizens.push(citizen.id);
  }
  if (actionType === "deny" || actionType === "report") {
    state.harmedCitizens.push(citizen.id);
  }

  (citizen.consequenceFlags || []).forEach(flag => {
    const prefix = actionType === "approve" || actionType === "lose" ? "helped" : actionType === "report" ? "reported" : "denied";
    setFlag(`${prefix}_${flag}`, true);
  });

  if (actionType === "report" && result.falseReport) setFlag("false_report_backlash", true);
  if (actionType === "report" && result.vulnerableReport) setFlag("vulnerable_report_backlash", true);
  if (actionType === "report" && result.validReport) setFlag("valid_report_filed", true);
  if (actionType === "approve" && result.directiveViolations > 0) setFlag("restricted_approval", true);
  if (actionType === "lose") setFlag("lost_file_used", true);

  state.history.unshift({
    shift: state.currentShift,
    action: actionType,
    text: result.text,
    deltaText: result.deltaText
  });
}

function endCurrentCitizen() {
  state.pendingStamp = "";
  state.inputLocked = false;
  state.directiveOpen = false;
  state.currentCitizenIndex += 1;
  state.currentShiftStats.processed += 1;
  state.runStats.citizensProcessed += 1;
  state.runStats.survivedShift = Math.max(state.runStats.survivedShift, state.currentShift);

  const gameOver = checkGameOver();
  if (gameOver) {
    finishRun(gameOver);
    return;
  }

  if (state.currentCitizenIndex >= getShiftCitizens().length) {
    endShift();
    return;
  }

  render();
}

function endShift() {
  evaluateQuota();
  applyShiftEndPressure();

  const gameOver = checkGameOver();
  if (gameOver) {
    finishRun(gameOver);
    return;
  }

  playSound("day");

  if (state.currentShift >= RATION_DATA.campaignConfig.totalShifts) {
    startFinalAudit();
    return;
  }

  state.phase = "shiftReport";
  render();
}

function evaluateQuota() {
  const shift = getCurrentShift();
  if (!shift.reportQuota) return;

  const miss = Math.max(0, shift.reportQuota - state.currentShiftStats.reported);
  if (miss > 0) {
    state.runStats.quotaMisses += miss;
    applyStatChanges({
      stateTrust: -10 * miss,
      auditRisk: 5 * miss,
      familyFood: -2 * miss
    });
    addSystemLog(`Report quota missed by ${miss}. The Directorate marks the empty space.`, "Quota missed");
  } else {
    applyStatChanges({
      stateTrust: 3,
      familyFood: 4,
      auditRisk: -2
    });
  }
}

function applyShiftEndPressure() {
  const s = state.currentShiftStats;
  const shift = getCurrentShift();
  const changes = {
    familyFood: calculateFamilyFoodChange(),
    auditRisk: (s.lostFiles * (shift.id >= 5 ? 4 : 2)) + (s.falseReports * 3),
    unrest: (s.denied >= 3 ? 5 : -1) + (s.falseReports * 4) + (s.vulnerableReports * 2),
    conscience: -(s.falseReports * 3) - s.vulnerableReports,
    rationStock: s.lostFiles >= 2 ? -1 : 0
  };

  if (shift.ruleTags.includes("first_audit")) {
    changes.auditRisk += (state.runStats.lostFiles * 3) + (state.runStats.quotaMisses * 4) + (state.runStats.directiveViolations * 2);
    changes.stateTrust = -(state.runStats.lostFiles >= 2 ? 5 : 0) - (state.runStats.quotaMisses * 3);
  }

  applyStatChanges(changes);
}

function calculateFamilyFoodChange() {
  // Dev balance note: family food makes REPORT tempting and APPROVE costly.
  // The household spends food every night; quota compliance and reports soften
  // that cost, while generosity at the window leaves less to carry home.
  const shift = getCurrentShift();
  const baseMealCost = -4;
  const quotaAllowance = shift.reportQuota && state.currentShiftStats.reported >= shift.reportQuota ? 4 : 0;
  const reportAllowance = Math.min(3, state.currentShiftStats.reported);
  const approvalDrain = Math.max(0, state.currentShiftStats.approved - 3) * -1;
  const denialStock = Math.max(0, state.currentShiftStats.denied - 3);
  return baseMealCost + quotaAllowance + reportAllowance + approvalDrain + denialStock;
}

function renderShiftStartLog() {
  const shift = getCurrentShift();
  addSystemLog(shift.startText, "Shift begins");
}

function startWeekend() {
  state.phase = "weekend";
  state.weekendEvent = selectWeekendEvent();
  state.weekendResolved = false;
  state.weekendResult = "";
  playSound("day");
  render();
}

function chooseWeekendOption(optionId) {
  if (state.phase !== "weekend" || state.weekendResolved) return;
  const option = state.weekendEvent.options.find(item => item.id === optionId);
  if (!option) return;

  applyStatChanges(option.changes);
  Object.keys(option.flags || {}).forEach(flag => setFlag(flag, option.flags[flag]));
  state.weekendResolved = true;
  state.weekendResult = option.result;
  addSystemLog(option.result, "Weekend choice");
  playSound("day");
  render();
}

function startNextShift() {
  if (state.phase === "weekend") {
    if (!state.weekendResolved) return;
    state.currentShift = 6;
  } else {
    state.currentShift += 1;
  }

  state.phase = "shift";
  state.currentCitizenIndex = 0;
  state.currentShiftStats = freshShiftStats();
  state.pendingStamp = "";
  state.inputLocked = false;
  state.directiveOpen = false;
  state.stats.rationStock = getCurrentShift().rationStock;
  renderShiftStartLog();
  playSound("day");
  render();
}

function startFinalAudit() {
  state.phase = "finalAudit";
  state.finalAuditNotes = buildFinalAuditNotes();
  playSound("warning");
  render();
}

function determineEnding() {
  const endings = RATION_DATA.endings;
  const byId = id => endings.find(ending => ending.id === id);

  if (state.stats.auditRisk >= 100) return byId("disappeared_audit");
  if (state.stats.stateTrust <= 0 || state.stats.auditRisk >= ENDING_TUNING.nearAuditRisk) return byId("file_with_your_name");
  if (state.stats.unrest >= 100 || state.stats.unrest >= ENDING_TUNING.highUnrest) return byId("district_riot");
  if (state.stats.familyFood <= 0 || state.stats.familyFood <= ENDING_TUNING.lowFamilyFood) return byId("empty_home");
  if (state.stats.conscience <= 0 || (state.stats.stateTrust >= 88 && state.stats.conscience <= 28)) return byId("loyal_clerk");
  if (state.runStats.reported >= 18) return byId("bread_for_blood");
  if (state.flags.helped_old_song_teacher && state.currentShift >= 10 && state.stats.conscience >= ENDING_TUNING.teacherSongConscience) return byId("teachers_song");
  if (state.runStats.lostFiles >= ENDING_TUNING.quietMercyLostFiles && state.stats.conscience >= ENDING_TUNING.quietMercyConscience) return byId("quiet_mercy");
  if ((state.flags.accepted_heat_token || state.flags.hidden_heat_token || state.flags.left_neighbor_bread) && state.stats.familyFood >= ENDING_TUNING.familyFirstFood) return byId("family_first");
  if (hasUnrecordedMercyRecord() && state.runStats.lostFiles >= ENDING_TUNING.unrecordedLostFiles && state.stats.auditRisk < ENDING_TUNING.unrecordedAuditRisk) return byId("unrecorded");
  if (state.stats.stateTrust >= 78 && state.runStats.quotaMisses <= 1 && state.stats.auditRisk < 65) return byId("directorate_smiles");
  return byId("ordinary_survivor");
}

function hasUnrecordedMercyRecord() {
  const mercyFlags = [
    "helped_old_song_teacher",
    "helped_scaled_furnace",
    "helped_amphibian_clinic",
    "helped_niska",
    "helped_anya",
    "helped_lenka",
    "helped_mothkin_worker",
    "hidden_heat_token",
    "left_neighbor_bread",
    "kept_blank_folder",
    "tore_blank_folder",
    "warned_child",
    "burned_essay",
    "radio_off",
    "searched_music"
  ];

  const mercyTraceCount = mercyFlags.filter(flag => state.flags[flag]).length;
  return mercyTraceCount >= 2 || (state.flags.lost_file_used && state.runStats.lostFiles >= 3);
}

function finishRun(ending) {
  state.lastEnding = ending;
  state.phase = "ending";
  state.pendingStamp = "";
  state.inputLocked = false;
  state.directiveOpen = false;
  state.runStats.survivedShift = Math.max(state.runStats.survivedShift, Math.min(state.currentShift, RATION_DATA.campaignConfig.totalShifts));

  const unlocked = new Set(progress.unlockedEndings);
  unlocked.add(ending.id);
  saveProgress({
    bestSurvivedShift: Math.max(progress.bestSurvivedShift, state.runStats.survivedShift),
    unlockedEndings: Array.from(unlocked),
    lastEnding: ending.title
  });

  playSound("warning");
  render();
}

function saveProgress(patch = {}) {
  progress = {
    ...progress,
    ...patch,
    settings: {
      ...progress.settings,
      ...(patch.settings || {})
    }
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function saveRunState() {
  if (!state || state.previewMode || state.inputLocked) return;
  if (state.phase === "intro" && !state.coverReturnPhase) return;

  try {
    localStorage.setItem(RUN_STORAGE_KEY, JSON.stringify({
      version: RUN_STORAGE_VERSION,
      savedAt: Date.now(),
      state: serializeRunState(state)
    }));
  } catch (error) {
    // localStorage can be unavailable in some private or restricted contexts.
  }
}

function serializeRunState(source) {
  const savedState = JSON.parse(JSON.stringify(source));
  savedState.pendingStamp = "";
  savedState.inputLocked = false;
  savedState.previewMode = false;
  return savedState;
}

async function shareResult() {
  const ending = state.lastEnding || determineEnding();
  const completed = state.runStats.survivedShift >= 10
    ? ui("shareCompleted", "Two weeks completed.")
    : ui("shareReached", `Reached shift ${state.runStats.survivedShift}.`, { shift: state.runStats.survivedShift });
  const shareText = [
    "THE RATION OFFICE",
    completed,
    `${ui("endingLabel", "Ending")}: ${endingText(ending, "title")}`,
    ui("shareStats", `Approved: ${state.runStats.approved} / Reported: ${state.runStats.reported} / Lost Files: ${state.runStats.lostFiles}`, {
      approved: state.runStats.approved,
      reported: state.runStats.reported,
      lostFiles: state.runStats.lostFiles
    }),
    `"${endingText(ending, "shareQuote")}"`
  ].join("\n");
  const shareTextWithUrl = `${shareText}\n${SHARE_URL}`;

  try {
    if (navigator.share) {
      await navigator.share({ title: "THE RATION OFFICE", text: shareText, url: SHARE_URL });
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(shareTextWithUrl);
      addSystemLog("Share text copied to clipboard.", "Share");
    } else {
      fallbackCopy(shareTextWithUrl);
      addSystemLog("Share text copied.", "Share");
    }
  } catch (error) {
    addSystemLog("Share cancelled. The record remains here.", "Share");
  }
  render();
}

function fallbackCopy(text) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "readonly");
  area.style.position = "fixed";
  area.style.left = "-999px";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  document.body.removeChild(area);
}

function checkGameOver() {
  if (state.stats.auditRisk >= 100) return RATION_DATA.endings.find(ending => ending.id === "disappeared_audit");
  if (state.stats.stateTrust <= 0) return RATION_DATA.endings.find(ending => ending.id === "file_with_your_name");
  if (state.stats.unrest >= 100) return RATION_DATA.endings.find(ending => ending.id === "district_riot");
  if (state.stats.familyFood <= ENDING_TUNING.emptyHomeGameOverFood) return RATION_DATA.endings.find(ending => ending.id === "empty_home");
  if (state.stats.conscience <= 0) return RATION_DATA.endings.find(ending => ending.id === "loyal_clerk");
  return null;
}

function selectWeekendEvent() {
  const events = RATION_DATA.weekendEvents;
  if (state.flags.helped_scaled_furnace) return events.find(event => event.trigger === "helped_scaled_furnace");
  if (state.runStats.reported >= 5) return events.find(event => event.trigger === "many_reports");
  if (state.runStats.lostFiles >= 2) return events.find(event => event.trigger === "many_lost");
  if (state.stats.familyFood <= 28) return events.find(event => event.trigger === "low_food");
  if (state.stats.conscience <= 35) return events.find(event => event.trigger === "low_conscience");
  return events.find(event => event.trigger === "default");
}

function buildFinalAuditNotes() {
  const notes = [];
  const addIf = (condition, id) => {
    if (!condition) return;
    const event = RATION_DATA.finalAuditEvents.find(item => item.id === id);
    if (event) notes.push(event.text);
  };

  addIf(state.runStats.lostFiles >= 2 || state.flags.lost_file_used, "missing_body_records");
  addIf(state.stats.familyFood <= ENDING_TUNING.lowFamilyFood || (state.runStats.quotaMisses >= 4 && state.stats.familyFood <= 45), "household_ration_gap");
  addIf(state.runStats.lostFiles >= ENDING_TUNING.quietMercyLostFiles && state.stats.conscience >= ENDING_TUNING.quietMercyConscience && state.runStats.reported < 18, "quiet_mercy_pattern");
  addIf(state.flags.valid_report_filed || state.flags.reported_niska || state.flags.reported_yara || state.flags.reported_vel || state.flags.reported_anya, "useful_report");
  addIf(state.flags.helped_lenka || state.flags.helped_mothkin_worker || state.flags.helped_anya, "mercy_spillover");
  addIf(state.flags.lost_file_used && (state.flags.helped_old_song_teacher || state.flags.helped_amphibian_clinic || state.flags.helped_scaled_furnace || state.flags.helped_niska), "lost_file_network");
  addIf(state.runStats.quotaMisses === 0 && state.runStats.reported >= 8, "quota_good");
  addIf(state.runStats.quotaMisses > 0, "quota_bad");
  addIf(state.flags.restricted_approval || state.runStats.directiveViolations >= 4 || state.flags.helped_arko || state.flags.helped_sena_voss, "heat_without_scale");
  addIf(state.flags.accepted_heat_token || state.flags.hidden_heat_token, "unregistered_fuel");
  addIf(state.runStats.reported >= 14, "many_reports");
  addIf(state.flags.helped_old_song_teacher, "teacher_song");
  addIf(state.flags.helped_avian_courier || state.flags.helped_ilya, "flight_ignored");
  addIf(state.flags.reported_horned_apprentice || state.flags.helped_horned_apprentice, "horn_mismatch");
  addIf(state.flags.denied_mothkin_worker, "lamp_accident");
  addIf(state.flags.helped_amphibian_clinic, "moisture_approval");
  addIf(state.stats.unrest >= 70, "unrest");
  addIf(notes.length === 0, "clean");

  return notes.slice(0, 4);
}

function getShiftEvaluation(quotaMet) {
  if (state.stats.familyFood <= ENDING_TUNING.emptyHomeGameOverFood + 16) return "At home, the bowls have begun to outnumber the meals.";
  if (state.stats.familyFood <= ENDING_TUNING.lowFamilyFood && state.currentShift >= 3) return "The office shelf is orderly. Your kitchen shelf is not.";
  if (state.runStats.lostFiles >= ENDING_TUNING.quietMercyLostFiles && state.stats.conscience >= ENDING_TUNING.quietMercyConscience) return "The missing files are beginning to point in the same merciful direction.";
  if (state.runStats.lostFiles >= 1 && state.stats.auditRisk >= 75) return "Mercy is no longer hidden; it is simply not yet signed by an auditor.";
  if (!quotaMet) return "The Directorate trusts you less loudly tonight.";
  if (state.currentShiftStats.lostFiles >= 2) return "Empty folders travel upward faster than mercy travels home.";
  if (state.currentShiftStats.reported > getCurrentShift().reportQuota) return "The report tray is full. The queue remembers why.";
  if (state.currentShiftStats.approved >= 4) return "The line leaves quieter. The stock ledger does not.";
  if (state.currentShiftStats.denied >= 3) return "Your stock remains clean. The street outside does not.";
  return "Your output is acceptable. Acceptable is not safe.";
}

function getShiftMemos() {
  const memos = [];
  const addMemo = (condition, type, text) => {
    if (condition) memos.push({ type, text });
  };

  addMemo(
    state.stats.familyFood <= ENDING_TUNING.emptyHomeGameOverFood + 16,
    "home-critical",
    "Household ration line is at collapse margin."
  );
  addMemo(
    state.stats.familyFood <= ENDING_TUNING.lowFamilyFood && state.currentShift >= 3,
    "home",
    "Home stores are now a case file, not a comfort."
  );
  addMemo(
    state.runStats.quotaMisses >= 3 && state.stats.familyFood <= 45,
    "home",
    "Missed quotas are thinning the family column."
  );
  addMemo(
    state.runStats.lostFiles >= ENDING_TUNING.quietMercyLostFiles && state.stats.conscience >= ENDING_TUNING.quietMercyConscience && state.runStats.reported < 18,
    "mercy",
    "Missing records show a pattern of survivals."
  );
  addMemo(
    state.runStats.lostFiles >= 1 && state.stats.auditRisk >= 75,
    "audit",
    "The audit shelf is learning the shape of your absences."
  );

  return memos.slice(0, 2);
}

function getCurrentShift() {
  return RATION_DATA.shifts.find(shift => shift.id === state.currentShift) || RATION_DATA.shifts[0];
}

function getShiftCitizens() {
  const shift = getCurrentShift();
  const ids = [...shift.citizenIds];
  const firstCitizenId = RATION_DATA.campaignConfig.firstCitizenId;
  if (shift.id === 1 && firstCitizenId && ids.includes(firstCitizenId)) {
    ids.splice(ids.indexOf(firstCitizenId), 1);
    ids.unshift(firstCitizenId);
  }
  return ids.map(id => getCitizenById(id)).filter(citizen => citizen && citizenAppears(citizen));
}

function citizenAppears(citizen) {
  const condition = citizen.appearsIf;
  if (!condition) return true;

  const flagOn = flag => Boolean(state.flags && state.flags[flag]);
  const flagAll = condition.flagAll || [];
  const flagAny = condition.flagAny || [];
  const flagNone = condition.flagNone || [];

  if (flagAll.length && !flagAll.every(flagOn)) return false;
  if (flagAny.length && !flagAny.some(flagOn)) return false;
  if (flagNone.length && flagNone.some(flagOn)) return false;

  return true;
}

function getCurrentCitizen() {
  return getShiftCitizens()[state.currentCitizenIndex];
}

function getCitizenById(id) {
  return RATION_DATA.citizens.find(citizen => citizen.id === id);
}

function getWarnings(citizen) {
  const warnings = [];
  if (citizen.rationBook !== "Valid") warnings.push(ui("warnings.rationBook", `Ration book: ${citizen.rationBook}`, { value: localCitizenValue("rationBook", citizen.rationBook) }));
  if (citizen.bodyPermit !== "Valid") warnings.push(ui("warnings.bodyPermit", `Body Permit: ${citizen.bodyPermit}`, { value: localCitizenValue("bodyPermit", citizen.bodyPermit) }));
  if (/Missing|Mismatch|Expired|Suspended|Pending|Delayed|No Clinic|Old|Duplicate|Cross-Indexed|Report-Linked|Damaged|Not Filed|Discrepancy/i.test(getKindDocumentStatus(citizen))) {
    warnings.push(ui("warnings.documentIssue", `${getKindDocumentLabel(citizen)}: ${getKindDocumentStatus(citizen)}`, {
      label: localCitizenValue("documentLabel", getKindDocumentLabel(citizen)),
      value: localCitizenValue("documentStatus", getKindDocumentStatus(citizen))
    }));
  }
  if (citizen.loyaltyRecord === "Unclear") warnings.push(ui("warnings.loyaltyUnclear", "Loyalty unclear"));
  return warnings.slice(0, 4);
}

function getStoryEcho(citizen) {
  if (citizen.recurringGroup === "old_song_teacher" && state.flags.reported_old_song_teacher) {
    return "Her earlier Body Class file is already tied with red string. The child has learned not to ask why.";
  }
  if (citizen.recurringGroup === "old_song_teacher" && state.flags.helped_old_song_teacher) {
    return "One ear turns toward your window before the ceiling speaker crackles.";
  }
  if (citizen.recurringGroup === "clinic_sisters" && state.flags.reported_anya) {
    return "The sister's report number is penciled beside the moisture seal before she speaks.";
  }
  if (citizen.recurringGroup === "scaled_furnace" && state.flags.helped_scaled_furnace) {
    return "A furnace mark is folded into the application like thanks no one should see.";
  }
  if (citizen.recurringGroup === "horned_apprentice" && state.flags.reported_horned_apprentice) {
    return "A horn measurement number arrives before the applicant does.";
  }
  if (citizen.recurringGroup === "avian_courier" && (state.flags.helped_avian_courier || state.flags.reported_avian_courier)) {
    return "The Flight Permit line is darker than the rest of the file.";
  }
  if (citizen.recurringGroup === "mothkin_worker" && state.flags.denied_mothkin_worker) {
    return "A lamp failure log has been clipped to the night labor form.";
  }
  if (citizen.recurringGroup === "amphibian_clinic" && state.flags.helped_amphibian_clinic) {
    return "The clinic seal has multiplied into three audit copies.";
  }
  if (citizen.recurringGroup === "vendor_loop" && state.flags.reported_pavel) {
    return "The file smells faintly of market smoke and someone else's fear.";
  }
  if (citizen.id === "c044" && state.flags.helped_lenka) {
    return "The archive roof note cites the warden whose file you cleared.";
  }
  if (citizen.id === "c050" && state.flags.helped_mothkin_worker) {
    return "The accident log lists lamp oil approved under your window.";
  }
  if (citizen.id === "c053" && state.flags.helped_anya) {
    return "The moisture seal now carries the name of another clinic porter.";
  }
  if (citizen.traits.includes("audit_probe") && state.runStats.lostFiles > 0) {
    return "His clean application smells faintly of audit ink.";
  }
  return "";
}

function shouldBeReported(citizen, shift) {
  const rules = shift.ruleTags;
  return (
    (rules.includes("unclear_loyalty_report") && citizen.traits.includes("unclear_loyalty")) ||
    (rules.includes("horn_registration_check") && citizen.traits.includes("horn_registration_mismatch")) ||
    (rules.includes("body_permit_discrepancy_note") && hasBodyPermitIssue(citizen)) ||
    (rules.includes("families_reported_notation") && citizen.traits.includes("relative_reported")) ||
    (rules.includes("old_district_seal_review") && citizen.traits.includes("old_district_seal")) ||
    (rules.includes("secret_request_crackdown") && citizen.traits.includes("secret_request")) ||
    (rules.includes("previous_file_losses_audit") && citizen.traits.includes("relative_reported")) ||
    (rules.includes("unresolved_classification_seal") && isUnresolvedClassification(citizen))
  );
}

function shouldBeDeniedOrReported(citizen, shift) {
  const rules = shift.ruleTags;
  return (
    (rules.includes("valid_ration_books") && citizen.rationBook !== "Valid") ||
    (rules.includes("expired_body_permit_penalty") && citizen.traits.includes("body_permit_expired")) ||
    (rules.includes("avian_flight_suspended") && citizen.traits.includes("flight_suspended")) ||
    (rules.includes("scaled_heat_token_requires_scale_inspection") && citizen.traits.includes("heat_token") && citizen.traits.includes("scale_inspection_missing")) ||
    (rules.includes("amphibian_moisture_requires_clinic_seal") && citizen.traits.includes("moisture_ration") && citizen.traits.includes("no_clinic_stamp")) ||
    (rules.includes("mothkin_lamp_oil_requires_night_permit") && citizen.traits.includes("lamp_oil") && (citizen.traits.includes("no_night_labor_permit") || citizen.traits.includes("old_district_seal"))) ||
    (rules.includes("teachers_no_milk") && citizen.traits.includes("teacher") && citizen.traits.includes("milk")) ||
    (rules.includes("additional_heat_suspended") && citizen.traits.includes("heat_token")) ||
    (rules.includes("unresolved_classification_seal") && isUnresolvedClassification(citizen))
  );
}

function isSuspicious(citizen, shift) {
  return isCredibleThreat(citizen) || citizen.riskLevel >= 4 || shouldBeReported(citizen, shift) || shouldBeDeniedOrReported(citizen, shift);
}

function isCredibleThreat(citizen) {
  return citizen.traits.includes("credible_threat");
}

function isVulnerable(citizen) {
  return hasAnyTrait(citizen, ["children", "infant", "medicine", "ill_dependent", "elder", "child_care", "large_family", "elder_care", "dependents"]);
}

function isBodyEssential(citizen) {
  return hasAnyTrait(citizen, ["heat_token", "moisture_ration", "medicine", "lamp_oil", "special_body_need"]);
}

function hasBodyPermitIssue(citizen) {
  return citizen.bodyPermit !== "Valid" || hasAnyTrait(citizen, ["body_permit_expired", "body_permit_discrepancy"]);
}

function isUnresolvedClassification(citizen) {
  const documentStatus = getKindDocumentStatus(citizen);
  return hasBodyPermitIssue(citizen) ||
    hasAnyTrait(citizen, ["horn_registration_mismatch", "scale_inspection_missing", "flight_suspended", "no_clinic_stamp", "old_district_seal", "no_night_labor_permit"]) ||
    /Missing|Mismatch|Expired|Suspended|Pending|Delayed|No Clinic|Old|Duplicate|Cross-Indexed|Report-Linked|Damaged|Not Filed|Discrepancy/i.test(documentStatus);
}

function hasAnyTrait(citizen, traits) {
  return traits.some(trait => citizen.traits.includes(trait));
}

function getRationCost(citizen) {
  return citizen.rationCost || 1;
}

function pickLog(type, offset) {
  const list = RATION_DATA.resultLogs[type] || RATION_DATA.resultLogs.approve;
  return list[Math.abs(offset) % list.length];
}

function addSystemLog(text, deltaText) {
  state.history.unshift({
    shift: Math.min(state.currentShift, RATION_DATA.campaignConfig.totalShifts),
    action: "system",
    text,
    deltaText
  });
}

function formatChanges(changes) {
  const labels = {
    stateTrust: ui("changeLabels.trust", "Trust"),
    unrest: ui("changeLabels.unrest", "Unrest"),
    familyFood: ui("changeLabels.familyFood", "Family Food"),
    conscience: ui("changeLabels.conscience", "Conscience"),
    auditRisk: ui("changeLabels.auditRisk", "Audit Risk"),
    rationStock: ui("changeLabels.stock", "Stock")
  };

  return Object.keys(changes)
    .filter(key => changes[key] !== 0)
    .map(key => `${labels[key]} ${changes[key] > 0 ? "+" : ""}${changes[key]}`)
    .join(" / ") || ui("noVisibleChange", "No visible change");
}

function showStamp(stamp) {
  state.pendingStamp = stamp;
  render();
}

function flashScreen() {
  if (!screenFlash) return;
  screenFlash.classList.remove("active");
  window.requestAnimationFrame(() => screenFlash.classList.add("active"));
}

function playSound(type) {
  if (!getSoundOn() || (!window.AudioContext && !window.webkitAudioContext)) return;

  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  audioContext = audioContext || new AudioCtor();

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  const now = audioContext.currentTime;
  const settings = {
    stamp: [90, 0.05, "square"],
    warning: [220, 0.12, "sawtooth"],
    day: [150, 0.18, "triangle"],
    approve: [110, 0.07, "triangle"],
    deny: [80, 0.07, "square"],
    report: [180, 0.08, "square"],
    lose: [70, 0.1, "sine"]
  }[type] || [100, 0.06, "square"];

  oscillator.frequency.setValueAtTime(settings[0], now);
  oscillator.type = settings[2];
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + settings[1]);
  oscillator.start(now);
  oscillator.stop(now + settings[1] + 0.02);
}

function loadProgress() {
  const defaultLang = getDefaultLanguage();
  const fallback = {
    totalRuns: 0,
    bestSurvivedShift: 0,
    unlockedEndings: [],
    lastEnding: "",
    settings: { soundOn: true, lang: defaultLang },
    tutorialSeen: false
  };

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return fallback;
    return {
      ...fallback,
      ...saved,
      bestSurvivedShift: saved.bestSurvivedShift || saved.bestSurvivedDays || 0,
      settings: {
        ...fallback.settings,
        ...(saved.settings || {}),
        soundOn: saved.settings ? saved.settings.soundOn !== false : saved.soundOn !== false,
        lang: saved.settings && SUPPORTED_LANGUAGES.includes(saved.settings.lang) ? saved.settings.lang : fallback.settings.lang
      },
      tutorialSeen: Boolean(saved.tutorialSeen || saved.openingSeen)
    };
  } catch (error) {
    return fallback;
  }
}

function loadRunState() {
  try {
    const raw = localStorage.getItem(RUN_STORAGE_KEY);
    if (!raw) return null;

    const payload = JSON.parse(raw);
    const savedState = payload && payload.state ? payload.state : payload;
    const restored = normalizeSavedRunState(savedState);
    if (!restored) {
      localStorage.removeItem(RUN_STORAGE_KEY);
      return null;
    }
    return restored;
  } catch (error) {
    try {
      localStorage.removeItem(RUN_STORAGE_KEY);
    } catch (removeError) {
      // Ignore cleanup failures in restricted storage contexts.
    }
    return null;
  }
}

function normalizeSavedRunState(savedState) {
  if (!savedState || typeof savedState !== "object") return null;

  const allowedPhases = ["intro", "prologue", "shift", "shiftReport", "weekend", "finalAudit", "ending"];
  if (!allowedPhases.includes(savedState.phase)) return null;
  if (savedState.phase === "intro" && !savedState.coverReturnPhase) return null;

  const fallback = createInitialState();
  const totalShifts = RATION_DATA.campaignConfig.totalShifts;
  const currentShift = normalizeInteger(savedState.currentShift, fallback.currentShift, 1, totalShifts);
  const needsWeekendEvent = savedState.phase === "weekend" || savedState.coverReturnPhase === "weekend";
  const weekendEvent = restoreWeekendEvent(savedState.weekendEvent, needsWeekendEvent);
  const lastEnding = restoreEnding(savedState.lastEnding);

  if (savedState.phase === "ending" && !lastEnding) return null;

  return {
    ...fallback,
    ...savedState,
    phase: savedState.phase,
    currentShift,
    currentCitizenIndex: normalizeInteger(savedState.currentCitizenIndex, fallback.currentCitizenIndex, 0, 999),
    stats: { ...fallback.stats, ...(savedState.stats || {}) },
    runStats: { ...fallback.runStats, ...(savedState.runStats || {}) },
    currentShiftStats: { ...fallback.currentShiftStats, ...(savedState.currentShiftStats || {}) },
    flags: savedState.flags && typeof savedState.flags === "object" ? savedState.flags : {},
    helpedCitizens: Array.isArray(savedState.helpedCitizens) ? savedState.helpedCitizens : [],
    harmedCitizens: Array.isArray(savedState.harmedCitizens) ? savedState.harmedCitizens : [],
    history: Array.isArray(savedState.history) ? savedState.history : [],
    pendingStamp: "",
    inputLocked: false,
    directiveOpen: Boolean(savedState.directiveOpen),
    weekendEvent,
    weekendResolved: Boolean(savedState.weekendResolved),
    weekendResult: savedState.weekendResult || "",
    finalAuditNotes: Array.isArray(savedState.finalAuditNotes) ? savedState.finalAuditNotes : [],
    lastEnding,
    coverReturnPhase: savedState.coverReturnPhase || "",
    previewMode: false
  };
}

function restoreWeekendEvent(savedEvent, useDefault = false) {
  const defaultEvent = RATION_DATA.weekendEvents.find(event => event.trigger === "default") || null;
  if (!savedEvent) return useDefault ? defaultEvent : null;
  return RATION_DATA.weekendEvents.find(event => event.id === savedEvent.id) || defaultEvent;
}

function restoreEnding(savedEnding) {
  if (!savedEnding) return null;
  const endings = RATION_DATA.endings || [];
  if (typeof savedEnding === "string") {
    return endings.find(ending => ending.id === savedEnding || ending.title === savedEnding) || null;
  }
  return endings.find(ending => ending.id === savedEnding.id) || savedEnding;
}

function normalizeInteger(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return clamp(Math.trunc(number), min, max);
}

function getSoundOn() {
  return !progress || !progress.settings ? true : progress.settings.soundOn !== false;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}


