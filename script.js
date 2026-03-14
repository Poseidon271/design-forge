/* ═══════════════════════════════════════════════
   CityPulse — script.js
   World-class hackathon UI/UX
   ═══════════════════════════════════════════════ */

'use strict';

/* ── LOADER ── */
(function initLoader() {
  const bar    = document.getElementById('loader-bar');
  const status = document.getElementById('loader-status');
  const loader = document.getElementById('loader');
  const app    = document.getElementById('app');

  const steps = [
    [20,  'CONNECTING TO CITY GRID...'],
    [45,  'FETCHING LIVE TRANSIT DATA...'],
    [65,  'CALIBRATING AIR SENSORS...'],
    [80,  'LOADING INFRASTRUCTURE MAP...'],
    [95,  'SYNCING INCIDENT DATABASE...'],
    [100, 'ALL SYSTEMS ONLINE'],
  ];

  let i = 0;
  function tick() {
    if (i >= steps.length) {
      setTimeout(() => {
        loader.classList.add('hidden');
        app.classList.add('visible');
        initApp();
      }, 400);
      return;
    }
    const [pct, msg] = steps[i++];
    bar.style.width   = pct + '%';
    status.textContent = msg;
    setTimeout(tick, i === steps.length ? 600 : 320 + Math.random() * 200);
  }
  setTimeout(tick, 300);
})();


/* ── CUSTOM CURSOR ── */
const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursor-dot');
let mouseX = -200, mouseY = -200;
let curX = -200,   curY = -200;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';
});

(function animateCursor() {
  curX += (mouseX - curX) * 0.12;
  curY += (mouseY - curY) * 0.12;
  cursor.style.left = curX + 'px';
  cursor.style.top  = curY + 'px';
  requestAnimationFrame(animateCursor);
})();

document.querySelectorAll('button, a, [onclick], .issue-card, .transit-row, .map-pin, .bus-dot').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});


/* ── INIT APP ── */
function initApp() {
  initClock();
  initStats();
  initTicker();
  initTransit();
  renderChart('week');
  initNavLinks();
  initHeroLines();
}


/* ── CLOCK ── */
function initClock() {
  function update() {
    const now = new Date();
    const hms = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const hm  = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const el  = document.getElementById('nav-clock');
    const ft  = document.getElementById('footer-time');
    if (el) el.textContent = hms;
    if (ft) ft.textContent = hm;
  }
  update();
  setInterval(update, 1000);
}


/* ── STAT COUNTERS ── */
function initStats() {
  const targets = { 's-resolved': 247, 's-buses': 18, 's-aqi': 42, 's-critical': 7 };
  Object.entries(targets).forEach(([id, target]) => {
    animateCount(id, 0, target, 1200);
  });
  // Simulate live bus fluctuation
  setInterval(() => {
    const el = document.getElementById('s-buses');
    if (el) {
      const v = 17 + Math.floor(Math.random() * 4);
      el.textContent = v;
    }
  }, 7000);
}

function animateCount(id, from, to, duration) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    el.textContent = Math.round(from + (to - from) * eased);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}


/* ── TICKER ── */
function initTicker() {
  const items = [
    { sev: 'CRIT', cls: 'ti-crit', text: 'POTHOLE · MG ROAD SECTOR 21 · CREW DISPATCHED' },
    { sev: 'MOD',  cls: 'ti-mod',  text: 'STREETLIGHT OUTAGE · CONNAUGHT PLACE BLOCK C' },
    { sev: 'CRIT', cls: 'ti-crit', text: 'WATER PIPE BURST · KAROL BAGH H-BLOCK · EMERGENCY' },
    { sev: 'INFO', cls: 'ti-ok',   text: 'BUS 44C · ON TIME · NEXT STOP CP GATE 2 IN 3 MIN' },
    { sev: 'MOD',  cls: 'ti-mod',  text: 'GARBAGE OVERFLOW · LAJPAT NAGAR MARKET' },
    { sev: 'OK',   cls: 'ti-ok',   text: 'RESOLVED · ROAD CAVE-IN · DWARKA SECTOR 10' },
    { sev: 'INFO', cls: 'ti-ok',   text: 'AQI 42 · AIR QUALITY GOOD · ALL ZONES CLEAR' },
    { sev: 'MOD',  cls: 'ti-mod',  text: 'BUS 7B · RUNNING 4 MIN LATE DUE TO SIGNAL WORK' },
  ];

  const inner = document.getElementById('ticker-inner');
  if (!inner) return;

  // Double for seamless loop
  const all = [...items, ...items];
  inner.innerHTML = all.map(it =>
    `<div class="ticker-item">
      <span class="ti-sev ${it.cls}">[${it.sev}]</span>
      <span>${it.text}</span>
      <span style="color:var(--text-3)">·</span>
    </div>`
  ).join('');
}


/* ── TRANSIT DATA ── */
const transitData = {
  bus: [
    { num: '44C', color: 'var(--blue)',   route: 'CP ↔ Nehru Place',    stops: 'Janpath · ITO · NH-24', eta: '3', etaUnit: 'min', tag: 'ON TIME',   tagCls: 'tag-ok' },
    { num: '7B',  color: 'var(--purple)', route: 'Janakpuri ↔ ITO',     stops: 'Dwarka · Patel Nagar',  eta: '11', etaUnit: 'min', tag: '4 MIN LATE', tagCls: 'tag-late' },
    { num: '22',  color: 'var(--red)',    route: 'Dwarka ↔ Lajpat Nagar',stops: 'Uttam Nagar · Lajpat', eta: '28', etaUnit: 'min', tag: 'DELAYED',    tagCls: 'tag-late' },
    { num: '510', color: 'var(--green)',  route: 'Rohini ↔ Saket',      stops: 'Pitampura · Hauz Khas', eta: '6',  etaUnit: 'min', tag: '2 MIN EARLY', tagCls: 'tag-early' },
  ],
  metro: [
    { num: 'BL', color: 'var(--blue)',   route: 'Blue Line',    stops: 'Dwarka Sec 21 ↔ Vaishali',  eta: '2',  etaUnit: 'min', tag: 'NORMAL',    tagCls: 'tag-ok' },
    { num: 'YL', color: 'var(--amber)',  route: 'Yellow Line',  stops: 'HUDA City ↔ Samaypur Badli', eta: '5',  etaUnit: 'min', tag: 'SLOW',      tagCls: 'tag-late' },
    { num: 'PK', color: 'var(--red)',    route: 'Pink Line',    stops: 'Majlis Park ↔ Shiv Vihar',   eta: '4',  etaUnit: 'min', tag: 'NORMAL',    tagCls: 'tag-ok' },
    { num: 'GR', color: 'var(--green)',  route: 'Green Line',   stops: 'Brigadier Hoshiyar ↔ Inderlok', eta: '7', etaUnit: 'min', tag: 'NORMAL', tagCls: 'tag-ok' },
  ],
};

let currentTransit = 'bus';

function initTransit() {
  renderTransit('bus');
}

function renderTransit(type) {
  currentTransit = type;
  const body = document.getElementById('transit-body');
  if (!body) return;
  const data = transitData[type];
  body.innerHTML = data.map(d => `
    <div class="transit-row" onclick="showToast('🚌 ${d.route} · ${d.tag}')">
      <div class="tr-num" style="color:${d.color}">${d.num}</div>
      <div class="tr-info">
        <div class="tr-route">${d.route}</div>
        <div class="tr-stops">${d.stops}</div>
      </div>
      <div class="tr-right">
        <div class="tr-eta">${d.eta}<span style="font-size:12px;color:var(--text-2)"> ${d.etaUnit}</span></div>
        <div class="tr-tag ${d.tagCls}">${d.tag}</div>
      </div>
    </div>
  `).join('');
}

function switchTransit(btn, type) {
  document.querySelectorAll('.ttab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTransit(type);
}


/* ── CHART ── */
const chartConfig = {
  week: {
    labels:   ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    critical: [4, 7, 3, 8, 5, 2, 7],
    moderate: [12, 15, 10, 18, 14, 8, 11],
    resolved: [10, 14, 9, 16, 13, 7, 9],
    total: 247,
  },
  month: {
    labels:   ['W1', 'W2', 'W3', 'W4'],
    critical: [22, 18, 31, 14],
    moderate: [68, 74, 55, 82],
    resolved: [58, 70, 48, 78],
    total: 618,
  },
  year: {
    labels:   ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'],
    critical: [28,22,31,19,14,17,23,28,21,16,19,24],
    moderate: [80,68,90,74,58,64,79,91,72,61,70,83],
    resolved: [72,61,82,67,52,58,72,84,65,55,62,76],
    total: 3004,
  },
};

function renderChart(period) {
  const cfg    = chartConfig[period];
  const area   = document.getElementById('chart-area');
  const xAxis  = document.getElementById('chart-x');
  const total  = document.getElementById('cl-total');
  if (!area || !xAxis) return;

  const maxVal = Math.max(...cfg.critical.map((c,i) => c + cfg.moderate[i] + cfg.resolved[i]));

  area.innerHTML  = '';
  xAxis.innerHTML = '';
  if (total) total.textContent = cfg.total.toLocaleString();

  cfg.labels.forEach((lbl, i) => {
    const hc = Math.round((cfg.critical[i] / maxVal) * 110);
    const hm = Math.round((cfg.moderate[i] / maxVal) * 110);
    const hr = Math.round((cfg.resolved[i] / maxVal) * 110);

    const col = document.createElement('div');
    col.className = 'chart-col';
    col.innerHTML = `
      <div class="chart-bar" style="height:${hr}px;background:var(--green);opacity:0.7"
        onmouseenter="showToast('${lbl} Resolved: ${cfg.resolved[i]}')"
        title="Resolved: ${cfg.resolved[i]}"></div>
      <div class="chart-bar" style="height:${hm}px;background:var(--amber);opacity:0.8"
        onmouseenter="showToast('${lbl} Moderate: ${cfg.moderate[i]}')"
        title="Moderate: ${cfg.moderate[i]}"></div>
      <div class="chart-bar" style="height:${hc}px;background:var(--red);opacity:0.85"
        onmouseenter="showToast('${lbl} Critical: ${cfg.critical[i]}')"
        title="Critical: ${cfg.critical[i]}"></div>
    `;
    area.appendChild(col);

    const lbl_el = document.createElement('div');
    lbl_el.className = 'chart-x-lbl';
    lbl_el.textContent = lbl;
    xAxis.appendChild(lbl_el);
  });

  // Animate bars in
  area.querySelectorAll('.chart-bar').forEach((bar, i) => {
    const h = bar.style.height;
    bar.style.height = '0px';
    bar.style.transition = `height ${0.4 + i * 0.02}s cubic-bezier(0.16,1,0.3,1)`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { bar.style.height = h; });
    });
  });
}

function setChartPeriod(btn, period) {
  document.querySelectorAll('.actl').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderChart(period);
}


/* ── FILTER ISSUES ── */
function filterIssues(btn, cat) {
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.issue-card').forEach(card => {
    const match = cat === 'all' || card.dataset.cat === cat;
    card.style.display = match ? 'flex' : 'none';
  });
  showToast('Filtered: ' + btn.textContent);
}


/* ── REPORT FORM ── */
let selectedSeverity = 'hig';

function setSeverity(btn) {
  document.querySelectorAll('.sev-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedSeverity = btn.dataset.level;
}

function submitReport() {
  const loc  = document.getElementById('r-loc');
  const type = document.getElementById('r-type');
  if (!loc || !loc.value.trim()) {
    showToast('⚠ Please enter a location');
    loc && loc.focus();
    return;
  }

  const refNum    = 'R-' + (Math.floor(Math.random() * 900) + 2100);
  const typeLabel = type ? type.options[type.selectedIndex].text.replace(/^[^ ]+ /, '') : 'Issue';
  const locLabel  = loc.value.trim();
  const isCrit    = selectedSeverity === 'hig';

  // Show success
  const formArea = document.getElementById('form-area');
  const success  = document.getElementById('form-success');
  const refEl    = document.getElementById('ref-num');
  if (formArea) formArea.style.display = 'none';
  if (success)  { success.style.display = 'flex'; success.classList.add('show'); }
  if (refEl)    refEl.textContent = '#' + refNum;

  // Inject into issue list
  const list = document.getElementById('issue-list');
  if (list) {
    const card = document.createElement('div');
    card.className = `issue-card ${isCrit ? 'severity-critical' : 'severity-moderate'}`;
    card.dataset.cat = 'road';
    card.onclick = () => showToast(`📍 ${typeLabel} · ${locLabel} · Just reported`);
    card.innerHTML = `
      <div class="issue-icon">${isCrit ? '⚠' : '◉'}</div>
      <div class="issue-body">
        <div class="issue-title">${typeLabel} — ${locLabel}</div>
        <div class="issue-loc">#${refNum} · Just now</div>
      </div>
      <div class="issue-right">
        <div class="issue-time">0m</div>
        <div class="issue-sev">${isCrit ? 'CRIT' : 'MOD'}</div>
      </div>
    `;
    card.style.background = 'rgba(79,179,247,0.04)';
    card.style.animation = 'fadeInCard .4s cubic-bezier(0.16,1,0.3,1)';
    list.insertBefore(card, list.firstChild);
  }

  // Update critical count
  const s4 = document.getElementById('s-critical');
  if (s4 && isCrit) {
    s4.textContent = parseInt(s4.textContent || '0') + 1;
  }

  // Update map pin count
  const pinCount = document.getElementById('map-pin-count');
  if (pinCount) {
    pinCount.textContent = parseInt(pinCount.textContent || '0') + 1;
  }

  showToast('✅ Report #' + refNum + ' submitted · Crew notified');
}

function resetForm() {
  const formArea = document.getElementById('form-area');
  const success  = document.getElementById('form-success');
  const loc      = document.getElementById('r-loc');
  const desc     = document.getElementById('r-desc');
  if (formArea) formArea.style.display = 'block';
  if (success)  { success.style.display = 'none'; success.classList.remove('show'); }
  if (loc)  loc.value  = '';
  if (desc) desc.value = '';
  document.querySelectorAll('.sev-btn').forEach(b => b.classList.remove('selected'));
  const defBtn = document.querySelector('.sev-btn[data-level="hig"]');
  if (defBtn) defBtn.classList.add('selected');
  selectedSeverity = 'hig';
}


/* ── SCROLL TO REPORT ── */
function scrollToReport() {
  const el = document.getElementById('report-section');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}


/* ── TOAST ── */
let toastTimer;
function showToast(msg) {
  clearTimeout(toastTimer);
  const toast   = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  if (!toast || !toastMsg) return;
  toastMsg.textContent = msg;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}


/* ── NAV LINKS ── */
function initNavLinks() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      const section = this.dataset.section;
      if (section === 'dashboard') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (section === 'analytics') {
        document.getElementById('chart-area')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (section === 'alerts') {
        document.getElementById('issue-list')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        showToast(`🗺 ${section.charAt(0).toUpperCase() + section.slice(1)} view loading...`);
      }
    });
  });
}


/* ── HERO LINE DELAYS ── */
function initHeroLines() {
  document.querySelectorAll('.h-line').forEach(el => {
    el.style.animationDelay = (el.dataset.delay || 0) + 'ms';
  });
}


/* ── INJECT KEYFRAMES FOR ISSUE CARD ENTRY ── */
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInCard {
    from { opacity: 0; transform: translateX(-12px); }
    to   { opacity: 1; transform: translateX(0); }
  }
`;
document.head.appendChild(style);
