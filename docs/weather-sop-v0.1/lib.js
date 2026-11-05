/* ================= 공통 빌더 =================
   컴포넌트 모양은 기준 환경(인트라)을 따른다 — 카드가 없고, 섹션은 파란 제목과
   가로선으로 나뉜다. 입력은 밑줄, 버튼은 알약, 액션은 하단 바에 모인다.
   인자 규칙: 글자 인자(t · l · v · p(placeholder) · h · title · key · item)는 이스케이프한다.
             HTML 인자(html · head의 p · d · body · 표 셀 · why · state)는 그대로 넣는다.
   주석 번호: 옵션 객체는 mk:n, 위치 인자는 마지막 n 으로 받는다. n 은 notes 의 순번(1부터). */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ---------- 주석 마커 (목업 전용) ---------- */
const mk = n => `<span class="mk" data-goto="${n}">${n}</span>`;   /* 번호 배지 — 누르면 주석 패널로 */
const note = n => ` data-mk="${n}"`;                                  /* 점선 외곽선 속성 */
const noted = (n, html) => `<div class="noted"${note(n)}>${html}${mk(n)}</div>`;   /* 아무 블록에나 주석을 단다 — 배지는 오른쪽 위 */

/* ---------- 페이지 머리 ---------- */
function head(o){
  return `<div class="phead"><h1>${esc(o.h)}</h1><p>${o.p}</p><div class="owner">• 담당 ${esc(o.owner)} | 메인 검토 ${esc(o.review)}</div></div>`;
}

/* ---------- 탭 ---------- */
function tabs(list, cur, added){   /* added: 새로 생기는 탭 이름 목록 — 「신설」 배지를 단다 */
  return `<div class="tabs">${list.map(t=>`<button class="tab"${t===cur?' aria-selected="true"':""}>${esc(t)}${
    added&&added.includes(t)?'<span class="pill new">신설</span>':""}</button>`).join("")}</div>`;
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
  return `<div class="tblwrap"><table><thead><tr>${cols.map(c=>`<th${c.mk?note(c.mk):""}${c.num?' class="r"':""}>${esc(c.t)}${c.mk?mk(c.mk):""}</th>`).join("")}</tr></thead><tbody>${
    rows.map(r=>`<tr>${r.map((cell,i)=>`<td class="${cols[i]&&cols[i].num?"num":""}${cols[i]&&cols[i].mono?" mono":""}">${cell}</td>`).join("")}</tr>`).join("")
  }</tbody></table></div>`;
}

/* ---------- 섹션 ---------- */
function sechdr(o){
  if(!o.title) return "";
  return `<header><h3${o.mk?note(o.mk):""}>${esc(o.title)}${o.mk?mk(o.mk):""}</h3>${
    o.tag?`<span class="pill ${o.tagk||"mute"}">${esc(o.tag)}</span>`:""}${
    o.right?`<div class="spacer"></div>${o.right}`:""}</header>`;
}
const axcls = a => a ? ` axis-${a}` : "";   /* axis:"a"|"b" — 섹션 제목을 축 색으로 */
function card(o, body){   /* 본문에 여백을 주는 섹션 */
  return `<section class="sec${axcls(o.axis)}">${sechdr(o)}<div class="body">${body}</div>${
    o.actions?bar(o.actions):""}</section>`;
}
function plain(o, body){  /* 표를 바로 붙이는 섹션 */
  return `<section class="sec${axcls(o.axis)}">${sechdr(o)}${body}${o.actions?bar(o.actions):""}</section>`;
}

/* ---------- 폼 (밑줄 입력) ---------- */
function form(rows){   /* g:1 이면 hint 를 화면 안내문구로 그린다 — 앞머리 「» 」를 붙인다 */
  return `<dl>${rows.map(r=>`<div class="frow"${r.mk?note(r.mk):""}><dt>${esc(r.l)}${r.req?'<span class="req">•</span>':""}${r.mk?mk(r.mk):""}</dt><dd>${
    r.html||`<div class="field${r.ro?" ro":""}${r.v?"":" ph"}">${esc(r.v||r.p||"")}</div>`}${
    r.hint?`<div class="hint${r.g?" g":""}">${r.g?guidemark(r.hint):r.hint}</div>`:""}</dd></div>`).join("")}</dl>`;
}

/* ---------- 배너 ---------- */
function banner(kind, key, html){   /* kind: ok · warn · stop */
  return `<div class="banner ${kind}"><span class="k">${esc(key)}</span><div>${html}</div></div>`;
}

/* ---------- 하단 바 ---------- */
function bar(actions){    /* 상세 화면 — 오른쪽 정렬 액션. go: 누르면 열 화면 키 */
  return `<div class="actions">${actions.map(a=>`<button class="btn${a.pri?" pri":""}${a.off?" off":""}"${
    a.go?` data-go="${esc(a.go)}"`:""}>${esc(a.t)}</button>`).join("")}</div>`;
}
function listbar(addLabel, total, go){  /* 목록 화면 — 등록 · 페이지 · 총 N건 */
  return `<div class="pagebar"><button class="btn pri"${go?` data-go="${esc(go)}"`:""}>＋ ${esc(addLabel)}</button>
    <div class="pg"><span>«</span><span>‹</span><b>1</b><span>›</span><span>»</span></div>
    <span class="total">${esc(total)}</span></div>`;
}

/* ---------- 자주 쓰는 조각 ---------- */
const EMPTY = '<span class="dash hot">-</span>';                         /* 연결 없음 — 강조한 빈 값 */
const ext = t => `<span class="lnk">${esc(t)} <span class="ext">↗</span></span>`;   /* 새 탭 링크 */
const state = html => `<div class="statemsg">${html}</div>`;            /* 빈 상태 · 미선택 상태 */
const pill = (t, k) => `<span class="pill ${k||"mute"}">${esc(t)}</span>`;   /* k: ok · warn · stop · new · mute · a · b */
const kbd = t => `<span class="kbd">${esc(t)}</span>`;                  /* 화면에 그대로 찍히는 문자열 */
const strike = t => `<span class="strike">${esc(t)}</span>`;            /* 없어지는 것 */
const lnk = (t, go) => `<span class="lnk"${go?` data-go="${esc(go)}"`:""}>${esc(t)}</span>`;   /* 표 안 링크 — go: 열 화면 키 */
const toggle = (t, on) => `<span class="toggle${on?"":" off"}"><i></i>${esc(t)}</span>`;     /* 켜고 끄는 스위치 */

/* ---------- 문구 ---------- */
const guidemark = html => /^\s*»/.test(html) ? html : "» " + html;
function guide(html, n){  /* 화면 안내문구 — 실제 화면에 찍힌다. 합니다체, 앞머리 「» 」 */
  return `<div class="hint g guide"${n?note(n):""}>${guidemark(html)}${n?mk(n):""}</div>`;
}
function hint(html, n){   /* 목업 해설 — 실제 화면에는 없다. 해라체 */
  return `<div class="hint"${n?note(n):""}>${html}${n?mk(n):""}</div>`;
}
function specOut(item, why, n){   /* PRD에서 Spec-out(삭제)한 요소 — 화면에서 빼고 흔적만 남긴다 */
  return `<span class="specout"${n?note(n):""}><span class="strike">${esc(item)}</span><em>Spec-out(삭제)</em>${
    why?`<span class="why">${why}</span>`:""}${n?mk(n):""}</span>`;
}
/* 여러 단계 흐름 — 항목은 글자 또는 {t, sub:곁말, kbd:버튼 이름이면 1, on:굵게}.
   cur: 지금 단계 순번(0부터). 굵게 할 단계가 여럿이면 항목에 on:1 */
function steps(list, cur, n){
  return `<div class="steps"${n?note(n):""}>${list.map((x,i)=>{
    const o = typeof x === "string" ? {t:x} : x;
    const t = o.kbd ? kbd(o.t) : (i===cur || o.on) ? `<b>${esc(o.t)}</b>` : `<span>${esc(o.t)}</span>`;
    return t + (o.sub ? `<span class="dim">${esc(o.sub)}</span>` : "");
  }).join("<span>›</span>")}${n?mk(n):""}</div>`;
}

/* ---------- 바뀐 것을 보여주는 표 ---------- */
/* 화면 맨 아래 요약 줄. keep: 기준 화면에서 그대로인 것 · gone: 없어진 것(취소선)
   o.extra: [["액션","목록으로 · 저장"], …] — 앞에 붙는 「이름 값」 묶음(값은 HTML) */
function foot(keep, gone, o){
  o = o || {};
  const ex = (o.extra||[]).map(([k,v])=>`<span><b>${esc(k)}</b>${v?" "+v:""}</span>`).join("");
  const kp = keep && keep.length ? `<span><b>기준 화면에서 그대로</b> ${keep.map(esc).join(" · ")}</span>` : "";
  const gn = (gone||[]).map(strike).join("");
  return `<div class="foot"${o.mk?note(o.mk):""}>${ex}${kp}${gn}${o.mk?mk(o.mk):""}</div>`;
}
/* 「저장할 때 검사하는 것」 — PRD 표와 머리글을 맞춘다(# · 상황 · 화면이 하는 일).
   rows: [[상황, 화면이 하는 일], …] 번호는 자동. 번호를 정하려면 [번호, 상황, 하는 일].
   o: {title, mk, bare:1 이면 섹션 없이 표만} */
function ruleTable(rows, o){
  o = o || {};
  const t = tbl([{t:"#",mono:1},{t:"상황"},{t:"화면이 하는 일"}], rows.map((r,i)=> r.length > 2 ? r : [String(i+1), ...r]));
  return o.bare ? t : plain({title:o.title||"저장할 때 검사하는 것", mk:o.mk}, t);
}
/* 「이 화면에서 없어지는 것」 — 왼쪽은 기준 화면(취소선), 오른쪽은 바뀐 뒤.
   rows: [[없어지는 것(글자), 대신 무엇(HTML)], …]  o: {base:기준 화면 이름, to:새 메뉴 이름, title, mk} */
function goneTable(rows, o){
  o = o || {};
  return card({title:o.title||"이 화면에서 없어지는 것", mk:o.mk},
    tbl([{t:o.base?`기준 화면 (${o.base})`:"기준 화면"},{t:o.to||"이 화면"}], rows.map(([was, now])=>[strike(was), now])));
}

/* ---------- 모달 ---------- */
function modal(o, body){   /* 오버레이로 띄우지 않고 어두운 무대 위에 그린다 — 캡처하기 쉽다 */
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
