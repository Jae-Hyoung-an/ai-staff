/* 벤더존 적시 도착·조리 지연 — 차트 도우미 (d3 v7 전역, dash 전역). 모든 쓰기는 drawing 안에서만 한다. */
(function () {
  const VZ = {};

  VZ.TYPES = ['G1', 'G4', '요기요OD', '땡겨요OD', '올리브영'];
  // 상점 타입 색: G4·G1·요기요OD만 색, 나머지는 회색. 타입이 아닌 계열(지표·유형)의 강조는 colors[3]
  VZ.typeColor = (t) => ({ G4: dash.colors[0], G1: dash.colors[1], '요기요OD': dash.colors[2] }[t] || 'var(--cds-chart-muted)');
  VZ.accent = () => dash.colors[3];
  VZ.num = (v) => (v === null || v === undefined || v === '' ? NaN : Number(v));
  VZ.f1 = (v) => (Number.isFinite(v) ? d3.format('.1f')(v) : '—');
  VZ.signed = (v) => (Number.isFinite(v) ? (v > 0 ? '+' : v < 0 ? '−' : '') + d3.format('.1f')(Math.abs(v)) : '—');
  VZ.int = (v) => (Number.isFinite(v) ? d3.format(',')(v) : '—');

  // 값 하나의 표기: 1 = 소수 1자리, 0 = 정수(쉼표), s1 = 부호 붙은 소수 1자리, a1 = 절댓값 소수 1자리, 2 = 소수 2자리, t = 글자 그대로
  VZ.fmt = (v, f) => {
    if (f === 't') return v === null || v === undefined || v === '' ? '—' : String(v);
    const x = VZ.num(v);
    if (!Number.isFinite(x)) return '—';
    if (f === '0') return d3.format(',')(Math.round(x));
    if (f === '2') return d3.format('.2f')(x);
    if (f === 'a1') return d3.format('.1f')(Math.abs(x));
    if (f === 's1') return VZ.signed(x);
    return d3.format('.1f')(x);
  };

  // 표시 값 하나: data-source·data-field와 data-where(또는 data-row)로 행을 찾아 data-fmt로 적는다
  VZ.cell = (el) => {
    const s = dash.data(el.getAttribute('data-source'));
    if (s.status !== 'ok') { el.textContent = '—'; return; }
    const rows = s.data || [];
    let r;
    const ri = el.getAttribute('data-row');
    if (ri !== null) r = rows[Number(ri)];
    else {
      const w = (el.getAttribute('data-where') || '').split('&').filter(Boolean).map((p) => p.split('=').map(decodeURIComponent));
      r = rows.find((x) => w.every(([k, v]) => String(x[k]) === v));
    }
    el.textContent = r ? VZ.fmt(r[el.getAttribute('data-field')], el.getAttribute('data-fmt') || '1') : '—';
  };

  // CSS 색 표현(var(...) 포함)을 rgb 문자열로 바꾼다 — 보간·명도 판정용. 잴 때 쓰는 요소는 그 그림 상자(box) 안에 잠깐 둔다
  VZ.rgb = (expr, box) => {
    const p = document.createElement('span');
    p.style.color = expr;
    p.style.position = 'absolute';
    p.style.visibility = 'hidden';
    box.appendChild(p);
    const c = getComputedStyle(p).color;
    p.remove();
    return c;
  };
  VZ.isDark = (rgb) => {
    const m = String(rgb).match(/[\d.]+/g);
    if (!m) return false;
    const [r, g, b] = m.slice(0, 3).map(Number).map((x) => x / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.36;
  };

  // 상태별 자리 표시: ok가 아니면 비우고, error면 한 줄
  VZ.ready = (el, ids) => {
    const st = ids.map((id) => dash.data(id));
    if (st.every((s) => s.status === 'ok')) return st.map((s) => s.data || []);
    el.replaceChildren();
    if (st.some((s) => s.status === 'error')) {
      const m = document.createElement('div');
      m.className = 'vz-fail';
      const dot = document.createElement('span');
      dot.className = 'vz-fail-dot';
      const tx = document.createElement('span');
      tx.textContent = 'Failed to load';
      m.append(dot, tx);
      el.append(m);
    } else {
      el.textContent = '—';
    }
    return null;
  };

  // 툴팁: drawing 상자 안 absolute
  VZ.tip = (box) => {
    let t = box.querySelector(':scope > .vz-tip');
    if (!t) {
      t = document.createElement('div');
      t.className = 'vz-tip';
      t.hidden = true;
      box.append(t);
    }
    return {
      show(ev, head, lines) {
        t.replaceChildren();
        const h = document.createElement('div');
        h.className = 'vz-tip-head';
        h.textContent = head;
        t.append(h);
        lines.forEach(([color, label, value]) => {
          const r = document.createElement('div');
          r.className = 'vz-tip-row';
          if (color) {
            const k = document.createElement('span');
            k.className = 'vz-tip-key';
            k.style.background = color;
            r.append(k);
          }
          const v = document.createElement('b');
          v.textContent = value;
          const l = document.createElement('span');
          l.textContent = label;
          r.append(v, l);
          t.append(r);
        });
        t.hidden = false;
        const bb = box.getBoundingClientRect();
        const tw = t.offsetWidth, th = t.offsetHeight;
        let x = ev.clientX - bb.left + 12, y = ev.clientY - bb.top + 12;
        if (x + tw > bb.width) x = Math.max(0, ev.clientX - bb.left - tw - 12);
        if (y + th > bb.height) y = Math.max(0, ev.clientY - bb.top - th - 12);
        t.style.left = x + 'px';
        t.style.top = y + 'px';
      },
      hide() { t.hidden = true; },
    };
  };

  VZ.svg = (el, w, h) => {
    el.replaceChildren();
    return d3.select(el).append('svg').attr('width', '100%').attr('viewBox', `0 0 ${w} ${h}`).attr('role', 'img');
  };
  VZ.textW = (svg, s, cls) => {
    const t = svg.append('text').attr('class', cls || 'vz-tick').text(s);
    const w = t.node().getComputedTextLength();
    t.remove();
    return w;
  };
  // 범례 한 줄(svg 안 위쪽): 넘치면 다음 줄로. 차지한 높이를 돌려준다
  VZ.legend = (g, svg, x0, maxX, items) => {
    let lx = x0, ly = 4;
    items.forEach((it) => {
      const w = 14 + VZ.textW(svg, it.name, 'vz-legend') + 14;
      if (lx + w > maxX && lx > x0) { lx = x0; ly += 16; }
      if (it.hollow) g.append('circle').attr('cx', lx + 5).attr('cy', ly + 5).attr('r', 4).style('fill', 'var(--color-panel)').style('stroke', it.color).style('stroke-width', 2);
      else if (it.line) g.append('line').attr('x1', lx).attr('x2', lx + 10).attr('y1', ly + 5).attr('y2', ly + 5).style('stroke', it.color).style('stroke-width', 2).style('stroke-dasharray', it.dash || null);
      else g.append('rect').attr('x', lx).attr('y', ly).attr('width', 10).attr('height', 10).attr('rx', 2).style('fill', it.color).style('opacity', it.opacity ?? 1);
      g.append('text').attr('x', lx + 14).attr('y', ly + 9).attr('class', 'vz-legend').text(it.name);
      lx += w;
    });
    return ly + 16;
  };

  // ── 히트맵 표: 행(존) × 열(상점 타입), 한 색 계열(연함→진함) ──
  VZ.heat = (el, rows, o) => {
    el.replaceChildren();
    const cols = o.cols, rws = o.rows;
    const vals = rows.filter((r) => cols.includes(r[o.colKey]) && rws.includes(r[o.rowKey]) && r[o.rowKey] !== o.totalRow && r[o.colKey] !== o.totalCol).map((r) => VZ.num(r[o.value]));
    const dom = o.domain || d3.extent(vals);
    const c0 = VZ.rgb('var(--color-panel)', el), c1 = VZ.rgb(dash.colors[0], el);
    const ramp = d3.scaleLinear().domain(dom).range([0.08, 0.95]).clamp(true);
    const tip = VZ.tip(el);
    const grid = document.createElement('div');
    grid.className = 'vz-heat';
    grid.style.gridTemplateColumns = `minmax(4.2rem, 1.1fr) repeat(${cols.length}, minmax(2.9rem, 1fr))`;
    const cell = (cls, txt) => { const d = document.createElement('div'); d.className = cls; d.textContent = txt; return d; };
    grid.append(cell('vz-heat-corner', ''));
    cols.forEach((c) => grid.append(cell('vz-heat-col', c)));
    rws.forEach((rk) => {
      grid.append(cell('vz-heat-row' + (rk === o.totalRow ? ' is-total' : ''), rk));
      cols.forEach((ck) => {
        const r = rows.find((x) => x[o.rowKey] === rk && x[o.colKey] === ck);
        const v = r ? VZ.num(r[o.value]) : NaN;
        const total = rk === o.totalRow || ck === o.totalCol;
        const d = cell('vz-heat-cell' + (total ? ' is-total' : ''), Number.isFinite(v) ? VZ.f1(v) : '—');
        if (Number.isFinite(v) && !total) {
          const bg = d3.interpolateRgb(c0, c1)(ramp(v));
          d.style.background = bg;
          d.style.color = VZ.isDark(bg) ? '#fff' : 'var(--color-fg)';
        }
        if (r) {
          d.tabIndex = 0;
          const n = VZ.num(r[o.n]);
          const show = (ev) => tip.show(ev, `${rk} · ${ck}`, [[null, o.label, VZ.f1(v) + '%'], [null, o.nLabel || '완료 오더', VZ.int(n) + '건']].concat(o.extra ? o.extra(r) : []));
          d.addEventListener('pointermove', show);
          d.addEventListener('focus', () => { const b = d.getBoundingClientRect(); show({ clientX: b.right, clientY: b.top }); });
          d.addEventListener('pointerleave', () => tip.hide());
          d.addEventListener('blur', () => tip.hide());
        }
        grid.append(d);
      });
    });
    el.append(grid);
    const lg = document.createElement('div');
    lg.className = 'vz-heat-legend';
    const a = document.createElement('span'); a.textContent = VZ.f1(dom[0]) + '%';
    const bar = document.createElement('span'); bar.className = 'vz-heat-ramp';
    bar.style.background = `linear-gradient(90deg, ${d3.interpolateRgb(c0, c1)(0.08)}, ${d3.interpolateRgb(c0, c1)(0.95)})`;
    const b = document.createElement('span'); b.textContent = VZ.f1(dom[1]) + '%';
    lg.append(a, bar, b);
    el.append(lg);
  };

  // ── 덤벨: 항목마다 계열 여럿(채운 원·빈 원), 위쪽에 범례 ──
  VZ.dumbbell = (el, rows, o) => {
    const W = Math.max(300, el.clientWidth || 640);
    const unit = o.unit ?? '%';
    const rowH = 36, bottom = 28;
    const svg = VZ.svg(el, W, 100);
    const labW = d3.max(rows, (r) => VZ.textW(svg, r[o.label], 'vz-lab')) + 12;
    const L = labW, R = 20;
    const g = svg.append('g');
    const top = VZ.legend(g, svg, L, W - R, o.series.map((s) => ({ name: s.name, color: s.color, hollow: s.hollow }))) + 14;
    const H = top + rows.length * rowH + bottom;
    svg.attr('viewBox', `0 0 ${W} ${H}`);
    const all = rows.flatMap((r) => o.series.map((s) => VZ.num(r[s.field]))).filter(Number.isFinite);
    const x = d3.scaleLinear().domain([Math.floor((d3.min(all) - 3) / 5) * 5, Math.ceil((d3.max(all) + 3) / 5) * 5]).range([L, W - R]);
    const ticks = x.ticks(Math.max(3, Math.min(7, Math.floor((W - L - R) / 60))));
    ticks.forEach((t) => {
      g.append('line').attr('x1', x(t)).attr('x2', x(t)).attr('y1', top - 6).attr('y2', H - bottom).attr('class', t === 0 ? 'vz-axis' : 'vz-grid');
      g.append('text').attr('x', x(t)).attr('y', H - bottom + 17).attr('text-anchor', 'middle').attr('class', 'vz-tick').text((t < 0 ? '−' + Math.abs(t) : t) + unit);
    });
    const tip = VZ.tip(el);
    const vf = (v) => (o.signed ? VZ.signed(v) : VZ.f1(v));
    rows.forEach((r, i) => {
      const y = top + i * rowH + rowH / 2;
      const vs = o.series.map((s) => VZ.num(r[s.field]));
      g.append('text').attr('x', L - 10).attr('y', y + 4).attr('text-anchor', 'end').attr('class', 'vz-lab' + (r[o.label] === o.emph ? ' is-emph' : '')).text(r[o.label]);
      const ok = vs.filter(Number.isFinite);
      if (ok.length > 1) g.append('line').attr('x1', x(d3.min(ok))).attr('x2', x(d3.max(ok))).attr('y1', y).attr('y2', y).attr('class', 'vz-db-line');
      const labeled = o.series.map((s, j) => (s.label && Number.isFinite(vs[j]) ? vs[j] : NaN)).filter(Number.isFinite);
      o.series.forEach((s, j) => {
        const v = vs[j];
        if (!Number.isFinite(v)) return;
        g.append('circle').attr('cx', x(v)).attr('cy', y).attr('r', s.hollow ? 5 : 6)
          .style('fill', s.hollow ? 'var(--color-panel)' : s.color).style('stroke', s.hollow ? s.color : 'var(--color-panel)').style('stroke-width', 2);
        if (s.label) {
          const left = labeled.length > 1 && v === d3.min(labeled);
          g.append('text').attr('x', x(v) + (left ? -10 : 10)).attr('y', y - 8).attr('text-anchor', left ? 'end' : 'start').attr('class', 'vz-val').text(vf(v));
        }
      });
      g.append('rect').attr('x', L).attr('y', y - rowH / 2).attr('width', W - L - R).attr('height', rowH).attr('fill', 'transparent')
        .on('pointermove', (ev) => tip.show(ev, r[o.label], o.series.map((s, j) => [s.color, s.name, vf(vs[j]) + unit]).concat(o.extra ? o.extra(r) : [])))
        .on('pointerleave', () => tip.hide());
    });
  };

  // ── 가로 막대(음수 가능, 선택적으로 95% 구간 선) ──
  VZ.hbars = (el, rows, o) => {
    const W = Math.max(300, el.clientWidth || 600);
    const rowH = o.rowH || 30, top = 8, bottom = 26;
    const H = top + rows.length * rowH + bottom;
    const svg = VZ.svg(el, W, H);
    const labW = d3.max(rows, (r) => VZ.textW(svg, r[o.label], 'vz-lab')) + 12;
    const vals = rows.map((r) => VZ.num(r[o.value]));
    const cis = rows.map((r) => (o.ci ? VZ.num(r[o.ci]) || 0 : 0));
    const lo = Math.min(0, d3.min(vals.map((v, i) => v - cis[i]))), hi = Math.max(0, d3.max(vals.map((v, i) => v + cis[i])));
    const valW = VZ.textW(svg, '−00.0' + (o.unit || ''), 'vz-val') + 10;
    const x = d3.scaleLinear().domain([lo, hi]).range([labW + (lo < 0 ? valW : 0), W - (hi > 0 ? valW : 8)]).nice();
    const g = svg.append('g');
    x.ticks(Math.max(3, Math.min(6, Math.floor((W - labW) / 70)))).forEach((t) => {
      g.append('line').attr('x1', x(t)).attr('x2', x(t)).attr('y1', top).attr('y2', H - bottom).attr('class', t === 0 ? 'vz-axis' : 'vz-grid');
      g.append('text').attr('x', x(t)).attr('y', H - bottom + 16).attr('text-anchor', 'middle').attr('class', 'vz-tick').text((t < 0 ? '−' + Math.abs(t) : t) + (o.unit || ''));
    });
    const tip = VZ.tip(el);
    const vf = (v) => (o.signed ? VZ.signed(v) : VZ.f1(v)) + (o.unit || '');
    rows.forEach((r, i) => {
      const v = vals[i];
      const y = top + i * rowH;
      const bh = Math.min(18, rowH - 12);
      g.append('text').attr('x', labW - 10).attr('y', y + rowH / 2 + 4).attr('text-anchor', 'end').attr('class', 'vz-lab' + (o.emph && o.emph(r) ? ' is-emph' : '')).text(r[o.label]);
      if (!Number.isFinite(v)) return;
      const x0 = x(Math.min(0, v)), x1 = x(Math.max(0, v));
      const color = o.color ? o.color(r) : VZ.accent();
      g.append('rect').attr('x', x0).attr('y', y + (rowH - bh) / 2).attr('width', Math.max(1, x1 - x0)).attr('height', bh).attr('rx', 3).style('fill', color);
      const ci = cis[i];
      if (ci > 0) {
        const cy = y + rowH / 2;
        g.append('line').attr('x1', x(v - ci)).attr('x2', x(v + ci)).attr('y1', cy).attr('y2', cy).attr('class', 'vz-ci');
        [v - ci, v + ci].forEach((e) => g.append('line').attr('x1', x(e)).attr('x2', x(e)).attr('y1', cy - 4).attr('y2', cy + 4).attr('class', 'vz-ci'));
      }
      const ex = v < 0 ? x(Math.min(v, v - ci)) - 6 : x(Math.max(v, v + ci)) + 6;
      g.append('text').attr('x', ex).attr('y', y + rowH / 2 + 4).attr('text-anchor', v < 0 ? 'end' : 'start').attr('class', 'vz-val').text(vf(v));
      g.append('rect').attr('x', labW).attr('y', y).attr('width', W - labW).attr('height', rowH).attr('fill', 'transparent')
        .on('pointermove', (ev) => tip.show(ev, r[o.label], [[color, o.name || '', vf(v)]].concat(ci > 0 ? [[null, '95% 구간', `${VZ.signed(v - ci)} ~ ${VZ.signed(v + ci)}${o.unit || ''}`]] : []).concat(o.extra ? o.extra(r) : [])))
        .on('pointerleave', () => tip.hide());
    });
  };

  // ── 누적 막대(구성): 항목마다 여러 조각 ──
  VZ.stack = (el, rows, o) => {
    const W = Math.max(300, el.clientWidth || 640);
    const rowH = o.rowH || 34, bottom = 26;
    const svg = VZ.svg(el, W, 100);
    const labW = d3.max(rows, (r) => VZ.textW(svg, r[o.label], 'vz-lab')) + 12;
    const g = svg.append('g');
    const top = VZ.legend(g, svg, labW, W - 10, o.parts.map((p) => ({ name: p.name, color: p.color, opacity: p.opacity }))) + 10;
    const H = top + rows.length * rowH + bottom;
    svg.attr('viewBox', `0 0 ${W} ${H}`);
    const tot = rows.map((r) => d3.sum(o.parts, (p) => Math.max(0, VZ.num(r[p.field]) || 0)));
    const totW = VZ.textW(svg, '00.0' + (o.unit || ''), 'vz-val') + 10;
    const x = d3.scaleLinear().domain([0, o.max || d3.max(tot)]).range([labW, W - totW]).nice();
    x.ticks(Math.max(3, Math.min(6, Math.floor((W - labW) / 70)))).forEach((t) => {
      g.append('line').attr('x1', x(t)).attr('x2', x(t)).attr('y1', top - 4).attr('y2', H - bottom).attr('class', t === 0 ? 'vz-axis' : 'vz-grid');
      g.append('text').attr('x', x(t)).attr('y', H - bottom + 16).attr('text-anchor', 'middle').attr('class', 'vz-tick').text(t + (o.unit || ''));
    });
    const tip = VZ.tip(el);
    rows.forEach((r, i) => {
      const y = top + i * rowH;
      const bh = Math.min(22, rowH - 10);
      g.append('text').attr('x', labW - 10).attr('y', y + rowH / 2 + 4).attr('text-anchor', 'end').attr('class', 'vz-lab' + (r[o.label] === o.emph ? ' is-emph' : '')).text(r[o.label]);
      let acc = 0;
      o.parts.forEach((p, j) => {
        const v = Math.max(0, VZ.num(r[p.field]) || 0);
        const xa = x(acc), xb = x(acc + v);
        const w = Math.max(0, xb - xa - (j < o.parts.length - 1 ? 2 : 0));
        g.append('rect').attr('x', xa).attr('y', y + (rowH - bh) / 2).attr('width', w).attr('height', bh).attr('rx', 2).style('fill', p.color).style('opacity', p.opacity ?? 1);
        acc += v;
      });
      g.append('text').attr('x', x(acc) + 6).attr('y', y + rowH / 2 + 4).attr('class', 'vz-val').text(VZ.f1(acc) + (o.unit || ''));
      g.append('rect').attr('x', labW).attr('y', y).attr('width', W - labW).attr('height', rowH).attr('fill', 'transparent')
        .on('pointermove', (ev) => tip.show(ev, r[o.label], o.parts.map((p) => [p.color, p.name, VZ.f1(VZ.num(r[p.field])) + (o.unit || '')]).concat([[null, o.totalName || '합계', VZ.f1(acc) + (o.unit || '')]])))
        .on('pointerleave', () => tip.hide());
    });
  };

  // 끝 라벨을 겹치지 않게 아래로 민다
  const endLabels = (g, ends, xEnd) => {
    ends.sort((a, b) => a.ty - b.ty);
    for (let i = 1; i < ends.length; i++) if (ends[i].ty - ends[i - 1].ty < 13) ends[i].ty = ends[i - 1].ty + 13;
    ends.forEach((e) => {
      const ex = xEnd(e);
      if (Math.abs(e.ty - e.y0) > 2) g.append('line').attr('x1', ex + 3).attr('x2', ex + 8).attr('y1', e.y0).attr('y2', e.ty - 4).attr('class', 'vz-leader');
      g.append('text').attr('x', ex + 10).attr('y', e.ty + 4).attr('class', 'vz-end' + (e.emph ? ' is-emph' : '')).text(e.text);
    });
  };

  // ── 선 그래프(날짜 x): 끝 라벨 직접 표시, 십자선 툴팁 ──
  VZ.lines = (el, rows, o) => {
    const W = Math.max(300, el.clientWidth || 640);
    const unit = o.unit ?? '%';
    const H = o.height || 280, top = 16, bottom = 28;
    const svg = VZ.svg(el, W, H);
    const series = o.series.map((s) => ({ ...s, pts: rows.filter((r) => r[o.seriesKey] === s.key).map((r) => ({ x: new Date(r[o.x] + 'T00:00:00'), y: VZ.num(r[o.y]) })).filter((p) => Number.isFinite(p.y)).sort((a, b) => a.x - b.x) }));
    const ys = series.flatMap((s) => s.pts.map((p) => p.y));
    const y = d3.scaleLinear().domain([Math.floor((d3.min(ys) - 2) / 5) * 5, Math.ceil((d3.max(ys) + 2) / 5) * 5]).range([H - bottom, top]);
    const vf = (v) => (o.signed ? VZ.signed(v) : VZ.f1(v));
    const endW = d3.max(series, (s) => VZ.textW(svg, `${s.name} ${vf(s.pts.length ? s.pts[s.pts.length - 1].y : 0)}`, 'vz-end')) + 14;
    const L = d3.max(y.ticks(5), (t) => VZ.textW(svg, (t < 0 ? '−' + Math.abs(t) : t) + unit)) + 10;
    const xs = series.flatMap((s) => s.pts.map((p) => p.x));
    const x = d3.scaleUtc().domain(d3.extent(xs)).range([L, W - endW]);
    const g = svg.append('g');
    (o.bands || []).forEach((b) => {
      const c = new Date(b.at + 'T00:00:00');
      const half = (x(d3.utcDay.offset(c, 1)) - x(c)) / 2;
      g.append('rect').attr('x', x(c) - half).attr('y', top).attr('width', Math.max(2, 2 * half)).attr('height', H - bottom - top).attr('class', 'vz-band');
      const bw = VZ.textW(svg, b.label);
      const anchor = x(c) + bw / 2 > W - endW ? 'end' : x(c) - bw / 2 < L ? 'start' : 'middle';
      g.append('text').attr('x', x(c)).attr('y', top - 4).attr('text-anchor', anchor).attr('class', 'vz-tick').text(b.label);
    });
    y.ticks(5).forEach((t) => {
      g.append('line').attr('x1', L).attr('x2', W - endW).attr('y1', y(t)).attr('y2', y(t)).attr('class', t === 0 ? 'vz-axis' : 'vz-grid');
      g.append('text').attr('x', L - 6).attr('y', y(t) + 4).attr('text-anchor', 'end').attr('class', 'vz-tick').text((t < 0 ? '−' + Math.abs(t) : t) + unit);
    });
    const kst = (d) => new Date(+d + 9 * 3600e3);
    const dates = Array.from(new Set(xs.map((d) => +d))).sort((a, b) => a - b).map((d) => new Date(d));
    const lw = VZ.textW(svg, '10/00') + 14;
    const every = Math.max(1, Math.ceil(dates.length / Math.max(2, Math.floor((W - L - endW) / lw))));
    dates.forEach((d, i) => {
      if (i % every) return;
      g.append('text').attr('x', x(d)).attr('y', H - bottom + 18).attr('text-anchor', 'middle').attr('class', 'vz-tick').text(d3.utcFormat('%-m/%-d')(kst(d)));
    });
    const line = d3.line().x((p) => x(p.x)).y((p) => y(p.y));
    series.slice().sort((a, b) => (a.emph ? 1 : 0) - (b.emph ? 1 : 0)).forEach((s) => {
      g.append('path').attr('d', line(s.pts)).attr('class', 'vz-line').style('stroke', s.color).style('stroke-width', s.emph ? 2.5 : 2).style('stroke-dasharray', s.dash || null);
      s.pts.forEach((p) => g.append('circle').attr('cx', x(p.x)).attr('cy', y(p.y)).attr('r', 3).style('fill', s.color));
    });
    endLabels(g, series.filter((s) => s.pts.length).map((s) => { const p = s.pts[s.pts.length - 1]; return { y0: y(p.y), ty: y(p.y), x: p.x, emph: s.emph, text: `${s.name} ${vf(p.y)}` }; }), (e) => x(e.x));
    const tip = VZ.tip(el);
    const rule = g.append('line').attr('class', 'vz-rule').attr('y1', top).attr('y2', H - bottom).style('opacity', 0);
    const headFmt = o.headFmt || ((dd) => d3.utcFormat('%-m/%-d')(kst(dd)) + ' 주');
    svg.append('rect').attr('x', L).attr('y', top).attr('width', Math.max(1, W - endW - L)).attr('height', H - bottom - top).attr('fill', 'transparent')
      .on('pointermove', (ev) => {
        const [mx] = d3.pointer(ev);
        const d = dates.reduce((b, c) => (Math.abs(x(c) - mx) < Math.abs(x(b) - mx) ? c : b), dates[0]);
        rule.attr('x1', x(d)).attr('x2', x(d)).style('opacity', 1);
        tip.show(ev, headFmt(d), series.map((s) => { const p = s.pts.find((q) => +q.x === +d); return [s.color, s.name, p ? vf(p.y) + unit : '—']; }));
      })
      .on('pointerleave', () => { rule.style('opacity', 0); tip.hide(); });
  };

  // ── 선 그래프(숫자 x): 누적 곡선 같은 것, 기준선(refX) 선택 ──
  VZ.xlines = (el, rows, o) => {
    const W = Math.max(300, el.clientWidth || 640);
    const unit = o.unit ?? '%';
    const H = o.height || 260, top = 18, bottom = 40;
    const svg = VZ.svg(el, W, H);
    const series = o.series.map((s) => ({ ...s, pts: rows.filter((r) => r[o.seriesKey] === s.key).map((r) => ({ x: VZ.num(r[o.x]), y: VZ.num(r[s.field || o.y]) })).filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y)).sort((a, b) => a.x - b.x) }));
    const yMax = o.yMax || 100;
    const y = d3.scaleLinear().domain([0, yMax]).range([H - bottom, top]);
    const endW = d3.max(series, (s) => VZ.textW(svg, `${s.name} ${VZ.f1(s.pts.length ? s.pts[s.pts.length - 1].y : 0)}`, 'vz-end')) + 14;
    const L = VZ.textW(svg, yMax + unit) + 10;
    const xs = series.flatMap((s) => s.pts.map((p) => p.x));
    const x = d3.scaleLinear().domain([o.xMin ?? 0, d3.max(xs)]).range([L, W - endW]);
    const g = svg.append('g');
    y.ticks(5).forEach((t) => {
      g.append('line').attr('x1', L).attr('x2', W - endW).attr('y1', y(t)).attr('y2', y(t)).attr('class', t === 0 ? 'vz-axis' : 'vz-grid');
      g.append('text').attr('x', L - 6).attr('y', y(t) + 4).attr('text-anchor', 'end').attr('class', 'vz-tick').text(t + unit);
    });
    let right = -Infinity;
    (o.xTicks || x.ticks(6)).forEach((t) => {
      const s = o.xFmt ? o.xFmt(t) : String(t);
      const w = VZ.textW(svg, s);
      if (x(t) - w / 2 < right + 8) return;
      g.append('text').attr('x', x(t)).attr('y', H - bottom + 17).attr('text-anchor', 'middle').attr('class', 'vz-tick').text(s);
      right = x(t) + w / 2;
    });
    if (o.xTitle) g.append('text').attr('x', W - endW).attr('y', H - 4).attr('text-anchor', 'end').attr('class', 'vz-tick').text(o.xTitle);
    (o.refX || []).forEach((rf) => {
      g.append('line').attr('x1', x(rf.x)).attr('x2', x(rf.x)).attr('y1', top).attr('y2', H - bottom).attr('class', 'vz-ref');
      g.append('text').attr('x', x(rf.x) + 4).attr('y', top + 10).attr('class', 'vz-tick').text(rf.label);
    });
    const line = d3.line().x((p) => x(p.x)).y((p) => y(p.y));
    series.slice().sort((a, b) => (a.emph ? 1 : 0) - (b.emph ? 1 : 0)).forEach((s) => {
      g.append('path').attr('d', line(s.pts)).attr('class', 'vz-line').style('stroke', s.color).style('stroke-width', s.emph ? 2.5 : 2).style('stroke-dasharray', s.dash || null);
    });
    endLabels(g, series.filter((s) => s.pts.length).map((s) => { const p = s.pts[s.pts.length - 1]; return { y0: y(p.y), ty: y(p.y), x: p.x, emph: s.emph, text: `${s.name} ${VZ.f1(p.y)}` }; }), (e) => x(e.x));
    const tip = VZ.tip(el);
    const rule = g.append('line').attr('class', 'vz-rule').attr('y1', top).attr('y2', H - bottom).style('opacity', 0);
    const ux = Array.from(new Set(xs)).sort((a, b) => a - b);
    svg.append('rect').attr('x', L).attr('y', top).attr('width', Math.max(1, W - endW - L)).attr('height', H - bottom - top).attr('fill', 'transparent')
      .on('pointermove', (ev) => {
        const [mx] = d3.pointer(ev);
        const v = x.invert(mx);
        const xv = ux.reduce((b, c) => (Math.abs(c - v) < Math.abs(b - v) ? c : b), ux[0]);
        rule.attr('x1', x(xv)).attr('x2', x(xv)).style('opacity', 1);
        tip.show(ev, o.headFmt ? o.headFmt(xv) : String(xv), series.map((s) => { const p = s.pts.find((q) => q.x === xv); return [s.color, s.name, p ? VZ.f1(p.y) + unit : '—']; }));
      })
      .on('pointerleave', () => { rule.style('opacity', 0); tip.hide(); });
  };

  // ── 세로 막대(구간·항목별), 계열 여럿이면 묶음 ──
  VZ.columns = (el, rows, o) => {
    const W = Math.max(300, el.clientWidth || 640);
    const unit = o.unit ?? '%';
    const H0 = o.height || 240, bottom = 44;
    const svg = VZ.svg(el, W, H0);
    const cats = o.cats || Array.from(new Set(rows.map((r) => r[o.x])));
    const ser = o.series;
    const g = svg.append('g');
    const vmax = d3.max(rows, (r) => d3.max(ser, (s) => VZ.num(r[s.field]))) || 1;
    const L = VZ.textW(svg, d3.format('d')(Math.ceil(vmax * 1.12)) + unit) + 12;
    const top = (ser.length > 1 ? VZ.legend(g, svg, L, W - 8, ser.map((s) => ({ name: s.name, color: s.color, opacity: s.opacity }))) : 4) + 12;
    const H = H0 + top;
    svg.attr('viewBox', `0 0 ${W} ${H}`);
    const x0 = d3.scaleBand().domain(cats).range([L, W - 8]).paddingInner(0.22).paddingOuter(0.08);
    const x1 = d3.scaleBand().domain(ser.map((s) => s.field)).range([0, x0.bandwidth()]).padding(0.08);
    const y = d3.scaleLinear().domain([0, vmax * 1.12]).range([H - bottom, top]).nice();
    y.ticks(4).forEach((t) => {
      g.append('line').attr('x1', L).attr('x2', W - 8).attr('y1', y(t)).attr('y2', y(t)).attr('class', t === 0 ? 'vz-axis' : 'vz-grid');
      g.append('text').attr('x', L - 6).attr('y', y(t) + 4).attr('text-anchor', 'end').attr('class', 'vz-tick').text(d3.format('d')(t) + unit);
    });
    // 구간 이름: 칸보다 길면 두 줄로 나눈다
    const bw0 = x0.bandwidth() + x0.step() * x0.paddingInner();
    cats.forEach((c) => {
      const t = g.append('text').attr('x', x0(c) + x0.bandwidth() / 2).attr('y', H - bottom + 16).attr('text-anchor', 'middle').attr('class', 'vz-tick');
      const s = String(c);
      if (VZ.textW(svg, s) > bw0 - 4 && s.includes(' ')) {
        const parts = s.split(' ');
        const mid = Math.ceil(parts.length / 2);
        t.append('tspan').attr('x', x0(c) + x0.bandwidth() / 2).text(parts.slice(0, mid).join(' '));
        t.append('tspan').attr('x', x0(c) + x0.bandwidth() / 2).attr('dy', 13).text(parts.slice(mid).join(' '));
      } else t.text(s);
    });
    const tip = VZ.tip(el);
    cats.forEach((c) => {
      const r = rows.find((q) => q[o.x] === c);
      if (!r) return;
      ser.forEach((s) => {
        const v = VZ.num(r[s.field]);
        if (!Number.isFinite(v) || (o.skip && o.skip(r, s))) return;
        const bw = Math.min(28, x1.bandwidth());
        const bx = x0(c) + x1(s.field) + (x1.bandwidth() - bw) / 2;
        g.append('rect').attr('x', bx).attr('y', y(v)).attr('width', bw).attr('height', Math.max(0, y(0) - y(v))).attr('rx', 3).style('fill', s.color).style('opacity', s.opacity ?? 1);
        if (o.labels && (o.labels === true || o.labels(r, s))) g.append('text').attr('x', bx + bw / 2).attr('y', y(v) - 5).attr('text-anchor', 'middle').attr('class', 'vz-val').text(VZ.f1(v));
      });
      g.append('rect').attr('x', x0(c)).attr('y', top).attr('width', x0.bandwidth()).attr('height', H - bottom - top).attr('fill', 'transparent')
        .on('pointermove', (ev) => tip.show(ev, (o.headPrefix || '') + c, ser.map((s) => [s.color, s.name, (o.skip && o.skip(r, s)) ? '표본 적음' : VZ.f1(VZ.num(r[s.field])) + unit]).concat(o.extra ? o.extra(r) : [])))
        .on('pointerleave', () => tip.hide());
    });
  };

  // ── 표: tbody 하나를 행 데이터로 채운다(셀에는 글자만, 행 키는 tr의 data-key) ──
  VZ.tbody = (tb, rows, cols, key) => {
    tb.replaceChildren();
    rows.forEach((r) => {
      const tr = document.createElement('tr');
      if (key) tr.dataset.key = key(r);
      cols.forEach((c) => {
        const td = document.createElement('td');
        const v = r[c.field];
        td.textContent = c.fmt ? c.fmt(v, r) : (v === null || v === undefined || v === '' ? '—' : String(v));
        if (c.num) td.className = 'is-num';
        tr.append(td);
      });
      tb.append(tr);
    });
  };

  window.VZ = VZ;
})();
