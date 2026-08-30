const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ---------- tiny builders ---------- */
const mk = n => `<span class="mk" data-goto="${n}">${n}</span>`;
const note = n => ` data-mk="${n}"`;
function filters(list, actions){
  return `<div class="filters">${list.map(f=>{
    const cls = f.sel ? "ctl sel" : "ctl";
    const ph = f.v ? "" : " ph";
    return `<div class="f"${f.mk?note(f.mk):""}><label>${esc(f.l)}${f.mk?mk(f.mk):""}</label><div class="${cls}${ph}">${esc(f.v||f.p||"전체")}</div></div>`;
  }).join("")}<div class="f"><label>&nbsp;</label><div style="display:flex;gap:7px">${(actions||[]).map(a=>`<button class="btn${a.pri?" pri":""}">${esc(a.t)}</button>`).join("")}</div></div></div>`;
}
function chips(list){
  return `<div class="chips">${list.map(c=>`<span class="chip ${c.k||""}"${c.mk?note(c.mk):""}>${esc(c.t)} <b class="n">${esc(c.n)}</b>${c.mk?mk(c.mk):""}</span>`).join("")}</div>`;
}
function tbl(cols, rows){
  return `<div class="tblwrap"><table><thead><tr>${cols.map(c=>`<th${c.mk?note(c.mk):""} ${c.num?'style="text-align:right"':""}>${esc(c.t)}${c.mk?mk(c.mk):""}</th>`).join("")}</tr></thead><tbody>${
    rows.map(r=>`<tr>${r.map((cell,i)=>`<td class="${cols[i].num?"num":""}${cols[i].mono?" mono":""}">${cell}</td>`).join("")}</tr>`).join("")
  }</tbody></table></div>`;
}
function card(o, body){
  const hdr = o.title ? `<header><h3${o.mk?note(o.mk):""}>${esc(o.title)}${o.mk?mk(o.mk):""}</h3>${o.tag?`<span class="pill ${o.tagk||"mute"}">${esc(o.tag)}</span>`:""}${o.right?`<div class="spacer"></div>${o.right}`:""}</header>`:"";
  return `<section class="card ${o.axis||""}">${hdr}<div class="body">${body}</div>${o.actions?`<div class="actions">${o.actions.map(a=>`<button class="btn${a.pri?" pri":""}">${esc(a.t)}</button>`).join("")}</div>`:""}</section>`;
}
function plain(o, body){ // card without body padding (for tables)
  const hdr = o.title ? `<header><h3${o.mk?note(o.mk):""}>${esc(o.title)}${o.mk?mk(o.mk):""}</h3>${o.right?`<div class="spacer"></div>${o.right}`:""}</header>`:"";
  return `<section class="card ${o.axis||""}">${hdr}${body}${o.actions?`<div class="actions">${o.actions.map(a=>`<button class="btn${a.pri?" pri":""}">${esc(a.t)}</button>`).join("")}</div>`:""}</section>`;
}
function form(rows){
  return `<dl>${rows.map(r=>`<div class="frow"${r.mk?note(r.mk):""}><dt>${esc(r.l)}${r.req?'<span class="req">*</span>':""}${r.mk?mk(r.mk):""}</dt><dd>${r.html||`<div class="field${r.ro?" ro":""}${r.v?"":" ph"}">${esc(r.v||r.p||"")}</div>`}${r.hint?`<div class="hint${r.g?" g":""}">${r.hint}</div>`:""}</dd></div>`).join("")}</dl>`;
}
