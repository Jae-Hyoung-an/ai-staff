/* ================= 메뉴 · 라우터 · 주석 패널 =================
   설정은 config.js(CONFIG), 화면은 screens/*.js(S)에 있다. 목업마다 이 파일은 고치지 않는다.
   맨 마지막에 불러온다 — CONFIG · 빌더 · 화면이 모두 있어야 한다.
   ?s=키 로 화면을 바로 연다(캡처 · PRD 링크용). ?notes=off 로 주석 패널을 끈다.
   화면을 옮길 때마다 주소의 ?s= 를 바꿔 둔다 — 지금 주소를 그대로 PRD에 붙이면 된다. */

/* ---------- 메뉴 표 ---------- */
const ALL = [];                        /* 메뉴 전부 (그룹 순서) */
const MENU = {};                       /* 메뉴 키 → 메뉴 정의 */
const ROOT = {};                       /* 화면 키 → 메뉴 키 */
CONFIG.menus.forEach(g => g.items.forEach(m => {
  m.grp = g.grp; ALL.push(m); MENU[m.key] = m;
  m.screens.forEach(k => ROOT[k] = m.key);
}));

/* ---------- 목업 점검 — 어긋나면 콘솔에 [목업 점검] 경고를 남긴다 ---------- */
const AUDIT = [];
function warn(msg){ AUDIT.push(msg); console.warn("[목업 점검] " + msg); }
(function audit(){
  const sids = {};
  ALL.forEach(m => m.screens.forEach(k => {
    const s = S[k];
    if(!s){ warn(`메뉴 「${m.t}」의 화면 키 ${k} 가 S 에 없다 — 화면 파일이 빠졌거나 잘렸다`); return; }
    if(s.menu !== m.t) warn(`${k}: menu 「${s.menu}」가 메뉴 이름 「${m.t}」와 다르다`);
    if(s.grp !== m.grp) warn(`${k}: grp 「${s.grp}」가 그룹 이름 「${m.grp}」와 다르다`);
    if(s.doc !== m.doc) warn(`${k}: doc ${s.doc} 가 메뉴의 doc ${m.doc} 와 다르다`);
  }));
  Object.entries(S).forEach(([k, s]) => {
    if(!ROOT[k]) warn(`S.${k} 가 어느 메뉴의 screens 에도 없다 — ?s=${k} 로만 열린다`);
    if(!/^SCR_[A-Z0-9]+_\d{3}$/.test(s.sid || "")) warn(`${k}: sid 「${s.sid}」가 SCR_XXX_000 형식이 아니다`);
    if(sids[s.sid]) warn(`${k}: sid ${s.sid} 를 ${sids[s.sid]} 도 쓴다`); else sids[s.sid] = k;
    if(typeof s.render !== "function") warn(`${k}: render() 가 없다`);
    (s.notes || []).forEach((n, i) => { if(!n.r) warn(`${k}: 주석 ${i+1}번에 근거(r)가 없다`); });
  });
})();

/* ---------- 껍데기 채우기 ---------- */
if(CONFIG.title) document.title = CONFIG.title;
$("#brand").innerHTML = `<span class="v">${esc(CONFIG.brand[0])}</span><span class="i">${esc(CONFIG.brand[1])}</span><span class="star">★ 0</span>`;
$("#me").innerHTML = `<div class="who">${esc(CONFIG.author)}</div><div class="id">목업 계정 <button class="out">로그아웃</button></div>`;
$("#navgroups").innerHTML = CONFIG.menus.map(g => `<div class="navgrp"><h4>${esc(g.grp)} <span class="cv">⌄</span></h4>${
  g.items.map(m => `<button class="navitem" data-go="${esc(m.key)}"><span class="axis ${m.a||""}"></span>${esc(m.t)}${
    m.screens.length ? "" : '<span class="soon">예정</span>'}</button>`).join("")}</div>`).join("");
$("#links").innerHTML = [CONFIG.prev, CONFIG.home].filter(Boolean)
  .map(l => `<a class="btn sm" href="${esc(l.href)}">${esc(l.t)}</a>`).join("");
const DONE = ALL.filter(m => m.screens.length).map(m => `${m.doc} ${m.t}`);
$("#draft").innerHTML = `DRAFT ${esc(CONFIG.draft)} · ${esc(CONFIG.version)}<br>${
  DONE.reduce((a, t, i) => (i % 3 ? a[a.length-1].push(t) : a.push([t]), a), []).map(l => esc(l.join(" · "))).join("<br>")
}<br>서식 기준 ${esc(CONFIG.baseEnv)}<br>화면 목업 · 실제 동작 아님`;

/* ---------- 아직 화면이 없는 메뉴 ---------- */
function todoScreen(m){
  return head({h:m.t, p:`이 메뉴의 화면은 아직 만들지 않았다. <b>${esc(m.doc)}번 페이지</b>가 완료되면 여기에 덧붙인다.`, owner:"—", review:"—"})
    + card({title:"작성 예정"}, hint(`목업은 <b>PRD 메뉴 페이지가 완료될 때마다 한 메뉴씩</b> 덧붙인다. 현재 반영된 것은 <b>${esc(DONE.join(" · ") || "없음")}</b>이다.`));
}

/* ---------- 화면 전환 ---------- */
let cur = null;
const checked = new Set();
function go(key){
  const menu = !S[key] && MENU[key];      /* 화면 키를 먼저 찾고, 없으면 메뉴 키로 본다 */
  if(menu && !menu.screens.length) return showTodo(menu);
  if(menu) key = menu.screens[0];         /* 메뉴를 누르면 첫 화면으로 */
  const s = S[key];
  if(!s){ warn(`열 수 없는 키: ${key}`); return false; }
  cur = key;
  let html, failed = false;
  try { html = s.render(); }
  catch(e){ failed = true; console.error(e); warn(`${key}: render() 오류 — ${e.message}`); html = banner("stop", "렌더 오류", esc(`${key}: ${e.message}`)); }
  $("#canvas").innerHTML = html;
  crumb(s.grp, s.menu, s.sid, s.axis);
  markNav(ROOT[key]);
  switcher(key);
  renderNotes(s);
  if(!failed && !checked.has(key)){ checked.add(key); checkMarks(key, s); }
  syncURL();
  window.scrollTo({top:0, behavior:"instant"});
  return true;
}
function showTodo(m){
  cur = m.key;
  $("#canvas").innerHTML = todoScreen(m);
  crumb(m.grp, m.t, "—", m.a);
  markNav(m.key);
  $("#panel").innerHTML = `<h2>이 화면의 변경점</h2><p class="lede">아직 작성하지 않았다.</p>`;
  syncURL();
  window.scrollTo({top:0, behavior:"instant"});
  return true;
}
function crumb(grp, menu, sid, axis){
  $("#cb-grp").textContent = grp;
  $("#cb-menu").innerHTML = `<span class="axis ${axis||""}"></span>${esc(menu)}`;
  $("#cb-sid").textContent = sid;
}
function markNav(rootKey){
  document.querySelectorAll(".navitem").forEach(b => b.setAttribute("aria-current", b.dataset.go === rootKey ? "true" : "false"));
}
/* 메뉴에 화면이 2개 이상이면 페이지 머리 아래에 화면 전환기를 끼운다 (목업 전용) */
function switcher(key){
  const m = MENU[ROOT[key]];
  if(!m || m.screens.length < 2) return;
  const b = document.createElement("div");
  b.className = "switcher";
  b.innerHTML = m.screens.filter(k => S[k]).map(k =>
    `<button class="btn sm${k===key?" on":""}" data-go="${esc(k)}"><span class="sid">${esc(S[k].sid)}</span>${esc(S[k].scr)}</button>`).join("");
  const ph = $("#canvas").querySelector(".phead");
  if(ph) ph.after(b); else $("#canvas").prepend(b);
}

/* ---------- 주석 패널 ---------- */
function renderNotes(s){
  const ns = s.notes || [];
  $("#panel").innerHTML = `<h2>이 화면의 변경점</h2>
    <p class="lede">${esc(s.menu)} · <b>${esc(s.sid)}</b> ${esc(s.scr)} · 근거 ${esc(CONFIG.prd)} <b>${esc(s.doc)}번</b>. 점선으로 표시된 요소가 아래 번호와 연결된다.</p>
    <div class="legend">${pill("신규","new")}${pill("변경","warn")}${pill("삭제","stop")}${pill("그대로","mute")}</div>
    ${ns.length ? ns.map((n, i) => `<div class="note" id="note-${i+1}"><div class="n">${i+1}</div><div><h5>${esc(n.t)}</h5><p>${n.d}</p><span class="ref">${esc(n.r || "근거 없음")}</span></div></div>`).join("")
      : '<p class="lede">주석이 없다.</p>'}`;
}
/* 주석 n번마다 화면에 mk(n) 마커가 하나 있어야 한다 */
function checkMarks(key, s){
  const used = new Set([...document.querySelectorAll("#canvas [data-goto]")].map(e => +e.dataset.goto));
  const n = (s.notes || []).length;
  for(let i = 1; i <= n; i++) if(!used.has(i)) warn(`${key}: 주석 ${i}번에 화면 마커 mk(${i})가 없다`);
  used.forEach(i => { if(i < 1 || i > n) warn(`${key}: 마커 mk(${i})에 맞는 주석이 없다 (주석 ${n}개)`); });
}
function toggleNotes(on){
  document.body.classList.toggle("notes-on", on);
  $("#notetgl").setAttribute("aria-pressed", String(on));
  if(cur) syncURL();
}

/* ---------- 주소 동기화 — ?s= 와 ?notes=off 를 지금 상태로 ---------- */
function syncURL(){
  try {
    const u = new URL(location.href);
    u.searchParams.set("s", cur);
    if(document.body.classList.contains("notes-on")) u.searchParams.delete("notes"); else u.searchParams.set("notes", "off");
    history.replaceState(null, "", u.toString());
  } catch(e){ /* 주소를 바꿀 수 없는 환경(일부 file://)에서는 넘어간다 */ }
}

/* ---------- 클릭 위임 ---------- */
document.addEventListener("click", e => {
  const m = e.target.closest("[data-goto]");      /* 번호 배지 — 주석으로 */
  if(m){
    if(!document.body.classList.contains("notes-on")) toggleNotes(true);
    const el = document.getElementById("note-" + m.dataset.goto);
    if(el){
      el.scrollIntoView({block:"center", behavior:"smooth"});
      el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
    }
    return;
  }
  const g = e.target.closest("[data-go]");        /* 메뉴 · 링크 · 버튼 — 화면으로 */
  if(g) go(g.dataset.go);
});
$("#notetgl").addEventListener("click", () => toggleNotes(!document.body.classList.contains("notes-on")));
$("#theme").addEventListener("click", () => {
  const r = document.documentElement;
  const now = r.getAttribute("data-theme");
  const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  r.setAttribute("data-theme", now ? (now === "dark" ? "light" : "dark") : (sysDark ? "light" : "dark"));
});

/* ---------- 시작 ---------- */
const Q = new URLSearchParams(location.search);
toggleNotes(Q.get("notes") === "off" ? false : CONFIG.notes !== false);
const want = Q.get("s");
if(want && !S[want] && !MENU[want]) warn(`?s=${want} 에 맞는 화면이 없다 — 시작 화면을 연다`);
if(!(want && (S[want] || MENU[want]) && go(want))) go(CONFIG.start);
