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
function banner(kind, key, html){
  return `<div class="banner ${kind}"><span class="k">${esc(key)}</span><div>${html}</div></div>`;
}
function head(o){
  return `<div class="phead"><h1>${esc(o.h)}</h1><p>${o.p}</p><div class="owner">담당 ${esc(o.owner)} · 검토 ${esc(o.review)}</div></div>`;
}
const P = {ok:'<span class="pill ok">활성</span>', off:'<span class="pill mute">미활성</span>'};
const NEW = '<span class="pill new">신규</span>';
const CHG = '<span class="pill warn">변경</span>';
const DEL = '<span class="pill stop">삭제</span>';

/* ================= SCREENS ================= */
const S = {};

/* ---- 02 영업존 관리 ---- */
S.ez = {
  grp:"권역 관리", menu:"영업존 관리", axis:"s", sid:"SCR_EZ_001", doc:"02",
  notes:[
    {t:"지점명 검색", d:"영업존 이름과 지점명이 항상 같지는 않아 지점명으로도 찾을 수 있게 한다.", r:"02 §5.1"},
    {t:"세일즈 권역 컬럼", d:"어떤 권역에 판가가 걸려 있는지 목록에서 바로 보이게 한다. 용어는 세일즈 권역으로 통일했다.", r:"00 §5.1 · 02 §5.1"},
    {t:"판가 요금제 컬럼", d:"요금제 쪽 목록의 대상 존 수가 0으로 보이는 결함 때문에 존 쪽에서 거꾸로 보여준다. 연결이 없으면 강조한다.", r:"02 §5.1"},
    {t:"지점명은 중복되지 않는다", d:"지점↔영업존이 1:1이므로 같은 지점명이 두 행에 나오지 않는다. 판가를 나누려면 지점을 새로 만든다.", r:"02 EZ-2 · S-2"},
    {t:"통합요금제 미지정 경보", d:"영업존을 만들어도 상점에 통합요금제가 지정되어야 판가가 붙는다. 자동 연결은 별도 개발이며 범위 포함 여부가 미결이다.", r:"02 EZ-6 · 13 B-4"}
  ],
  render(){ return head({h:"영업존 목록",p:"판가를 적용할 단위를 관리한다. 영업존 하나는 <b>지점 1개 + 세일즈 권역 1개</b>로 구성된다.",owner:"영업 담당자",review:"권역 서버 담당 팀"})
  + banner("warn","확인", "상점에 통합요금제가 지정되지 않은 영업존이 <b>3건</b> 있습니다. 해당 상점의 오더는 영업존 판가가 아니라 상점에 설정된 판가로 산정됩니다." + mk(5))
  + plain({title:"검색"}, `<div class="body" style="padding-bottom:0">${filters([
      {l:"영업존 이름",p:"입력"},
      {l:"지점명",p:"입력",mk:1},
      {l:"판가 요금제",p:"전체",sel:1},
      {l:"통합요금제 지정",p:"전체",sel:1,mk:5}
    ],[{t:"조회",pri:1},{t:"초기화"}])}</div>`)
  + plain({title:"영업존", right:'<button class="btn pri">영업존 등록</button>'},
      `<div class="body" style="padding-bottom:0">${chips([
        {t:"총",n:"128건",k:"total"},
        {t:"판가 요금제 미연결",n:"4건",k:"alert"},
        {t:"통합요금제 미지정",n:"3건",k:"alert",mk:5},
        {t:"권역 중첩 오류",n:"1건",k:"alert"}
      ])}</div>` +
      tbl([{t:"ID",mono:1},{t:"영업존 이름"},{t:"지점명",mk:4},{t:"세일즈 권역",mk:2},{t:"판가 요금제",mk:3},{t:"상태"},{t:"생성자"}],[
        ["EZ-1042",'<span class="lnk" data-go="ez2">성북 1</span>',"성북 1 지점","성북 1 zone<span class='sub'>법정동 36</span>","G4 통합 A<span class='sub'>할증 4</span>",P.ok,"김영업"],
        ["EZ-1043",'<span class="lnk" data-go="ez2">성북 2</span>',"성북 2 지점","성북 2 zone<span class='sub'>법정동 21</span>","G4 통합 A",P.ok,"김영업"],
        ["EZ-1051",'<span class="lnk" data-go="ez2">강북 미아</span>',"강북 미아 지점","미아 zone<span class='sub'>법정동 18</span>","G4 통합 B",'<span class="pill warn">통합요금제 미지정</span>',"박영업"],
        ["EZ-1052",'<span class="lnk" data-go="ez2">노원 상계</span>',"노원 상계 지점","상계 zone<span class='sub'>법정동 24</span>",'<span class="dash hot">-</span>','<span class="pill stop">요금제 미연결</span>',"박영업"],
        ["EZ-1060",'<span class="lnk" data-go="ez2">중랑 면목</span>',"중랑 면목 지점","면목 zone<span class='sub'>법정동 15</span>","G4 통합 B",'<span class="pill stop">권역 중첩</span><span class="sub">상계 zone과 겹침</span>',"이영업"]
      ]))
  + `<div class="foot"><span><b>빈 값 표기</b> 연결이 없으면 <span class="dash hot">-</span> 로 강조한다</span><span><b>총 개수</b> <span class="kbd">총 N건</span> 으로 다른 화면과 통일</span></div>`;}
};

/* ---- 02-2 영업존 등록 ---- */
S.ez2 = {
  grp:"권역 관리", menu:"영업존 관리", axis:"s", sid:"SCR_EZ_002", doc:"02",
  notes:[
    {t:"지점은 하나만", d:"이미 영업존이 있는 지점은 목록에서 고를 수 없다. 판가를 나눠 쓰려면 지점을 먼저 새로 만들어야 한다.", r:"02 EZ-2 · 검사 1-1"},
    {t:"세일즈 권역 선택 섹션", d:"기존 「권역 정보」(세일즈 권역·공급권역 읽기 전용 표시)를 대신한다. 지점이 가진 권역 중 하나만 고른다.", r:"02 §5.2 섹션2"},
    {t:"고를 수 없는 이유는 두 가지", d:"이미 다른 영업존에 연결됨(EZ-4)과 다른 권역과 지리적으로 겹침(EZ-5)은 서로 다른 검사다.", r:"02 EZ-4 · EZ-5"},
    {t:"지도는 고른 권역 하나만", d:"세일즈 권역 + 픽업지 전체 + 배송지 3겹을 그리던 것을 하나로 줄인다. 배송 반경 원과 배송지 레이어는 없앤다.", r:"02 §5.2 섹션3"},
    {t:"배송 반경 설정 삭제", d:"상점의 배송 접수 반경은 기존 상점 설정을 그대로 따른다. 이 화면에서 입력하지 않는다.", r:"02 EZ-7 · S-7"},
    {t:"이력 신설", d:"어떤 세일즈 권역이 연결되었다 바뀌었는지를 남긴다. 판가가 어떤 권역에 적용됐는지 되짚는 근거다.", r:"02 §5.2 섹션4"}
  ],
  render(){ return head({h:"영업존 등록",p:"지점을 고르고 그 지점의 세일즈 권역 하나를 고르면 끝이다. 금액은 <b>판가 요금제 관리</b>에서 정한다.",owner:"영업 담당자",review:"권역 서버 담당 팀"})
  + card({title:"기본 정보",axis:"sales"}, form([
      {l:"영업존 이름",req:1,v:"강북 미아"},
      {l:"지점",req:1,mk:1,v:"강북 미아 지점",hint:"» 벤더존 운영방식의 지점만 연결할 수 있습니다. <b>지점 하나에는 영업존 하나만</b> 만들 수 있으며, 연결한 뒤에는 다른 지점으로 바꿀 수 없습니다.",g:1}
    ]) + `<div class="pick" style="margin-top:10px">
      <div class="r on"><span class="radio"></span><b>강북 미아 지점</b><span class="mono">권역 3</span><span class="pill ok">선택 가능</span></div>
      <div class="r dis"><span class="radio"></span><span>성북 1 지점</span><span class="mono">권역 3</span><span style="font-size:11.5px">이미 영업존 <b>성북 1</b> 이 있습니다</span></div>
      <div class="r dis"><span class="radio"></span><span>노원 상계 지점</span><span class="mono">권역 2</span><span style="font-size:11.5px">이미 영업존 <b>노원 상계</b> 가 있습니다</span></div>
    </div>`)
  + plain({title:"세일즈 권역 선택",tag:"신규",mk:2,axis:"sales"}, `<div class="body">
      <div class="hint g" style="margin:0 0 10px">» 영업존은 지점의 세일즈 권역 1개로 구성됩니다. 이미 다른 영업존에 연결된 권역은 선택할 수 없습니다.</div>
      <div class="pick"${note(3)}>
        <div class="r on"><span class="radio"></span><b>미아 zone</b><span class="mono">법정동 18</span><span class="pill ok">선택 가능</span></div>
        <div class="r dis"><span class="radio"></span><span>YOGIYO_OD</span><span class="mono">법정동 18</span><span style="font-size:11.5px">미아 zone과 <b>지리적으로 겹침</b></span></div>
        <div class="r dis"><span class="radio"></span><span>YOGIYO_DIRECT</span><span class="mono">법정동 18</span><span style="font-size:11.5px">미아 zone과 <b>지리적으로 겹침</b></span></div>
      </div>
      <div class="hint">지점↔영업존이 1:1이므로, 지점을 고를 수 있는 시점에는 그 지점의 권역이 아직 아무것도 연결되어 있지 않다. 위에서 고를 수 없는 두 줄은 <b>연결 때문이 아니라 먼저 고른 권역과 지리적으로 겹치기 때문</b>이다.</div>
    </div>`)
  + plain({title:"지도 · 지역 목록",mk:4,axis:"sales"}, `<div class="body">${MAP_EZ}
      <div class="maplegend"><span><i style="background:var(--sales)"></i>영업존 권역 (고른 것)</span><span><i style="background:var(--line-2)"></i>다른 영업존 권역</span><span class="strike">배송지 레이어</span><span class="strike">배송 반경 원</span></div>
      <div class="hint" style="margin-top:10px">지역 목록 라벨을 <span class="kbd">지역종류</span> / <span class="strike">픽업지명</span> <b>지역명</b> 으로 바로잡고, 고른 권역에 포함된 지역만 보여준다. 행정동·법정동 전환은 유지한다.</div>
    </div>`)
  + card({title:"이 화면에서 없어지는 것",mk:5}, tbl([{t:"없어지는 것"},{t:"대신"}],[
      ['<span class="strike">상점 배송 반경 설정 섹션</span>',"기존 상점 설정을 그대로 따른다. 이 화면에서 입력하지 않는다"],
      ['<span class="strike">상점 판매권역 섹션</span>',"영업존은 세일즈 권역만 구성한다"],
      ['<span class="strike">지도의 반경 원</span>',"그리지 않는다"],
      ['<span class="strike">배송지(도착권역) 부분</span>',"도착권역 개념 폐기"]
    ]))
  + plain({title:"이력",tag:"신규",mk:6,actions:[{t:"삭제"},{t:"목록으로"},{t:"저장",pri:1}]},
      tbl([{t:"일시",mono:1},{t:"변경한 사람"},{t:"바뀐 것"}],[
        ["2026-08-24 14:02","김영업","세일즈 권역 <span class='strike'>미아 임시 zone</span> → <b>미아 zone</b>"],
        ["2026-08-11 09:30","김영업","영업존 생성"]
      ]));}
};

/* ---- 03 벤더 배송권역 ---- */
S.vdr = {
  grp:"권역 관리", menu:"벤더 배송권역 관리", axis:"c", sid:"SCR_VDR_001", doc:"03",
  notes:[
    {t:"독립 메뉴로 승격", d:"정책 화면 안의 탭이던 것을 독립 메뉴로 뺀다. 이 권역이 원가·정산·세트분배·벤더 소속의 기준 축이다.", r:"03 §2"},
    {t:"연동 지점은 항상 값이 있다", d:"지점 연동 없는 배송권역은 만들 수 없다. 지점을 고른 뒤 그 지점의 공급권역 중 하나를 고른다.", r:"03 VDR-1 · VDR-5"},
    {t:"공급권역명은 별도 컬럼", d:"운영자가 붙인 배송권역명과 원본 공급권역명이 다를 수 있어 둘 다 보여준다.", r:"03 §5.1"},
    {t:"끊긴 연결을 걸러 본다", d:"정책이나 벤더가 붙지 않은 권역은 배차에 쓰이지 않는데 화면에는 정상으로 보인다. 상단 칩으로 그 행만 걸러낸다.", r:"03 §5.1"},
    {t:"중첩 정책 열은 없앤다", d:"권역 중첩이 금지되어 항상 빈 값이 된다. 「중첩 구간은 양쪽 벤더에게 제안됩니다」 안내도 성립하지 않는다.", r:"03 VDR-4 · §5"}
  ],
  render(){ return head({h:"벤더 배송권역 목록",p:"벤더가 배송을 담당하는 범위를 관리한다. <b>원가·정산·세트분배·벤더 소속의 기준 축</b>이다.",owner:"공급 담당자",review:"권역 서버 담당 팀"})
  + banner("stop","주의","권역 중첩을 <b>허용하지 않는다.</b> 하나의 공급권역은 배송권역 하나에만 쓰이고, 하나의 배송권역은 정책 하나에만 속한다."+mk(5))
  + plain({title:"검색"},`<div class="body" style="padding-bottom:0">${filters([
      {l:"배송권역명",p:"입력"},{l:"지점명",p:"입력",mk:2},{l:"연결 정책명",p:"전체",sel:1},
      {l:"연결 상태",p:"전체",sel:1,mk:4}
    ],[{t:"조회",pri:1},{t:"초기화"}])}</div>`)
  + plain({title:"배송권역",right:'<button class="btn pri">배송권역 등록</button>',axis:"cost"},
      `<div class="body" style="padding-bottom:0">${chips([
        {t:"총",n:"87건",k:"total"},{t:"정책 미연결",n:"6건",k:"alert",mk:4},{t:"벤더 미연결",n:"9건",k:"alert",mk:4}
      ])}</div>` +
      tbl([{t:"배송권역명"},{t:"연동 지점",mk:2},{t:"공급권역명",mk:3},{t:"면적",num:1},{t:"연결 정책"},{t:"연결 벤더 수",num:1}],[
        ['<span class="lnk" data-go="vdr2">성북 북부</span>',"성북 1 지점","성북 1 공급","12.4 km²","서울 북부 A","3"],
        ['<span class="lnk" data-go="vdr2">성북 남부</span>',"성북 1 지점","성북 2 공급","9.1 km²","서울 북부 A","2"],
        ['<span class="lnk" data-go="vdr2">미아 전역</span>',"강북 미아 지점","미아 공급","15.8 km²","서울 북부 A","4"],
        ['<span class="lnk" data-go="vdr2">상계 동부</span>',"노원 상계 지점","상계 동 공급","11.2 km²",'<span class="dash hot">-</span>','<span class="dash hot">0</span>'],
        ['<span class="lnk" data-go="vdr2">면목 전역</span>',"중랑 면목 지점","면목 공급","8.7 km²","서울 동부 B",'<span class="dash hot">0</span>']
      ]))
  + `<div class="foot"><span><b>한 지점 여러 권역</b> 성북 1 지점이 두 권역을 갖는 것은 정상이다 (지점 → 배송권역 = 1:N)</span><span class="strike">중첩 정책 컬럼</span></div>`;}
};

S.vdr2 = {
  grp:"권역 관리", menu:"벤더 배송권역 관리", axis:"c", sid:"SCR_VDR_002", doc:"03",
  notes:[
    {t:"지점 선택 → 공급권역 선택", d:"두 단계다. 지점을 먼저 고르면 그 지점의 공급권역 목록이 나오고 그중 하나를 고른다. 저장되는 것은 고른 공급권역이다.", r:"03 VDR-5 · §5.2"},
    {t:"모두 사용 중이면 목록이 빈다", d:"「이 지점에는 이미 배송권역이 있습니다」로 막지 않는다. 그 지점의 공급권역이 전부 사용 중일 때만 고를 것이 없다.", r:"03 §5.2 · 검사 4"},
    {t:"교체는 막는다", d:"같은 배송권역이 시점에 따라 다른 지역을 가리키면 과거 정산이 어느 지역 실적인지 알 수 없다. 바꾸려면 새로 만든다 — 운영 빈도 확인 필요.", r:"03 §5.2 · 8"},
    {t:"모양은 여기서 못 고친다", d:"원본 공급권역과 항상 같은 모양을 유지한다. 원본이 바뀌면 이 권역도 함께 바뀌고, 쓰는 정책·벤더에게 알린다.", r:"03 VDR-2 · VDR-3 · VDR-7"},
    {t:"연결 상태 섹션", d:"권역을 만들어도 정책·벤더가 붙지 않으면 아무 일도 일어나지 않는다. 어디서 끊겼는지 보이지 않으면 운영자가 모른다.", r:"03 §5.2 섹션4"}
  ],
  render(){ return head({h:"벤더 배송권역 상세",p:"모양을 그리는 것이 아니라 <b>지점의 공급권역을 가리키는 것</b>이다. 벤더 연결과 세트 수는 세트 분배 관리에서 정한다.",owner:"공급 담당자",review:"권역 서버 담당 팀"})
  + card({title:"기본 정보",axis:"cost"}, form([
      {l:"배송권역명",req:1,v:"성북 북부",hint:"공급권역명과 같지 않아도 된다. 운영자가 벤더에게 설명하기 쉬운 이름을 붙이는 자리다."},
      {l:"연동 지점",req:1,mk:1,v:"성북 1 지점",hint:"» 지점을 먼저 고르면 그 지점의 공급권역 목록이 나옵니다.",g:1},
      {l:"연동 공급권역",req:1,mk:3,html:`<div class="pick">
        <div class="r on"><span class="radio"></span><b>성북 1 공급</b><span class="mono">12.4 km²</span><span class="pill ok">선택 가능</span></div>
        <div class="r dis"><span class="radio"></span><span>성북 2 공급</span><span class="mono">9.1 km²</span><span style="font-size:11.5px"><b>성북 남부</b>가 사용 중</span></div>
        <div class="r"><span class="radio"></span><span>성북 3 공급</span><span class="mono">6.0 km²</span><span class="pill ok">선택 가능</span></div>
      </div>`, hint:"» 등록한 뒤에는 다른 공급권역으로 바꿀 수 없습니다. 바꿔야 하면 새 배송권역을 만드세요."+mk(2)}
    ]))
  + plain({title:"지도",tag:"조회 전용",mk:4,axis:"cost"},`<div class="body">${MAP_VDR}
      <div class="maplegend"><span><i style="background:var(--cost)"></i>이 배송권역</span><span><i style="background:var(--line-2)"></i>다른 배송권역</span><span><i style="background:var(--sales);opacity:.45"></i>영업존 (겹쳐 보기)</span><span><i style="background:var(--warn-bg);border:1px dashed var(--warn)"></i>어느 권역에도 없는 지역</span></div>
      <div class="hint">» 모양을 바꾸려면 권역 관리에서 <b>원본 공급권역</b>을 수정해야 합니다. 이웃 권역과 사이의 빈 지역은 <b>벤더가 배송하지 않는 지역</b>이 됩니다.</div>
    </div>`)
  + plain({title:"연결 상태",tag:"조회 전용",mk:5,axis:"cost"},
      tbl([{t:"항목"},{t:"현재"},{t:"어디서 바꾸나"}],[
        ["연결 정책","서울 북부 A",'<span class="lnk" data-go="pol2">배송권역 정책 관리</span>'],
        ["연결 벤더","라이더스코리아 · 퀵메이트 · 북부로지스 (3)",'<span class="lnk" data-go="set2">세트 분배 관리</span>'],
        ["적용 원가 요금제","북부 표준 원가 A",'<span class="lnk" data-go="cp2">원가 요금제 관리</span>']
      ]))
  + plain({title:"이력",tag:"신규",actions:[{t:"삭제"},{t:"목록으로"},{t:"저장",pri:1}]},
      tbl([{t:"일시",mono:1},{t:"바뀐 것"},{t:"왜 남기나"}],[
        ["2026-08-19 11:20","연동 공급권역 모양 변경 (12.0 → 12.4 km²)","원가 산정 범위가 바뀐 것이므로 정산 분쟁 때 언제부터 달랐는지를 봐야 한다"],
        ["2026-07-30 16:44","연결 정책 <span class='strike'>서울 북부 임시</span> → <b>서울 북부 A</b>","정책이 바뀌면 원가 요금제가 바뀐다"],
        ["2026-07-30 16:40","벤더 <b>북부로지스</b> 연결","어느 기사가 어떤 권역 기준으로 지급받았는지를 되짚는 입구다"]
      ]));}
};
