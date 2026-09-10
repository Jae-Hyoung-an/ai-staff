/* ================= 메뉴 · 라우터 =================
   메뉴 페이지가 완료될 때마다 해당 메뉴의 screens 에 화면 키를 채운다.
   비어 있는 메뉴는 「작성 예정」 자리만 보여준다. */
const MENUS = {
  "nav-mon":[
    {key:"monm", t:"오더 상세",                a:"",  doc:"12", screens:["mon"]}
  ],
  "nav-area":[
    {key:"ptn", t:"지점 관리",                a:"",  doc:"03", screens:["pt","pt2","pt3","pt4"]}
  ],
  "nav-region":[
    {key:"ez",  t:"영업존 관리",              a:"s", doc:"02", screens:["ez","ez2","ez3"]},
    {key:"prg", t:"지점 권역 관리",            a:"",  doc:"04", screens:[]}
  ],
  "nav-vendor":[
    {key:"pol", t:"벤더 배송권역 정책 관리",    a:"c", doc:"09", screens:["pol","pol2","pol3","pol4"]},
    {key:"set", t:"세트 분배 관리",            a:"c", doc:"10", screens:["set","set2","set3","set4","set5"]},
    {key:"ven", t:"벤더 관리",                a:"c", doc:"11", screens:["ven","ven2","ven3","ven4"]}
  ],
  "nav-vp":[
    {key:"vpd", t:"대시보드",                  a:"c", doc:"12", screens:["vp"]},
    {key:"vpa", t:"기사 수행 현황",             a:"c", doc:"12", screens:["vp2","vp3"]}
  ]
};

const ALL = Object.values(MENUS).flat();
const ROOT = {};                       /* 화면 키 → 메뉴 키 */
const MENU = {};                       /* 메뉴 키 → 메뉴 정의 */
ALL.forEach(m=>{ MENU[m.key]=m; m.screens.forEach(k=>ROOT[k]=m.key); });

Object.entries(MENUS).forEach(([id,items])=>{
  $("#"+id).innerHTML = items.map(m=>{
    const todo = m.screens.length ? "" : ' data-todo="1"';
    return `<button class="navitem" data-go="${m.key}"${todo}><span class="axis ${m.a}"></span>${m.t}${m.screens.length?"":'<span class="soon">예정</span>'}</button>`;
  }).join("");
});

const GRP = {"nav-mon":"관제 관리","nav-area":"지역 관리","nav-region":"권역 관리","nav-vendor":"벤더 정책 관리","nav-vp":"벤더포털"};

function todoScreen(m){
  return head({h:m.t, p:`이 메뉴의 화면은 아직 만들지 않았다. <b>${m.doc}번 페이지</b>가 완료되면 여기에 덧붙인다.`, owner:"—", review:"—"})
    + card({title:"작성 예정"}, `<div class="hint">v2.0 목업은 <b>메뉴 페이지가 완료될 때마다 한 메뉴씩</b> 덧붙인다. 현재 반영된 것은 <b>03 지점 설정 · 02 영업존 · 09 벤더 배송권역 정책 · 10 세트 분배 · 11 벤더 관리 · 12 벤더포털·관제</b>다.</div>`);
}

let cur = "ez";
function go(key){
  const menu = MENU[key];
  if(menu && !menu.screens.length){       /* 아직 화면이 없는 메뉴 */
    cur = key;
    $("#canvas").innerHTML = todoScreen(menu);
    $("#cb-grp").textContent = GRP[Object.keys(MENUS).find(k=>MENUS[k].includes(menu))];
    $("#cb-menu").textContent = menu.t;
    $("#cb-sid").textContent = "—";
    mark(key);
    $("#panel").innerHTML = `<h2>이 화면의 변경점</h2><p class="lede">아직 작성하지 않았다.</p>`;
    window.scrollTo({top:0,behavior:"instant"});
    return;
  }
  if(menu) key = menu.screens[0];         /* 메뉴를 누르면 첫 화면으로 */
  const s = S[key]; if(!s) return;
  cur = key;
  $("#canvas").innerHTML = s.render();
  $("#cb-grp").textContent = s.grp;
  $("#cb-menu").textContent = s.menu;
  $("#cb-sid").textContent = s.sid;
  mark(ROOT[key]);
  switcher(key);
  renderNotes(s);
  window.scrollTo({top:0,behavior:"instant"});
}
function mark(rootKey){
  document.querySelectorAll(".navitem").forEach(b=>b.setAttribute("aria-current", b.dataset.go===rootKey ? "true":"false"));
}
function switcher(key){
  const m = MENU[ROOT[key]];
  if(!m || m.screens.length < 2) return;
  const b = document.createElement("div");
  b.className = "switcher";
  b.innerHTML = m.screens.map(k=>{
    const s = S[k];
    return `<button class="btn sm${k===key?" on":""}" data-go="${k}"><span class="sid">${s.sid}</span>${esc(s.scr)}</button>`;
  }).join("");
  const ph = $("#canvas").querySelector(".phead");
  ph.parentNode.insertBefore(b, ph.nextSibling);
}
function renderNotes(s){
  const p = $("#panel");
  p.innerHTML = `<h2>이 화면의 변경점</h2>
    <p class="lede">${esc(s.menu)} · <b>${esc(s.sid)}</b> · 근거 문서 <b>${esc(s.doc)}번</b>. 점선으로 표시된 요소가 아래 번호와 연결된다.</p>
    <div class="legend"><span class="pill new">신규</span><span class="pill warn">변경</span><span class="pill stop">삭제</span><span class="pill mute">그대로</span></div>
    ${s.notes.map((n,i)=>`<div class="note" id="note-${i+1}"><div class="n">${i+1}</div><div><h5>${esc(n.t)}</h5><p>${n.d}</p><span class="ref">${esc(n.r)}</span></div></div>`).join("")}`;
}

document.addEventListener("click", e=>{
  const g = e.target.closest("[data-go]");
  if(g){ go(g.dataset.go); return; }
  const m = e.target.closest("[data-goto]");
  if(m){
    if(!document.body.classList.contains("notes-on")) toggleNotes(true);
    const el = document.getElementById("note-"+m.dataset.goto);
    if(el){ el.scrollIntoView({block:"center",behavior:"smooth"}); el.animate([{background:"var(--new-bg)"},{background:"transparent"}],{duration:1200}); }
  }
});
function toggleNotes(on){
  document.body.classList.toggle("notes-on", on);
  $("#notetgl").setAttribute("aria-pressed", String(on));
}
$("#notetgl").addEventListener("click", ()=> toggleNotes(!document.body.classList.contains("notes-on")));
$("#theme").addEventListener("click", ()=>{
  const r = document.documentElement;
  const now = r.getAttribute("data-theme");
  const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  r.setAttribute("data-theme", now ? (now==="dark"?"light":"dark") : (sysDark?"light":"dark"));
});

/* ?s=ez2 처럼 화면을 직접 열 수 있게 한다 — 캡처할 때 쓴다 */
const want = new URLSearchParams(location.search).get("s");
if(new URLSearchParams(location.search).get("notes") === "off") toggleNotes(false); else toggleNotes(true);
go(want && (S[want] || MENU[want]) ? want : "ez");
