// 벤더 배송권역 시뮬레이터 — 판정 엔진 (브라우저·Node 공용, 외부 의존성 없음)
//
// 오더×권역 분류 (PRD v2.0 00 §4.1, 개발 enum)
//   권역 내 INTERNAL : 출발·도착 모두 그 권역 안
//   권역 외 OUTBOUND : 출발만 안
//   복귀   INBOUND  : 도착만 안
// 오더 단위 5유형 (겹친 권역 때문에 폴리곤별 합계는 중복되므로 전체는 이것으로 센다)
//   T1 내부   : 출발·도착을 함께 품는 권역이 하나라도 있음
//   T2 권역 간: 출발 권역과 도착 권역이 모두 있으나 서로 다름 (징검다리 중첩으로 줄일 몫)
//   T3 이탈   : 출발만 어떤 권역 안, 도착은 어느 권역에도 없음
//   T4 유입   : 도착만 어떤 권역 안, 출발은 어느 권역에도 없음
//   T5 미포함 : 출발·도착 모두 어느 권역에도 없음 (벤더 후보 0, 프렌즈·폴백)

export const T = { INTERNAL: 1, CROSS: 2, EXIT: 3, ENTRY: 4, NONE: 5 };
export const T_LABEL = { 1: 'T1 내부', 2: 'T2 권역 간', 3: 'T3 이탈', 4: 'T4 유입', 5: 'T5 미포함' };

function polysOf(geom) {
  if (!geom) return [];
  if (geom.type === 'Polygon') return [geom.coordinates];
  if (geom.type === 'MultiPolygon') return geom.coordinates;
  if (geom.type === 'GeometryCollection') return geom.geometries.flatMap(polysOf);
  return [];
}

// 띠 인덱스: bbox를 B개 가로 띠로 나누고 띠마다 걸치는 변만 모아 둔다.
// 점 하나는 자기 띠의 변만 ray casting(짝홀 규칙, 구멍·여러 조각 포함)으로 검사한다.
export function prepare(geom, B = 512) {
  const edges = [];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, nv = 0;
  for (const poly of polysOf(geom)) {
    for (const ring of poly) {
      const a = ring[0], z = ring[ring.length - 1];
      nv += ring.length - (ring.length > 1 && a[0] === z[0] && a[1] === z[1] ? 1 : 0); // 닫는 중복점은 세지 않음
      for (let i = 0; i < ring.length; i++) {
        const [x0, y0] = ring[i];
        const [x1, y1] = ring[(i + 1) % ring.length];
        if (x0 === x1 && y0 === y1) continue;
        edges.push(x0, y0, x1, y1);
        if (x0 < minX) minX = x0; if (x0 > maxX) maxX = x0;
        if (y0 < minY) minY = y0; if (y0 > maxY) maxY = y0;
      }
    }
  }
  const ne = edges.length / 4;
  if (!ne) return { empty: true, nv: 0 };
  const h = (maxY - minY) / B || 1e-12;
  const band = (y) => Math.min(B - 1, Math.max(0, Math.floor((y - minY) / h)));
  const off = new Uint32Array(B + 1);
  for (let i = 0; i < ne; i++) {
    const a = band(Math.min(edges[4 * i + 1], edges[4 * i + 3])), c = band(Math.max(edges[4 * i + 1], edges[4 * i + 3]));
    for (let k = a; k <= c; k++) off[k + 1]++;
  }
  for (let k = 0; k < B; k++) off[k + 1] += off[k];
  const idx = new Uint32Array(off[B]);
  const pos = off.slice();
  for (let i = 0; i < ne; i++) {
    const a = band(Math.min(edges[4 * i + 1], edges[4 * i + 3])), c = band(Math.max(edges[4 * i + 1], edges[4 * i + 3]));
    for (let k = a; k <= c; k++) idx[pos[k]++] = i;
  }
  return { empty: false, minX, minY, maxX, maxY, h, B, E: new Float64Array(edges), off, idx, nv };
}

export function contains(P, x, y) {
  if (P.empty || x < P.minX || x > P.maxX || y < P.minY || y > P.maxY) return false;
  let k = Math.floor((y - P.minY) / P.h);
  if (k >= P.B) k = P.B - 1;
  const E = P.E, idx = P.idx;
  let inside = false;
  for (let t = P.off[k], end = P.off[k + 1]; t < end; t++) {
    const i = idx[t] * 4;
    const xi = E[i], yi = E[i + 1], xj = E[i + 2], yj = E[i + 3];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// X, Y: Float64Array(경도, 위도). 반환: 1이면 안
export function membership(P, X, Y, n) {
  const out = new Uint8Array(n);
  if (P.empty) return out;
  for (let i = 0; i < n; i++) if (contains(P, X[i], Y[i])) out[i] = 1;
  return out;
}

// S[k], D[k]: k번째(활성) 권역에 출발/도착이 들어가는지. 모든 오더에 대해 유형과 '단독 커버 권역'을 계산한다.
export function classify(n, S, D) {
  const K = S.length;
  const types = new Uint8Array(n);
  const only = new Int16Array(n).fill(-1); // 출발·도착이 걸친 권역이 정확히 하나일 때 그 권역 번호
  for (let i = 0; i < n; i++) {
    let s = false, d = false, both = false, cnt = 0, last = -1;
    for (let k = 0; k < K; k++) {
      const sk = S[k][i], dk = D[k][i];
      if (sk) s = true;
      if (dk) d = true;
      if (sk && dk) both = true;
      if (sk || dk) { cnt++; last = k; }
    }
    types[i] = both ? T.INTERNAL : (s && d) ? T.CROSS : s ? T.EXIT : d ? T.ENTRY : T.NONE;
    if (cnt === 1) only[i] = last;
  }
  return { types, only };
}

// mask: 모집단(1 = 포함). 폴리곤별 지표와 5유형 합계.
export function aggregate(n, mask, S, D, cls) {
  const K = S.length;
  const per = Array.from({ length: K }, () => ({ INT: 0, OUT: 0, IN: 0, realOut: 0, only: 0 }));
  const t = [0, 0, 0, 0, 0, 0];
  let N = 0;
  for (let i = 0; i < n; i++) {
    if (!mask[i]) continue;
    N++;
    const ty = cls.types[i];
    t[ty]++;
    for (let k = 0; k < K; k++) {
      const sk = S[k][i], dk = D[k][i];
      if (sk) {
        if (dk) per[k].INT++;
        else { per[k].OUT++; if (ty !== T.INTERNAL) per[k].realOut++; }
      } else if (dk) per[k].IN++;
    }
    if (cls.only[i] >= 0) per[cls.only[i]].only++;
  }
  return { N, t, per };
}

// 기준선 유형 → 현재 유형 5×5 전환 행렬 (모집단 안에서)
export function transition(n, mask, baseTypes, types) {
  const m = Array.from({ length: 6 }, () => new Array(6).fill(0));
  for (let i = 0; i < n; i++) if (mask[i]) m[baseTypes[i]][types[i]]++;
  return m;
}

// 격자 집계: sel(i)가 참인 오더의 도착지를 cell 크기(도) 격자로 센다
export function gridCount(n, sel, X, Y, cellX, cellY) {
  const m = new Map();
  for (let i = 0; i < n; i++) {
    if (!sel(i)) continue;
    const gx = Math.floor(X[i] / cellX), gy = Math.floor(Y[i] / cellY);
    const key = gx * 100000 + gy;
    m.set(key, (m.get(key) || 0) + 1);
  }
  const out = [];
  for (const [key, c] of m) {
    const gx = Math.floor(key / 100000), gy = key - gx * 100000;
    out.push({ x0: gx * cellX, y0: gy * cellY, x1: (gx + 1) * cellX, y1: (gy + 1) * cellY, c });
  }
  return out;
}

// 격자 집계(분류별): cat(i)가 0..k-1이면 그 칸의 k번째 칸수에 더하고, -1이면 건너뛴다
export const cellKey = (x, y, cellX, cellY) => Math.floor(x / cellX) * 100000 + Math.floor(y / cellY);
export function gridCountBy(n, cat, X, Y, cellX, cellY, k) {
  const m = new Map();
  for (let i = 0; i < n; i++) {
    const c = cat(i);
    if (c < 0) continue;
    const key = cellKey(X[i], Y[i], cellX, cellY);
    let a = m.get(key);
    if (!a) { a = new Array(k).fill(0); m.set(key, a); }
    a[c]++;
  }
  const out = [];
  for (const [key, cnt] of m) {
    const gx = Math.floor(key / 100000), gy = key - gx * 100000;
    out.push({ key, x0: gx * cellX, y0: gy * cellY, x1: (gx + 1) * cellX, y1: (gy + 1) * cellY,
      cnt, c: cnt.reduce((s, v) => s + v, 0) });
  }
  return out;
}

// 인트라 권역 편집기 클립보드 포맷 (mesh-one-web regionClipboard.ts, v72.3.0~)
export function toMeshOneRegion(geom) {
  const polys = polysOf(geom).map((poly) => poly.map((ring) => {
    const r = [];
    for (const c of ring) {
      const p = [Math.round(c[0] * 1e6) / 1e6, Math.round(c[1] * 1e6) / 1e6];
      const q = r[r.length - 1];
      if (!q || q[0] !== p[0] || q[1] !== p[1]) r.push(p);
    }
    const a = r[0], z = r[r.length - 1];
    if (a && (a[0] !== z[0] || a[1] !== z[1])) r.push([a[0], a[1]]);
    return r;
  }).filter((ring) => ring.length >= 4)).filter((poly) => poly.length > 0);
  return JSON.stringify({ format: 'mesh-one-region', version: 1,
    feature: { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: polys } } });
}

// 닫는 중복점을 빼고 꼭짓점이 3개 이상인 고리만 도형으로 본다 ([a, b, a]는 면적 없는 선)
export const ringOk = (r) => Array.isArray(r) && r.length - (r.length > 1 && r[0][0] === r[r.length - 1][0] && r[0][1] === r[r.length - 1][1] ? 1 : 0) >= 3;

// 붙여넣은 텍스트 → [{geometry, name}] (mesh-one-region / GeoJSON Feature·FeatureCollection·Geometry)
export function parseGeometries(text) {
  let obj;
  try { obj = JSON.parse(String(text || '').trim()); } catch { return []; }
  const ok = (v) => typeof v === 'number' && Number.isFinite(v);
  // 좌표를 2D로 정리하고, 잘못된 구조면 null
  const fix = (c, depth) => {
    if (!Array.isArray(c)) return null;
    if (depth === 0) return c.length >= 2 && ok(c[0]) && ok(c[1]) ? [c[0], c[1]] : null;
    const out = c.map((x) => fix(x, depth - 1));
    return out.some((x) => x === null) ? null : out;
  };
  const out = [];
  const add = (g, name) => {
    if (!g || typeof g !== 'object') return;
    if (g.type === 'Polygon' || g.type === 'MultiPolygon') {
      const coords = fix(g.coordinates, g.type === 'Polygon' ? 2 : 3);
      const rings = coords ? (g.type === 'Polygon' ? coords : coords.flat()) : [];
      if (coords && rings.length && rings.every(ringOk)) out.push({ geometry: { type: g.type, coordinates: coords }, name: typeof name === 'string' ? name : '' });
    } else if (g.type === 'GeometryCollection' && Array.isArray(g.geometries)) g.geometries.forEach((x) => add(x, name));
  };
  if (!obj || typeof obj !== 'object') return out;
  if (obj.format === 'mesh-one-region' && obj.feature) add(obj.feature.geometry, obj.feature.properties?.name);
  else if (obj.type === 'FeatureCollection' && Array.isArray(obj.features)) obj.features.forEach((f) => f && add(f.geometry, f.properties?.name));
  else if (obj.type === 'Feature') add(obj.geometry, obj.properties?.name);
  else if (obj.type) add(obj);
  return out;
}

// ───────── 파란 박스 공유 코드 ─────────
// 'VRS1.' + base64url(zlib(JSON)). 서버에 저장하지 않고 문자열 하나에 파란 박스의 모양·이름·켜짐을 모두 담는다
// (시간대·필터·영업존 표시 같은 화면 설정은 담지 않음).
// 좌표는 마이크로도 정수 — 화면이 쓰는 GeoJSON(Leaflet toGeoJSON)이 소수 6자리라 손실이 없다. 고리마다 첫 점 + 차분, 닫는 점은 뺀다.
export const SHARE_PREFIX = 'VRS1.';
const SHARE_MAX_CHARS = 4_000_000, SHARE_MAX_JSON = 40_000_000, SHARE_MAX_BOXES = 500;

function b64uEncode(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64uDecode(str) {
  const s = atob(str.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (str.length % 4)) % 4));
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}
async function pipeBytes(bytes, stream, limit = Infinity) {
  const reader = new Blob([bytes]).stream().pipeThrough(stream).getReader();
  const chunks = [];
  let n = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    n += value.length;
    if (n > limit) { await reader.cancel(); throw new Error('too large'); }
    chunks.push(value);
  }
  const out = new Uint8Array(n);
  let o = 0;
  for (const c of chunks) { out.set(c, o); o += c.length; }
  return out;
}

const SHARE_MAX_POINTS = 200_000;

function packRing(ring) {
  const pts = ring.map((c) => [Math.round(c[0] * 1e6), Math.round(c[1] * 1e6)]);
  const a = pts[0], z = pts[pts.length - 1];
  if (pts.length > 1 && a[0] === z[0] && a[1] === z[1]) pts.pop();
  const out = [];
  let px = 0, py = 0;
  for (const [x, y] of pts) { out.push(x - px, y - py); px = x; py = y; }
  return out;
}
function unpackRing(arr, budget) {
  if (!Array.isArray(arr) || arr.length < 6 || arr.length % 2) throw new Error('꼭짓점이 3개 미만인 고리');
  budget.left -= arr.length / 2;
  if (budget.left < 0) throw new Error(`꼭짓점이 너무 많음(전체 ${SHARE_MAX_POINTS.toLocaleString()}개 이하)`);
  const ring = [];
  let x = 0, y = 0;
  for (let i = 0; i < arr.length; i += 2) {
    if (!Number.isSafeInteger(arr[i]) || !Number.isSafeInteger(arr[i + 1])) throw new Error('좌표가 정수가 아님');
    x += arr[i]; y += arr[i + 1];
    if (x < 124e6 || x > 132e6 || y < 33e6 || y > 39e6) throw new Error('한국 범위(경도 124~132, 위도 33~39) 밖 좌표');
    ring.push([x / 1e6, y / 1e6]);
  }
  ring.push([ring[0][0], ring[0][1]]);
  return ring;
}
const packBox = (x) => ({ n: String(x.name ?? ''), a: x.active === false ? 0 : 1, m: x.geometry?.type === 'MultiPolygon' ? 1 : 0,
  g: polysOf(x.geometry).map((poly) => poly.map(packRing)) });
function unpackBox(x, budget = { left: SHARE_MAX_POINTS }) {
  if (!x || !Array.isArray(x.g) || !x.g.length) throw new Error('도형 없음');
  const polys = x.g.map((poly) => {
    if (!Array.isArray(poly) || !poly.length) throw new Error('빈 다각형');
    return poly.map((r) => unpackRing(r, budget));
  });
  const geometry = polys.length > 1 || x.m === 1 ? { type: 'MultiPolygon', coordinates: polys } : { type: 'Polygon', coordinates: polys[0] };
  return { name: String(x.n ?? ''), active: x.a !== 0, geometry };
}

// list: [{name, active, geometry}] → { code, count, skipped: [{index, name, reason}] }
// 받는 쪽에서 거절될 박스(꼭짓점 3개 미만·한국 범위 밖 등)는 같은 검사로 미리 빼고 알려 준다 → 만든 코드는 항상 가져올 수 있다
export async function encodeShare(list) {
  const b = [], skipped = [];
  const budget = { left: SHARE_MAX_POINTS };
  list.forEach((x, index) => {
    try { const p = packBox(x); unpackBox(p, budget); b.push(p); } catch (e) { skipped.push({ index, name: String(x?.name ?? ''), reason: e.message }); }
  });
  if (b.length > SHARE_MAX_BOXES) throw new Error(`파란 박스가 너무 많습니다 (${SHARE_MAX_BOXES}개 이하)`);
  const json = new TextEncoder().encode(JSON.stringify({ v: 1, b }));
  const code = SHARE_PREFIX + b64uEncode(await pipeBytes(json, new CompressionStream('deflate')));
  return { code, count: b.length, skipped };
}

// 공유 코드 → [{name, active, geometry}]. 형식이 틀리면 사용자에게 보여 줄 문구로 Error를 던진다
export async function decodeShare(text) {
  const s = String(text ?? '').replace(/\s+/g, '');
  if (!s.startsWith(SHARE_PREFIX)) throw new Error(`공유 코드가 아닙니다 (${SHARE_PREFIX} 로 시작해야 합니다)`);
  if (s.length > SHARE_MAX_CHARS) throw new Error('공유 코드가 너무 깁니다');
  let obj;
  try {
    const json = await pipeBytes(b64uDecode(s.slice(SHARE_PREFIX.length)), new DecompressionStream('deflate'), SHARE_MAX_JSON);
    obj = JSON.parse(new TextDecoder().decode(json));
  } catch {
    throw new Error('공유 코드가 깨졌습니다 — 처음부터 끝까지 빠짐없이 복사했는지 확인하세요');
  }
  if (!obj || obj.v !== 1 || !Array.isArray(obj.b)) throw new Error('지원하지 않는 공유 코드 형식입니다');
  if (obj.b.length > SHARE_MAX_BOXES) throw new Error(`파란 박스가 너무 많습니다 (${SHARE_MAX_BOXES}개 이하)`);
  const budget = { left: SHARE_MAX_POINTS };
  return obj.b.map((x, i) => {
    try { return unpackBox(x, budget); } catch (e) { throw new Error(`공유 코드의 ${i + 1}번째 파란 박스가 잘못되었습니다: ${e.message}`); }
  });
}

export function geomKey(geom) {
  const s = JSON.stringify(geom.coordinates);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return `${s.length}:${h >>> 0}`;
}
