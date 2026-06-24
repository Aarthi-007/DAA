/* ============================================================
   Algorithm Time Complexity Visualizer — script.js
   ============================================================ */

// ── Complexity calculation helpers ──────────────────────────
const calc = {
  O1:    ()    => 1,
  Olog:  (n)   => Math.log2(Math.max(n, 1)),
  On:    (n)   => n,
  Onlog: (n)   => n * Math.log2(Math.max(n, 1)),
  On2:   (n)   => n * n,
};

const COMPLEXITIES = [
  { key: 'O1',    label: 'O(1)',       color: '#10b981', checkId: 'chk-o1'    },
  { key: 'Olog',  label: 'O(log n)',   color: '#38bdf8', checkId: 'chk-olog'  },
  { key: 'On',    label: 'O(n)',       color: '#a78bfa', checkId: 'chk-on'    },
  { key: 'Onlog', label: 'O(n log n)', color: '#fb923c', checkId: 'chk-onlog' },
  { key: 'On2',   label: 'O(n²)',      color: '#f43f5e', checkId: 'chk-on2'   },
];

// ── Chart setup ─────────────────────────────────────────────
const POINTS = 60; // number of x-axis samples

function buildDataset(c, n) {
  const maxN = n;
  const data = [];
  for (let i = 0; i <= POINTS; i++) {
    const x = Math.round((i / POINTS) * maxN) || 1;
    data.push({ x, y: calc[c.key](x) });
  }
  return data;
}

let chart;

function initChart(n) {
  const ctx = document.getElementById('complexityChart').getContext('2d');

  const datasets = COMPLEXITIES.map(c => ({
    label: c.label,
    data: buildDataset(c, n),
    borderColor: c.color,
    backgroundColor: c.color + '15',
    borderWidth: 2.2,
    pointRadius: 0,
    pointHoverRadius: 5,
    pointHoverBackgroundColor: c.color,
    tension: 0.4,
    fill: false,
    hidden: false,
  }));

  chart = new Chart(ctx, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 350, easing: 'easeInOutQuart' },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#7ba7c4',
            font: { family: "'IBM Plex Mono', monospace", size: 11 },
            boxWidth: 12,
            padding: 18,
          }
        },
        tooltip: {
          backgroundColor: 'rgba(13, 20, 35, 0.92)',
          borderColor: 'rgba(99, 179, 237, 0.2)',
          borderWidth: 1,
          titleColor: '#e8f4fd',
          bodyColor: '#7ba7c4',
          titleFont: { family: "'IBM Plex Mono', monospace", size: 12 },
          bodyFont:  { family: "'IBM Plex Mono', monospace", size: 11 },
          padding: 12,
          callbacks: {
            title: items => `n = ${items[0].raw.x}`,
            label: item => ` ${item.dataset.label}: ${fmt(item.raw.y)}`,
          }
        }
      },
      scales: {
        x: {
          type: 'linear',
          title: {
            display: true,
            text: 'Input Size (n)',
            color: '#3d6278',
            font: { family: "'IBM Plex Mono', monospace", size: 11 },
          },
          ticks: {
            color: '#3d6278',
            font: { family: "'IBM Plex Mono', monospace", size: 10 },
            maxTicksLimit: 8,
          },
          grid: { color: 'rgba(99, 179, 237, 0.05)' }
        },
        y: {
          type: 'linear',
          title: {
            display: true,
            text: 'Operations',
            color: '#3d6278',
            font: { family: "'IBM Plex Mono', monospace", size: 11 },
          },
          ticks: {
            color: '#3d6278',
            font: { family: "'IBM Plex Mono', monospace", size: 10 },
            callback: v => fmt(v),
            maxTicksLimit: 7,
          },
          grid: { color: 'rgba(99, 179, 237, 0.05)' }
        }
      }
    }
  });
}

// ── Number formatter ─────────────────────────────────────────
function fmt(v) {
  if (v >= 1e9)  return (v / 1e9).toFixed(1) + 'B';
  if (v >= 1e6)  return (v / 1e6).toFixed(1) + 'M';
  if (v >= 1e3)  return (v / 1e3).toFixed(1) + 'K';
  return Number.isInteger(v) ? v.toString() : v.toFixed(2);
}

// ── Update everything with new n ────────────────────────────
function update(n) {
  n = Math.max(1, Math.min(1000, n));

  // 1. Sync controls
  document.getElementById('slider').value      = n;
  document.getElementById('nDisplay').textContent = n;
  document.getElementById('nInput').value      = n;

  // 2. Recalculate values
  const vals = {
    O1:    calc.O1(n),
    Olog:  calc.Olog(n),
    On:    calc.On(n),
    Onlog: calc.Onlog(n),
    On2:   calc.On2(n),
  };

  // 3. Update table
  document.getElementById('val-o1').textContent    = fmt(vals.O1);
  document.getElementById('val-olog').textContent  = fmt(vals.Olog);
  document.getElementById('val-on').textContent    = fmt(vals.On);
  document.getElementById('val-onlog').textContent = fmt(vals.Onlog);
  document.getElementById('val-on2').textContent   = fmt(vals.On2);

  // 4. Update chart datasets
  COMPLEXITIES.forEach((c, i) => {
    chart.data.datasets[i].data = buildDataset(c, n);
  });
  chart.update('active');

  // 5. Update growth bars
  const maxVal = vals.On2 || 1;
  updateBar('bar-o1',    vals.O1,    maxVal, '#10b981');
  updateBar('bar-olog',  vals.Olog,  maxVal, '#38bdf8');
  updateBar('bar-on',    vals.On,    maxVal, '#a78bfa');
  updateBar('bar-onlog', vals.Onlog, maxVal, '#fb923c');
  updateBar('bar-on2',   vals.On2,   maxVal, '#f43f5e');
}

function updateBar(id, val, max, color) {
  const fill = document.getElementById(id + '-fill');
  const text = document.getElementById(id + '-val');
  const pct  = max > 0 ? Math.max((val / max) * 100, 0.4) : 0.4;
  fill.style.width = Math.min(pct, 100) + '%';
  fill.style.background = color;
  text.textContent = fmt(val);
}

// ── Checkboxes to toggle chart lines ────────────────────────
function bindCheckboxes() {
  COMPLEXITIES.forEach((c, i) => {
    const chk = document.getElementById(c.checkId);
    if (!chk) return;
    chk.addEventListener('change', () => {
      chart.data.datasets[i].hidden = !chk.checked;
      chart.update();
    });
  });
}

// ── Theme toggle ─────────────────────────────────────────────
function initTheme() {
  const btn  = document.getElementById('themeBtn');
  const body = document.body;
  let dark = true;

  btn.addEventListener('click', () => {
    dark = !dark;
    body.classList.toggle('light', !dark);
    btn.textContent = dark ? '☀ Light' : '☾ Dark';
    // re-tint chart text
    updateChartTheme(dark);
  });
}

function updateChartTheme(dark) {
  const tc = dark ? '#3d6278' : '#7aabcc';
  const gc = dark ? 'rgba(99,179,237,0.05)' : 'rgba(56,142,210,0.07)';
  chart.options.scales.x.ticks.color = tc;
  chart.options.scales.y.ticks.color = tc;
  chart.options.scales.x.title.color = tc;
  chart.options.scales.y.title.color = tc;
  chart.options.scales.x.grid.color  = gc;
  chart.options.scales.y.grid.color  = gc;
  chart.options.plugins.legend.labels.color = dark ? '#7ba7c4' : '#2a5a82';
  chart.update();
}

// ── Export chart as PNG ──────────────────────────────────────
function initExport() {
  document.getElementById('exportBtn').addEventListener('click', () => {
    const url = chart.toBase64Image('image/png', 1);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = 'complexity-chart.png';
    a.click();
  });
}

// ── Reset ────────────────────────────────────────────────────
function initReset() {
  document.getElementById('resetBtn').addEventListener('click', () => {
    // re-check all boxes
    COMPLEXITIES.forEach((c, i) => {
      const chk = document.getElementById(c.checkId);
      if (chk) chk.checked = true;
      chart.data.datasets[i].hidden = false;
    });
    update(100);
  });
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const DEFAULT_N = 100;

  initChart(DEFAULT_N);
  update(DEFAULT_N);
  bindCheckboxes();
  initTheme();
  initExport();
  initReset();

  // Slider
  const slider = document.getElementById('slider');
  slider.addEventListener('input', () => update(+slider.value));

  // Manual input
  const nInput = document.getElementById('nInput');
  nInput.addEventListener('input', () => {
    const v = parseInt(nInput.value);
    if (!isNaN(v) && v >= 1) update(v);
  });
  nInput.addEventListener('blur', () => {
    const v = parseInt(nInput.value);
    update(isNaN(v) ? DEFAULT_N : v);
  });
});
