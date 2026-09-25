/* =========================================================
   K-Nearest Neighbors: From Distance to Prediction
   Plain JavaScript, no dependencies. Open index.html to run.
   ========================================================= */
(function () {
  'use strict';

  /* =======================================================
     1. Seeded random numbers
     ======================================================= */

  // mulberry32: a tiny, fast 32-bit PRNG. Same seed -> same sequence.
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function createRng(seed) {
    const next = mulberry32(seed);
    let spare = null;
    return {
      uniform(min = 0, max = 1) { return min + (max - min) * next(); },
      int(n) { return Math.floor(next() * n); },
      // Gaussian via the Marsaglia polar method
      normal(mean = 0, sd = 1) {
        if (spare !== null) { const v = spare; spare = null; return mean + sd * v; }
        let u, v, s;
        do { u = next() * 2 - 1; v = next() * 2 - 1; s = u * u + v * v; } while (s === 0 || s >= 1);
        const f = Math.sqrt(-2 * Math.log(s) / s);
        spare = v * f;
        return mean + sd * u * f;
      }
    };
  }

  // FNV-1a string hash, used to give each preset its own base seed.
  function hashString(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  /* =======================================================
     2. Dataset generation
     ======================================================= */

  const CLASS_A = 0;
  const CLASS_B = 1;
  const SYNTH = {
    xLabel: 'Synthetic feature 1',
    yLabel: 'Synthetic feature 2',
    classNames: ['Class A', 'Class B'],
    testName: 'Test instance'
  };

  const PRESETS = {
    student: {
      name: 'Student Support',
      domain: { xmin: 0, xmax: 12, ymin: 3.5, ymax: 10.5 },
      xLabel: 'Study hours',
      yLabel: 'Sleep hours',
      classNames: ['Submitted assignment', 'Did not submit'],
      testName: 'New student',
      defaultTest: { x: 5.5, y: 7.0 },
      generate(rng) {
        const pts = [];
        const nA = 24 + rng.int(5);
        const nB = 22 + rng.int(5);
        // Submitted: more study, moderately more sleep. Overlaps on purpose.
        for (let i = 0; i < nA; i++) {
          pts.push({ x: rng.normal(7.1, 1.9), y: rng.normal(7.6, 0.9), label: CLASS_A });
        }
        // Did not submit: less study, somewhat lower and more variable sleep.
        for (let i = 0; i < nB; i++) {
          pts.push({ x: rng.normal(4.0, 1.9), y: rng.normal(6.5, 1.35), label: CLASS_B });
        }
        return pts;
      }
    },

    moons: Object.assign({}, SYNTH, {
      name: 'Twin Moons',
      domain: { xmin: -1.6, xmax: 2.6, ymin: -1.1, ymax: 1.6 },
      defaultTest: { x: 0.5, y: 0.25 },
      generate(rng) {
        const pts = [];
        const n = 25;
        const noise = 0.14;
        for (let i = 0; i < n; i++) {
          const t = rng.uniform(0, Math.PI);
          pts.push({ x: Math.cos(t) + rng.normal(0, noise), y: Math.sin(t) + rng.normal(0, noise), label: CLASS_A });
        }
        for (let i = 0; i < n; i++) {
          const t = rng.uniform(0, Math.PI);
          pts.push({ x: 1 - Math.cos(t) + rng.normal(0, noise), y: 0.45 - Math.sin(t) + rng.normal(0, noise), label: CLASS_B });
        }
        return pts;
      }
    }),

    clusters: Object.assign({}, SYNTH, {
      name: 'Overlapping Clusters',
      domain: { xmin: -4, xmax: 4, ymin: -2.8, ymax: 2.8 },
      defaultTest: { x: 0, y: 0 },
      generate(rng) {
        const pts = [];
        const nA = 23 + rng.int(5);
        const nB = 23 + rng.int(5);
        for (let i = 0; i < nA; i++) {
          pts.push({ x: rng.normal(-1.1, 1.0), y: rng.normal(-0.5, 0.9), label: CLASS_A });
        }
        for (let i = 0; i < nB; i++) {
          pts.push({ x: rng.normal(1.1, 1.0), y: rng.normal(0.5, 0.9), label: CLASS_B });
        }
        return pts;
      }
    }),

    rings: Object.assign({}, SYNTH, {
      name: 'Concentric Rings',
      domain: { xmin: -4.4, xmax: 4.4, ymin: -3.2, ymax: 3.2 },
      defaultTest: { x: 1.65, y: 0.3 },
      generate(rng) {
        const pts = [];
        const nInner = 22;
        const nOuter = 30;
        for (let i = 0; i < nInner; i++) {
          const r = Math.abs(rng.normal(1.0, 0.3));
          const t = rng.uniform(0, 2 * Math.PI);
          pts.push({ x: r * Math.cos(t), y: r * Math.sin(t), label: CLASS_A });
        }
        for (let i = 0; i < nOuter; i++) {
          const r = rng.normal(2.35, 0.3);
          const t = rng.uniform(0, 2 * Math.PI);
          pts.push({ x: r * Math.cos(t), y: r * Math.sin(t), label: CLASS_B });
        }
        return pts;
      }
    })
  };

  function clampPoint(p, d) {
    const mx = (d.xmax - d.xmin) * 0.02;
    const my = (d.ymax - d.ymin) * 0.02;
    return {
      x: Math.min(d.xmax - mx, Math.max(d.xmin + mx, p.x)),
      y: Math.min(d.ymax - my, Math.max(d.ymin + my, p.y)),
      label: p.label
    };
  }

  // Checks every sample against the minimum conditions in the spec.
  function isValidSample(pts, preset) {
    const n = pts.length;
    if (n < 15) return false;

    let countA = 0;
    for (const p of pts) if (p.label === CLASS_A) countA++;
    const countB = n - countA;
    if (countA === 0 || countB === 0) return false;
    if (Math.min(countA, countB) / n < 0.3) return false;

    const seen = new Set();
    for (const p of pts) {
      const key = p.x + ',' + p.y;
      if (seen.has(key)) return false;
      seen.add(key);
    }

    // The classes must overlap or come close somewhere.
    const d = preset.domain;
    const diag = Math.hypot(d.xmax - d.xmin, d.ymax - d.ymin);
    let minCross = Infinity;
    for (const a of pts) {
      if (a.label !== CLASS_A) continue;
      for (const b of pts) {
        if (b.label !== CLASS_B) continue;
        const dd = Math.hypot(a.x - b.x, a.y - b.y);
        if (dd < minCross) minCross = dd;
      }
    }
    if (minCross > 0.07 * diag) return false;

    // Default test location must lie inside the plot.
    const t = preset.defaultTest;
    if (t.x < d.xmin || t.x > d.xmax || t.y < d.ymin || t.y > d.ymax) return false;
    return true;
  }

  // Stable IDs: points are ordered left-to-right and numbered from 1.
  function finalizePoints(pts) {
    const sorted = pts.slice().sort((a, b) => a.x - b.x || a.y - b.y || a.label - b.label);
    return sorted.map((p, i) => Object.freeze({ id: i + 1, x: p.x, y: p.y, label: p.label }));
  }

  function seedFor(key, sampleNumber, attempt) {
    let s = hashString(key);
    s = (s ^ Math.imul(sampleNumber, 0x9E3779B1)) >>> 0;
    s = (s ^ Math.imul(attempt + 1, 0x85EBCA6B)) >>> 0;
    return s;
  }

  // Deterministic: the same preset + sample number always yields the same points.
  // If a draw fails validation, the next attempt seed is also derived deterministically.
  function generateDataset(key, sampleNumber) {
    const preset = PRESETS[key];
    let pts = null;
    for (let attempt = 0; attempt < 50; attempt++) {
      const rng = createRng(seedFor(key, sampleNumber, attempt));
      const raw = preset.generate(rng).map(p => clampPoint(p, preset.domain));
      pts = raw;
      if (isValidSample(raw, preset)) break;
    }
    return finalizePoints(pts);
  }

  /* =======================================================
     3. Distance, neighbor selection, voting
     ======================================================= */

  function squaredDistance(ax, ay, bx, by) {
    const dx = ax - bx;
    const dy = ay - by;
    return dx * dx + dy * dy;
  }

  // Sort by ascending distance, then by stable point ID when distances tie.
  function findNeighbors(x, y, points, k) {
    const ranked = points.map(p => ({ point: p, d2: squaredDistance(x, y, p.x, p.y) }));
    ranked.sort((a, b) => (a.d2 - b.d2) || (a.point.id - b.point.id));
    return ranked.slice(0, k);
  }

  function countVotes(neighbors) {
    const votes = [0, 0];
    for (const n of neighbors) votes[n.point.label]++;
    return votes;
  }

  function majorityLabel(votes, neighbors) {
    if (votes[CLASS_A] > votes[CLASS_B]) return CLASS_A;
    if (votes[CLASS_B] > votes[CLASS_A]) return CLASS_B;
    return neighbors.length ? neighbors[0].point.label : CLASS_A; // unreachable with odd K
  }

  // Fast version for the prediction map: keeps a small sorted buffer of the K best.
  // Same ordering rule (distance, then ID) as findNeighbors.
  function makeFastPredictor(points, k) {
    const n = points.length;
    const px = new Float64Array(n), py = new Float64Array(n);
    const pid = new Int32Array(n), plab = new Int8Array(n);
    points.forEach((p, i) => { px[i] = p.x; py[i] = p.y; pid[i] = p.id; plab[i] = p.label; });
    const bd = new Float64Array(k), bi = new Int32Array(k), bl = new Int8Array(k);

    return function predict(x, y) {
      let filled = 0;
      for (let j = 0; j < n; j++) {
        const dx = x - px[j], dy = y - py[j];
        const d = dx * dx + dy * dy;
        const id = pid[j];
        if (filled < k || d < bd[filled - 1] || (d === bd[filled - 1] && id < bi[filled - 1])) {
          let i = filled < k ? filled++ : filled - 1;
          while (i > 0 && (bd[i - 1] > d || (bd[i - 1] === d && bi[i - 1] > id))) {
            bd[i] = bd[i - 1]; bi[i] = bi[i - 1]; bl[i] = bl[i - 1];
            i--;
          }
          bd[i] = d; bi[i] = id; bl[i] = plab[j];
        }
      }
      let a = 0;
      for (let i = 0; i < filled; i++) if (bl[i] === CLASS_A) a++;
      const b = filled - a;
      return a > b ? CLASS_A : b > a ? CLASS_B : bl[0];
    };
  }

  /* =======================================================
     4. UI state
     ======================================================= */

  const K_CHOICES = [1, 3, 5, 7, 9, 11, 13, 15];

  const state = {
    datasetKey: 'student',
    sample: 1,
    points: [],
    k: 3,
    mode: 'neighbors',
    follow: true,
    test: { x: 0, y: 0 },
    show: { circle: true, lines: true, ids: false, coords: true }
  };

  const preset = () => PRESETS[state.datasetKey];

  const el = {};
  [
    'plot', 'plotWrap', 'datasetSelect', 'newSampleBtn', 'resetSampleBtn', 'sampleLabel',
    'kSelect', 'modeNeighbors', 'modeMap', 'mapNote', 'result', 'kValue',
    'voteNameA', 'voteNameB', 'votesA', 'votesB', 'tallyA', 'tallyB', 'predText',
    'coords', 'coordTitle', 'coordXLabel', 'coordYLabel', 'coordX', 'coordY',
    'neighborsDetails', 'neighborList', 'tieInfoBtn', 'tieNote',
    'followStatus', 'followBtn', 'optCircle', 'optLines', 'optIds', 'optCoords', 'optFollow',
    'resetTestBtn', 'legendA', 'legendB', 'legendTest', 'announcer'
  ].forEach(id => { el[id] = document.getElementById(id); });

  const canvas = el.plot;
  const ctx = canvas.getContext('2d');

  /* =======================================================
     5. Coordinate conversion and layout
     ======================================================= */

  let layout = null; // { cssW, cssH, plotX, plotY, plotW, plotH, scale }
  let dpr = 1;
  let lastWrapWidth = -1;

  // Equal scale on both axes, so the neighborhood circle is a true circle.
  function computeLayout() {
    const d = preset().domain;
    const xr = d.xmax - d.xmin;
    const yr = d.ymax - d.ymin;
    const style = getComputedStyle(el.plotWrap);
    const wrapW = el.plotWrap.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const narrow = wrapW < 560;
    const m = narrow ? { l: 54, r: 12, t: 14, b: 54 } : { l: 72, r: 20, t: 18, b: 64 };

    let plotW = Math.max(120, wrapW - m.l - m.r);
    let scale = plotW / xr;
    let plotH = yr * scale;
    const maxPlotH = Math.max(220, window.innerHeight * 0.74 - m.t - m.b);
    if (plotH > maxPlotH) {
      plotH = maxPlotH;
      scale = plotH / yr;
      plotW = xr * scale;
    }
    const cssW = wrapW;
    const cssH = Math.round(plotH + m.t + m.b);
    const plotX = m.l + Math.max(0, (wrapW - m.l - m.r - plotW) / 2);
    return { cssW, cssH, plotX, plotY: m.t, plotW, plotH, scale, narrow };
  }

  function dataToPx(x, y) {
    const d = preset().domain;
    return {
      x: layout.plotX + (x - d.xmin) * layout.scale,
      y: layout.plotY + layout.plotH - (y - d.ymin) * layout.scale
    };
  }

  function pxToData(px, py) {
    const d = preset().domain;
    return {
      x: d.xmin + (px - layout.plotX) / layout.scale,
      y: d.ymin + (layout.plotY + layout.plotH - py) / layout.scale
    };
  }

  function clampToDomain(p) {
    const d = preset().domain;
    return {
      x: Math.min(d.xmax, Math.max(d.xmin, p.x)),
      y: Math.min(d.ymax, Math.max(d.ymin, p.y))
    };
  }

  function resizeCanvas(force) {
    const w = el.plotWrap.clientWidth;
    const newDpr = window.devicePixelRatio || 1;
    if (!force && w === lastWrapWidth && newDpr === dpr && layout) return;
    lastWrapWidth = w;
    dpr = newDpr;
    layout = computeLayout();
    canvas.style.height = layout.cssH + 'px';
    canvas.width = Math.round(layout.cssW * dpr);
    canvas.height = Math.round(layout.cssH * dpr);
    mapStale = true;
    requestRender();
  }

  /* =======================================================
     6. Palette (read from CSS so light/dark stay in sync)
     ======================================================= */

  let palette = {};
  function readPalette() {
    const cs = getComputedStyle(document.documentElement);
    const v = name => cs.getPropertyValue(name).trim();
    const rgb = name => v(name).split(',').map(s => parseInt(s, 10));
    palette = {
      paper: v('--paper'), ink: v('--ink'), inkSoft: v('--ink-soft'),
      blue: v('--blue'), orange: v('--orange'),
      blueStroke: v('--blue-stroke'), orangeStroke: v('--orange-stroke'),
      gray: v('--gray-point'), grayStroke: v('--gray-stroke'),
      outline: v('--outline'), plotBg: v('--plot-bg'), grid: v('--grid'), axis: v('--axis'),
      mapA: rgb('--map-a-rgb'), mapAAlpha: parseFloat(v('--map-a-alpha')),
      mapB: rgb('--map-b-rgb'), mapBAlpha: parseFloat(v('--map-b-alpha')),
      sans: v('--sans')
    };
  }

  /* =======================================================
     7. Prediction map (cached; not recomputed on cursor moves)
     ======================================================= */

  const mapCanvas = document.createElement('canvas');
  let mapStale = true;

  function buildPredictionMap() {
    const cell = 3; // CSS pixels per grid cell
    const cols = Math.max(2, Math.round(layout.plotW / cell));
    const rows = Math.max(2, Math.round(layout.plotH / cell));
    mapCanvas.width = cols;
    mapCanvas.height = rows;
    const mctx = mapCanvas.getContext('2d');
    const img = mctx.createImageData(cols, rows);
    const data = img.data;
    const d = preset().domain;
    const predict = makeFastPredictor(state.points, state.k);
    const colA = palette.mapA, colB = palette.mapB;
    const alphaA = Math.round(palette.mapAAlpha * 255);
    const alphaB = Math.round(palette.mapBAlpha * 255);

    for (let r = 0; r < rows; r++) {
      const y = d.ymax - ((r + 0.5) / rows) * (d.ymax - d.ymin);
      for (let c = 0; c < cols; c++) {
        const x = d.xmin + ((c + 0.5) / cols) * (d.xmax - d.xmin);
        const label = predict(x, y);
        const i = (r * cols + c) * 4;
        const col = label === CLASS_A ? colA : colB;
        data[i] = col[0]; data[i + 1] = col[1]; data[i + 2] = col[2];
        data[i + 3] = label === CLASS_A ? alphaA : alphaB;
      }
    }
    mctx.putImageData(img, 0, 0);
    mapStale = false;
  }

  /* =======================================================
     8. Canvas rendering
     ======================================================= */

  function niceTicks(min, max, target) {
    const raw = (max - min) / target;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / mag;
    const step = (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * mag;
    const values = [];
    const start = Math.ceil(min / step - 1e-9);
    for (let i = start; i * step <= max + 1e-9; i++) {
      let v = i * step;
      if (Math.abs(v) < 1e-9) v = 0;
      values.push(v);
    }
    const decimals = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
    return values.map(v => ({ v, text: v.toFixed(decimals) }));
  }

  function pathCircle(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
  }
  function pathSquare(x, y, r) {
    const s = r * 1.75;
    ctx.beginPath();
    ctx.rect(x - s / 2, y - s / 2, s, s);
  }
  function pathStar(x, y, R) {
    const inner = R * 0.47;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 === 0 ? R : inner;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const px = x + rad * Math.cos(a);
      const py = y + rad * Math.sin(a);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function drawAxes() {
    const p = preset();
    const d = p.domain;
    const L = layout;
    const fontSize = L.narrow ? 12 : 15;

    ctx.fillStyle = palette.plotBg;
    ctx.fillRect(L.plotX, L.plotY, L.plotW, L.plotH);

    const xt = niceTicks(d.xmin, d.xmax, L.narrow ? 5 : 8);
    const yt = niceTicks(d.ymin, d.ymax, L.narrow ? 4 : 6);

    ctx.lineWidth = 1;
    ctx.strokeStyle = palette.grid;
    ctx.beginPath();
    for (const t of xt) {
      const x = Math.round(dataToPx(t.v, d.ymin).x) + 0.5;
      ctx.moveTo(x, L.plotY); ctx.lineTo(x, L.plotY + L.plotH);
    }
    for (const t of yt) {
      const y = Math.round(dataToPx(d.xmin, t.v).y) + 0.5;
      ctx.moveTo(L.plotX, y); ctx.lineTo(L.plotX + L.plotW, y);
    }
    ctx.stroke();

    return { xt, yt, fontSize };
  }

  function drawAxisFrame(ticks) {
    const p = preset();
    const d = p.domain;
    const L = layout;
    ctx.strokeStyle = palette.axis;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(L.plotX, L.plotY, L.plotW, L.plotH);

    ctx.fillStyle = palette.inkSoft;
    ctx.font = `${ticks.fontSize}px ${palette.sans}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (const t of ticks.xt) {
      const x = dataToPx(t.v, d.ymin).x;
      ctx.fillText(t.text, x, L.plotY + L.plotH + 7);
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (const t of ticks.yt) {
      const y = dataToPx(d.xmin, t.v).y;
      ctx.fillText(t.text, L.plotX - 8, y);
    }

    ctx.fillStyle = palette.ink;
    ctx.font = `600 ${ticks.fontSize + 2}px ${palette.sans}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(p.xLabel, L.plotX + L.plotW / 2, L.cssH - 6);

    ctx.save();
    ctx.translate(16, L.plotY + L.plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textBaseline = 'middle';
    ctx.fillText(p.yLabel, 0, 0);
    ctx.restore();
  }

  function pointRadius() {
    return Math.max(5, Math.min(9, layout.plotW / 105));
  }

  function drawTrainingPoint(p, selected, r) {
    const c = dataToPx(p.x, p.y);
    if (p.label === CLASS_A) pathCircle(c.x, c.y, r); else pathSquare(c.x, c.y, r);
    if (selected) {
      ctx.fillStyle = p.label === CLASS_A ? palette.blue : palette.orange;
      ctx.strokeStyle = p.label === CLASS_A ? palette.blueStroke : palette.orangeStroke;
      ctx.lineWidth = 2;
    } else {
      ctx.fillStyle = palette.gray;
      ctx.strokeStyle = palette.grayStroke;
      ctx.lineWidth = 1.25;
    }
    ctx.fill();
    ctx.stroke();
  }

  let frameRequested = false;
  function requestRender() {
    if (frameRequested) return;
    frameRequested = true;
    requestAnimationFrame(render);
  }

  function computeCurrent() {
    const neighbors = findNeighbors(state.test.x, state.test.y, state.points, state.k);
    const votes = countVotes(neighbors);
    const prediction = majorityLabel(votes, neighbors);
    return { neighbors, votes, prediction };
  }

  function render() {
    frameRequested = false;
    if (!layout) return;
    const L = layout;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, L.cssW, L.cssH);
    ctx.fillStyle = palette.paper;
    ctx.fillRect(0, 0, L.cssW, L.cssH);

    const ticks = drawAxes();

    if (state.mode === 'map') {
      if (mapStale) buildPredictionMap();
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(mapCanvas, L.plotX, L.plotY, L.plotW, L.plotH);
      ctx.restore();
    }

    drawAxisFrame(ticks);

    const { neighbors, votes, prediction } = computeCurrent();
    const selectedIds = new Set(neighbors.map(n => n.point.id));
    const t = dataToPx(state.test.x, state.test.y);
    const r = pointRadius();

    // Neighborhood circle: radius = distance to the Kth-nearest neighbor.
    if (state.show.circle && neighbors.length) {
      const radius = Math.sqrt(neighbors[neighbors.length - 1].d2) * L.scale;
      ctx.save();
      ctx.beginPath();
      ctx.rect(L.plotX, L.plotY, L.plotW, L.plotH);
      ctx.clip();
      pathCircle(t.x, t.y, radius);
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = palette.outline;
      ctx.fill();
      ctx.globalAlpha = 0.6;
      ctx.setLineDash([7, 6]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = palette.outline;
      ctx.stroke();
      ctx.restore();
    }

    // Non-neighbors first so they recede behind the voters.
    for (const p of state.points) if (!selectedIds.has(p.id)) drawTrainingPoint(p, false, r * 0.9);

    // Thin lines to neighbors (only for small K to avoid clutter).
    if (state.show.lines && state.k <= 5) {
      ctx.save();
      ctx.strokeStyle = palette.outline;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (const n of neighbors) {
        const c = dataToPx(n.point.x, n.point.y);
        ctx.moveTo(t.x, t.y); ctx.lineTo(c.x, c.y);
      }
      ctx.stroke();
      ctx.restore();
    }

    for (const n of neighbors) drawTrainingPoint(n.point, true, r * 1.15);

    if (state.show.ids) {
      ctx.font = `${L.narrow ? 10 : 12}px ${palette.sans}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      for (const p of state.points) {
        const c = dataToPx(p.x, p.y);
        const sel = selectedIds.has(p.id);
        ctx.fillStyle = sel ? palette.ink : palette.inkSoft;
        ctx.globalAlpha = sel ? 1 : 0.75;
        ctx.fillText(String(p.id), c.x + r + 1, c.y - r * 0.4);
      }
      ctx.globalAlpha = 1;
    }

    // The test case: large star, predicted-color interior, heavy outline.
    const R = r * 2.5;
    pathStar(t.x, t.y, R);
    ctx.lineJoin = 'round';
    ctx.lineWidth = 7;
    ctx.strokeStyle = palette.paper;
    ctx.stroke();
    ctx.fillStyle = prediction === CLASS_A ? palette.blue : palette.orange;
    ctx.fill();
    ctx.lineWidth = 3.2;
    ctx.strokeStyle = palette.outline;
    ctx.stroke();

    updatePanel(neighbors, votes, prediction);
  }

  /* =======================================================
     9. Panel updates (text only; no DOM rebuild per frame)
     ======================================================= */

  const cache = {};
  function resetPanelCache() {
    Object.assign(cache, { k: null, a: null, b: null, pred: null, ids: null, cx: null, cy: null });
  }
  resetPanelCache();

  // Pre-create tally marks and neighbor list items once.
  const MAX_K = K_CHOICES[K_CHOICES.length - 1];
  const tallyMarks = { a: [], b: [] };
  for (let i = 0; i < MAX_K; i++) {
    const ia = document.createElement('i'); ia.hidden = true; el.tallyA.appendChild(ia); tallyMarks.a.push(ia);
    const ib = document.createElement('i'); ib.hidden = true; el.tallyB.appendChild(ib); tallyMarks.b.push(ib);
  }
  const listItems = [];
  for (let i = 0; i < MAX_K; i++) {
    const li = document.createElement('li'); li.hidden = true; el.neighborList.appendChild(li); listItems.push(li);
  }

  const voteText = n => (n === 1 ? '1 vote' : `${n} votes`);

  function updatePanel(neighbors, votes, prediction) {
    const p = preset();

    if (cache.k !== state.k) { el.kValue.textContent = state.k; cache.k = state.k; }

    if (cache.a !== votes[0]) {
      el.votesA.textContent = voteText(votes[0]);
      tallyMarks.a.forEach((m, i) => { m.hidden = i >= votes[0]; });
      cache.a = votes[0];
    }
    if (cache.b !== votes[1]) {
      el.votesB.textContent = voteText(votes[1]);
      tallyMarks.b.forEach((m, i) => { m.hidden = i >= votes[1]; });
      cache.b = votes[1];
    }
    if (cache.pred !== prediction) {
      el.predText.textContent = p.classNames[prediction];
      el.result.dataset.pred = prediction === CLASS_A ? 'a' : 'b';
      cache.pred = prediction;
    }

    if (el.neighborsDetails.open) {
      const ids = neighbors.map(n => n.point.id).join(',');
      if (cache.ids !== ids) {
        listItems.forEach((li, i) => {
          if (i < neighbors.length) {
            const pt = neighbors[i].point;
            li.hidden = false;
            li.textContent = `Point ${pt.id}, ${p.classNames[pt.label]}`;
            li.className = pt.label === CLASS_A ? 'nb-a' : 'nb-b';
          } else {
            li.hidden = true;
          }
        });
        cache.ids = ids;
      }
    }

    if (state.show.coords) {
      const cx = state.test.x.toFixed(1);
      const cy = state.test.y.toFixed(1);
      if (cache.cx !== cx) { el.coordX.textContent = cx; cache.cx = cx; }
      if (cache.cy !== cy) { el.coordY.textContent = cy; cache.cy = cy; }
    }
  }

  function updateDatasetText() {
    const p = preset();
    el.legendA.textContent = p.classNames[0];
    el.legendB.textContent = p.classNames[1];
    el.legendTest.textContent = p.testName;
    el.voteNameA.textContent = p.classNames[0];
    el.voteNameB.textContent = p.classNames[1];
    el.coordTitle.textContent = p.testName;
    el.coordXLabel.textContent = p.xLabel;
    el.coordYLabel.textContent = p.yLabel;
    el.sampleLabel.textContent = `Sample ${state.sample}`;
    canvas.setAttribute('aria-label',
      `KNN plot of ${p.name}: ${p.xLabel} across, ${p.yLabel} up. ` +
      'Use the arrow keys to move the test case. Hold Shift for larger steps.');
    resetPanelCache();
  }

  /* =======================================================
     10. Announcements (aria-live)
     ======================================================= */

  function announce(prefix) {
    const p = preset();
    const { votes, prediction } = computeCurrent();
    const msg = `${prefix ? prefix + '. ' : ''}K = ${state.k}. ` +
      `${p.classNames[0]}: ${voteText(votes[0])}. ${p.classNames[1]}: ${voteText(votes[1])}. ` +
      `Prediction: ${p.classNames[prediction]}. ` +
      `${p.xLabel} ${state.test.x.toFixed(1)}, ${p.yLabel} ${state.test.y.toFixed(1)}.`;
    // Clear first so repeated identical messages are still read.
    el.announcer.textContent = '';
    setTimeout(() => { el.announcer.textContent = msg; }, 30);
  }

  let announceTimer = null;
  function announceSoon(prefix) {
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => announce(prefix), 400);
  }

  /* =======================================================
     11. State changes
     ======================================================= */

  function populateKOptions() {
    const n = state.points.length;
    const allowed = K_CHOICES.filter(k => k <= n);
    if (!allowed.includes(state.k)) {
      state.k = allowed.filter(k => k <= state.k).pop() || allowed[0];
    }
    const current = Array.from(el.kSelect.options).map(o => +o.value).join(',');
    if (current !== allowed.join(',')) {
      el.kSelect.textContent = '';
      for (const k of allowed) {
        const o = document.createElement('option');
        o.value = String(k);
        o.textContent = String(k);
        el.kSelect.appendChild(o);
      }
    }
    el.kSelect.value = String(state.k);
  }

  function loadData() {
    state.points = generateDataset(state.datasetKey, state.sample);
    state.test = clampToDomain(state.test);
    populateKOptions();
    updateDatasetText();
    mapStale = true;
    requestRender();
  }

  function setFollow(on) {
    state.follow = on;
    el.followBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    el.optFollow.checked = on;
    el.followStatus.textContent = on
      ? 'Following the cursor. Click the plot to freeze the test case.'
      : 'Frozen. Click the plot to move the test case, or choose Follow cursor.';
  }

  function resetTest() {
    const t = preset().defaultTest;
    state.test = { x: t.x, y: t.y };
    requestRender();
  }

  /* =======================================================
     12. Pointer, touch, and keyboard interaction
     ======================================================= */

  function setTestFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    const d = pxToData(e.clientX - rect.left, e.clientY - rect.top);
    state.test = clampToDomain(d);
    requestRender();
  }

  let dragging = false;

  canvas.addEventListener('pointermove', e => {
    if (e.pointerType === 'mouse') {
      if (state.follow) setTestFromEvent(e);
    } else if (dragging) {
      setTestFromEvent(e);
    }
  });

  canvas.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse') {
      if (e.button !== 0) return;
      setTestFromEvent(e);
      setFollow(false);
      announce('Test case frozen');
    } else {
      dragging = true;
      try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
      setTestFromEvent(e);
      e.preventDefault();
    }
  });

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    setFollow(false);
    announce('Test case placed');
  }
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  canvas.addEventListener('keydown', e => {
    const keys = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
    const dir = keys[e.key];
    if (!dir) return;
    e.preventDefault();
    const d = preset().domain;
    const frac = e.shiftKey ? 0.05 : 0.01;
    state.test = clampToDomain({
      x: state.test.x + dir[0] * frac * (d.xmax - d.xmin),
      y: state.test.y + dir[1] * frac * (d.ymax - d.ymin)
    });
    if (state.follow) setFollow(false);
    requestRender();
    announceSoon('Test case moved');
  });

  /* =======================================================
     13. Control wiring
     ======================================================= */

  el.datasetSelect.addEventListener('change', () => {
    state.datasetKey = el.datasetSelect.value;
    state.sample = 1;
    const t = preset().defaultTest;
    state.test = { x: t.x, y: t.y };
    loadData();
    resizeCanvas(true); // aspect ratio depends on the dataset's ranges
    announce(`${preset().name} dataset, sample 1`);
  });

  el.newSampleBtn.addEventListener('click', () => {
    state.sample += 1;
    loadData();
    announce(`Sample ${state.sample}`);
  });

  el.resetSampleBtn.addEventListener('click', () => {
    state.sample = 1;
    loadData();
    announce('Sample 1');
  });

  el.kSelect.addEventListener('change', () => {
    state.k = parseInt(el.kSelect.value, 10);
    mapStale = true;
    requestRender();
    announce('K changed');
  });

  function setMode(mode) {
    state.mode = mode;
    el.mapNote.hidden = mode !== 'map';
    requestRender();
  }
  el.modeNeighbors.addEventListener('change', () => setMode('neighbors'));
  el.modeMap.addEventListener('change', () => setMode('map'));

  el.followBtn.addEventListener('click', () => {
    setFollow(!state.follow);
    if (!state.follow) announce('Test case frozen');
  });
  el.optFollow.addEventListener('change', () => {
    setFollow(el.optFollow.checked);
    if (!state.follow) announce('Test case frozen');
  });

  el.optCircle.addEventListener('change', () => { state.show.circle = el.optCircle.checked; requestRender(); });
  el.optLines.addEventListener('change', () => { state.show.lines = el.optLines.checked; requestRender(); });
  el.optIds.addEventListener('change', () => { state.show.ids = el.optIds.checked; requestRender(); });
  el.optCoords.addEventListener('change', () => {
    state.show.coords = el.optCoords.checked;
    el.coords.hidden = !state.show.coords;
    cache.cx = cache.cy = null;
    requestRender();
  });

  el.resetTestBtn.addEventListener('click', () => {
    resetTest();
    announce('Test case reset');
  });

  el.neighborsDetails.addEventListener('toggle', () => { cache.ids = null; requestRender(); });

  el.tieInfoBtn.addEventListener('click', () => {
    const open = el.tieInfoBtn.getAttribute('aria-expanded') === 'true';
    el.tieInfoBtn.setAttribute('aria-expanded', open ? 'false' : 'true');
    el.tieNote.hidden = open;
  });

  // Resize handling (canvas size change -> prediction map rebuild).
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => resizeCanvas(false)).observe(el.plotWrap);
  }
  window.addEventListener('resize', () => resizeCanvas(true));

  // Theme changes: re-read colors and rebuild the map.
  const darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  if (darkQuery && darkQuery.addEventListener) {
    darkQuery.addEventListener('change', () => { readPalette(); mapStale = true; requestRender(); });
  }

  /* =======================================================
     14. Start
     ======================================================= */

  readPalette();
  el.datasetSelect.value = state.datasetKey;
  resetTest();
  loadData();
  setFollow(true);
  setMode('neighbors');
  resizeCanvas(true);
})();
