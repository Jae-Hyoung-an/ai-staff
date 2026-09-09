/* ================= 공통 빌더 =================
   컴포넌트 모양은 QA2 인트라를 따른다 — 카드가 없고, 섹션은 파란 제목과
   가로선으로 나뉘다. 입력은 밑줄, 버튼은 알약, 액션은 하단 바에 모인다. */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ---------- 주석 마커 (목업 전용) ---------- */
const mk = n => `<span class="mk" data-goto="${n}">${n}</span>`;
const note = n => ` data-mk="${n}"`;

/* ---------- 페이지 머리 ---------- */
function head(o){
  return `<div class="phead"><h1>${esc(o.h)}</h1><p>${o.p}</p><div class="owner">• 담당 ${esc(o.owner)} | 메인 검토 ${esc(o.review)}</div></div>`;
}

/* ---------- 탭 ---------- */
function tabs(list, cur){
  return `<div class="tabs">${list.map(t=>`<button class="tab"${t===cur?' aria-selected="true"':""}>${esc(t)}</button>`).join("")}</div>`;
}

/* ---------- 필드 한 줄 (모달 등에서 쓰는 맨몸) ---------- */
function fieldrow(list){
  return `<div class="filters">${list.map(f=>{
    const cls = f.sel ? "ctl sel" : "ctl";
    const ph = f.v ? "" : " ph";
    return `<div class="f"${f.mk?note(f.mk):""}><label>${esc(f.l)}${f.mk?mk(f.mk):""}</label><div class="${cls}${ph}">${esc(f.v||f.p||"전체")}</div></div>`;
  }).join("")}</div>`;
}
/* ---------- 검색 조건 블록 (목록 화면) ---------- */
function srch(list){
  return `<div class="srch"><div class="lb">검색 조건</div>${fieldrow(list)}<button class="go">🔍</button></div>`;
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

/* ---------- 섹션 ---------- */
function sechdr(o){
  if(!o.title) return "";
  return `<header><h3${o.mk?note(o.mk):""}>${esc(o.title)}${o.mk?mk(o.mk):""}</h3>${
    o.tag?`<span class="pill ${o.tagk||"mute"}">${esc(o.tag)}</span>`:""}${
    o.right?`<div class="spacer"></div>${o.right}`:""}</header>`;
}
function card(o, body){   /* 본문에 여백을 주는 섹션 */
  return `<section class="sec ${o.axis||""}">${sechdr(o)}<div class="body">${body}</div>${
    o.actions?bar(o.actions):""}</section>`;
}
function plain(o, body){  /* 표를 바로 붙이는 섹션 */
  return `<section class="sec ${o.axis||""}">${sechdr(o)}${body}${o.actions?bar(o.actions):""}</section>`;
}

/* ---------- 폼 (밑줄 입력) ---------- */
function form(rows){
  return `<dl>${rows.map(r=>`<div class="frow"${r.mk?note(r.mk):""}><dt>${esc(r.l)}${r.req?'<span class="req">•</span>':""}${r.mk?mk(r.mk):""}</dt><dd>${
    r.html||`<div class="field${r.ro?" ro":""}${r.v?"":" ph"}">${esc(r.v||r.p||"")}</div>`}${
    r.hint?`<div class="hint${r.g?" g":""}">${r.hint}</div>`:""}</dd></div>`).join("")}</dl>`;
}

/* ---------- 배너 ---------- */
function banner(kind, key, html){
  return `<div class="banner ${kind}"><span class="k">${esc(key)}</span><div>${html}</div></div>`;
}

/* ---------- 하단 바 ---------- */
function bar(actions){    /* 상세 화면 — 오른쪽 정렬 액션 */
  return `<div class="actions">${actions.map(a=>`<button class="btn${a.pri?" pri":""}${a.off?" off":""}">${esc(a.t)}</button>`).join("")}</div>`;
}
function listbar(addLabel, total){  /* 목록 화면 — 등록 · 페이지 · 총 N건 */
  return `<div class="pagebar"><button class="btn pri">＋ ${esc(addLabel)}</button>
    <div class="pg"><span>«</span><span>‹</span><b>1</b><span>›</span><span>»</span></div>
    <span class="total">${esc(total)}</span></div>`;
}

/* ---------- 자주 쓰는 조각 ---------- */
const P = {ok:'<span class="pill ok">활성</span>', off:'<span class="pill mute">미활성</span>'};
const NEW = '<span class="pill new">신규</span>';
const CHG = '<span class="pill warn">변경</span>';
const DEL = '<span class="pill stop">삭제</span>';
const EMPTY = '<span class="dash hot">-</span>';
const ext = t => `<span class="lnk">${esc(t)} <span class="ext">↗</span></span>`;
const state = t => `<div class="statemsg">${t}</div>`;

/* ---------- 모달 ---------- */
function modal(o, body){
  return `<div class="modalstage">
    <div class="modalcard">
      <header><h3${o.mk?note(o.mk):""}>${esc(o.title)}${o.mk?mk(o.mk):""}</h3>${
        o.tag?`<span class="pill ${o.tagk||"new"}">${esc(o.tag)}</span>`:""}<div class="spacer"></div><span class="xbtn">✕</span></header>
      <div class="modalbody">${body}</div>
      ${bar(o.actions||[])}
    </div>
  </div>`;
}

/* ================= 화면 등록소 ================= */
const S = {};
