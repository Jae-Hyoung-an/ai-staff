/* 대시보드 런타임(dash) — Claude 대시보드가 페이지에 주는 dash 객체를 정적 파일로 흉내 낸다.
   head에서 페이지 스크립트보다 먼저 돈다. 첫 그리기는 페이지 스크립트가 다 돈 뒤(DOMContentLoaded)
   #dash-datasets의 CSV를 모두 받은 다음 한 번에 하고, 그 뒤 다시 그리기는 한 프레임(rAF)에 모은다. */
(function () {
  'use strict';

  const LOADING = { status: 'loading', data: [], columns: [], message: '' };
  const MISSING = { status: 'missing', data: [], columns: [], message: '' };
  const fail = (message) => ({ status: 'error', data: [], columns: [], message });

  // 데이터셋 목록(id → CSV 주소): head의 JSON
  let manifest = {};
  try {
    const m = document.getElementById('dash-datasets');
    if (m) manifest = JSON.parse(m.textContent);
  } catch (err) {
    console.error('[dash]', 'dash-datasets', err);
  }
  const sets = new Map(Object.keys(manifest).map((id) => [id, LOADING])); // id → 상태
  const calcs = new Map();      // id → {inputs, fn, memo}
  const draws = new Map();      // 이름 → fn 또는 {mount, update, unmount}(등록 순서대로 그린다)
  const loaders = new Map();    // 정적 사본에서는 보관만 한다
  const onDataFns = [];
  const mounted = new Map();    // 요소 → {def, name, made}: mount를 마친 객체형 drawing
  const waiting = new Set();    // hidden 밑이라 건너뛴 요소
  const logged = new WeakMap(); // 요소 → 오류를 이미 남긴 drawing 이름들
  const widths = new WeakMap(); // 요소 → 우리가 그린 직후 잰 너비
  const observed = new WeakSet();
  let params = Object.create(null);
  let root = null;
  let started = false;          // 첫 판을 시작했나(그 전의 예약은 첫 판이 모두 덮는다)
  let lastVW = window.innerWidth;

  // ── 데이터 상태 ──
  const state = (id, seen) => {
    if (sets.has(id)) return sets.get(id);
    const c = calcs.get(id);
    return c ? calcState(id, c, seen || new Set()) : MISSING;
  };
  // 계산값: 입력이 모두 ok일 때 계산하고, 입력(행 배열)이 그대로면 기억한 결과를 돌려준다
  const calcState = (id, c, seen) => {
    if (seen.has(id)) return fail('계산값이 서로를 입력으로 씁니다: ' + id);
    seen.add(id);
    const ins = c.inputs.map((x) => [x, state(x, seen)]);
    seen.delete(id);
    const bad = ins.find(([, s]) => s.status !== 'ok' && s.status !== 'loading');
    if (bad) return fail(`입력 ${bad[0]}: ${bad[1].message || bad[1].status}`);
    if (ins.some(([, s]) => s.status === 'loading')) return LOADING;
    const key = ins.map(([, s]) => s.data);
    if (c.memo && c.memo.key.every((d, i) => d === key[i])) return c.memo.st;
    let st;
    try {
      const v = c.fn(...key);
      st = { status: 'ok', data: v, columns: Array.isArray(v) && v[0] && typeof v[0] === 'object' ? Object.keys(v[0]) : [], message: '' };
    } catch (err) {
      console.error('[dash]', id, err);
      st = fail(String((err && err.message) || err));
    }
    c.memo = { key, st };
    return st;
  };

  // ── 페이지가 쓰는 dash ──
  const dash = {
    colors: Object.freeze([1, 2, 3, 4, 5, 6, 7, 8].map((i) => `var(--cds-chart-categorical-${i})`)),
    // {status, data, message, refreshing, meta} + columns(열 순서). rows는 예전 페이지용 별칭
    data(id) {
      const s = state(String(id));
      return { status: s.status, data: s.data, rows: s.data, columns: s.columns, message: s.message, refreshing: false, meta: [] };
    },
    calc(id, spec) {
      const s = spec || {};
      if (typeof s.fn !== 'function' || !Array.isArray(s.inputs)) {
        console.error('[dash]', 'calc', id, 'inputs 배열과 fn이 필요합니다');
        return;
      }
      calcs.set(String(id), { inputs: s.inputs.map(String), fn: s.fn, memo: null });
      scheduleAll();
    },
    draw(name, def) {
      name = String(name);
      if (def === undefined) { schedule(name); return; } // 이름만 주면 다시 그린다
      if (typeof def !== 'function' && !(def && typeof def === 'object')) {
        console.error('[dash]', name, 'drawing은 함수나 {mount, update, unmount}여야 합니다');
        return;
      }
      draws.set(name, def);
      schedule(name);
    },
    onData(fn) {
      if (typeof fn !== 'function') return;
      onDataFns.push(fn);
      runOnData(fn); // 지금 한 번
    },
    loader(id, spec) { loaders.set(String(id), spec); },
    refresh() {},
    params() { return Object.assign({}, params); },
    setParams(o) {
      let changed = false;
      Object.keys(o || {}).forEach((k) => {
        const v = o[k];
        if (v === null || v === undefined) {
          if (k in params) { delete params[k]; changed = true; }
        } else if (params[k] !== v) {
          params[k] = v;
          changed = true;
        }
      });
      if (changed) scheduleAll();
    },
    resetParams() { params = Object.create(null); scheduleAll(); },
    setLink(name) {
      try {
        history.replaceState(null, '', name ? '#' + name : location.pathname + location.search);
      } catch (err) {
        console.error('[dash]', 'setLink', err);
      }
    },
  };
  window.dash = dash;

  // ── 다시 그리기 예약: 한 프레임(rAF)에 모아 한 번 ──
  let queued = false;
  let wantAll = false;
  const dirtyNames = new Set();
  const dirtyEls = new Set();
  const request = () => { if (!queued) { queued = true; requestAnimationFrame(flush); } };
  function scheduleAll() { if (started) { wantAll = true; request(); } }
  function schedule(name) { if (started) { dirtyNames.add(name); request(); } }
  const scheduleEl = (el) => { if (started) { dirtyEls.add(el); request(); } };

  const onDataLogged = new WeakSet();
  function runOnData(fn) {
    try {
      fn();
    } catch (err) {
      if (!onDataLogged.has(fn)) { onDataLogged.add(fn); console.error('[dash]', 'onData', err); }
    }
  }

  // 같은 (drawing, 요소)의 오류는 한 번만 남긴다
  const report = (el, name, err) => {
    let names = logged.get(el);
    if (!names) logged.set(el, (names = new Set()));
    if (!names.has(name)) { names.add(name); console.error('[dash]', name, err); }
  };
  const unmount = (el, it) => {
    mounted.delete(el);
    try {
      if (it.def.unmount) it.def.unmount(el, it.made);
    } catch (err) {
      report(el, it.name, err);
    }
  };

  // 상태 표시: 출처 중 error가 있으면 error, loading이 있으면 loading, 모두 ok인데 '—'만 보이면 empty, 아니면 지운다
  const stamp = (el) => {
    const src = el.getAttribute('data-source');
    if (src === null) return;
    const st = src.split(/\s+/).filter(Boolean).map((id) => state(id).status);
    const v = st.includes('error') ? 'error'
      : st.includes('loading') ? 'loading'
        : st.length && st.every((s) => s === 'ok') && el.textContent.trim() === '—' ? 'empty' : null;
    if (v === null) el.removeAttribute('data-dash-source-state');
    else if (el.getAttribute('data-dash-source-state') !== v) el.setAttribute('data-dash-source-state', v);
  };

  // 요소 하나를 그린다. 그릴 것이 없거나 hidden 밑이면 false(hidden이 풀리면 다시 온다)
  const runEl = (el, name) => {
    const def = draws.get(name);
    if (!def) return false;
    if (el.closest('[hidden]')) { waiting.add(el); return false; }
    waiting.delete(el);
    try {
      let it = mounted.get(el);
      if (typeof def === 'function') {
        if (it) unmount(el, it); // 객체형에서 함수형으로 바뀐 경우
        def(el);
      } else {
        if (it && it.def !== def) { unmount(el, it); it = null; }
        if (!it) {
          el.replaceChildren(); // 비운 요소에 mount
          it = { def, name, made: def.mount ? def.mount(el) : undefined };
          mounted.set(el, it);
        }
        if (def.update) def.update(el, it.made);
      }
    } catch (err) {
      report(el, name, err);
      const it = mounted.get(el);
      if (it) unmount(el, it); // 던지면 내린다 → 다음 번에 다시 mount
    }
    stamp(el);
    return true;
  };

  const widthOf = (el) => (typeof el.offsetWidth === 'number' ? el.offsetWidth : el.getBoundingClientRect().width);

  function flush() {
    queued = false;
    const all = wantAll;
    const names = new Set(dirtyNames);
    const els = [...dirtyEls];
    wantAll = false;
    dirtyNames.clear();
    dirtyEls.clear();
    const done = new Set();
    const drawn = [];
    const run = (el, name) => {
      if (done.has(el)) return;
      done.add(el);
      if (runEl(el, name)) drawn.push(el);
    };
    const marks = () => root.querySelectorAll('[data-draw]');
    if (all) {
      lastVW = window.innerWidth;
      onDataFns.forEach(runOnData); // onData는 drawing보다 먼저
      const byName = new Map();
      marks().forEach((el) => {
        const n = el.getAttribute('data-draw');
        if (!byName.has(n)) byName.set(n, []);
        byName.get(n).push(el);
      });
      draws.forEach((def, name) => (byName.get(name) || []).forEach((el) => run(el, name)));
    } else {
      if (names.size) marks().forEach((el) => { const n = el.getAttribute('data-draw'); if (names.has(n)) run(el, n); });
      els.forEach((el) => { if (el.isConnected) run(el, el.getAttribute('data-draw')); });
    }
    // 그린 요소의 너비는 끝에 한꺼번에 잰다(레이아웃 한 번). ResizeObserver는 이 값과 달라질 때만 다시 그린다
    drawn.forEach((el) => {
      widths.set(el, widthOf(el));
      if (ro && !observed.has(el)) { observed.add(el); ro.observe(el); }
    });
  }

  // 요소 자기 너비가 바뀌면 그 요소만 다시 그린다. 우리 그리기가 만든 크기 변화(그린 직후 잰 값)로는 다시 돌지 않는다
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver((entries) => {
    entries.forEach(({ target: el }) => {
      if (el.isConnected && widths.has(el) && Math.abs(widthOf(el) - widths.get(el)) >= 0.5) scheduleEl(el);
    });
  }) : null;

  // hidden이 풀리면 미뤄 둔 요소를 그리고, 페이지에서 빠진 요소의 객체형 drawing은 내린다
  const mo = new MutationObserver((records) => {
    let hiddenChanged = false;
    let removed = false;
    records.forEach((r) => {
      if (r.type === 'attributes') hiddenChanged = true;
      else if (r.removedNodes.length) removed = true;
    });
    if (hiddenChanged) {
      waiting.forEach((el) => {
        if (!el.isConnected) waiting.delete(el);
        else if (!el.closest('[hidden]')) scheduleEl(el);
      });
    }
    if (removed) mounted.forEach((it, el) => { if (!el.isConnected) unmount(el, it); });
  });

  // 창 너비·테마가 바뀌면 전부 다시(차트는 그릴 때 색을 굳힌다), 글꼴이 준비되면 한 번 더
  window.addEventListener('resize', () => { if (window.innerWidth !== lastVW) scheduleAll(); });
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) mq.addEventListener('change', scheduleAll);
    else if (mq.addListener) mq.addListener(scheduleAll);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => scheduleAll());

  // ── 시작: 데이터를 받고 첫 판 ──
  // CSV → d3.csvParse와 같은 행(열 이름 → 글자, 빈 칸 ''). d3.csvParse는 new Function을 써서
  // 이 페이지의 CSP(unsafe-eval 없음)에 막히므로, csvParseRows로 읽어 같은 모양으로 짓는다
  const parseCsv = (text) => {
    const all = d3.csvParseRows(text);
    const columns = all.length ? all[0] : [];
    const rows = all.slice(1).map((r) => {
      const o = {};
      columns.forEach((c, i) => { o[c] = r[i] || ''; });
      return o;
    });
    rows.columns = columns;
    return rows;
  };
  const setRootState = () => {
    if ([...sets.values()].some((s) => s.status === 'error')) root.setAttribute('data-dash-state', 'error');
    else root.removeAttribute('data-dash-state');
  };
  const load = (id) => fetch(manifest[id])
    .then((r) => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    })
    .then((text) => {
      const rows = parseCsv(text);
      return { status: 'ok', data: rows, columns: rows.columns.slice(), message: '' };
    })
    .catch((err) => fail(String((err && err.message) || err)))
    .then((st) => {
      sets.set(id, st);
      if (started) { setRootState(); scheduleAll(); } // 첫 판 뒤에 도착한 데이터: 모두 다시 그린다
    });
  const firstPass = () => {
    started = true;
    mo.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['hidden'] });
    wantAll = true;
    flush(); // 첫 판은 rAF를 기다리지 않는다(뒤쪽 탭에서도 그려 둔다)
    setRootState();
    // 주소의 #이름: 페이지 스크립트가 먼저 옮겨 갔지만 그때는 차트가 없었으므로, 그린 뒤 한 번 더
    let id = location.hash.slice(1);
    try { id = decodeURIComponent(id); } catch (err) { /* 그대로 쓴다 */ }
    const target = id ? document.getElementById(id) : null;
    if (target) target.scrollIntoView();
  };
  const notice = () => {
    const p = document.createElement('p');
    p.className = 'dash-notice';
    p.setAttribute('role', 'alert');
    p.textContent = '차트 라이브러리를 불러오지 못했습니다 — 네트워크를 확인하고 새로고침하세요';
    root.prepend(p);
  };
  const boot = () => {
    root = document.getElementById('dash-root') || document.body;
    if (typeof window.d3 === 'undefined' || typeof d3.csvParseRows !== 'function') {
      notice(); // CDN이 막혔다: 안내만 하고 멈춘다
      root.setAttribute('data-dash-state', 'error');
      return;
    }
    root.setAttribute('data-dash-state', 'loading');
    Promise.all(Object.keys(manifest).map(load))
      .then(firstPass)
      .catch((err) => console.error('[dash]', 'first-pass', err));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
