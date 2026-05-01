(() => {
  const data = window.RATION_DATA;
  const summaryStrip = document.getElementById("summaryStrip");
  const grid = document.getElementById("portraitGrid");
  const emptyState = document.getElementById("emptyState");
  const resultCount = document.getElementById("resultCount");
  const searchInput = document.getElementById("portraitSearch");
  const kindFilter = document.getElementById("kindFilter");
  const sourceFilter = document.getElementById("sourceFilter");
  const appearanceFilter = document.getElementById("appearanceFilter");

  if (!data || !Array.isArray(data.citizens)) {
    grid.innerHTML = `<p class="empty-state">人物データを読み込めませんでした。</p>`;
    return;
  }

  const kindEntries = Object.entries(data.citizenKinds || {});
  const kindLabels = Object.fromEntries(kindEntries.map(([id, item]) => [id, item.label || id]));
  const kindIcons = Object.fromEntries(kindEntries.map(([id, item]) => [id, item.icon || id.slice(0, 3).toUpperCase()]));
  const shiftByCitizenId = makeShiftIndex(data.shifts || []);
  const people = buildPeople(data.citizens, shiftByCitizenId);

  const state = {
    search: "",
    kind: "",
    source: "",
    appearance: ""
  };

  kindFilter.innerHTML = [
    `<option value="">すべて</option>`,
    ...kindEntries.map(([id, item]) => `<option value="${escapeHtml(id)}">${escapeHtml(item.label || id)}</option>`)
  ].join("");

  renderSummary();
  render();

  searchInput.addEventListener("input", () => {
    state.search = searchInput.value.trim().toLowerCase();
    render();
  });
  kindFilter.addEventListener("change", () => {
    state.kind = kindFilter.value;
    render();
  });
  sourceFilter.addEventListener("change", () => {
    state.source = sourceFilter.value;
    render();
  });
  appearanceFilter.addEventListener("change", () => {
    state.appearance = appearanceFilter.value;
    render();
  });

  function makeShiftIndex(shifts) {
    const index = new Map();
    shifts.forEach(shift => {
      (shift.citizenIds || []).forEach((citizenId, order) => {
        index.set(citizenId, {
          shiftId: shift.id,
          order,
          label: `第${shift.week}週 ${shift.weekday} / Shift ${shift.id}`
        });
      });
    });
    return index;
  }

  function buildPeople(citizens, shiftIndex) {
    const map = new Map();
    citizens.forEach(citizen => {
      const key = citizen.portraitImage || citizen.name;
      if (!map.has(key)) {
        map.set(key, {
          name: citizen.name,
          kind: citizen.kind,
          image: citizen.portraitImage || "",
          records: []
        });
      }
      map.get(key).records.push(citizen);
    });

    return [...map.values()].map(person => {
      const records = person.records;
      const first = records[0];
      const campaignSlots = unique(records.map(record => shiftIndex.get(record.id)).filter(Boolean), slot => slot.label);
      const recordIds = records.map(record => record.id);
      const jobs = unique(records.map(record => record.job));
      const districts = unique(records.map(record => `District ${record.district}`));
      const documents = unique(records.map(record => `${record.kindDocument.label}: ${record.kindDocument.status}`));
      const requests = unique(records.map(record => record.request));
      const notes = unique(records.map(record => record.note));
      const traits = unique(records.flatMap(record => record.traits || []));
      const firstSlot = campaignSlots.length
        ? campaignSlots.slice().sort((a, b) => a.shiftId - b.shiftId || a.order - b.order)[0]
        : null;

      return {
        ...person,
        age: first.age,
        bodyClass: first.bodyClassCode || first.bodyClass,
        kindLabel: kindLabels[first.kind] || first.kind,
        kindIcon: kindIcons[first.kind] || first.kind.slice(0, 3).toUpperCase(),
        source: person.image.startsWith("assets/portraits/") ? "portrait-folder" : "other",
        recordIds,
        jobs,
        districts,
        documents,
        requests,
        notes,
        traits,
        campaignSlots,
        firstShiftOrder: firstSlot ? firstSlot.shiftId * 100 + firstSlot.order : 9999,
        searchText: [
          person.name,
          first.kind,
          first.bodyClass,
          first.bodyClassCode,
          ...recordIds,
          ...jobs,
          ...districts,
          ...documents,
          ...requests,
          ...notes,
          ...traits
        ].join(" ").toLowerCase()
      };
    }).sort((a, b) => a.firstShiftOrder - b.firstShiftOrder || a.name.localeCompare(b.name));
  }

  function renderSummary() {
    const metrics = [
      ["人物", people.length],
      ["人物レコード", data.citizens.length],
      ["assets/portraits", people.filter(person => person.source === "portrait-folder").length],
      ["その他画像", people.filter(person => person.source === "other").length],
      ["シフト登場あり", people.filter(person => person.campaignSlots.length > 0).length],
      ["複数レコード", people.filter(person => person.records.length > 1).length]
    ];
    summaryStrip.innerHTML = metrics.map(([label, value]) => `
      <div class="metric">
        <strong>${value}</strong>
        <span>${escapeHtml(label)}</span>
      </div>
    `).join("");
  }

  function render() {
    const filtered = people.filter(matchesFilters);
    resultCount.textContent = `${filtered.length} / ${people.length} 人を表示`;
    emptyState.hidden = filtered.length > 0;
    grid.innerHTML = filtered.map(renderCard).join("");
    bindImageErrors();
  }

  function matchesFilters(person) {
    if (state.search && !person.searchText.includes(state.search)) return false;
    if (state.kind && person.kind !== state.kind) return false;
    if (state.source && person.source !== state.source) return false;
    if (state.appearance === "campaign" && person.campaignSlots.length === 0) return false;
    if (state.appearance === "reserve" && person.campaignSlots.length > 0) return false;
    if (state.appearance === "repeat" && person.records.length < 2) return false;
    return true;
  }

  function renderCard(person) {
    const campaignText = person.campaignSlots.length
      ? person.campaignSlots.map(slot => slot.label).join(" / ")
      : "予備人物";
    const sourceLabel = person.source === "portrait-folder" ? "assets/portraits" : "その他画像";
    const repeatChip = person.records.length > 1
      ? `<span class="chip alert">複数レコード ${person.records.length}</span>`
      : "";
    const reserveChip = person.campaignSlots.length
      ? ""
      : `<span class="chip alert">予備</span>`;

    return `
      <article class="portrait-card kind-${escapeHtml(person.kind)}" data-name="${escapeHtml(person.name)}">
        <a class="image-link" href="${escapeAttribute(person.image)}" target="_blank" rel="noreferrer">
          <img class="portrait-admin-image" src="${escapeAttribute(person.image)}" alt="${escapeAttribute(person.name)}">
        </a>
        <div class="portrait-body">
          <div class="card-top">
            <div>
              <h2>${escapeHtml(person.name)}</h2>
              <div class="record-id">${escapeHtml(person.recordIds.join(", "))}</div>
            </div>
            <span class="kind-badge">${escapeHtml(person.kindIcon)}</span>
          </div>
          <div class="meta-list">
            <div><b>区分</b> ${escapeHtml(person.kindLabel)} / ${escapeHtml(person.bodyClass)} / ${escapeHtml(String(person.age))}歳</div>
            <div><b>職業</b> ${escapeHtml(person.jobs.join(" / "))}</div>
            <div><b>地区</b> ${escapeHtml(person.districts.join(" / "))}</div>
            <div><b>登場</b> ${escapeHtml(campaignText)}</div>
            <div><b>申請</b> ${escapeHtml(person.requests.join(" / "))}</div>
            <div><b>書類</b> ${escapeHtml(person.documents.join(" / "))}</div>
            <div class="path-line" title="${escapeAttribute(person.image)}"><b>画像</b> ${escapeHtml(person.image)}</div>
          </div>
          <div class="chip-row">
            <span class="chip">${escapeHtml(sourceLabel)}</span>
            ${repeatChip}
            ${reserveChip}
            ${person.traits.slice(0, 5).map(trait => `<span class="chip">${escapeHtml(trait)}</span>`).join("")}
          </div>
        </div>
      </article>
    `;
  }

  function bindImageErrors() {
    document.querySelectorAll(".portrait-admin-image").forEach(image => {
      image.addEventListener("error", () => {
        const card = image.closest(".portrait-card");
        const link = image.closest(".image-link");
        if (!card || !link) return;
        card.classList.add("image-error");
        link.removeAttribute("href");
        link.textContent = "画像を読み込めません";
      }, { once: true });
    });
  }

  function unique(items, keyFn = item => item) {
    const seen = new Set();
    const result = [];
    items.forEach(item => {
      if (!item) return;
      const key = keyFn(item);
      if (seen.has(key)) return;
      seen.add(key);
      result.push(item);
    });
    return result;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replaceAll("`", "&#096;");
  }
})();
