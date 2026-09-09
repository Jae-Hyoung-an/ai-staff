/* ================= 공통 볓더 =================
   v1.5 목업(p01·p02)의 볓더를 그대로 옜겼 다. 서식이 바뀌면 여기만 고최다. */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ---------- 주석 마커 ---------- */
const mk = n => `<span class="mk" data-goto="${n}">${n}</span>`;
const note = n => ` data-mk="${n}"`;

/* ---------- 필터 바 ---------- */
function filters(list, actions){
  return `<div class="filters">${list.map(f=>{
    const cls = f.sel ? "ctl sel" : "ctl";
    const ph = f.v ? "" : " ph";
    return `<div class="f"${f.mk?note(f.mk):""}><label>${esc(f.l)}${f.mk?mk(f.mk):""}</label><div class="${cls}${ph}">${esc(f.v||f.p||"전쉬")}</div></div>`;
  }).join("")}<div class="f"><label>&nbsp;</label><div style="display:flex;gap:7px">${(actions||[]).map(a=>`<button class="btn${a.pri?" pri":""}">${esc(a.t)}</button>`).join("")}</div></div></div>`;
}

/* ---------- 요약 칩 ---------- */
function chips(list){
  return `<div class="chips">${list.map(c=>`<span class="chip ${c.k||""}"${c.mk?note(c.mk):""}>${esc(c.t)} <b class="n">${esc(c.n)}</b>${c.mk?mk(c.mk):""}</span>`).join("")}</div>`;
}

/* ---------- 표 ---------- */
function tbl(cols, rows){
  return `<div class="tblwrap"><table><thead><tr>${cols.map(c=>`<th${c.mk?note(c.mk):""} ${c.num?'style="text-align:right"':""}>${esc(c.t)}${c.mk?mk(c.mk):""}</th>`).join("")}</tr></thead><tbody>${
    rows.map(r=>`<tr>${r.map((cell,i)=>`<td class="${cols[i].num?"num":""}${cols[i].mono?" mono":""}">${cell}</td>`).join("")}</tr>`).join("")
  }</tbody></table></div>`;
}

/* ---------- 카드 ---------- */
function card(o, body){
  const hdr = o.title ? `<header><h3${o.mk?note(o.mk):""}>${esc(o.title)}${o.mk?mk(o.mk):""}</h3>${o.tag?`<span class="pill ${o.tagk||"mute"}">${esc(o.tag)}</span>`:""}${o.right?`<div class="spacer"></div>${o.right}`:""}</header>`:"";
  return `<section class="card ${o.axis||""}">${hdr}<div class="body">${body}</div>${o.actions?`<div class="actions">${o.actions.map(a=>`<button class="btn${a.pri?" pri":""}">${esc(a.t)}</button>`).join("")}</div>`:""}</section>`;
}
function plain(o, body){ /* 본문 패딩 없는 카드 — 표를 바로 넣을 때 */
  const hdr = o.title ? `<header><h3${o.mk?note(o.mk):""}>${esc(o.title)}${o.mk?mk(o.mk):""}</h3>${o.tag?`<span class="pill ${o.tagk||"mute"}">${esc(o.tag)}</span>`:""}${o.right?`<div class="spacer"></div>${o.right}`:""}</header>`:"";
  return `<section class="card ${o.axis||""}">${hdr}${body}${o.actions?`<div class="actions">${o.actions.map(a=>`<button class="btn${a.pri?" pri":""}">${esc(a.t)}</button>`).join("")}</div>`:""}</section>`;
}

/* ---------- 폼 ---------- */
function form(rows){
  return `<dl>${rows.map(r=>`<div class="frow"${r.mk?note(r.mk):""}><dt>${esc(r.l)}${r.req?'<span class="req">*</span>':""}${r.mk?mk(r.mk):""}</dt><dd>${r.html||`<div class="field${r.ro?" ro":""}${r.v?"":" ph"}">${esc(r.v||r.p||"")}</div>`}${r.hint?`<div class="hint${r.g?" g":""}">${r.hint}</div>`:""}</dd></div>`).join("")}</dl>`;
}

/* ---------- 배너 · 페이지 헤드 ---------- */
function banner(kind, key, html){
  return `<div class="banner ${kind}"><span class="k">${esc(key)}</span><div>${html}</div></div>`;
}
function head(o){
  return `<div class="phead"><h1>${esc(o.h)}</h1><p>${o.p}</p><div class="owner">담당 ${esc(o.owner)} · 검토 ${esc(o.review)}</div></div>`;
}

/* ---------- 자주 쓰는 조겁 ---------- */
const P = {ok:'<span class="pill ok">활성</span>', off:'<span class="pill mute">미활성</span>'};
const NEW = '<span class="pill new">신규</span>';
const CHG = '<span class="pill warn">변경</span>';
const DEL = '<span class="pill stop">삭제</span>';
const EMPTY = '<span class="dash hot">-</span>';
/* 새 탭으로 여는 링크 (영업 존 요금제 상세 등) */
const ext = t => `<span class="lnk">${esc(t)} <span class="ext">↗</span></span>`;
/* 지점 미선택 등 화면 상태 문구 */
const state = t => `<div class="statemsg">${t}</div>`;

/* ---------- 모달 ---------- */
function modal(o, body){
  return `<div class="modalstage">
    <div class="modalcard">
      <header><h3${o.mk?note(o.mk):""}>${esc(o.title)}${o.mk?mk(o.mk):""}</h3>${o.tag?`<span class="pill ${o.tagk||"new"}">${esc(o.tag)}</span>`:""}<div class="spacer"></div><span class="xbtn">✕</span></header>
      <div class="modalbody">${body}</div>
      <div class="actions">${(o.actions||[]).map(a=>`<button class="btn${a.pri?" pri":""}">${esc(a.t)}</button>`).join("")}</div>
    </div>
  </div>`;
}

/* ================= 화면 등록소 ================= */
const S = {};
