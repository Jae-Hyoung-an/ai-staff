/* =====================================================================
   09. 벤더 배송권역 정책 관리 — 벤더 정책 관리 > 벤더 배송권역 정책 관리
   근거: [PRD] 존·권역 구조 개편 v2.0 / 09. 벤더 배송권역 정책 관리 §4
   화면 4장 — SCR_POL_001 목록 · SCR_POL_002 등록·상세
              SCR_POL_003 연결 모달 1단계 · SCR_POL_004 연결 모달 2단계
   v1.5의 「벤더 배송권역 관리」(03)를 이 메뉴가 흔수했다 — 별도 메뉴를 두지 않는다.
   ===================================================================== */

/* ---------------- SCR_POL_001 정책 목록 (§4.2) ---------------- */
S.pol = {
  grp:"벤더 정책 관리", menu:"벤더 배송권역 정책 관리", axis:"cost", sid:"SCR_POL_001", scr:"정책 목록", doc:"09",
  notes:[
    {t:"검색 조건은 기준 화면 그대로 둘", d:"<b>정책명 · 상태</b>만 둔다. 지점 · 벤더 · 요금제로 찾는 것은 각 정책을 열어 연결 권역 표에서 본다 — 목록에 조건을 늘리지 않는다.", r:"09 §4.2"},
    {t:"벤더 미연결 N건 (신설)", d:"권역은 담았지만 벤더가 붙지 않아 <b>배차에 쓰이지 않는</b> 정책을 걸러 본다. 상태는 `활성`인데 실제로는 아무 일도 하지 않는 정책이 여기 걸린다.", r:"09 §4.2 · POL-12"},
    {t:"연결 권역 수 (신설)", d:"<b>0이면 강조한다.</b> 활성 조건을 못 맞춘 것이다 — 정책을 만들어도 권역이 비어 있으면 아무 일도 일어나지 않는다.", r:"09 §4.2 · POL-10"},
    {t:"연결 벤더 수 (신설)", d:"권역을 거쳐 <b>파생된 값</b>이다. 정책이 직접 벤더를 가리키지 않는다 — 벤더 연결은 세트 분배 관리에서 한다.", r:"09 §4.2 · POL-12"},
    {t:"중첩 정책 수 (신설) — 0이 정상값이 아니다", d:"이 정책의 권역들과 지리적으로 겹치는 다른 정책의 수. 징검다리로 이어 붙인 결과 <b>겹치는 것이 정상</b>이므로 경고색을 쓰지 않는다. 누르면 겹치는 정책 목록을 보여준다.", r:"09 POL-8"},
    {t:"상태 (신설) — 손으로 바꿀 수 없다", d:"`활성` / `미활성`은 <b>연결된 권역이 1개 이상인가</b>로 자동 판단한다. 미활성이면 사유(`연결 권역 없음`)를 함께 적는다. 바꾸라고 보여주는 게 아니라 <b>왜 안 돌고 있는지</b>를 알려주려고 둔다.", r:"09 POL-10 · POL-11"},
    {t:"예약 (신설)", d:"발효 대기 중인 변경이 있으면 발효 예정 일시를 배지로 보여준다. 정책당 예약은 하나만 걸린다. 다만 <b>예약 저장 버튼 자체는 기준 화면에 이미 있다</b>.", r:"09 POL-14"},
    {t:"삭제 버튼이 없다", d:"정책은 삭제할 수 없다. 멈추려면 <b>권역 연결을 비운다</b> — 상태가 자동 판단이라 수동 비활성 버튼도 두지 않는다.", r:"09 POL-11 · §2"}
  ],
  render(){ return head({
      h:"벤더 배송권역 정책 목록",
      p:"지점들의 <b>벤더 배송권역</b>을 묶어 권역마다 쓸 요금제를 정하고, 그 권역들에 일괄로 적용할 <b>보상 조건 · 세트 물량 · 단위물량</b>을 정한다.",
      owner:"공급 담당자", review:"벤더 서버 · 라스트마일 담당 팀"})
  + `<div${note(1)}>${srch([
      {l:"정책명",p:"입력"},
      {l:"상태",p:"전체",sel:1}
    ])}${mk(1)}</div>`
  + plain({title:"정책"},
      chips([
        {t:"총",n:"24건",k:"total"},
        {t:"벤더 미연결",n:"3건",k:"alert",mk:2}
      ]) +
      tbl([{t:"정책명"},{t:"연결 권역 수",num:1,mk:3},{t:"연결 벤더 수",num:1,mk:4},{t:"중첩 정책 수",num:1,mk:5},{t:"활성 슬롯 수",num:1},{t:"상태",mk:6},{t:"예약",mk:7},{t:"생성일",mono:1},{t:"마지막 수정일",mono:1}],[
        ['<span class="lnk" data-go="pol2">수도권 벤더 운영정책 v3</span>',"3","6","2","35",'<span class="pill ok">활성</span>','<span class="pill new">09-15 00:00 발효</span>',"2026-07-21","2026-09-08"],
        ['<span class="lnk" data-go="pol2">강북 벤더 정책</span>',"2","0","1","28",'<span class="pill ok">활성</span><span class="sub">벤더 미연결</span>','<span class="dash">-</span>',"2026-08-04","2026-08-27"],
        ['<span class="lnk" data-go="pol2">경기남부 벤더 정책</span>',"5","11","3","35",'<span class="pill ok">활성</span>','<span class="dash">-</span>',"2026-05-19","2026-09-01"],
        ['<span class="lnk" data-go="pol2">야간 전용 정책</span>',EMPTY,"0","0","7",'<span class="pill stop">미활성</span><span class="sub">연결 권역 없음</span>','<span class="dash">-</span>',"2026-08-26","2026-08-26"],
        ['<span class="lnk" data-go="pol2">수도권 벤더 운영정책 v2</span>',"4","9","2","35",'<span class="pill ok">활성</span>','<span class="dash">-</span>',"2026-05-19","2026-08-13"]
      ]) + listbar("정책 등록","총 24건"))
  + `<div class="foot"${note(8)}><span><b>기준 화면에서 그대로</b> 정책명(관리정책명) · 생성일 · 마지막 수정일 · 검색 조건 정책명·상태</span><span><b>중첩 정책 수</b> 0이 정상값이 아니다</span><span class="strike">삭제 버튼</span><span class="strike">수동 활성 · 비활성</span>${mk(8)}</div>`;}
};

/* ---------------- SCR_POL_002 정책 등록 · 상세 (§4.3) ---------------- */
const POL_ROWS = [
  ["1","부릉 강남2지점","강남 벤더 배송권역","18.4 km²",ext("수도권 표준 원가 요금제 v3")+' <button class="btn sm">변경</button>','<span class="lnk">3곳</span>','<span class="lnk">1개</span><span class="sub">수도권 벤더 운영정책 v2</span>','<button class="btn sm">삭제</button>'],
  ["2","부릉 서초지점","서초 벤더 배송권역","22.1 km²",ext("수도권 표준 원가 요금제 v3")+' <button class="btn sm">변경</button>','<span class="lnk">3곳</span>','<span class="dash">0개</span>','<button class="btn sm">삭제</button>'],
  ["3","부릉 마포지점","마포 벤더 배송권역","23.8 km²",ext("경기남부 원가 요금제")+' <button class="btn sm">변경</button>',EMPTY,'<span class="lnk">2개</span><span class="sub">강북 벤더 정책 외 1</span>','<button class="btn sm">삭제</button>']
];

function volTable(){
  const slots = [
    {n:"슬롯1",a:"06:00",b:"11:00",on:null},
    {n:"슬롯2",a:"11:00",b:"13:00",on:true},
    {n:"슬롯3",a:"13:00",b:"17:00",on:true},
    {n:"슬롯4",a:"17:00",b:"21:00",on:true},
    {n:"슬롯5",a:"21:00",b:"23:00",on:false}
  ];
  const th = slots.map(s=>`<th><div class="slotname">${esc(s.n)}</div><div class="slottime"><span>${s.a}</span> ~ <span>${s.b}</span></div>${
    s.on===null ? `<div class="toggle" style="opacity:.45">토글 없음 · 항상 사용</div>`
                : `<div class="toggle${s.on?"":" off"}"><i></i>사용</div>`}</th>`).join("");
  const days = ["월","화","수","목","금","토","일"];
  const vals = [[12,26,14,31,0],[12,26,14,31,0],[12,26,14,31,0],[14,28,16,34,0],[16,33,19,41,0],[18,35,22,44,0],[15,30,18,38,0]];
  const body = days.map((d,i)=>`<tr><td class="daycol">${d}</td>${vals[i].map(v=>`<td><span class="volcell">${v}</span></td>`).join("")}</tr>`).join("");
  return `<div class="tblwrap"><table><thead><tr><th class="daycol">요일</th>${th}</tr></thead><tbody>${body}</tbody></table></div>`;
}

S.pol2 = {
  grp:"벤더 정책 관리", menu:"벤더 배송권역 정책 관리", axis:"cost", sid:"SCR_POL_002", scr:"정책 등록 · 상세", doc:"09",
  notes:[
    {t:"상단 상태 배너 (신설)", d:"왜 동작하지 않는지를 <b>제일 먼저</b> 보여준다. 여기 그린 것은 <b>활성이지만 벤더가 하나도 없는</b> 상태다 — 권역은 담겼고 요금제도 붙었지만 <b>배차에는 쓰이지 않는다.</b> 벤더 연결은 세트 분배 관리에서 한다.", r:"09 §4.3 · POL-10 · POL-12"},
    {t:"연결 권역 — 지점을 담으면 권역이 따라온다", d:"기준 화면의 「적용 ZONE 선택」을 대신한다. <b>지점을 검색해 담고, 권역마다 요금제를 지정한다.</b> 지점당 벤더 배송권역은 1개뿐이라 고를 것도, 개수를 검사할 것도 없다. 폴리곤은 지점의 <b>벤더 배송권역 편집기</b>에서 그린다.", r:"09 POL-3 · POL-7"},
    {t:"요금제 열 (신설 · 필수)", d:"<b>같은 정책 안에서 권역마다 다른 요금제를 줄 수 있다</b> — 정책을 쪼간 이유가 없어졌다. 요금제를 지정하지 않은 권역이 있으면 저장을 막는다. 요금제명을 누르면 요금제 상세로 이동한다(새 탭).", r:"09 POL-5 · S-2"},
    {t:"연결 벤더 수 · 중첩 권역 (신설)", d:"연결 벤더가 <b>0이면 강조한다</b> — 배차에 쓰이지 않는다. 중첩 권역은 <b>오류가 아니라 정상</b>이므로 경고 없이 수와 정책명만 보여준다.", r:"09 POL-8 · POL-12"},
    {t:"지도 (신설 · 조회 전용)", d:"떨어져 있는 권역끼리 묶여 있어도 정상이다 — 정책은 지리적 단위가 아니라 <b>운영 조건의 묶음</b>이다. 보는 목적은 둘이다: 겹치는 구간이 <b>몇 겹인지</b>(징검다리가 의도대로 깔렸는가)와 이웃 권역 사이의 <b>빈 지역</b>(그 오더는 폴백용 요금제로 프렌즈에게 간다).", r:"09 §4.3 섹션3"},
    {t:"보상 · 물량은 일괄 적용", d:"관리비 보상 조건 · 세트당 최대 활성화 기사수 · 요일별 단위물량은 <b>연결된 모든 권역에 일괄</b> 적용된다. 권역별로 다르게 줄 수 없다 — 다르게 주려면 정책을 나눈다.", r:"09 POL-9 · S-3"},
    {t:"슬롯 이름도 입력한다", d:"슬롯 <b>이름 · 시작 시각 · 종료 시각</b>을 모두 화면에서 입력한다(이름 기본값 <span class='kbd'>슬롯1</span>~<span class='kbd'>슬롯5</span>, 50자). <b>슬롯1은 토글이 없고 항상 켜져 있다.</b> 슬롯 시간과 요금제가 보는 시간은 같을 필요가 없어 <span class='strike'>슬롯을 바꾸셨습니다 · 원가표를 다시 입력하세요</span> 경고는 없앤다.", r:"09 §4.3 섹션6"},
    {t:"삭제 · 활성화 · 비활성화 버튼이 없다", d:"액션은 <b>목록으로 · 예약 저장 · 저장</b> 셋뿐이다. 상태는 자동 판단 결과라 손으로 바꿔도 다시 덮인다 — 멈추려면 권역 연결을 비운다.", r:"09 POL-11 · S-5"}
  ],
  render(){ return head({
      h:"벤더 배송권역 정책 등록",
      p:"지점을 담으면 그 지점의 <b>벤더 배송권역</b>이 따라오고, 권역마다 <b>원가 요금제</b>를 하나씩 지정한다. 보상 조건과 물량은 담긴 권역 전부에 일괄 적용된다.",
      owner:"공급 담당자", review:"벤더 서버 · 라스트마일 담당 팀"})

  + `<div id="sec-head">`
  + tabs(["기본정보","변경 이력"],"기본정보")
  + `<div${note(1)} style="margin-top:18px">${banner("ok","활성", "<b>연결된 벤더가 없어 배차에 쓰이지 않습니다.</b> 세트 분배 관리에서 벤더를 연결해주세요. — 배송권역 3개 · 연결 벤더 0곳" + mk(1))}</div>`
  + card({title:"기본 정보",axis:"cost"}, form([
      {l:"정책명",req:1,v:"강북 벤더 정책"},
      {l:"상태",ro:1,v:"활성",hint:"자동 판단 결과다. 연결된 권역이 1개 이상이면 활성이며 <b>손으로 바꿀 수 없다</b> (POL-10)."},
      {l:"정책 설명",v:"강북권 벤더존 3개 지점 공통 운영 조건"}
    ]))
  + `</div>`

  + `<div id="sec-zone">`
  + plain({title:"연결 권역",mk:2,axis:"cost", right:'<button class="btn sm" data-go="pol3">권역 추가</button>'},
      `<div class="hint g" style="margin:0 0 12px">» 지점을 검색해 연결하면 그 지점의 <b>벤더 배송권역</b>이 함께 연결됩니다. 권역마다 요금제를 하나씩 지정해야 하며, 하나의 권역은 정책 하나에만 속합니다.</div>`
      + chips([{t:"총",n:"3개",k:"total"}])
      + tbl([{t:"#",mono:1},{t:"지점명"},{t:"벤더 배송권역명"},{t:"면적",num:1},{t:"요금제",mk:3},{t:"연결 벤더 수",num:1,mk:4},{t:"중첩 권역",mk:4},{t:""}], POL_ROWS)
      + `<div class="hint">떼어낼 때는 <b>그 권역에 속한 벤더가 몇 곳인지 먼저 보여주고 확인을 받는다.</b> 떼어내면 그 벤더는 이 정책의 원가를 더 이상 받지 않는다.</div>`)
  + `</div>`

  + `<div id="sec-map">`
  + card({title:"지도",tag:"신규 · 조회 전용",tagk:"new",mk:5,axis:"cost"}, `
      ${MAP_POL}
      <div class="maplegend"><span><i style="background:var(--cost)"></i>이 정책의 배송권역</span><span><i style="background:var(--line-2)"></i>다른 정책의 권역</span><span><i style="background:var(--sales)"></i>영업존</span><span><i style="background:var(--warn)"></i>빈 지역</span></div>
      <div class="hint" style="margin-top:10px"><b>편집할 수 없다.</b> 모양을 바꾸려면 지점의 <b>벤더 배송권역 편집기</b>에서 원본을 수정한다 (POL-7). 원본이 바뀌면 이 정책이 덤는 범위도 함께 바뀌고, 담당자에게 알리며 이력을 남긴다 (POL-6 · POL-16).</div>`)
  + `</div>`

  + `<div id="sec-comp">`
  + plain({title:"관리비 보상 조건",mk:6,axis:"cost"}, `
      <div style="margin-bottom:14px"><div style="font-size:12px;color:var(--faint)">활성 슬롯 (사용 설정된 슬롯 수)</div><div style="font-family:var(--mono);font-size:22px;font-weight:600;color:var(--ink-strong)">28</div></div>
      <div class="hint g" style="margin:0 0 10px">» 수행 슬롯 개수 ＋ 거절률 두 조건 모두 충족 시 해당 단계 적용 · 상위 단계 우선</div>`
      + tbl([{t:"단계",mono:1},{t:"수행 슬롯 개수"},{t:"거절률 상한 (%)",num:1},{t:"세트당 보상 금액 (원)",num:1}],[
        ["1",'<span class="volcell">14</span><div class="progress"><i style="width:50%"></i></div><span class="sub">14 / 28 슬롯 · 50.0%</span>',"20","30,000"],
        ["2",'<span class="volcell">21</span><div class="progress"><i style="width:75%"></i></div><span class="sub">21 / 28 슬롯 · 75.0%</span>',"15","45,000"],
        ["3",'<span class="volcell">28</span><div class="progress"><i style="width:100%"></i></div><span class="sub">28 / 28 슬롯 · 100.0%</span>',"10","60,000"]
      ])
      + `<div style="display:flex;gap:8px;margin-top:14px"><button class="btn sm">＋ 단계 추가</button><button class="btn sm">－ 단계 삭제</button></div>
         <div class="hint"><b>연결된 모든 권역에 일괄 적용된다</b> (POL-9).</div>`)
  + `</div>`

  + `<div id="sec-vol">`
  + card({title:"세트 물량 구성",axis:"cost"}, form([{l:"세트당 최대 활성화 기사수",v:"5"}])
      + `<div class="hint">연결된 모든 권역에 일괄 적용된다 (POL-9).</div>`)
  + plain({title:"요일별 단위물량",mk:7,axis:"cost"}, `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><span style="font-size:13px;color:var(--faint)">선택 0개</span><button class="btn sm">선택 셀 입력</button><button class="btn sm">선택 해제</button></div>`
      + volTable()
      + `<div class="hint">셀을 여러 개 골라 <span class="kbd">선택 셀 입력</span>으로 한 번에 넣는다. <b>원가와는 상관이 없다</b> — 슬롯 시간과 요금제가 보는 시간은 같을 필요가 없다.</div>`)
  + `</div>`

  + plain({title:"저장이 막힐는 경우"}, tbl([{t:"#",mono:1},{t:"상황"},{t:"화면이 하는 일"}],[
      ["1","정책명 미입력","저장할 수 없다"],
      ["2","권역이 하나도 없는 상태로 저장","<b>막지 않는다.</b> 저장하되 `미활성`으로 남기고 상단 배너로 알린다"],
      ["3","요금제를 지정하지 않은 권역이 있다","<b>저장을 막는다.</b> 요금제는 권역 연결의 필수 항목이다 (POL-5). 어느 행이 비었는지 표시한다"],
      ["4","이미 다른 정책이 쓰는 지점","<b>모달에서 선택할 수 없다.</b> 회색 행으로 남기고 <span class='kbd'>{정책명}이 사용 중</span> 을 함께 보여준다"],
      ["5","벤더 배송권역이 없는 지점","<b>목록에 나오지 않는다.</b> 단 고른 뒤 삭제되는 경합이 있으므로 <b>저장 시점에 서버가 다시 검증</b>한다"],
      ["6","벤더가 속한 권역을 떼어내려 함","그 권역의 벤더 수를 보여주고 확인을 받는다"],
      ["7","다른 권역과 지리적으로 겹침","<b>막지 않는다.</b> 징검다리를 위해 의도하는 상황이다. 경고도 띄우지 않고 `중첩 권역`에 <b>상태로만</b> 보여준다"],
      ["8","예약을 걸려는데 이미 예약이 있음","정책당 예약은 하나다. 기존 예약을 보여주고 덮을지 묻는다"],
      ["9","같은 지점을 다른 정책도 예약해 둥","<b>예약 단계에서 막는다.</b> 발효 시점에 권역이 정책 둘에 속하게 되기 때문이다"]
    ]))

  + bar([{t:"목록으로"},{t:"예약 저장",off:1},{t:"저장",pri:1}])
  + `<div class="foot"${note(8)}><span><b>탭</b> 기본정보 / 변경 이력</span><span><b>액션</b> 목록으로 · 예약 저장 · 저장</span><span class="strike">삭제</span><span class="strike">활성화</span><span class="strike">비활성화</span>${mk(8)}</div>`;}
};

/* ---------------- SCR_POL_003 배송권역 연결 모달 — 1단계 (§4.4) ---------------- */
S.pol3 = {
  grp:"벤더 정책 관리", menu:"벤더 배송권역 정책 관리", axis:"cost", sid:"SCR_POL_003", scr:"연결 모달 1단계", doc:"09",
  notes:[
    {t:"두 단계를 마쳐야 담긴다", d:"`권역 추가`를 누르면 열리는 <b>2단계 마법사</b>다. 지점을 고르고(1단계) 그 권역에 붙일 요금제를 고른다(2단계). <b>요금제 없이 권역만 담을 수 없다는 규칙(POL-5)이 이 흐름으로 지켜진다</b> — 저장 시점에 막는 것이 아니라 담는 시점에 막힌다.", r:"09 §4.4 · POL-5"},
    {t:"고를 수 없는 지점을 감추지 않는다", d:"이미 다른 정책이 쓰는 지점은 <b>회색 행으로 남기고 어느 정책이 쓰는지 함께 보여준다.</b> 정책 목록의 검색 조건은 정책명·상태뿐이라, 감추면 되돌아가 찾을 경로가 없기 때문이다. <b>02 영업존은 반대로 「감추는다」로 간다</b> — 그쪽은 목록에 지점명 검색이 있다.", r:"09 §4.4 · 02 EZ-4"},
    {t:"감추는 것은 하나뿐", d:"<b>벤더 배송권역이 없는 지점</b>만 감춘다. 담을 폴리곤 자체가 없어 보여줄 이유가 없다.", r:"09 §4.4"},
    {t:"여러 곳을 한 번에 고른다", d:"지점을 여러 곳 골라 한 번에 담을 수 있다. 고른 수를 <span class='kbd'>지점 N곳 선택됨</span> 으로 보여주고, 하나도 고르지 않으면 `다음`이 꺼져 있다. 검색은 <b>지점명 또는 벤더 배송권역명</b>으로 한다.", r:"09 §4.4"},
    {t:"중첩 열은 경고가 아니다", d:"겹치는 다른 권역의 수를 보여주지만 <b>막지도, 경고하지도 않는다.</b> 이웃까지 겹치게 그려 권역 외 오더를 줄이는 것이 목적이다(징검다리).", r:"09 POL-8"}
  ],
  render(){ return head({
      h:"배송권역 연결 — 1단계 지점 선택",
      p:"연결 권역 섹션의 <span class='kbd'>권역 추가</span>를 누르면 열린다. 메뉴가 아니라 <b>모달</b>이며 2단계로 진행한다.",
      owner:"공급 담당자", review:"벤더 서버 · 라스트마일 담당 팀"})
  + modal({title:"배송권역 연결",tag:"신규",actions:[{t:"닫기"},{t:"다음",pri:1}]},
      `<div class="steps"${note(1)}><b>1. 지점 선택</b><span>›</span><span>2. 원가 요금제 선택</span>${mk(1)}</div>
      <div class="hint g" style="margin:0 0 14px">» 지점을 고르면 그 지점의 <b>벤더 배송권역</b>이 연결됩니다. 지점당 권역이 1개라 따로 고를 것이 없습니다.</div>
      ${fieldrow([{l:"지점명 또는 벤더 배송권역명",p:"입력",mk:4}])}
      <div style="margin-top:14px">${tbl([{t:""},{t:"지점명"},{t:"벤더 배송권역"},{t:"면적",num:1},{t:"중첩",num:1,mk:5}],[
        ['<span class="radio" style="border-color:var(--accent);border-width:5px"></span>','<b>부릉 강남2지점</b>',"강남2지점_공급권역","18.4 km²","1개"],
        ['<span class="radio" style="border-color:var(--accent);border-width:5px"></span>','<b>부릉 서초지점</b>',"서초지점_공급권역","22.1 km²","0개"],
        ['<span class="radio" style="opacity:.45"></span>','<span class="dash">부릉 송파지점</span>','<span class="dash">송파지점_공급권역</span> <span class="pill mute">수도권 벤더 운영정책 v2이 사용 중</span>','<span class="dash">33.9 km²</span>','<span class="dash">2개</span>'],
        ['<span class="radio" style="border-color:var(--accent);border-width:5px"></span>','<b>부릉 마포지점</b>',"마포지점_공급권역","23.8 km²","3개"],
        ['<span class="radio"></span>',"부릉 성동지점","성동지점_공급권역","16.9 km²","2개"],
        ['<span class="radio" style="opacity:.45"></span>','<span class="dash">부릉 용산지점</span>','<span class="dash">용산지점_공급권역</span> <span class="pill mute">수도권 벤더 운영정책 v2이 사용 중</span>','<span class="dash">21.9 km²</span>','<span class="dash">0개</span>']
      ])}</div>
      <div class="hint" style="margin-top:10px"${note(2)}><b>회색 행은 이미 다른 정책이 쓰는 지점이다</b> — 감추지 않고 어느 정책이 쓰는지 함께 보여준다. ${mk(2)}</div>
      <div class="hint" style="text-align:right"><b>지점 3곳 선택됨</b></div>`)
  + plain({title:"목록에서 감추는 지점",mk:3}, tbl([{t:"감추는 지점"},{t:"이유"}],[
      ["벤더 배송권역이 없는 지점","담을 폴리곤이 없다. 지점 상세의 <b>벤더 배송권역 편집기</b>에서 먼저 만든다"]
    ])
    + `<div class="hint">이미 다른 정책이 쓰는 지점은 <b>감추지 않는다</b> — 회색으로 남긴다 (위 2번).</div>`)
  + `<div class="foot"><span><b>다음 단계</b> 고른 지점들에 붙일 원가 요금제를 고른다 (SCR_POL_004)</span></div>`;}
};

/* ---------------- SCR_POL_004 배송권역 연결 모달 — 2단계 (§4.5) ---------------- */
S.pol4 = {
  grp:"벤더 정책 관리", menu:"벤더 배송권역 정책 관리", axis:"cost", sid:"SCR_POL_004", scr:"연결 모달 2단계", doc:"09",
  notes:[
    {t:"이번에 담은 권역에만 붙는다", d:"1단계에서 고른 지점이 칩으로 보이고, 여기서 고른 요금제가 <b>그 권역 전부에 같은 것으로</b> 붙는다. <b>이미 담겨 있던 권역의 요금제는 건드리지 않는다.</b> 권역별로 다르게 주려면 담은 뒤 연결 권역 표의 `변경`으로 바꿄다.", r:"09 §4.5 · POL-5 · S-2"},
    {t:"조회 대상은 벤더 배송권역 요금제뿐", d:"<b>영업 존 요금제는 조회 대상이 아니다.</b> 판가 축과 원가 축은 섞이지 않는다.", r:"09 §4.5 · §3-1"},
    {t:"금액은 여기서 바꾸지 않는다", d:"요금제명 · 기본 거리 · 기본 원가 · 고정비 · 원가 할증을 <b>조회로만</b> 보여준다. 금액을 바꾸려면 요금 상품 관리로 간다. <b>할증도 여기서 고르지 않는다</b> — 고른 요금제가 가진 할증을 그대로 이어받는다.", r:"09 §4.5 · §3-1"},
    {t:"공유 안내", d:"다른 정책도 같은 요금제를 쓰고 있으면 요금제명 옆에 <span class='kbd'>정책 N개가 함께 사용</span> 을 보여준다. 금액을 고치면 그 정책들이 함께 영향을 받는다는 뜻이다.", r:"09 §4.5"},
    {t:"고르기 전에는 연결이 꺼져 있다", d:"요금제를 고르지 않으면 `연결` 버튼이 꺼져 있고 <span class='kbd'>요금제를 골라주세요</span> 를 보여준다 — 요금제 없는 권역이 담기지 않는다.", r:"09 POL-5"}
  ],
  render(){ return head({
      h:"배송권역 연결 — 2단계 원가 요금제 선택",
      p:"1단계에서 고른 지점들의 권역에 붙일 <b>벤더 배송권역 요금제</b>를 하나 고른다.",
      owner:"공급 담당자", review:"벤더 서버 · 라스트마일 담당 팀"})
  + modal({title:"배송권역 연결",tag:"신규",actions:[{t:"이전"},{t:"연결",off:1}]},
      `<div class="steps"><span>1. 지점 선택</span><span>›</span><b>2. 원가 요금제 선택</b></div>
      <div class="hint g" style="margin:0 0 10px"${note(1)}>» 이번에 새로 담은 배송권역에 붙일 요금제를 고릅니다. 요금제는 권역마다 하나씩 매핑되며, <b>이미 담겨 있던 권역의 요금제는 그대로 둡니다.</b>${mk(1)}</div>
      <div class="tagrow"><span class="tag">부릉 강남2지점</span><span class="tag">부릉 서초지점</span><span class="tag">부릉 마포지점</span></div>
      ${tbl([{t:"요금제명",mk:4},{t:"기본 거리",num:1},{t:"기본 원가",num:1},{t:"고정비",num:1},{t:"원가 할증",mk:3}],[
        ['<b>수도권 표준 원가 요금제 v3</b> <span class="pill warn">정책 2개가 함께 사용</span>',"3.0 km","3,900원","500원","우천 할증 · 심야 할증 · 권역 외 할증"],
        ['수도권 표준 원가 요금제 v2 <span class="pill warn">정책 1개가 함께 사용</span>',"3.0 km","3,700원","500원","우천 할증 · 심야 할증"],
        ["경기남부 원가 요금제","4.0 km","4,300원","700원","우천 할증 · 폭설 할증"],
        ["야간 전용 원가 요금제","2.5 km","4,800원","800원","심야 할증"],
        ["신규 벤더 프로모션 원가 요금제","3.0 km","4,100원","0원",'<span class="dash">-</span>']
      ])}
      <div class="hint" style="margin-top:10px;text-align:right"${note(5)}>요금제를 골라주세요${mk(5)}</div>`)
  + plain({title:"여기서 하지 않는 것",mk:2}, tbl([{t:"하지 않는 것"},{t:"어디서 하나"}],[
      ["금액 · 할증 구성 수정","요금 상품 관리 &gt; 벤더 배송권역 요금제 관리"],
      ["할증 개별 선택","고른 요금제가 가진 할증을 그대로 이어받는다"],
      ["영업 존 요금제 선택","<b>조회 대상이 아니다.</b> 판가는 02 영업존 관리 소관이다"],
      ["벤더 연결","세트 분배 관리 (POL-12)"]
    ]))
  + `<div class="foot"><span><b>연결한 뒤</b> 연결 권역 표에 행이 추가되고, 권역별로 요금제를 바꾸려면 그 행의 <span class="kbd">변경</span>을 쓴다</span></div>`;}
};
