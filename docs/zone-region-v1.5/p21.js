const PARENT = {ez2:"ez",vdr2:"vdr",sp2:"sp",cp2:"cp",pol2:"pol",set2:"set",ven2:"ven"};
const SUB = {ez:"ez2",vdr:"vdr2",sp:"sp2",cp:"cp2",pol:"pol2",set:"set2",ven:"ven2"};

Object.entries(NAV).forEach(([id,items])=>{
  $("#"+id).innerHTML = items.map(([k,t,a])=>`<button class="navitem" data-go="${k}"><span class="axis ${a}"></span>${t}</button>`).join("");
});

let cur = "ez";
function go(key){
  const s = S[key]; if(!s) return;
  cur = key;
  $("#canvas").innerHTML = s.render();
  $("#cb-grp").textContent = s.grp;
  $("#cb-menu").textContent = s.menu;
  $("#cb-sid").textContent = s.sid;
  const rootKey = PARENT[key] || key;
  document.querySelectorAll(".navitem").forEach(b=>b.setAttribute("aria-current", b.dataset.go===rootKey ? "true":"false"));
  // pair switcher
  const pair = SUB[key] ? {to:SUB[key], t:"상세·등록 화면 보기"} : (PARENT[key] ? {to:PARENT[key], t:"목록 화면 보기"} : null);
  if(pair){
    const b = document.createElement("div");
    b.style.cssText="display:flex;justify-content:flex-end;margin:-6px 0 14px";
    b.innerHTML = `<button class="btn sm" data-go="${pair.to}">${pair.t} ›</button>`;
    const ph = $("#canvas").querySelector(".phead");
    ph.parentNode.insertBefore(b, ph.nextSibling);
  }
  renderNotes(s);
  window.scrollTo({top:0,behavior:"instant"});
}
function renderNotes(s){
  const p = $("#panel");
  p.innerHTML = `<h2>이 화면의 변경점</h2>
    <p class="lede">${esc(s.menu)} · 근거 문서 <b>${esc(s.doc)}번</b>. 점선으로 표시된 요소가 아래 번호와 연결된다.</p>
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
  const next = now ? (now==="dark"?"light":"dark") : (sysDark?"light":"dark");
  r.setAttribute("data-theme", next);
});

toggleNotes(true);
go("ez");
