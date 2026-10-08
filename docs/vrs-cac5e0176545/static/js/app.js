// 벤더 배송권역 시뮬레이터 — 화면
import * as E from './engine.js';

const $ = (s) => document.querySelector(s);
const fmt = (x) => Math.round(x).toLocaleString('ko-KR');
const pct = (a, b, d = 1) => (b ? `${(100 * a / b).toFixed(d)}%` : '-');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const C = { sales: '#c0392b', cost: '#2a5c86', warn: '#e67e22', ok: '#1e7355', new: '#5b3fa8', mute: '#8a8f98' };
const T_COLOR = { 1: C.ok, 2: '#f0b37e', 3: C.warn, 4: C.new, 5: C.mute };
const RING_KM = 3; // 상점 배송 반경 3km (영업존 외곽 기준)
const LS_KEY = 'vrs.v1.blues';

const st = {
  meta: null, n: 0, X: null, col: null, stores: {},
  blues: [], zones: [], seq: 1, sel: null,
  mask: null, cls: null, agg: null, base: null, gaps: [], dirty: false,
};

// ───────── 지도 ─────────
const map = L.map('map', { zoomControl: true, preferCanvas: false }).setView([37.575, 127.03], 12);
// CARTO 타일은 2026-10 현재 키 없이 쓰면 'API KEY REQUIRED' 워터마크가 찍힌다 → OSM 표준 타일(흐리게)
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors', maxZoom: 19, className: 'baseTiles',
  referrerPolicy: 'strict-origin-when-cross-origin', // OSM 이용 정책: 출처가 없으면 'Access blocked' 타일이 온다
}).addTo(map);
// 커버 공백 빗금 무늬 (CSS fill: url(#vrsHatch))
document.body.insertAdjacentHTML('beforeend', `<svg width="0" height="0" style="position:absolute"><defs>
  <pattern id="vrsHatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
  <rect width="9" height="9" fill="rgba(230,126,34,.10)"/><line x1="0" y1="0" x2="0" y2="9" stroke="#e67e22" stroke-width="3" stroke-opacity=".55"/></pattern></defs></svg>`);
for (const [name, z] of [['heatPane', 380], ['gapPane', 390], ['ringPane', 395], ['salesPane', 450]]) {
  map.createPane(name).style.zIndex = z;
  map.getPane(name).style.pointerEvents = name === 'gapPane' ? 'auto' : 'none';
}
const heatRenderer = L.canvas({ pane: 'heatPane', padding: 0.2 });
const heatLayer = L.layerGroup().addTo(map);
const gapLayer = L.layerGroup().addTo(map);
const ringLayer = L.layerGroup().addTo(map);
const salesLayer = L.layerGroup().addTo(map);
const markLayer = L.layerGroup().addTo(map);

map.pm.addControls({
  position: 'topleft', drawMarker: false, drawCircleMarker: false, drawPolyline: false, drawCircle: false,
  drawText: false, drawRectangle: true, drawPolygon: true, editMode: true, dragMode: true, cutPolygon: true,
  removalMode: true, rotateMode: false,
});
try { map.pm.setLang('ko'); } catch { /* 번역 없으면 영어 */ }
map.pm.setPathOptions({ color: C.cost, fillColor: C.cost, fillOpacity: 0.12, weight: 2 });

const legend = L.control({ position: 'bottomleft' });
const HEAT = { t3: '#c2185b', t2: '#5e35b1', dest: '#1f7a6b', none5: '#6b6f76' }; // 분포 격자 색 (T3 진홍 · T2 보라)
const HEAT_LABEL = { out: '권역 외 오더 도착지', none5: '권역 미포함 오더 도착지', dest: '전체 오더 도착지', origin: '전체 오더 출발지' };
legend.onAdd = () => L.DomUtil.create('div', 'mapLegend');
function renderLegend() {
  const d = legend.getContainer();
  if (!d) return;
  const mode = $('#heatMode').value;
  const sw = (c) => `<i style="border-top:9px solid ${c};opacity:.75"></i>`;
  const heat = mode === 'out'
    ? `<div>${sw(HEAT.t3)}T3 이탈 — 도착이 모든 박스 밖</div><div>${sw(HEAT.t2)}T2 권역 간 — 도착이 다른 박스 안</div>`
    : mode === 'off' ? '' : `<div>${sw(mode === 'none5' ? HEAT.none5 : HEAT.dest)}${HEAT_LABEL[mode]}</div>`;
  d.innerHTML = `<div><i style="border-top:3px solid ${C.sales}"></i>영업존(고정)</div>
    <div><i style="border-top:2px dashed ${C.sales}"></i>영업존 외곽 ${RING_KM}km</div>
    <div><i style="border-top:3px solid ${C.cost}"></i>파란 박스(벤더 배송권역)</div>
    <div><i style="border-top:8px solid rgba(230,126,34,.45)"></i>커버 공백(${RING_KM}km 안, 파란 박스 밖)</div>
    ${heat ? `<div style="margin-top:3px;color:#5f6670">분포 격자(약 250m, 진할수록 많음 · 마우스를 올리면 건수)</div>${heat}` : ''}`;
}
legend.addTo(map);
renderLegend();

// ───────── 데이터 ─────────
async function getJSON(url) { const r = await fetch(url); if (!r.ok) throw new Error(`${url} ${r.status}`); return r.json(); }

// ───────── 데이터 창구: 로컬 서버(server.py) 또는 정적 배포(암호화 데이터 팩) ─────────
// 정적 배포(GitHub Pages)는 같은 폴더의 data.vrs.enc 를 비밀번호로 풀어 브라우저 안에서만 쓰고,
// 영업존 수정·시나리오는 이 브라우저(localStorage)에만 저장한다
const PACK_URL = 'data.vrs.enc';
const LS_ZONES = 'vrs.v1.zonesLocal', LS_SCEN = 'vrs.v1.scenarios';
const bk = { mode: 'server', pack: null };

async function detectBackend() {
  try {
    const r = await fetch('/api/datasets', { cache: 'no-store' });
    if (r.ok && (r.headers.get('content-type') || '').includes('json')) return 'server';
  } catch { /* 서버 없음 */ }
  return 'static';
}

function askPassword(msg) {
  return new Promise((resolve) => {
    openModal(`<h3>벤더 배송권역 시뮬레이터</h3><p class="hint">${msg || '데이터가 암호화되어 있습니다. 전달받은 비밀번호를 입력하세요.'}</p>
      <div class="row"><input id="mPw" type="password" autocomplete="off" style="flex:1;padding:6px"><button class="primary" id="mPwOk">열기</button></div>`, true);
    const go = () => { const v = $('#mPw').value; if (v) { closeModal(true); resolve(v); } };
    $('#mPwOk').onclick = go;
    $('#mPw').onkeydown = (e) => { if (e.key === 'Enter') go(); };
    $('#mPw').focus();
  });
}

// 형식: 'VRSE' | 버전(1B) | PBKDF2 반복수(uint32 BE) | salt(16) | iv(12) | AES-256-GCM 암호문(+태그). 앞 9바이트는 AAD
async function decryptPack(enc, pw) {
  const u8 = new Uint8Array(enc);
  if (String.fromCharCode(...u8.slice(0, 4)) !== 'VRSE' || u8[4] !== 1) throw new Error('데이터 팩 형식이 아닙니다');
  const iter = new DataView(enc).getUint32(5, false);
  const salt = u8.slice(9, 25), iv = u8.slice(25, 37), ct = u8.slice(37);
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, base,
    { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  return crypto.subtle.decrypt({ name: 'AES-GCM', iv, additionalData: u8.slice(0, 9) }, key, ct);
}

// 평문 팩: 'VRSP' | 헤더 길이(uint32 LE) | 헤더 JSON | 이진 데이터들
function parsePack(buf) {
  const u8 = new Uint8Array(buf);
  if (String.fromCharCode(...u8.slice(0, 4)) !== 'VRSP') throw new Error('데이터 팩이 손상되었습니다');
  const hl = new DataView(buf).getUint32(4, true);
  const header = JSON.parse(new TextDecoder().decode(u8.slice(8, 8 + hl)));
  return { header, blobs: buf.slice(8 + hl) };
}

async function unlockPack() {
  setStatus('암호화된 데이터를 내려받는 중…');
  const r = await fetch(PACK_URL, { cache: 'no-store' });
  if (!r.ok) throw new Error('데이터 팩(data.vrs.enc)을 찾지 못했습니다');
  const enc = await r.arrayBuffer();
  let msg = null;
  for (;;) {
    const pw = await askPassword(msg);
    setStatus('복호화 중… (몇 초 걸립니다)');
    try { return parsePack(await decryptPack(enc, pw)); } catch (e) {
      if (e.name !== 'OperationError') throw e;
      msg = '비밀번호가 맞지 않습니다. 다시 입력하세요.';
      setStatus('비밀번호를 기다리는 중…');
    }
  }
}

const lsGet = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? d; } catch { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };

async function bkDatasets() {
  if (bk.mode === 'server') return getJSON('/api/datasets');
  return bk.pack.header.datasets.map((d) => ({ dataset: d.meta.dataset, label: d.meta.label, n: d.meta.n, period: d.meta.period }));
}
async function bkDataset(name) {
  if (bk.mode === 'server') {
    const meta = await getJSON(`/data/${name}.json`);
    const r = await fetch(`/data/${name}.bin`);
    if (!r.ok) throw new Error(`/data/${name}.bin ${r.status}`);
    return { meta, buf: await r.arrayBuffer(), stores: await getJSON(`/data/${name}.stores.json`) };
  }
  const d = bk.pack.header.datasets.find((x) => x.meta.dataset === name);
  return { meta: d.meta, buf: bk.pack.blobs.slice(d.binOffset, d.binOffset + d.binLength), stores: d.stores };
}
async function bkMeta(name) { return bk.mode === 'server' ? getJSON(`/data/${name}.json`) : bk.pack.header.datasets.find((x) => x.meta.dataset === name).meta; }
async function bkZones() {
  if (bk.mode === 'server') return getJSON('/api/layers/sales_zones');
  return lsGet(LS_ZONES, null) || bk.pack.header.zones;
}
async function bkSaveZones(fc) {
  if (bk.mode === 'static') return lsSet(LS_ZONES, fc) ? { ok: true } : { ok: false, error: '브라우저 저장 공간 부족' };
  const r = await fetch('/api/layers/sales_zones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fc) });
  return r.ok ? { ok: true } : { ok: false, error: (await r.json().catch(() => ({}))).error || r.status };
}
async function bkScenarioList() {
  if (bk.mode === 'server') return getJSON('/api/scenarios');
  return Object.keys(lsGet(LS_SCEN, {})).sort();
}
async function bkScenario(name) {
  if (bk.mode === 'server') return getJSON(`/api/scenarios/${encodeURIComponent(name)}`);
  return lsGet(LS_SCEN, {})[name];
}
async function bkSaveScenario(name, body) {
  if (bk.mode === 'static') {
    const all = lsGet(LS_SCEN, {}); all[name] = body;
    return lsSet(LS_SCEN, all) ? { ok: true } : { ok: false, error: '브라우저 저장 공간 부족' };
  }
  const r = await fetch(`/api/scenarios/${encodeURIComponent(name)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return r.ok ? { ok: true } : { ok: false, error: (await r.json().catch(() => ({}))).error || r.status };
}

async function loadDataset(name) {
  setStatus('데이터 불러오는 중…');
  const t0 = performance.now();
  const { meta, buf, stores } = await bkDataset(name);
  if (meta.binBytes && buf.byteLength !== meta.binBytes) {
    throw new Error(`추출본 불일치(${name}.bin 크기가 메타와 다름) — extract.py를 다시 실행하세요`);
  }
  const col = {};
  for (const c of meta.columns) col[c.name] = new globalThis[`${c.type}Array`](buf, c.offset, c.length);
  const n = meta.n, s = meta.coordScale;
  const X = { ox: new Float64Array(n), oy: new Float64Array(n), dx: new Float64Array(n), dy: new Float64Array(n) };
  for (let i = 0; i < n; i++) {
    X.ox[i] = col.olng[i] * s; X.oy[i] = col.olat[i] * s; X.dx[i] = col.dlng[i] * s; X.dy[i] = col.dlat[i] * s;
  }
  Object.assign(st, { meta, n, col, X, stores, base: null });
  buildPopOptions();
  for (const b of st.blues) b.key = null;
  for (const z of st.zones) z.key = null;
  refreshAll();
  setStatus(null, performance.now() - t0);
}

function buildPopOptions() {
  const sel = $('#pop'), prev = sel.value;
  const zs = st.meta.zones.map((z) => `<option value="z${z.idx}">${esc(z.name)} 관제 상점</option>`).join('');
  // 영업존이 있으면 기본 모집단은 '체크(표시)한 영업존의 관제 상점'
  const main = st.zones.length ? `표시 중인 영업존의 관제 상점 (${visibleZones().length}/${st.zones.length}개 존)` : '5개 존 관제 상점 전체';
  sel.innerHTML = `<option value="zones">${main}</option>${zs}
    <option value="salesOrigin">출발지가 영업존 안 (지도 기준)</option><option value="all">데이터 전체</option>`;
  sel.value = [...sel.options].some((o) => o.value === prev) ? prev : 'zones';
}

// ───────── 모집단 ─────────
function buildMask() {
  const { n, col } = st;
  const pop = $('#pop').value, g4 = $('#fG4').checked, vd = $('#fVendor').checked, done = $('#fDone').checked;
  const day = $('#fDay').value, h0 = +$('#fH0').value || 0, h1 = $('#fH1').value === '' ? 23 : +$('#fH1').value;
  const g4code = st.meta.gCodes.indexOf('G4');
  const zIdx = pop.startsWith('z') && pop !== 'zones' ? +pop.slice(1) : 0;
  const so = pop === 'salesOrigin' ? salesOriginAny() : null;
  // 기본 모집단: 체크한 영업존의 관제 상점(기타 영업존은 출발지가 그 안인 오더). 영업존이 없으면 5개 존 전체
  let allowZone = null, allowOrigin = null;
  if (pop === 'zones' && st.zones.length) {
    const vis = visibleZones();
    allowZone = new Uint8Array(256);
    vis.forEach((z) => { if (z.zoneIdx) allowZone[z.zoneIdx] = 1; });
    const others = vis.filter((z) => !z.zoneIdx && z.O);
    if (others.length) {
      allowOrigin = new Uint8Array(n);
      for (const z of others) for (let i = 0; i < n; i++) if (z.O[i]) allowOrigin[i] = 1;
    }
  }
  const m = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    if (pop === 'zones') {
      if (allowZone ? !(allowZone[col.zone[i]] || (allowOrigin && allowOrigin[i])) : !col.zone[i]) continue;
    }
    if (zIdx && col.zone[i] !== zIdx) continue;
    if (so && !so[i]) continue;
    if (g4 && col.g[i] !== g4code) continue;
    if (vd && !(col.flags[i] & 2)) continue;
    if (done && col.st[i] !== 1) continue;
    const w = col.dow[i] >= 6;
    if (day === 'wd' && w) continue;
    if (day === 'we' && !w) continue;
    const h = col.hh[i];
    if (h0 <= h1 ? (h < h0 || h > h1) : (h < h0 && h > h1)) continue;
    m[i] = 1;
  }
  st.mask = m;
}

function salesOriginAny() {
  const out = new Uint8Array(st.n);
  for (const z of visibleZones()) if (z.O) for (let i = 0; i < st.n; i++) if (z.O[i]) out[i] = 1;
  return out;
}

// ───────── 판정 ─────────
function layerGeometry(layer) {
  const gj = layer && layer.toGeoJSON ? layer.toGeoJSON() : null;
  const g = gj && (gj.type === 'Feature' ? gj.geometry : gj.type === 'FeatureCollection' ? gj.features[0]?.geometry : null);
  return g && (g.type === 'Polygon' || g.type === 'MultiPolygon') ? g : null;
}

function ensureBlue(b) {
  const geom = layerGeometry(b.layer);
  if (!geom) { b.S = b.D = b.P = null; b.key = null; b.area = 0; return; } // 도형이 비었으면 계산에서 뺀다
  const key = E.geomKey(geom);
  if (b.key === key && b.S) return;
  b.geometry = geom; b.key = key;
  b.P = E.prepare(geom);
  b.S = E.membership(b.P, st.X.ox, st.X.oy, st.n);
  b.D = E.membership(b.P, st.X.dx, st.X.dy, st.n);
  const f = turf.feature(geom);
  b.area = turf.area(f) / 1e6;
  b.warn = [];
  try { if (turf.kinks(f).features.length) b.warn.push('꼬인 선'); } catch { /* 무시 */ }
  if (b.area < 0.005) b.warn.push('너무 작음');
  if (b.area > 200) b.warn.push('광역(셀 변환 부담)');
}

function ensureZone(z) {
  const key = E.geomKey(z.geometry);
  if (z.key === key && z.O) return;
  z.key = key;
  z.O = E.membership(E.prepare(z.geometry), st.X.ox, st.X.oy, st.n);
}

function activeBlues() { return st.blues.filter((b) => b.active && b.S); }
// 커버 공백이 지금 박스·영업존 상태로 계산된 것인지 확인하는 키
function gapStateKey() { return activeBlues().map((b) => b.key).join('|') + '#' + visibleZones().map((z) => E.geomKey(z.geometry)).join('|'); }

function recompute() {
  if (!st.n) return;
  const t0 = performance.now();
  st.blues.forEach(ensureBlue);
  st.zones.forEach(ensureZone);
  buildMask();
  const act = activeBlues();
  st.cls = E.classify(st.n, act.map((b) => b.S), act.map((b) => b.D));
  st.agg = E.aggregate(st.n, st.mask, act.map((b) => b.S), act.map((b) => b.D), st.cls);
  renderKpi(); renderPerPoly(); renderBlueList(); renderHeat(); renderGap(); renderBaseline();
  setStatus(null, performance.now() - t0);
}

let gapTimer = null;
function scheduleGap() { clearTimeout(gapTimer); gapTimer = setTimeout(() => { computeGaps(); renderGap(); }, 350); }
function refreshAll() { recompute(); computeGaps(); renderGap(); renderZoneList(); }

// ───────── 커버 공백: 영업존 외곽 3km 안인데 어떤 파란 박스도 덮지 않는 곳 ─────────
function computeGaps() {
  gapLayer.clearLayers(); ringLayer.clearLayers();
  st.gaps = [];
  st.gapKey = gapStateKey();
  if (!st.n || !visibleZones().length) return;
  const act = activeBlues();
  // '출발이 파란 박스 안' 판단도 공백과 같은 시점의 박스 상태로 저장한다
  const anyS = new Uint8Array(st.n);
  for (const b of act) { const S = b.S; for (let i = 0; i < st.n; i++) if (S[i]) anyS[i] = 1; }
  st.gapAnyS = anyS;
  let blueUnion = null;
  try {
    const feats = act.map((b) => turf.feature(b.geometry));
    blueUnion = feats.length === 1 ? feats[0] : feats.length > 1 ? turf.union(turf.featureCollection(feats)) : null;
  } catch (e) { toast(`파란 박스 합치기 실패: ${e.message}`); }
  for (const z of visibleZones()) {
    let ring = null, gap = null, inner = null, err = null;
    try {
      const zf = turf.feature(z.geometry);
      ring = turf.buffer(zf, RING_KM, { units: 'kilometers' });
      gap = blueUnion ? turf.difference(turf.featureCollection([ring, blueUnion])) : ring;
      // 공백 중 영업존 안쪽 = 영업존 자체가 파란 박스 밖인 곳 (외곽 링과 나눠 보여 준다)
      inner = gap ? turf.intersect(turf.featureCollection([gap, zf])) : null;
    } catch (e) { err = e.message; }
    const g = { zone: z, ring, gap, err, area: gap ? turf.area(gap) / 1e6 : 0,
      innerArea: inner ? turf.area(inner) / 1e6 : 0, D: null, DI: null };
    if (gap) g.D = E.membership(E.prepare(gap.geometry), st.X.dx, st.X.dy, st.n);
    if (inner) g.DI = E.membership(E.prepare(inner.geometry), st.X.dx, st.X.dy, st.n);
    st.gaps.push(g);
    if (ring && $('#lyRing').checked) {
      L.geoJSON(ring, { pane: 'ringPane', pmIgnore: true, interactive: false,
        style: { color: C.sales, weight: 1.2, dashArray: '6 6', fill: false, opacity: 0.7 } }).addTo(ringLayer);
    }
    if (gap && $('#lyGap').checked) {
      L.geoJSON(gap, { pane: 'gapPane', pmIgnore: true,
        style: { color: C.warn, weight: 1.2, dashArray: '3 4', fillColor: C.warn, fillOpacity: 1, className: 'gapHatch' } })
        .bindTooltip(`커버 공백 · ${esc(z.name)}`, { sticky: true }).addTo(gapLayer);
    }
  }
}

// ───────── 렌더링 ─────────
function renderKpi() {
  const { N, t } = st.agg;
  const b = st.base ? baseCounts() : null;
  const out = t[2] + t[3];
  const kd = (cur, prev, lowerIsGood = true) => {
    if (!b) return '';
    const dv = (100 * cur / (N || 1)) - (100 * prev / (b.N || 1));
    if (Math.abs(dv) < 0.05) return '<span class="d">±0.0%p</span>';
    const good = lowerIsGood ? dv < 0 : dv > 0;
    return `<span class="d ${good ? 'good' : 'bad'}">${dv > 0 ? '+' : ''}${dv.toFixed(1)}%p</span>`;
  };
  const bar = [1, 2, 3, 4, 5].map((k) => `<div title="${E.T_LABEL[k]} ${fmt(t[k])}건" style="width:${N ? 100 * t[k] / N : 0}%;background:${T_COLOR[k]}"></div>`).join('');
  // 일평균 분모는 요일 필터에 맞는 날짜 수
  const nd = daysInFilter();
  // 권역 외는 '출발지가 박스 안'인 오더만 센다 → 출발지가 박스 밖이면 권역 외 0%가 오히려 나쁜 상태
  const uncovered = t[4] + t[5];
  const popLabel = $('#pop').selectedOptions[0]?.text || '';
  const alert = N && uncovered / N >= 0.2
    ? `<div class="alert">⚠ 이 모집단(${esc(popLabel)}) 오더의 <b>${pct(uncovered, N)}</b>는 출발지가 어느 파란 박스에도 없습니다.
       권역 외는 <b>출발지가 박스 안</b>인 오더만 세므로, 이 오더들은 권역 외가 아니라 <b>권역 미포함(벤더 후보 없음, 프렌즈만)</b>으로 잡힙니다.
       ${activeBlues().length ? '모집단과 파란 박스 위치가 맞는지 확인하세요.' : '먼저 이 상점들을 덮는 파란 박스를 그리세요.'}</div>` : '';
  $('#kpi').innerHTML = `<h2>전체 결과 <small>모집단 ${fmt(N)}건 · 일평균 ${fmt(N / nd)}건(${nd}일)</small></h2>${alert}
    <div class="kpis">
      <div class="kpi main"><div class="k">권역 외 비중 (T3 이탈)</div><div class="v">${pct(t[3], N)}${kd(t[3], b ? b.t[3] : 0)}</div>
        <div class="k">${fmt(t[3])}건 · 보조: 보수(T2+T3) ${pct(out, N)}${kd(out, b ? b.t[2] + b.t[3] : 0)}</div></div>
      <div class="kpi"><div class="k">권역 내 확보율 (T1)</div><div class="v">${pct(t[1], N)}${kd(t[1], b ? b.t[1] : 0, false)}</div></div>
      <div class="kpi ${N && t[5] / N >= 0.2 ? 'bad' : ''}"><div class="k">권역 미포함 (T5) — 벤더 후보 없음</div><div class="v">${pct(t[5], N)}${kd(t[5], b ? b.t[5] : 0)}</div></div>
      <div class="kpi"><div class="k">출발 미커버 (T4+T5)</div><div class="v">${pct(t[4] + t[5], N)}${kd(t[4] + t[5], b ? b.t[4] + b.t[5] : 0)}</div></div>
      <div class="kpi"><div class="k">필요 가상 지점</div><div class="v">${activeBlues().length}개</div></div>
    </div>
    <div class="bar">${bar}</div>
    <div class="legend5">${[1, 2, 3, 4, 5].map((k) => `<span><i style="background:${T_COLOR[k]}"></i>${E.T_LABEL[k]} ${pct(t[k], N)}</span>`).join('')}</div>
    <div class="note">권역 외 비중은 T3(도착이 어느 파란 박스에도 없는 오더)만 센다. 권역 간(T2)은 도착 권역 벤더의 복귀로 처리된다고 본다. 보조 지표 보수(T2+T3)는 복귀가 실현되지 않는다고 가정한 값이다. 실측(배정 기사 기준)이 둘 사이에 온다는 보장은 없다.</div>`;
}

function renderPerPoly() {
  const act = activeBlues();
  if (!act.length) { $('#perPoly').innerHTML = '<h2>폴리곤별</h2><div class="empty">파란 박스가 없습니다.</div>'; return; }
  const rows = act.map((b, k) => {
    const p = st.agg.per[k];
    if (!p) return '';
    const src = p.INT + p.OUT;
    return `<tr class="${st.sel === b ? 'sel' : ''}" data-id="${b.id}"><td><span class="sw" style="display:inline-block;background:${C.cost}"></span> ${esc(b.name)}</td>
      <td>${fmt(src)}</td><td>${fmt(p.INT)}</td><td>${fmt(p.OUT)}</td><td>${fmt(p.IN)}</td>
      <td><b>${pct(p.realOut, src)}</b></td><td>${fmt(p.only)}</td><td>${(b.area || 0).toFixed(1)}</td></tr>`;
  }).join('');
  $('#perPoly').innerHTML = `<h2>폴리곤별 <small>권역 기준 분류</small></h2>
    <table><thead><tr><th>파란 박스</th><th>출발</th><th>권역 내</th><th>권역 외</th><th>복귀</th><th>실질 권역 외율</th><th>단독</th><th>km²</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="note">출발 = 권역 내+권역 외. 실질 권역 외율 = 그 권역의 권역 외 중 다른 어떤 권역에서도 권역 내가 아닌 오더 ÷ 출발. 단독 = 이 박스를 끄면 권역 미포함이 되는 오더(출발·도착이 걸친 박스가 이것 하나뿐). 겹침 때문에 폴리곤별 합계는 전체와 다르다.</div>`;
  $('#perPoly').querySelectorAll('tr[data-id]').forEach((tr) => tr.onclick = () => selectBlue(st.blues.find((b) => b.id === +tr.dataset.id), true));
}

function renderGap() {
  const el = $('#gap');
  if (!st.zones.length) {
    el.innerHTML = `<h2>커버 공백 알림</h2><div class="empty">영업존이 없습니다. 인트라 권역 편집기에서 영업존 권역을 Ctrl/Cmd+C로 복사한 뒤 왼쪽 [영업존 붙여넣기]로 넣으면, 영업존 외곽 ${RING_KM}km 안에서 파란 박스가 덮지 않는 곳을 알려 드립니다.</div>`;
    return;
  }
  if (!visibleZones().length) { el.innerHTML = '<h2>커버 공백 알림</h2><div class="empty">표시 중인 영업존이 없습니다. 왼쪽 영업존 체크를 켜면 그 영업존의 커버 공백을 알려 드립니다.</div>'; return; }
  if (!st.mask) return;
  const stale = st.gapKey !== gapStateKey();
  const anyS = st.gapAnyS || new Uint8Array(st.n);
  const cards = st.gaps.map((g) => {
    const z = g.zone;
    if (g.err) return `<div class="gapCard"><div class="t">${esc(z.name)}</div>계산 실패: ${esc(g.err)}</div>`;
    if (g.area < 0.01) return `<div class="okCard"><b>${esc(z.name)}</b> — 영업존과 외곽 ${RING_KM}km 안이 모두 파란 박스로 덮였습니다.</div>`;
    let zn = 0, hit = 0, hitOut = 0, hitInner = 0;
    const ringStore = new Map(), innerStore = new Map();
    for (let i = 0; i < st.n; i++) {
      if (!st.mask[i]) continue;
      if (z.zoneIdx ? st.col.zone[i] !== z.zoneIdx : !(z.O && z.O[i])) continue;
      zn++;
      if (!(g.D && g.D[i])) continue;
      hit++;
      if (anyS[i]) hitOut++;
      const sid = st.col.sid[i];
      const m = g.DI && g.DI[i] ? (hitInner++, innerStore) : ringStore;
      m.set(sid, (m.get(sid) || 0) + 1);
    }
    const hitRing = hit - hitInner;
    const list = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([sid, c]) => { const s = st.stores[sid]; return `<li data-sid="${sid}">${esc(s ? s[0] : sid)} · ${fmt(c)}건</li>`; }).join('');
    const innerWarn = g.innerArea >= 0.01
      ? `<div class="note" style="color:${C.sales}">⚠ 영업존 안 ${g.innerArea.toFixed(1)}km²가 파란 박스 밖입니다(영업존 자체 미커버).</div>` : '';
    return `<div class="gapCard"><div class="t">${esc(z.name)} — 공백 ${g.area.toFixed(1)}km²</div>${innerWarn}
      이 영업존 상점 오더 ${fmt(zn)}건 중 <b>${fmt(hit)}건(${pct(hit, zn)})</b>이 공백으로 배송됐습니다.<br>
      · <b>외곽 ${RING_KM}km 링</b>으로: ${fmt(hitRing)}건(${pct(hitRing, zn)}) — 경계 상점 오더<br>
      ${g.innerArea >= 0.01 ? `· 영업존 안 미커버 구역으로: ${fmt(hitInner)}건(${pct(hitInner, zn)})<br>` : ''}
      · 출발이 파란 박스 안 → 권역 외(할증·후순위): ${fmt(hitOut)}건 / 출발도 밖 → 권역 미포함(벤더 후보 없음, 프렌즈만): ${fmt(hit - hitOut)}건
      ${ringStore.size ? `<div class="note">외곽 링으로 배송이 많은 경계 상점 (누르면 지도 이동)</div><ul>${list(ringStore)}</ul>` : ''}
      ${innerStore.size ? `<div class="note">영업존 안 미커버 구역으로 배송이 많은 상점</div><ul>${list(innerStore)}</ul>` : ''}</div>`;
  }).join('');
  el.innerHTML = `<h2>커버 공백 알림 <small>참고용 · 막지 않음</small></h2>
    ${stale ? '<div class="note">박스가 바뀌어 공백을 다시 계산하는 중…</div>' : ''}<div style="${stale ? 'opacity:.45' : ''}">${cards}</div>
    <div class="note">영업존 상점은 반경 ${RING_KM}km까지 배송할 수 있으므로, 영업존 외곽 ${RING_KM}km 안인데 어떤 파란 박스도 덮지 않는 곳으로 가는 오더는 벤더가 수행하지 못하거나 권역 외가 될 수 있습니다. 의도적으로 비워 둔 구역이면 무시하세요. 기간 ${st.meta.period.start}~${st.meta.period.end}.</div>`;
  el.querySelectorAll('li[data-sid]').forEach((li) => li.onclick = () => focusStore(li.dataset.sid));
}

function focusStore(sid) {
  const s = st.stores[sid];
  if (!s || !s[1]) return;
  markLayer.clearLayers();
  L.circleMarker([s[1], s[2]], { radius: 8, color: C.sales, weight: 2, fillColor: '#fff', fillOpacity: 1, pmIgnore: true })
    .bindPopup(`<b>${esc(s[0])}</b><br>상점 ${sid}`).addTo(markLayer).openPopup();
  map.setView([s[1], s[2]], Math.max(map.getZoom(), 14));
}

const CELL_Y = 0.00225, CELL_X = 0.00283; // 약 250m
st.heat = { cells: new Map(), mode: 'off' };
function renderHeat() {
  heatLayer.clearLayers(); hideHeatTip();
  st.heat = { cells: new Map(), mode: 'off' };
  const mode = $('#heatMode').value;
  renderLegend();
  if (mode === 'off' || !st.cls) return;
  const { types } = st.cls, m = st.mask, X = st.X;
  const sel = st.sel && $('#lySelOnly').checked && st.sel.S ? st.sel : null;
  let cat; // 0 = T2(또는 단일 분류), 1 = T3
  if (mode === 'out') {
    const t = (i) => (types[i] === 2 ? 0 : types[i] === 3 ? 1 : -1);
    cat = sel ? (i) => (m[i] && sel.S[i] && !sel.D[i] ? t(i) : -1) : (i) => (m[i] ? t(i) : -1);
  } else if (mode === 'none5') cat = (i) => (m[i] && types[i] === 5 ? 0 : -1);
  else cat = (i) => (m[i] ? 0 : -1);
  const useO = mode === 'origin';
  const cells = E.gridCountBy(st.n, cat, useO ? X.ox : X.dx, useO ? X.oy : X.dy, CELL_X, CELL_Y, 2)
    .filter((c) => c.c >= 3).sort((a, b) => b.c - a.c).slice(0, 6000);
  st.heat = { cells: new Map(cells.map((c) => [c.key, c])), mode, sel: sel ? sel.name : null };
  if (!cells.length) return;
  const max = cells[0].c;
  const single = mode === 'none5' ? HEAT.none5 : HEAT.dest;
  for (const c of cells) {
    const a = 0.12 + 0.6 * Math.sqrt(c.c / max);
    const color = mode === 'out' ? (c.cnt[1] >= c.cnt[0] ? HEAT.t3 : HEAT.t2) : single; // 한 칸에 둘 다 있으면 많은 쪽
    L.rectangle([[c.y0, c.x0], [c.y1, c.x1]], { renderer: heatRenderer, pane: 'heatPane', pmIgnore: true, interactive: false,
      stroke: false, fillColor: color, fillOpacity: a }).addTo(heatLayer);
  }
}

// 마우스가 올라간 칸을 좌표로 찾아 건수를 보여 준다(칸을 클릭 가능하게 만들지 않아 박스 편집을 가리지 않음)
const heatTip = L.tooltip({ direction: 'top', offset: [0, -6], opacity: 0.95, className: 'heatTip' });
const heatHover = L.rectangle([[0, 0], [0, 0]], { pane: 'ringPane', interactive: false, pmIgnore: true, fill: false, color: '#111', weight: 1.5 });
let tipKey = null;
function hideHeatTip() { tipKey = null; map.closeTooltip(heatTip); heatHover.remove(); }
map.on('mousemove', throttle((e) => {
  const h = st.heat;
  if (!h || h.mode === 'off' || !h.cells.size) return hideHeatTip();
  const c = h.cells.get(E.cellKey(e.latlng.lng, e.latlng.lat, CELL_X, CELL_Y));
  if (!c) return hideHeatTip();
  if (tipKey !== c.key) {
    tipKey = c.key;
    const nd = daysInFilter(), p = st.meta.period;
    const per = (v) => `${fmt(v)}건 (일평균 ${(v / nd).toFixed(1)})`;
    const head = `${HEAT_LABEL[h.mode]}${h.sel ? ` · ${esc(h.sel)}에서 나간 것만` : ''}`;
    const body = h.mode === 'out'
      ? `<b>${per(c.c)}</b><br><span style="color:${HEAT.t3}">■</span> T3 이탈(도착이 모든 박스 밖) ${fmt(c.cnt[1])}건<br>
         <span style="color:${HEAT.t2}">■</span> T2 권역 간(도착이 다른 박스 안) ${fmt(c.cnt[0])}건`
      : `<b>${per(c.c)}</b>`;
    heatTip.setContent(`<div style="font-size:12px;line-height:1.5">${head}<br>${body}<br>
      <span style="color:#888">약 250m 칸 · ${p.start}~${p.end}(${nd}일) · 모집단·필터 적용</span></div>`);
    heatHover.setBounds([[c.y0, c.x0], [c.y1, c.x1]]);
    if (!map.hasLayer(heatHover)) heatHover.addTo(map);
  }
  heatTip.setLatLng(e.latlng);
  if (!map.hasLayer(heatTip)) heatTip.addTo(map);
}, 40));
map.on('mouseout', hideHeatTip);

function daysInFilter() { // 요일 필터에 맞는 날짜 수 (일평균 분모)
  const day = $('#fDay').value;
  return st.meta.dates.filter((d) => {
    const w = new Date(`${d}T00:00:00Z`).getUTCDay(), we = w === 0 || w === 6;
    return day === 'all' || (day === 'we') === we;
  }).length || 1;
}

function baseCounts() {
  const t = [0, 0, 0, 0, 0, 0];
  let N = 0;
  for (let i = 0; i < st.n; i++) if (st.mask[i]) { N++; t[st.base.types[i]]++; }
  return { N, t };
}

function renderBaseline() {
  const el = $('#baseline');
  if (!st.base) {
    el.innerHTML = `<h2>기준선 비교</h2><div class="row"><button id="btnBase">지금 안을 기준선으로 고정</button></div>
      <div class="note">현행 모양(B2)을 기준선으로 고정해 두면 이후 시안의 증감(%p)과 유형 전환표를 보여 줍니다.</div>`;
    $('#btnBase').onclick = setBaseline;
    return;
  }
  const mtx = E.transition(st.n, st.mask, st.base.types, st.cls.types);
  const head = [1, 2, 3, 4, 5].map((k) => `<th>${E.T_LABEL[k].split(' ')[0]}</th>`).join('');
  const rows = [1, 2, 3, 4, 5].map((r) => `<tr><th>${E.T_LABEL[r]}</th>${[1, 2, 3, 4, 5].map((c) => {
    const v = mtx[r][c]; const good = r !== c && c < r && (r === 2 || r === 3) && c === 1; const bad = r === 1 && (c === 3 || c === 5);
    return `<td style="${good ? `color:${C.ok};font-weight:700` : bad ? `color:${C.sales};font-weight:700` : ''}">${v ? fmt(v) : '·'}</td>`;
  }).join('')}</tr>`).join('');
  el.innerHTML = `<h2>기준선 비교 <small>${esc(st.base.label)}</small></h2>
    <table class="matrix"><thead><tr><th>기준선 → 현재</th>${head}</tr></thead><tbody>${rows}</tbody></table>
    <div class="note">초록 = 권역 외(T2·T3) → 권역 내(T1)로 바뀐 오더, 빨강 = 권역 내 → 이탈·미포함으로 나빠진 오더.</div>
    <div class="row"><button id="btnBase">현재 안으로 다시 고정</button><button id="btnBaseOff" class="ghost">기준선 해제</button></div>`;
  $('#btnBase').onclick = setBaseline;
  $('#btnBaseOff').onclick = () => { st.base = null; recompute(); };
}

function setBaseline() {
  st.base = { types: st.cls.types.slice(), label: `${new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} · 박스 ${activeBlues().length}개` };
  recompute();
  toast('기준선을 고정했습니다');
}

// ───────── 파란 박스 ─────────
function styleBlue(b) {
  const on = editing === b || st.sel === b;
  b.layer.setStyle({ color: C.cost, fillColor: C.cost, weight: on ? 3.5 : 2,
    fillOpacity: b.active ? (on ? 0.2 : 0.12) : 0.03, opacity: b.active ? 1 : 0.35, dashArray: b.active ? null : '4 4' });
}

// ───────── 박스 편집: 박스를 누르면 그 박스만 편집 모드 ─────────
// 꼭짓점 끌기 = 이동, 선 위 클릭(또는 변 가운데 점) = 꼭짓점 추가, 꼭짓점 우클릭 = 삭제, 박스 끌기 = 통째 이동
const EDIT_OPTS = { allowSelfIntersection: false, draggable: true, snappable: true, snapDistance: 12,
  addVertexOn: 'click', removeVertexOn: 'contextmenu', hideMiddleMarkers: false };
const EDGE_PX = 10; // 선에서 이 거리(px) 안을 누르면 꼭짓점 추가
let editing = null;
const editHint = L.control({ position: 'topright' });
editHint.onAdd = () => {
  const d = L.DomUtil.create('div', 'mapLegend editHint');
  L.DomEvent.disableClickPropagation(d);
  return d;
};
function otherModeOn() { // Geoman 전체 도구(그리기·전체 편집·이동·자르기·삭제)가 켜져 있으면 개별 편집은 쉰다
  const pm = map.pm;
  try {
    return pm.globalDrawModeEnabled() || pm.globalEditModeEnabled() || pm.globalDragModeEnabled()
      || pm.globalRemovalModeEnabled() || (pm.globalCutModeEnabled ? pm.globalCutModeEnabled() : false);
  } catch { return false; }
}
function startEdit(b) {
  if (!b || !b.layer || !b.layer.pm || editing === b) return;
  stopEdit();
  editing = b; st.sel = b;
  b.layer.pm.enable(EDIT_OPTS);
  editHint.addTo(map);
  editHint.getContainer().innerHTML = `<b>편집 중: ${esc(b.name)}</b><br>· 꼭짓점 끌기: 이동<br>· 선 위 클릭: 꼭짓점 추가 (추가한 점도 끌어 옮김)<br>
    · 꼭짓점 우클릭: 삭제<br>· 박스 안쪽 끌기: 통째로 이동<br>· 빈 곳 클릭 또는 Esc: 편집 끝`;
  st.blues.forEach(styleBlue); renderBlueList(); renderPerPoly(); renderHeat();
}
function stopEdit() {
  if (!editing) return;
  const b = editing;
  editing = null;
  try { b.layer.pm.disable(); } catch { /* 이미 지워진 레이어 */ }
  editHint.remove();
  st.blues.forEach(styleBlue); renderBlueList();
}
// 클릭 지점에서 가장 가까운 변을 찾아, EDGE_PX 안이면 그 자리에 꼭짓점을 넣는다
function insertVertexAt(b, latlng) {
  // latLngToLayerPoint는 픽셀을 정수로 반올림해 새 꼭짓점이 선에서 수 m 어긋난다 → 반올림 없는 project/unproject 사용
  const layer = b.layer, z = map.getZoom(), proj = (ll) => map.project(ll, z), p = proj(latlng);
  let best = null;
  const walk = (arr) => {
    if (!arr.length) return;
    if (arr[0] instanceof L.LatLng) {
      for (let i = 0; i < arr.length; i++) {
        const a = proj(arr[i]), c = proj(arr[(i + 1) % arr.length]);
        const d = L.LineUtil.pointToSegmentDistance(p, a, c);
        if (!best || d < best.d) best = { d, ring: arr, i, a, c };
      }
    } else arr.forEach(walk);
  };
  walk(layer.getLatLngs());
  if (!best || best.d > EDGE_PX) return false;
  const q = L.LineUtil.closestPointOnSegment(p, best.a, best.c);
  best.ring.splice(best.i + 1, 0, map.unproject(q, z));
  layer.pm.disable();
  layer.setLatLngs(layer.getLatLngs());
  layer.pm.enable(EDIT_OPTS); // 새 꼭짓점에도 끌 수 있는 마커가 생긴다
  b.key = null; recompute(); scheduleGap(); saveLocal();
  return true;
}

function attachBlue(b) {
  const L0 = b.layer;
  L0.options.pmIgnore = false;
  L0.on('click', (e) => {
    if (otherModeOn()) return; // 그리기·자르기 등 전체 도구가 처리
    L.DomEvent.stopPropagation(e);
    if (editing === b) insertVertexAt(b, e.latlng);
    else startEdit(b);
  });
  const changed = () => { b.key = null; recompute(); scheduleGap(); saveLocal(); };
  L0.on('pm:edit', changed);
  L0.on('pm:dragend', changed);
  L0.on('pm:markerdrag', throttle(() => { b.key = null; recompute(); }, 180));
  styleBlue(b);
}

map.on('click', (e) => {
  if (!editing || otherModeOn()) return;
  if (insertVertexAt(editing, e.latlng)) return; // 선 바로 바깥을 누른 경우
  stopEdit();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && editing) stopEdit(); });
for (const ev of ['pm:drawstart', 'pm:globaleditmodetoggled', 'pm:globaldragmodetoggled', 'pm:globalremovalmodetoggled', 'pm:globalcutmodetoggled']) {
  map.on(ev, (e) => { if (ev === 'pm:drawstart' || e.enabled) stopEdit(); });
}

function addBlue(geometry, name, layer) {
  if (!layer) {
    layer = L.geoJSON({ type: 'Feature', geometry, properties: {} }).getLayers()[0];
    layer.addTo(map);
  }
  const b = { id: st.seq++, name: name || `파란 박스 ${st.blues.length + 1}`, active: true, layer };
  st.blues.push(b);
  attachBlue(b);
  return b;
}

function removeBlue(b, fromMap = true) {
  if (editing === b) stopEdit();
  st.blues = st.blues.filter((x) => x !== b);
  if (fromMap) b.layer.remove();
  if (st.sel === b) st.sel = null;
  recompute(); scheduleGap(); saveLocal();
}

function selectBlue(b, zoom = false) {
  st.sel = st.sel === b && !zoom ? null : b;
  st.blues.forEach(styleBlue);
  if (zoom && b) map.fitBounds(b.layer.getBounds(), { maxZoom: 15 });
  renderBlueList(); renderPerPoly(); renderHeat();
}

function renderBlueList() {
  const el = $('#blueList');
  if (!st.blues.length) { el.innerHTML = '<div class="empty">아직 파란 박스가 없습니다.</div>'; return; }
  const idx = new Map(activeBlues().map((b, k) => [b, k]));
  el.innerHTML = st.blues.map((b) => {
    const k = idx.get(b), p = k !== undefined && st.agg ? st.agg.per[k] || null : null;
    const warn = [...(b.warn || []), ...(b.name.length > 50 ? ['이름 50자 초과'] : [])];
    return `<div class="item ${st.sel === b ? 'sel' : ''}" data-id="${b.id}">
      <div class="top"><input type="checkbox" class="act" ${b.active ? 'checked' : ''} title="계산에 포함">
        <span class="sw" style="background:${C.cost}"></span><input type="text" class="nm" value="${esc(b.name)}" maxlength="80"></div>
      <div class="meta">${b.area ? `${b.area.toFixed(1)}km²` : ''} ${b.P ? `· 꼭짓점 ${b.P.nv}` : ''}
        ${p ? `· 실질 권역 외 ${pct(p.realOut, p.INT + p.OUT)}` : b.active && !b.S ? '<span class="warnTag">⚠ 도형 없음</span>' : ''} ${warn.map((w) => `<span class="warnTag">⚠ ${esc(w)}</span>`).join(' ')}</div>
      <div class="row"><button class="mini ed ${editing === b ? 'primary' : ''}">${editing === b ? '편집 끝' : '편집'}</button><button class="mini cp">인트라로 복사</button><button class="mini zm">보기</button><button class="mini danger rm">삭제</button></div></div>`;
  }).join('');
  el.querySelectorAll('.item').forEach((it) => {
    const b = st.blues.find((x) => x.id === +it.dataset.id);
    it.querySelector('.act').onchange = (e) => { b.active = e.target.checked; styleBlue(b); recompute(); scheduleGap(); saveLocal(); };
    it.querySelector('.nm').onchange = (e) => { b.name = e.target.value.trim() || b.name; recompute(); saveLocal(); };
    it.querySelector('.ed').onclick = () => {
      if (editing === b) return stopEdit();
      startEdit(b);
      map.fitBounds(b.layer.getBounds(), { maxZoom: 15, padding: [30, 30] });
    };
    it.querySelector('.cp').onclick = () => copyIntra(b);
    it.querySelector('.zm').onclick = () => selectBlue(b, true);
    it.querySelector('.rm').onclick = () => { if (confirm(`'${b.name}'을(를) 삭제할까요?`)) removeBlue(b); };
  });
}

async function copyIntra(b) {
  const text = E.toMeshOneRegion(b.layer.toGeoJSON().geometry);
  try {
    await navigator.clipboard.writeText(text);
    toast(`복사됨 — 인트라 권역 편집기에서 Ctrl/Cmd+V → 미리보기 '적용'. 권역 이름: ${b.name}`);
  } catch {
    openModal(`<h3>인트라로 복사</h3><p class="hint">자동 복사가 막혀 있습니다. 아래 내용을 모두 선택해 복사하세요.</p>
      <textarea readonly>${esc(text)}</textarea><div class="row"><button class="primary" id="mClose">닫기</button></div>`);
    $('#mClose').onclick = closeModal;
  }
}

// ───────── 영업존 ─────────
function zoneOptions(selIdx = '') {
  const reg = new Set(st.zones.map((z) => z.zoneIdx));
  return `<option value="" ${selIdx === '' ? 'selected' : ''}>— 존을 선택하세요 —</option>`
    + st.meta.zones.map((z) => `<option value="${z.idx}" ${z.idx === selIdx ? 'selected' : ''}>${esc(z.name)} (지점 ${z.partnerId})${reg.has(z.idx) ? ' · 등록됨(교체)' : ''}</option>`).join('')
    + `<option value="0" ${selIdx === 0 ? 'selected' : ''}>기타 (출발지가 이 영업존 안인 오더로 계산)</option>`;
}

// 영업존 표시 여부(이 브라우저에만 기억). 끄면 빨간 선·3km 범위선·커버 공백·알림 카드가 함께 숨는다
const ZH_KEY = 'vrs.v1.zoneHidden';
const zoneKey = (z) => `${z.zoneIdx}:${z.name}`;
let zoneHidden = new Set();
try { zoneHidden = new Set(JSON.parse(localStorage.getItem(ZH_KEY) || '[]')); } catch { /* 첫 실행 */ }
function visibleZones() { return st.zones.filter((z) => !zoneHidden.has(zoneKey(z))); }
function setZoneVisible(z, on) {
  if (on) zoneHidden.delete(zoneKey(z)); else zoneHidden.add(zoneKey(z));
  try { localStorage.setItem(ZH_KEY, JSON.stringify([...zoneHidden])); } catch { /* 무시 */ }
  if (st.meta) buildPopOptions(); // 모집단 라벨(표시 중 n개 존) 갱신
  drawZones(); renderZoneList(); recompute(); computeGaps(); renderGap();
}

function drawZones() {
  salesLayer.clearLayers();
  for (const z of visibleZones()) {
    L.geoJSON(z.geometry, { pane: 'salesPane', pmIgnore: true, interactive: false,
      style: { color: C.sales, weight: 2.6, fill: false, opacity: 0.95 } }).addTo(salesLayer);
  }
}

function renderZoneList() {
  const el = $('#zoneList');
  if (!st.zones.length) { el.innerHTML = '<div class="empty">영업존이 없습니다. 인트라 권역 편집기에서 영업존 권역을 Ctrl/Cmd+C로 복사해 [영업존 붙여넣기]로 넣으세요. 한 번 넣으면 저장되어 항상 표시됩니다.</div>'; return; }
  el.innerHTML = `<div class="row" style="margin:0 0 6px"><button class="mini" id="zAllOn">모두 표시</button><button class="mini" id="zAllOff">모두 숨김</button></div>`
    + st.zones.map((z, i) => { const on = !zoneHidden.has(zoneKey(z)); return `<div class="item" style="${on ? '' : 'opacity:.55'}"><div class="top">
    <input type="checkbox" class="zv" data-i="${i}" ${on ? 'checked' : ''} title="지도에 표시"><span class="sw" style="background:${C.sales}"></span>
    <b style="flex:1">${esc(z.name)}</b><button class="mini zm" data-i="${i}">보기</button><button class="mini danger rm" data-i="${i}">삭제</button></div>
    <div class="meta">${(turf.area(turf.feature(z.geometry)) / 1e6).toFixed(1)}km² · ${z.zoneIdx ? '관제 상점 기준' : '출발지 기준'}${on ? '' : ' · 숨김'}</div></div>`; }).join('');
  el.querySelectorAll('.zv').forEach((cb) => cb.onchange = () => setZoneVisible(st.zones[+cb.dataset.i], cb.checked));
  $('#zAllOn').onclick = () => { zoneHidden.clear(); setZoneVisible(st.zones[0], true); };
  $('#zAllOff').onclick = () => { st.zones.forEach((z) => zoneHidden.add(zoneKey(z))); setZoneVisible(st.zones[0], false); };
  el.querySelectorAll('.zm').forEach((btn) => btn.onclick = () => map.fitBounds(L.geoJSON(st.zones[+btn.dataset.i].geometry).getBounds()));
  el.querySelectorAll('.rm').forEach((btn) => btn.onclick = async () => {
    const z = st.zones[+btn.dataset.i];
    if (!confirm(`영업존 '${z.name}'을(를) 삭제할까요? (저장된 레이어에서 지워집니다)`)) return;
    st.zones.splice(+btn.dataset.i, 1);
    await saveZones(); drawZones(); renderZoneList(); recompute(); computeGaps(); renderGap();
  });
}

async function loadZones() {
  let fc = { features: [] };
  try { fc = await bkZones(); } catch (e) { toast(`영업존 레이어를 읽지 못했습니다: ${e.message}`); }
  st.zones = [];
  let bad = 0;
  for (const f of Array.isArray(fc.features) ? fc.features : []) {
    const g = f && E.parseGeometries(JSON.stringify(f))[0];
    const p = (f && f.properties) || {};
    if (!g) { bad++; continue; } // 잘못된 영업존은 건너뛰고 화면은 계속 연다
    st.zones.push({ name: String(p.name || '영업존'), zoneIdx: Number.isInteger(p.zoneIdx) ? p.zoneIdx : 0,
      partnerId: p.partnerId || null, geometry: g.geometry, props: p });
  }
  if (bad) toast(`영업존 ${bad}개를 읽지 못해 건너뛰었습니다`);
  drawZones();
}

async function saveZones() {
  const fc = { type: 'FeatureCollection', features: st.zones.map((z) => ({ type: 'Feature',
    properties: { ...(z.props || {}), name: z.name, zoneIdx: z.zoneIdx, partnerId: z.partnerId }, geometry: z.geometry })) };
  try {
    const r = await bkSaveZones(fc);
    if (!r.ok) toast(`영업존 저장 실패: ${r.error}`);
    return r.ok;
  } catch (e) { toast(`영업존 저장 실패: ${e.message}`); return false; }
}

// ───────── 붙여넣기 ─────────
function openImport(geoms, defaultTarget = 'blue') {
  openModal(`<h3>도형 ${geoms.length}개 가져오기</h3>
    <label class="chk"><input type="radio" name="tg" value="blue" ${defaultTarget === 'blue' ? 'checked' : ''}> 파란 박스(벤더 배송권역)로 추가</label>
    <label class="chk"><input type="radio" name="tg" value="zone" ${defaultTarget === 'zone' ? 'checked' : ''}> 영업존(빨강, 고정)으로 추가 — 저장됩니다</label>
    <div id="zoneOpt" class="row wrap"><select id="mZone">${zoneOptions(st.meta.zones.find((z) => !st.zones.some((x) => x.zoneIdx === z.idx))?.idx ?? '')}</select><input id="mZoneName" type="text" placeholder="영업존 이름 (비우면 존 이름)"></div>
    <div class="row"><input id="mName" type="text" placeholder="파란 박스 이름 (선택)" style="flex:1"></div>
    <div class="row"><button class="primary" id="mOk">추가</button><button id="mCancel">취소</button></div>`);
  const sync = () => {
    const z = document.querySelector('input[name=tg]:checked').value === 'zone';
    $('#zoneOpt').style.display = z ? 'flex' : 'none'; $('#mName').parentElement.style.display = z ? 'none' : 'flex';
  };
  document.querySelectorAll('input[name=tg]').forEach((r) => r.onchange = sync); sync();
  $('#mCancel').onclick = closeModal;
  $('#mOk').onclick = async () => {
    const target = document.querySelector('input[name=tg]:checked').value;
    if (target === 'zone') {
      if ($('#mZone').value === '') return toast('어느 존의 영업존인지 선택하세요');
      const zi = +$('#mZone').value, zm = st.meta.zones.find((z) => z.idx === zi);
      const name = $('#mZoneName').value.trim() || (zm ? zm.name : '영업존');
      // 영업존은 지점당 1개: 같은 존(기타는 같은 이름)이 있으면 확인 후 교체
      const old = st.zones.find((z) => (zi ? z.zoneIdx === zi : z.zoneIdx === 0 && z.name === name));
      if (old && !confirm(`이미 저장된 영업존 '${old.name}'을(를) 새 도형으로 교체할까요?`)) return;
      let merged = geoms[0].geometry;
      if (geoms.length > 1) {
        try { merged = turf.union(turf.featureCollection(geoms.map((g) => turf.feature(g.geometry)))).geometry; } catch {
          merged = { type: 'MultiPolygon', coordinates: geoms.flatMap((g) => (g.geometry.type === 'Polygon' ? [g.geometry.coordinates] : g.geometry.coordinates)) };
        }
      }
      const prev = st.zones;
      st.zones = st.zones.filter((z) => z !== old);
      st.zones.push({ name, zoneIdx: zi, partnerId: zm ? zm.partnerId : null, geometry: merged });
      if (!(await saveZones())) { st.zones = prev; return; }
      drawZones(); renderZoneList();
      toast(`영업존 '${name}' 저장`);
      closeModal(); recompute(); computeGaps(); renderGap();
    } else {
      const nm = $('#mName').value.trim();
      const added = geoms.map((g, i) => addBlue(g.geometry, nm ? (geoms.length > 1 ? `${nm} ${i + 1}` : nm) : g.name || null));
      map.fitBounds(L.featureGroup(added.map((b) => b.layer)).getBounds(), { maxZoom: 14 });
      closeModal(); recompute(); computeGaps(); renderGap(); saveLocal();
    }
  };
}

function pasteDialog(target) {
  openModal(`<h3>${target === 'zone' ? '영업존' : '파란 박스'} 붙여넣기</h3>
    <p class="hint">인트라 권역 편집기에서 Ctrl/Cmd+C 한 내용(mesh-one-region)이나 GeoJSON을 붙여넣으세요.</p>
    <textarea id="mText" placeholder='{"format":"mesh-one-region", ...}'></textarea>
    <div class="row"><button class="primary" id="mNext">다음</button><button id="mCancel">취소</button></div>`);
  $('#mText').focus();
  $('#mCancel').onclick = closeModal;
  $('#mNext').onclick = () => {
    const g = E.parseGeometries($('#mText').value);
    if (!g.length) return toast('도형을 찾지 못했습니다 (mesh-one-region 또는 GeoJSON)');
    openImport(g, target);
  };
}

document.addEventListener('paste', (e) => {
  const tag = (e.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || !$('#modal').hidden) return;
  const g = E.parseGeometries(e.clipboardData.getData('text/plain'));
  if (g.length) { e.preventDefault(); openImport(g, 'blue'); }
});

map.on('pm:create', (e) => {
  let layer = e.layer;
  if (e.shape === 'Rectangle' || layer instanceof L.Rectangle) {
    // 사각형도 일반 다각형으로 바꿔 꼭짓점 단위로 고칠 수 있게 한다(사각형 모양에 묶이지 않음)
    const poly = L.polygon(layer.getLatLngs());
    layer.remove();
    poly.addTo(map);
    layer = poly;
  }
  const b = addBlue(null, null, layer);
  st.sel = b; st.blues.forEach(styleBlue);
  recompute(); scheduleGap(); saveLocal();
});
map.on('pm:remove', (e) => { const b = st.blues.find((x) => x.layer === e.layer); if (b) removeBlue(b, false); });
map.on('pm:cut', (e) => {
  const b = st.blues.find((x) => x.layer === e.originalLayer);
  if (!b) return;
  if (editing === b) stopEdit();
  // 박스를 통째로 잘라내면 Geoman이 빈 L.GeoJSON 그룹을 넘긴다 → 박스 삭제로 처리
  const gone = !e.layer || !layerGeometry(e.layer);
  if (gone) { if (e.layer) e.layer.remove(); removeBlue(b, false); return; }
  b.layer = e.layer; b.key = null; attachBlue(b);
  recompute(); scheduleGap(); saveLocal();
});

// ───────── 저장·불러오기 ─────────
function snapshot() {
  return st.blues.map((b) => ({ name: b.name, active: b.active, geometry: layerGeometry(b.layer) })).filter((x) => x.geometry);
}
function saveLocal() { try { localStorage.setItem(LS_KEY, JSON.stringify(snapshot())); } catch { /* 저장 실패는 무시 */ } }
function restore(list) {
  stopEdit();
  st.blues.forEach((b) => b.layer && b.layer.remove()); st.blues = []; st.sel = null;
  let bad = 0;
  for (const x of Array.isArray(list) ? list : []) {
    const g = x && E.parseGeometries(JSON.stringify({ type: 'Feature', properties: {}, geometry: x.geometry }))[0];
    if (!g) { bad++; continue; } // 깨진 항목은 건너뛰고 나머지는 복원
    try { const b = addBlue(g.geometry, x.name); b.active = x.active !== false; styleBlue(b); } catch { bad++; }
  }
  if (bad) toast(`복원하지 못한 박스 ${bad}개를 건너뛰었습니다`);
}

$('#btnSave').onclick = async () => {
  const name = (prompt('시나리오 이름 (예: 성북_징검다리500m) — 한글·영문·숫자·공백·_-. 만') || '').trim();
  if (!name) return;
  try {
    const list = await bkScenarioList();
    if (list.includes(name) && !confirm(`'${name}' 시나리오가 이미 있습니다. 덮어쓸까요?`)) return;
    const body = { savedAt: new Date().toISOString(), dataset: st.meta?.dataset, blues: snapshot() };
    const r = await bkSaveScenario(name, body);
    toast(r.ok ? `시나리오 '${name}' 저장${bk.mode === 'static' ? ' (이 브라우저에만)' : ''}` : `저장 실패: ${r.error}`);
  } catch (e) { toast(`저장 실패: ${e.message}`); }
};
$('#btnLoad').onclick = async () => {
  const list = await bkScenarioList();
  if (!list.length) return toast('저장된 시나리오가 없습니다');
  openModal(`<h3>시나리오 불러오기</h3><select id="mSc" size="8" style="width:100%">${list.map((x) => `<option>${esc(x)}</option>`).join('')}</select>
    <div class="row"><button class="primary" id="mOk">불러오기(현재 박스 교체)</button><button id="mCancel">취소</button></div>`);
  $('#mCancel').onclick = closeModal;
  $('#mOk').onclick = async () => {
    const v = $('#mSc').value; if (!v) return;
    const sc = await bkScenario(v);
    restore(sc.blues); closeModal(); recompute(); computeGaps(); renderGap(); saveLocal();
    if (st.blues.length) map.fitBounds(L.featureGroup(st.blues.map((b) => b.layer)).getBounds());
  };
};
$('#btnGeojson').onclick = () => {
  const fc = { type: 'FeatureCollection', features: snapshot().map((x) => ({ type: 'Feature', properties: { name: x.name, active: x.active }, geometry: x.geometry })) };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(fc)], { type: 'application/geo+json' }));
  a.download = `벤더배송권역_${new Date().toISOString().slice(0, 10)}.geojson`; a.click();
};
$('#btnClear').onclick = () => { if (confirm('파란 박스를 모두 지울까요?')) { restore([]); recompute(); computeGaps(); renderGap(); saveLocal(); } };
$('#btnBluePaste').onclick = () => pasteDialog('blue');
$('#btnGeoImport').onclick = () => $('#fileGeo').click();
$('#fileGeo').onchange = async (e) => {
  const f = e.target.files[0]; e.target.value = '';
  if (!f) return;
  const g = E.parseGeometries(await f.text());
  if (!g.length) return toast('파일에서 도형을 찾지 못했습니다 (GeoJSON 또는 mesh-one-region)');
  openImport(g, 'blue');
};
$('#btnZoneReset').onclick = async () => {
  if (!confirm('이 브라우저에서 바꾼 영업존을 버리고 배포본의 영업존으로 되돌릴까요?')) return;
  localStorage.removeItem(LS_ZONES);
  await loadZones(); buildPopOptions(); renderZoneList(); recompute(); computeGaps(); renderGap();
};
$('#btnZonePaste').onclick = () => pasteDialog('zone');
$('#btnDef').onclick = showDefinitions;

// ───────── 필터·레이어 ─────────
for (const id of ['#pop', '#fG4', '#fVendor', '#fDone', '#fDay', '#fH0', '#fH1']) $(id).addEventListener('change', recompute);
$('#heatMode').onchange = renderHeat;
$('#lySelOnly').onchange = renderHeat;
$('#lyGap').onchange = () => { computeGaps(); renderGap(); };
$('#lyRing').onchange = () => { computeGaps(); renderGap(); };
$('#dataset').onchange = (e) => loadDataset(e.target.value);

// ───────── 공통 UI ─────────
function openModal(html, lock = false) { $('#modalBody').innerHTML = html; $('#modal').hidden = false; $('#modal').dataset.lock = lock ? '1' : ''; }
function closeModal(force = false) { if ($('#modal').dataset.lock && force !== true) return; $('#modal').hidden = true; $('#modalBody').innerHTML = ''; $('#modal').dataset.lock = ''; }
$('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });
let toastTimer = null;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 3500); }
function throttle(fn, ms) { let last = 0, timer = null; return (...a) => { const now = Date.now(); clearTimeout(timer); if (now - last >= ms) { last = now; fn(...a); } else timer = setTimeout(() => { last = Date.now(); fn(...a); }, ms - (now - last)); }; }
function setStatus(msg, ms) {
  if (msg) { $('#status').textContent = msg; return; }
  if (!st.meta) return;
  const p = st.meta.period;
  $('#status').textContent = `${st.meta.label} · ${p.start}~${p.end}(${p.days}일) · ${fmt(st.n)}건 · 데이터 적재 ${st.meta.snowflakeLoadedAt}${bk.mode === 'static' ? ' · 암호화 배포본(저장은 이 브라우저에만)' : ''}${ms != null ? ` · 계산 ${Math.round(ms)}ms` : ''}`;
}

function showDefinitions() {
  openModal(`<h3>판정 정의 (PRD v2.0 00 §4.1 기준)</h3>
    <table class="def"><tr><th>권역 기준 분류</th><th>조건</th><th>운영상 의미</th></tr>
    <tr><td>권역 내</td><td>출발·도착 모두 그 박스 안</td><td>일반 제안, 거절 카운트 포함</td></tr>
    <tr><td>권역 외</td><td>출발만 안</td><td>원가에만 정액 권역 외 할증, 제안 후순위, 거절 카운트 제외</td></tr>
    <tr><td>복귀</td><td>도착만 안</td><td>할증 없음, 기사가 그 권역 밖에 있을 때만 제안</td></tr></table>
    <h3>오더 단위 5유형 (전체 지표)</h3>
    <table class="def"><tr><td>T1 내부</td><td>출발·도착을 함께 품는 박스가 하나라도 있음</td></tr>
    <tr><td>T2 권역 간</td><td>출발 박스·도착 박스가 다 있지만 서로 다름 → 징검다리 중첩으로 줄일 몫</td></tr>
    <tr><td>T3 이탈</td><td>출발만 박스 안, 도착은 어느 박스에도 없음 → 확장·제한권역으로 줄일 몫</td></tr>
    <tr><td>T4 유입</td><td>도착만 박스 안, 출발은 어느 박스에도 없음</td></tr>
    <tr><td>T5 미포함</td><td>출발·도착 모두 어느 박스에도 없음 → 벤더 후보 없음, 프렌즈·폴백 원가</td></tr></table>
    <p class="note">출발 = 오더 픽업 좌표(상점 좌표 아님), 도착 = 배송지 좌표. 판정은 원 폴리곤 기준(서버는 H3 r13 셀, 차이 0.03% 이하로 확인).
    현재 상점 관제지점을 과거 오더에도 적용한다. 기사 위치를 몰라 복귀 실현 여부는 반영하지 않는다. 접수 실패 오더는 데이터에 없다.</p>
    <div class="row"><button class="primary" id="mClose">닫기</button></div>`);
  $('#mClose').onclick = closeModal;
}

// 창이 가려진 채 열리면 지도 크기가 0이라 fitBounds가 최대 줌으로 간다 → 크기가 잡힌 뒤에 맞춘다
// 사용자가 지도를 직접 움직이기 전까지는 창 크기가 바뀔 때마다 영업존에 다시 맞춘다
let userMoved = false;
map.on('dragstart', () => { userMoved = true; });
$('#map').addEventListener('wheel', () => { userMoved = true; }, { passive: true });
new ResizeObserver(() => { map.invalidateSize(); if (!userMoved && st.n) fitWhenSized(); }).observe($('#map'));
function fitWhenSized(tries = 0) {
  map.invalidateSize();
  const sz = map.getSize();
  if ((sz.x < 100 || sz.y < 100) && tries < 50) { setTimeout(() => fitWhenSized(tries + 1), 200); return; }
  const layers = [...salesLayer.getLayers(), ...st.blues.map((b) => b.layer)];
  if (layers.length) map.fitBounds(L.featureGroup(layers).getBounds(), { padding: [20, 20], maxZoom: 14 });
}
if (new URLSearchParams(location.search).has('debug')) window.__vrs = { map, st }; // ?debug 일 때만 노출

// ───────── 시작 ─────────
(async function init() {
  try {
    bk.mode = await detectBackend();
    if (bk.mode === 'static') { bk.pack = await unlockPack(); $('#btnZoneReset').hidden = false; }
    const ds = await bkDatasets();
    if (!ds.length) { setStatus('데이터가 없습니다 — extract.py를 먼저 실행하세요'); return; }
    $('#dataset').innerHTML = ds.map((d) => `<option value="${d.dataset}">${esc(d.label)} (${fmt(d.n)}건)</option>`).join('');
    const first = (ds.find((d) => d.dataset === 'z5_12w') || ds[0]).dataset; // 기본은 5개 존 12주
    $('#dataset').value = first;
    try { restore(JSON.parse(localStorage.getItem(LS_KEY) || '[]')); } catch { /* 첫 실행 */ }
    if (!st.blues.length) $('#heatMode').value = 'dest'; // 박스가 없으면 권역 외 분포가 비므로 전체 도착지 분포로 시작
    st.meta = await bkMeta(first);
    await loadZones();
    await loadDataset(first);
    renderZoneList();
    fitWhenSized();
  } catch (e) {
    setStatus(`오류: ${e.message}`);
    console.error(e);
  }
})();
