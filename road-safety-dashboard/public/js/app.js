/* ── RoadSafe AI Dashboard ─────────────────────── */
const API = '/api';

Chart.defaults.color = '#525d72';
Chart.defaults.borderColor = '#1f2330';
Chart.defaults.font.family = "'DM Sans', sans-serif";

const COLORS = {
  red: '#f05060', red2: '#ff7080',
  green: '#40c080', blue: '#4080f0',
  accent: '#f0c040', orange: '#f07840',
  purple: '#9060f0', teal: '#20b0c0',
  bg3: '#181b22', border: '#1f2330'
};

// ─── Navigation ───────────────────────────────────
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');
const sectionTitle = document.getElementById('sectionTitle');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.querySelector('.sidebar');
const currentUserEl = document.getElementById('currentUser');
const logoutBtn = document.getElementById('logoutBtn');

navItems.forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const sec = item.dataset.section;
    navItems.forEach(n => n.classList.remove('active'));
    sections.forEach(s => s.classList.remove('active'));
    item.classList.add('active');
    document.getElementById(`section-${sec}`)?.classList.add('active');
    sectionTitle.textContent = item.textContent.trim();
    if (window.innerWidth < 900) sidebar.classList.remove('open');
  });
});

menuToggle?.addEventListener('click', () => sidebar.classList.toggle('open'));

// ─── Live Clock ───────────────────────────────────
function updateClock() {
  const el = document.getElementById('liveTime');
  if (el) el.textContent = new Date().toLocaleTimeString('en-GB', { hour12: false });
}
setInterval(updateClock, 1000);
updateClock();

// ─── Fetch helper ─────────────────────────────────
async function api(path) {
  const res = await fetch(API + path);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function ensureAuthenticated() {
  try {
    const res = await fetch('/auth/me');
    if (res.status === 401) {
      window.location.href = '/login';
      return null;
    }
    if (!res.ok) throw new Error('Unable to check auth session');
    const data = await res.json();
    if (currentUserEl) {
      currentUserEl.textContent = `Signed in as ${data.user.username}`;
    }
    return data;
  } catch (err) {
    console.error('Auth check failed:', err);
    window.location.href = '/login';
    return null;
  }
}

logoutBtn?.addEventListener('click', async () => {
  try {
    logoutBtn.disabled = true;
    const res = await fetch('/auth/logout', { method: 'POST' });
    if (!res.ok) throw new Error('Logout failed');
    window.location.href = '/login';
  } catch (err) {
    console.error(err);
    logoutBtn.disabled = false;
  }
});

// ─── KPI Cards ────────────────────────────────────
async function loadStats() {
  try {
    const d = await api('/stats');
    animateCount('kv-total', d.total);
    animateCount('kv-fatal', d.fatal);
    document.getElementById('kv-fatal-rate').textContent = `${d.fatalRate}% of total`;
    animateCount('kv-nonfatal', d.nonFatal);
    document.getElementById('kv-accuracy').textContent = d.modelAccuracy + '%';
    document.getElementById('kv-casualties').textContent = d.avgCasualties;
  } catch (e) { console.error('Stats error:', e); }
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = 0; const duration = 900;
  const startTime = performance.now();
  function step(now) {
    const t = Math.min((now - startTime) / duration, 1);
    el.textContent = Math.round(start + (target - start) * easeOut(t)).toLocaleString();
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

// ─── Trend Chart ──────────────────────────────────
async function loadTrendChart() {
  try {
    const data = await api('/accidents-by-month');
    const labels = data.map(d => {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${months[d._id.month - 1]} ${d._id.year}`;
    });
    new Chart(document.getElementById('trendChart'), {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Non-Fatal',
            data: data.map(d => d.total - d.fatal),
            borderColor: COLORS.green,
            backgroundColor: COLORS.green + '18',
            tension: 0.4, fill: true, pointRadius: 3, borderWidth: 2
          },
          {
            label: 'Fatal',
            data: data.map(d => d.fatal),
            borderColor: COLORS.red,
            backgroundColor: COLORS.red + '18',
            tension: 0.4, fill: true, pointRadius: 3, borderWidth: 2
          }
        ]
      },
      options: chartOptions({ x: true, y: true, legend: false, tooltip: true })
    });
  } catch (e) { console.error('Trend chart error:', e); }
}

// ─── Severity Donut ───────────────────────────────
async function loadSeverityDonut() {
  try {
    const d = await api('/stats');
    new Chart(document.getElementById('severityDonut'), {
      type: 'doughnut',
      data: {
        labels: ['Fatal', 'Non-Fatal'],
        datasets: [{
          data: [d.fatal, d.nonFatal],
          backgroundColor: [COLORS.red + 'cc', COLORS.green + 'cc'],
          borderColor: [COLORS.red, COLORS.green],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: true, position: 'right', labels: { color: '#8892a4', font: { size: 12 }, boxWidth: 12 } },
          tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw.toLocaleString()}` } }
        }
      }
    });
  } catch (e) { console.error('Donut error:', e); }
}

// ─── Junction Chart ───────────────────────────────
async function loadJunctionChart() {
  try {
    const data = await api('/accidents-by-junction');
    new Chart(document.getElementById('junctionChart'), {
      type: 'bar',
      data: {
        labels: data.map(d => shorten(d._id || 'Unknown', 18)),
        datasets: [
          { label: 'Fatal', data: data.map(d => d.fatal), backgroundColor: COLORS.red + 'cc', borderRadius: 4 },
          { label: 'Total', data: data.map(d => d.total - d.fatal), backgroundColor: COLORS.border, borderRadius: 4 }
        ]
      },
      options: { ...chartOptions({ x: true, y: true, stacked: true }), indexAxis: 'y' }
    });
  } catch (e) { console.error('Junction chart error:', e); }
}

// ─── Weather Chart ────────────────────────────────
async function loadWeatherChart() {
  try {
    const data = await api('/accidents-by-weather');
    const weatherColors = {
      'Fine': COLORS.accent, 'Rain': COLORS.blue, 'Snow': '#a0c0ff',
      'Fog': COLORS.purple, 'High winds': COLORS.orange, 'Unknown': COLORS.border
    };
    new Chart(document.getElementById('weatherChart'), {
      type: 'bar',
      data: {
        labels: data.map(d => d._id || 'Unknown'),
        datasets: [{
          label: 'Accidents',
          data: data.map(d => d.total),
          backgroundColor: data.map(d => (weatherColors[d._id] || COLORS.blue) + 'bb'),
          borderColor: data.map(d => weatherColors[d._id] || COLORS.blue),
          borderWidth: 1, borderRadius: 5
        }]
      },
      options: chartOptions({ x: true, y: true })
    });
  } catch (e) { console.error('Weather chart error:', e); }
}

// ─── Speed Chart ──────────────────────────────────
async function loadSpeedChart() {
  try {
    const data = await api('/severity-by-speed');
    new Chart(document.getElementById('speedChart'), {
      type: 'bar',
      data: {
        labels: data.map(d => `${d._id} mph`),
        datasets: [
          { label: 'Fatal', data: data.map(d => d.fatal), backgroundColor: COLORS.red + 'cc', borderRadius: 4 },
          { label: 'Non-Fatal', data: data.map(d => d.total - d.fatal), backgroundColor: COLORS.green + '44', borderRadius: 4 }
        ]
      },
      options: chartOptions({ x: true, y: true, stacked: true })
    });
  } catch (e) { console.error('Speed chart error:', e); }
}

// ─── Road Type Chart ──────────────────────────────
async function loadRoadTypeChart() {
  try {
    const data = await api('/accidents-by-road-type');
    new Chart(document.getElementById('roadTypeChart'), {
      type: 'bar',
      data: {
        labels: data.map(d => d._id || 'Unknown'),
        datasets: [
          { label: 'Fatal', data: data.map(d => d.fatal), backgroundColor: COLORS.red + 'bb', borderRadius: 4 },
          { label: 'Non-Fatal', data: data.map(d => d.total - d.fatal), backgroundColor: COLORS.accent + '44', borderRadius: 4 }
        ]
      },
      options: chartOptions({ x: true, y: true, stacked: true })
    });
  } catch (e) { console.error('Road type chart error:', e); }
}

// ─── Pedestrian Chart ─────────────────────────────
async function loadPedestrianChart() {
  try {
    const data = await api('/accidents-by-pedestrian-control');
    new Chart(document.getElementById('pedestrianChart'), {
      type: 'polarArea',
      data: {
        labels: data.map(d => shorten(d._id || 'Unknown', 16)),
        datasets: [{
          data: data.map(d => d.fatal),
          backgroundColor: [
            COLORS.red + 'aa',
            COLORS.orange + 'aa',
            COLORS.accent + 'aa',
            COLORS.green + 'aa',
            COLORS.blue + 'aa'
          ]
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels: { color: '#8892a4', font: { size: 10 }, boxWidth: 10 } } }
      }
    });
  } catch (e) { console.error('Pedestrian chart error:', e); }
}

// ─── Model Metrics ────────────────────────────────
async function loadModelMetrics() {
  try {
    const data = await api('/model-metrics');
    const grid = document.getElementById('modelGrid');
    grid.innerHTML = '';
    if (!data.length) {
      grid.innerHTML = '<div class="model-card"><div class="model-card-name">No model metrics available</div><div class="chart-sub">Run the seed script or insert metrics to populate the model view.</div></div>';
      return;
    }

    const best = Math.max(...data.map(m => m.accuracy));
    data.forEach(m => {
      const isBest = m.accuracy === best;
      grid.innerHTML += `
        <div class="model-card ${isBest ? 'best' : ''}">
          <div class="model-card-label">Model ${isBest ? '<span class="best-tag">⭐ Best</span>' : ''}</div>
          <div class="model-card-name">${m.model_name}</div>
          <div class="model-acc">${(m.accuracy * 100).toFixed(2)}<span>%</span></div>
          <div class="model-metrics">
            ${metricRow('Precision', m.precision)}
            ${metricRow('Recall', m.recall)}
            ${metricRow('F1 Score', m.f1_score)}
            ${metricRow('Train Acc', m.training_accuracy)}
            ${metricRow('Val Acc', m.validation_accuracy)}
          </div>
        </div>`;
    });

    // Model compare bar chart
    new Chart(document.getElementById('modelCompareChart'), {
      type: 'bar',
      data: {
        labels: data.map(m => m.model_name),
        datasets: [{
          label: 'Testing Accuracy',
          data: data.map(m => (m.testing_accuracy * 100).toFixed(2)),
          backgroundColor: [COLORS.accent + 'cc', COLORS.blue + 'cc', COLORS.green + 'cc', COLORS.orange + 'cc'],
          borderWidth: 0, borderRadius: 6
        }]
      },
      options: {
        ...chartOptions({ x: true, y: true }),
        scales: {
          y: { min: 75, max: 100, ticks: { color: '#525d72', callback: v => v + '%' }, grid: { color: COLORS.border } },
          x: { ticks: { color: '#525d72' }, grid: { color: 'transparent' } }
        }
      }
    });

    // TabNet epoch simulation
    const epochs = Array.from({ length: 50 }, (_, i) => i + 1);
    const trainAcc = epochs.map(e => 0.94 + 0.035 * (1 - Math.exp(-e / 8)) + Math.random() * 0.006);
    const valAcc = epochs.map(e => 0.93 + 0.044 * (1 - Math.exp(-e / 10)) + Math.random() * 0.008);

    new Chart(document.getElementById('tabnetEpochChart'), {
      type: 'line',
      data: {
        labels: epochs,
        datasets: [
          { label: 'Train', data: trainAcc, borderColor: COLORS.accent, backgroundColor: 'transparent', tension: 0.4, pointRadius: 0, borderWidth: 2 },
          { label: 'Validation', data: valAcc, borderColor: COLORS.blue, backgroundColor: 'transparent', tension: 0.4, pointRadius: 0, borderWidth: 2, borderDash: [4, 4] }
        ]
      },
      options: {
        ...chartOptions({ x: true, y: true }),
        scales: {
          y: { min: 0.92, max: 1.0, ticks: { color: '#525d72', callback: v => (v * 100).toFixed(0) + '%' }, grid: { color: COLORS.border } },
          x: { ticks: { color: '#525d72', maxTicksLimit: 10 }, grid: { color: 'transparent' } }
        }
      }
    });
  } catch (e) { console.error('Model metrics error:', e); }
}

function metricRow(label, val) {
  const pct = (val * 100).toFixed(1);
  return `
    <div class="metric-row"><span class="label">${label}</span><span class="val">${pct}%</span></div>
    <div class="metric-bar"><div class="metric-bar-fill" style="width:${pct}%"></div></div>`;
}

// ─── Records Table ────────────────────────────────
let currentPage = 1;
let currentFilters = {};

async function loadTable(page = 1) {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '<tr><td colspan="10" class="loading-row">Loading…</td></tr>';
  try {
    const params = new URLSearchParams({ page, limit: 12, ...currentFilters });
    const data = await api(`/accidents?${params}`);
    document.getElementById('recordCount').textContent = `${data.total.toLocaleString()} records`;

    if (!data.accidents.length) {
      tbody.innerHTML = '<tr><td colspan="10" class="loading-row">No records found</td></tr>';
      renderPagination(data.pages, page);
      return;
    }

    tbody.innerHTML = data.accidents.map(a => {
      const match = a.severity === a.predicted_severity;
      const conf = Number.isFinite(a.confidence) ? (a.confidence * 100).toFixed(0) : '0';
      return `<tr>
        <td style="font-family:var(--font-mono);font-size:11px;color:var(--text3)">${a.accident_id}</td>
        <td>${new Date(a.date).toLocaleDateString('en-GB')}</td>
        <td><span class="badge ${a.severity === 'Fatal' ? 'fatal' : 'nonfatal'}">${a.severity}</span></td>
        <td><span class="badge ${a.predicted_severity === 'Fatal' ? 'fatal' : 'nonfatal'}">${a.predicted_severity}</span></td>
        <td>
          <div class="conf-bar">
            <div class="conf-fill" style="width:${conf * 0.6}px"></div>
            <span style="font-family:var(--font-mono);font-size:11px">${conf}%</span>
          </div>
        </td>
        <td>${a.road_type || '—'}</td>
        <td>${a.weather || '—'}</td>
        <td style="font-family:var(--font-mono)">${a.speed_limit || '—'} mph</td>
        <td><span class="badge ${a.model_used === 'TabNet' ? 'tabnet' : 'mlp'}">${a.model_used}</span></td>
        <td><span class="badge ${match ? 'match' : 'nomatch'}">${match ? '✓' : '✗'}</span></td>
      </tr>`;
    }).join('');

    renderPagination(data.pages, page);
    currentPage = page;
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="10" class="loading-row">Error loading records</td></tr>`;
    console.error('Table error:', e);
  }
}

function renderPagination(pages, active) {
  const el = document.getElementById('pagination');
  if (!el) return;
  if (!pages) {
    el.innerHTML = '';
    return;
  }
  const range = [];
  for (let i = Math.max(1, active - 2); i <= Math.min(pages, active + 2); i++) range.push(i);
  el.innerHTML = [
    `<button class="page-btn" onclick="loadTable(${Math.max(1, active - 1)})" ${active === 1 ? 'disabled' : ''}>‹</button>`,
    ...range.map(p => `<button class="page-btn ${p === active ? 'active' : ''}" onclick="loadTable(${p})">${p}</button>`),
    `<button class="page-btn" onclick="loadTable(${Math.min(pages, active + 1)})" ${active === pages ? 'disabled' : ''}>›</button>`
  ].join('');
}

document.getElementById('applyFilter')?.addEventListener('click', () => {
  currentFilters = {};
  const sev = document.getElementById('filterSeverity').value;
  const mod = document.getElementById('filterModel').value;
  if (sev) currentFilters.severity = sev;
  if (mod) currentFilters.model = mod;
  loadTable(1);
});

// ─── Chart Options Helper ─────────────────────────
function chartOptions({ x = false, y = false, legend = false, tooltip = true, stacked = false } = {}) {
  return {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: legend, labels: { color: '#8892a4', font: { size: 11 }, boxWidth: 10 } },
      tooltip: { enabled: tooltip, backgroundColor: '#181b22', borderColor: '#252a38', borderWidth: 1, titleColor: '#e2e6f0', bodyColor: '#8892a4', padding: 10 }
    },
    scales: {
      x: x ? { stacked, ticks: { color: '#525d72', maxRotation: 35 }, grid: { color: 'transparent' } } : { display: false },
      y: y ? { stacked, ticks: { color: '#525d72' }, grid: { color: '#1f2330' } } : { display: false }
    }
  };
}

function shorten(str, max) {
  if (!str) return 'Unknown';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

// ─── Init ─────────────────────────────────────────
async function init() {
  const auth = await ensureAuthenticated();
  if (!auth) return;

  await Promise.allSettled([
    loadStats(),
    loadTrendChart(),
    loadSeverityDonut(),
    loadJunctionChart(),
    loadWeatherChart(),
    loadSpeedChart(),
    loadRoadTypeChart(),
    loadPedestrianChart(),
    loadModelMetrics(),
    loadTable(1)
  ]);
}

init();
