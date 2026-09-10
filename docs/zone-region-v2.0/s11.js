/* =====================================================================
   11. 벤더 관리 — 벤더 정책 관리 > 벤더 관리
   근거: [PRD] 존·권역 구조 개편 v2.0 / 11. 벤더 관리 §4
   화면 4장 — SCR_VEN_001 목록 · SCR_VEN_002 등록·상세
              SCR_VEN_003 소속기사 탭 · SCR_VEN_004 해지 경고 모달
   기존 메뉴다. 바뀌는 것은 소속의 축 하나 — 존 → 벤더 배송권역.
   QA2에 상세가 거의 PRD대로 올라와 있고, 목록의 소속 기사 수만 빠져 있다.
   ===================================================================== */

/* 벤더 상태 — 대기 / 운영중 / 운영중지 / 해지 (VEN-8) */
const V = {
  wait:'<span class="pill mute">대기</span>',
  on  :'<span class="pill ok">운영중</span>',
  off :'<span class="pill mute">운영중지</span>',
  end :'<span class="pill stop">해지</span>'
};

/* ---------------- SCR_VEN_001 벤더 목록 (§4.2) ---------------- */
S.ven = {
  grp:"벤더 정책 관리", menu:"벤더 관리", axis:"c", sid:"SCR_VEN_001", scr:"벤더 목록", doc:"11",
  notes:[
    {t:"검색 조건 — 라벨이 바뀜고 둘이 늘다", d:"<span class='strike'>소속 Zone</span> → <b>배송권역</b>으로 라벨과 대상이 바뀌다. 여기에 <b>정책명</b>(권역을 거쳐 파생된 값)과 <b>연결 상태</b>(권역 연결 / 권역 미연결)가 늘다. 벤더명 · 상태는 그대로다.", r:"11 §4.2"},
    {t:"권역 미연결 N건 — 이 화면에만 있다", d:"<b>세트 분배 목록에서는 찾을 수 없는 정보다.</b> 그 화면은 권역 기준이라 어느 권역에도 없는 벤더는 어느 행에도 나오지 않는다. 등록만 해두고 붙이는 걸 잃으면 <b>계약은 되었는데 물량이 안 가는</b> 상황이 되는데, 그걸 잡는 장치는 여기뿐이다.", r:"11 §4.2 · S-2"},
    {t:"소속 배송권역 (컴럼 변경 · 링크)", d:"<span class='strike'>존</span> 자리다. 연결이 없으면 <b>미연결</b>을 강조해 보여준다. 누르면 <b>그 권역을 담고 있는 정책 상세</b>로 이동한다(새 탭).", r:"11 §4.2 · VEN-1"},
    {t:"정책명 (신설)", d:"그 권역이 속한 정책이다. <b>권역을 알면 하나로 정해진다.</b> 권역이 없으면 <span class='kbd'>-</span>. QA2에는 권역은 있는데 정책명이 <span class='kbd'>-</span>인 행이 있다 — 정책에 담기지 않은 권역에 벤더가 붙어 있는 상태로, <b>10 SET-2대로면 생기지 않아야 할 데이터</b>다.", r:"11 §4.2 · 10 SET-2"},
    {t:"세트 수 (신설 · 링크)", d:"그 권역에서 이 벤더가 받는 세트 수다. 누르면 <b>세트 분배 상세</b>로 이동한다(새 탭). 없으면 <span class='kbd'>-</span>.", r:"11 §4.2 · → 10"},
    {t:"소속 기사 수 (신설 · 링크)", d:"이 벤더에 속한 기사 수. 누르면 <b>소속기사 탭</b>으로 간다. <b>권역 미연결 벤더에서는 그 수만큼 오더를 못 받고 있다는 뜻</b>이라 미연결 목록의 처리 순서를 정하는 기준이 된다. <b>QA2 목록에는 이 컴럼이 없다</b> — 개발과 맞춰야 할 차이다.", r:"11 §4.2 · VEN-7"},
    {t:"등록은 그대로 남는다", d:"<span class='kbd'>＋ 추가</span>는 기존과 같다. 다만 <b>등록만으로는 아무 오더도 받지 못한다</b> — 세트 분배에서 권역에 붙여야 동작한다 (S-1).", r:"11 §4.2 · VEN-3"}
  ],
  render(){ return head({
      h:"벤더 목록",
      p:"벤더를 등록하고 상태를 관리하며, 그 벤더가 <b>어느 벤더 배송권역에 속하는지</b>를 보여준다. <b>소속을 바꾸는 것은 세트 분배 관리에서 한다.</b>",
      owner:"공급 담당자", review:"벤더 서버 담당 팀"})
  + `<div${note(1)}>${srch([
      {l:"벤더명",p:"입력"},
      {l:"배송권역",p:"전체",sel:1},
      {l:"정책명",p:"전체",sel:1},
      {l:"연결 상태",p:"전체",sel:1},
      {l:"상태",p:"전체",sel:1}
    ])}${mk(1)}</div>`
  + plain({title:"벤더",axis:"cost"},
      chips([
        {t:"총",n:"13건",k:"total"},
        {t:"권역 미연결",n:"3건",k:"alert",mk:2}
      ]) +
      tbl([{t:"벤더 코드",num:1},{t:"사업자명(벤더명)"},{t:"상태"},{t:"소속 배송권역",mk:3},{t:"정책명",mk:4},{t:"세트 수",num:1,mk:5},{t:"소속 기사 수",num:1,mk:6},{t:"벤더장"},{t:"등록일",mono:1}],[
        ["14",'<span class="lnk" data-go="ven2">부롱 강남 벤더</span>',V.on,ext("강남 벤더 배송권역 A"),ext("수도권 벤더 운영정책 v3"),'<span class="lnk">5개</span>','<span class="lnk" data-go="ven3">24명</span>',"A벤더장","2026-09-01"],
        ["13",'<span class="lnk" data-go="ven2">강남 라이더스</span>',V.on,ext("서초 벤더 배송권역"),ext("수도권 벤더 운영정책 v3"),'<span class="lnk">4개</span>','<span class="lnk">18명</span>',"강연_벤더장","2026-08-10"],
        ["12",'<span class="lnk" data-go="ven2">역삼 물류</span>',V.on,'<span class="dash hot">미연결</span>','<span class="dash">-</span>','<span class="dash">-</span>','<span class="lnk">11명</span>','<span class="dash">-</span>',"2026-08-06"],
        ["11",'<span class="lnk" data-go="ven2">논현 딜리버리</span>',V.on,ext("강남 벤더 배송권역 A"),ext("수도권 벤더 운영정책 v3"),'<span class="lnk">3개</span>','<span class="lnk">9명</span>',"구이유나","2026-07-22"],
        ["10",'<span class="lnk" data-go="ven2">노원 퀵서비스</span>',V.off,ext("노원 벤더 배송권역"),ext("경기남부 벤더 운영정책"),'<span class="lnk">0개</span>','<span class="lnk">6명</span>',"현준테스트A","2026-07-07"],
        ["9",'<span class="lnk" data-go="ven2">마이그테스트 벤더</span>',V.end,ext("영등포 벤더 배송권역"),ext("수도권 벤더 운영정책 v2"),'<span class="lnk">3개</span>','<span class="lnk">0명</span>','<span class="dash">-</span>',"2026-06-15"],
        ["8",'<span class="lnk" data-go="ven2">kms벤더4</span>',V.on,'<span class="dash hot">미연결</span>','<span class="dash">-</span>','<span class="dash">-</span>','<span class="lnk">3명</span>',"kms벤더장","2026-06-02"],
        ["4",'<span class="lnk" data-go="ven2">테스트 벤더</span>',V.off,'<span class="dash hot">미연결</span>','<span class="dash">-</span>','<span class="dash">-</span>','<span class="lnk">0명</span>','<span class="dash">-</span>',"2026-05-28"]
      ]) +
      listbar("추가","총 13건"))
  + `<div class="foot"${note(7)}><span><b>그대로</b> 벤더 코드 · 사업자명 · 상태 · 벤더장 · 등록일 · ＋추가</span><span><b>변경</b> 존 → 소속 배송권역</span><span><b>신설</b> 정책명 · 세트 수 · 소속 기사 수 · 권역 미연결 필터</span><span class="strike">소속 Zone 검색</span>${mk(7)}</div>`;}
};

/* ---------------- SCR_VEN_002 벤더 등록 · 상세 (§4.3) ---------------- */
S.ven2 = {
  grp:"벤더 정책 관리", menu:"벤더 관리", axis:"c", sid:"SCR_VEN_002", scr:"벤더 등록 · 상세", doc:"11",
  notes:[
    {t:"이 문서의 유일한 실질 변경", d:"사업자 · 정산 · VO · 첨부 파일 · 소속기사 탭은 <b>그대로 둔다.</b> 바뀌는 것은 <b>소속의 축 하나</b> — 벤더가 속하는 대상이 존에서 벤더 배송권역으로 바뀌고, 그 결과 계약 정보에서 한 칸이 빠지고 섬션 하나가 둘다.", r:"11 §1 · §4.3"},
    {t:"계약 정보에서 소속 Zone을 빼다", d:"<span class='strike'>소속 Zone</span> 입력란은 <b>Spec-out</b>이다. 소속을 정하는 자리가 세트 분배로 옥겨졌으므로 이 화면에는 고르는 칸이 없다. <span class='kbd'>상태</span>도 아래 소속 권역 섬션으로 옥긴다.", r:"11 §4.3 섬션3 · VEN-3"},
    {t:"소속 권역 (신설 · 조회 전용)", d:"<b>소속 배송권역 · 연동 지점 · 속한 정책 · 적용 원가 요금제 · 이 권역에서 받는 세트 수 · 상태</b> 여섯을 보여준다. 배송권역 · 정책 · 요금제 · 세트 수는 각각 해당 상세로 이동한다(새 탭).", r:"11 §4.3 섬션4"},
    {t:"바꾸는 자리는 여기가 아니다", d:"입력란을 두지 않고 <span class='kbd'>세트 분배에서 변경</span> 버튼으로 <b>세트 분배의 해당 권역 상세</b>로 보낸다. 소속을 바꾸는 저장은 기사 소속 지점까지 옥기므로 그 화면에서만 일어난다 (10 SET-4).", r:"11 §4.3 섬션4 · VEN-3"},
    {t:"연결이 없으면 배너를 띄운다", d:"<span class='kbd'>이 벤더는 어느 배송권역에도 연결되어 있지 않아, 소속 기사가 오더를 받지 못합니다.</span> 등록은 됐지만 <b>기사가 지점에 배치된 채 오더를 못 받는 상태</b>임을 이 자리에서 알린다.", r:"11 §4.3 섬션4 · VEN-7"},
    {t:"원가 금액은 적지 않는다", d:"<b>요금제명만</b> 보여준다. 금액은 요금 상품 관리에서 본다. 벤더가 「우리는 어떤 조건이냐」고 물어오면 여기서 요금제명을 눌러 따라간다 (S-3).", r:"11 §4.3 섬션4 · S-3"},
    {t:"VO 규칙 두 가지", d:"<b>대기 → 운영중 전환에는 벤더장(VO) 지정이 필수</b>다(VEN-8). 여기에 구현이 지키고 있는 규칙 둘을 문서에도 명문화했다 — ① <b>운영중 상태에서는 VO를 해제할 수 없고 교체만 가능</b>하다 ② <b>타 벤더의 VO 기사는 선택할 수 없다</b>(서버에서 제한).", r:"11 §4.3 저장 검사 · VEN-8"},
    {t:"등록할 때는 소속 칸이 없다", d:"등록만 해 두면 <b>대기 · 권역 미연결</b> 상태로 남는다. 등록을 마치면 <span class='kbd'>세트 분배에서 권역에 연결하기</span>를 다음 할 일로 안내한다. <b>QA2 등록 화면에는 그 안내가 아직 없다.</b>", r:"11 §4.3 등록할 때 · S-1"},
    {t:"해지는 되돌릴 수 없다", d:"<span class='kbd'>대기 → 운영중 ↔ 운영중지 → 해지</span>. 권역에 연결된 벤더나 소속 기사가 있는 벤더를 해지하려 하면 <b>먼저 경고 모달</b>이 뜸다 (SCR_VEN_004).", r:"11 VEN-8 · §4.5"}
  ],
  render(){ return head({
      h:"강남 라이더스",
      p:"벤더 조회 — 사업자 · 정산 · 계약 정보와 <b>소속 권역(조회 전용)</b>. 소속을 바꾸는 입력란은 두지 않는다.",
      owner:"공급 담당자", review:"벤더 서버 담당 팀"})

  + `<div id="sec-head">`
  + tabs(["기본정보","소속기사","변경 이력"],"기본정보")
  + `<div${note(1)} style="margin-top:14px">${banner("ok","그대로", "사업자 정보 · 정산 정보 · 벤더장(VO) · 첨부 파일 · 소속기사 탭은 <b>이번 개편에서 바뀌지 않는다.</b> 바뀌는 것은 <b>소속의 축 하나</b> — 계약 정보에서 「소속 Zone」이 빠지고, 「소속 권역」 섬션이 둔다." + mk(1))}</div>`
  + `</div>`

  + `<div id="sec-biz">`
  + card({title:"사업자 정보",tag:"그대로",tagk:"mute"}, form([
      {l:"사업자등록번호",req:1,v:"124-53-53534"},
      {l:"사업자명(벤더명)",req:1,v:"강남 라이더스"},
      {l:"대표자명",req:1,v:"김강연"},
      {l:"연락처",req:1,v:"010-1234-1234"},
      {l:"이메일",req:1,v:"gn.riders@example.com"}
    ]))
  + card({title:"정산 정보",tag:"그대로",tagk:"mute"}, form([
      {l:"정산 은행",req:1,v:"경남은행"},
      {l:"정산 계좌번호",req:1,v:"123-4537-45353"},
      {l:"정산 예금주",req:1,v:"강남 라이더스"}
    ]))
  + `</div>`

  /* 섬션 3 — 계약 정보 */
  + `<div id="sec-contract">`
  + card({title:"계약 정보",tag:"변경",tagk:"warn",mk:2}, form([
      {l:"계약 시작일",p:"YYYY-MM-DD"},
      {l:"계약 종료일",p:"YYYY-MM-DD"},
      {l:"소속 Zone",html:'<div class="field ro"><span class="strike">부롱 강끨2존</span> &nbsp;<span class="pill stop">Spec-out</span></div>',hint:"<b>입력란을 없액다.</b> 소속을 정하는 자리는 세트 분배 관리다 (VEN-3)"},
      {l:"상태",html:'<div class="field ro"><span class="strike">운영중</span> &nbsp;<span class="pill warn">아래 소속 권역 섬션으로 이동</span></div>'}
    ]))
  + `</div>`

  /* 섬션 4 — 소속 권역 */
  + `<div id="sec-region">`
  + card({title:"소속 권역",tag:"신설 · 조회 전용",tagk:"new",mk:3,axis:"cost"},
      `<div class="hint g" style="margin:0 0 14px">» 벤더의 소속 배송권역은 세트 분배 관리에서 정해집니다. 이 화면에서는 결과만 보여드립니다.</div>`
      + form([
        {l:"소속 배송권역",ro:1,html:'<div class="field ro">'+ext("서초 벤더 배송권역")+'</div>',hint:"그 권역을 담고 있는 <b>정책 상세</b>로 이동한다"},
        {l:"연동 지점",ro:1,html:'<div class="field ro">'+ext("부롱 서초지점")+'</div>',hint:"이 벤더 소속 기사의 지점이 여기로 동기화된다 (VEN-6)"},
        {l:"속한 정책",ro:1,html:'<div class="field ro">'+ext("수도권 벤더 운영정책 v3")+'</div>'},
        {l:"적용 원가 요금제",ro:1,html:'<div class="field ro">'+ext("수도권 표준 원가 요금제 v3")+'</div>',hint:"<b>요금제명만 보여주고 금액은 적지 않는다</b> — 금액은 요금 상품 관리에서 본다",mk:6},
        {l:"이 권역에서 받는 세트 수",ro:1,html:'<div class="field ro">'+ext("4개")+'</div>',hint:"세트 분배 상세로 이동한다"},
        {l:"상태",ro:1,html:'<div class="field ro">'+V.on+'</div>',hint:"계약 정보에서 이 자리로 옥겨왔다"}
      ])
      + `<div class="actions" style="justify-content:flex-start;padding-left:0"${note(4)}><button class="btn">세트 분배에서 변경</button>${mk(4)}</div>`
      + `<div class="hint">바꿀 수 없다. 이 버튼은 <b>세트 분배의 해당 권역 상세</b>로 보낼 뿐이다.</div>`)
  + plain({title:"연결이 없을 때",mk:5}, `<div class="body">
      ${banner("stop","경고","이 벤더는 어느 배송권역에도 연결되어 있지 않아, <b>소속 기사가 오더를 받지 못합니다.</b>")}
      <div style="margin-top:12px">${form([
        {l:"소속 배송권역",ro:1,html:'<div class="field ro"><span class="dash hot">미연결</span></div>'},
        {l:"연동 지점",ro:1,html:'<div class="field ro"><span class="dash">-</span></div>'},
        {l:"속한 정책",ro:1,html:'<div class="field ro"><span class="dash">-</span></div>'},
        {l:"적용 원가 요금제",ro:1,html:'<div class="field ro"><span class="dash">-</span></div>'}
      ])}</div>
      <div class="hint">그 기사들은 <b>지점에는 배치되어 있으나 모든 오더에서 배차 후보에서 제외된다</b> (VEN-7). 지점별 기사 수 통계에는 잡히고 실적에는 안 잡힌다.</div>
    </div>`)
  + `</div>`

  /* 섬션 5·6 */
  + `<div id="sec-vo">`
  + card({title:"벤더장 (VO) 지정 / 해제",tag:"그대로",tagk:"mute",mk:7}, form([
      {l:"벤더장 선택",ro:1,v:"강연_벤더장 (010-1234-1234)"},
      {l:"벤더장 연락처",ro:1,v:"010-1234-1234"},
      {l:"벤더장 지정일",ro:1,v:"2026-08-10"}
    ])
    + `<div class="hint g" style="margin-top:10px">» 벤더 기사로 등록 가능한 기사 중에서만 검색됩니다(이름 또는 연락처). <b>타 벤더 VO 기사는 서버에서 선택이 제한됩니다.</b></div>
       <div class="hint g">» <b>운영중(ACTIVE) 상태에서는 VO 해제 불가.</b> 교체만 가능합니다. 해제하려면 먼저 운영중지로 변경하세요.</div>
       <div class="hint">위 두 줄은 <b>구현이 이미 지키고 있는 규칙</b>인데 문서에 없았다 — PRD §4.3 저장 검사표에 명문화했다.</div>`)
  + card({title:"첨부 파일",tag:"그대로",tagk:"mute"}, tbl([{t:"구분"},{t:"파일"},{t:""}],[
      ["사업자등록증",'<span class="lnk">사업자등록증_강남라이더스.pdf</span>','<button class="btn sm">파일 선택</button>'],
      ["계약서",'<span class="lnk">계약서_2026.pdf</span>','<button class="btn sm">파일 선택</button>'],
      ["통장 사본",'<span class="dash">-</span>','<button class="btn sm">파일 선택</button>'],
      ["신분증 사본",'<span class="dash">-</span>','<button class="btn sm">파일 선택</button>']
    ]))
  + `</div>`

  + plain({title:"저장할 때 검사하는 것"}, tbl([{t:"#",mono:1},{t:"상황"},{t:"화면이 하는 일"}],[
      ["1","권역에 연결된 벤더를 <b>해지</b>로 바꿈","<b>먼저 경고한다</b> — 연결된 권역명을 보여주고 세트 분배에서 해제해야 함을 알린다 (SCR_VEN_004)"],
      ["2","소속 기사가 있는 벤더를 해지","<b>기사 수를 보여주고 확인을 받는다.</b> 같은 모달에서 함께 보여준다"],
      ["3","소속 권역을 이 화면에서 바꾸려 함","<b>입력란이 없다.</b> <span class='kbd'>세트 분배에서 변경</span> 버튼만 있다"],
      ["4","대기 → 운영중 전환","<b>벤더장(VO)이 지정되어 있어야 한다.</b> 기존 규칙 그대로다"],
      ["5","운영중 상태에서 VO 해제","<b>막는다.</b> 교체만 가능하다 — 해제하려면 먼저 운영중지로 바꿔다"],
      ["6","타 벤더의 VO 기사를 벤더장으로 선택","<b>후보에 나오지 않는다.</b> 서버에서 제한한다"]
    ]))
  + plain({title:"저장 흐름",tag:"신설",tagk:"new"}, `<div class="body">
      <div class="steps" style="font-size:13.5px"><span class="kbd">저장</span><span>&rsaquo;</span><b>사유 입력</b><span style="color:var(--dim)">모든 저장</span><span>&rsaquo;</span><span>저장됨</span></div>
      <div class="hint" style="margin-top:10px">09 · 10 · 11이 <b>같은 저장 · 이력 구조</b>를 쓨다 (루트 「공통 규칙 — 저장과 변경 이력」). 사유는 <b>공란을 허용하지 않는다.</b> 11에는 조건부 고지 모달이 없어 사유 입력 한 단계뿐이다 — <b>예약 저장도 없다.</b></div>
    </div>`)
  + bar([{t:"운영 중지",off:1},{t:"해지",off:1},{t:"목록으로"},{t:"저장",pri:1}])
  + `<div class="foot"${note(8)}><span><b>탭</b> 기본정보 / 소속기사 / 변경 이력</span><span class="strike">계약 정보의 소속 Zone</span><span><b>신설</b> 소속 권역 섬션 · 세트 분배에서 변경</span><span><b>등록 화면</b> 소속 칸 없음 — 등록 후 「세트 분배에서 연결하기」 안내</span>${mk(8)}</div>`;}
};

/* ---------------- SCR_VEN_003 소속기사 탭 (§4.4) ---------------- */
S.ven3 = {
  grp:"벤더 정책 관리", menu:"벤더 관리", axis:"c", sid:"SCR_VEN_003", scr:"소속기사 탭", doc:"11",
  notes:[
    {t:"기존 그대로다", d:"기사 소속 등록 · 소속 기사 표 · 해제. <b>이번 개편으로 화면이 바뀌지는 않는다.</b> 다만 기사 소속 지점이 자동 동기화되므로 그 결과가 이 탭 뒤에서 움직인다.", r:"11 §4.4"},
    {t:"소속 지점은 여기서 고치는 값이 아니다", d:"기사의 소속 지점은 <b>소속 벤더가 속한 벤더 배송권역의 지점</b>으로 자동 동기화된다. 벤더가 권역을 옥기면 따라 움직이고, 권역과 분리되면 기존 지점을 유지한다. <b>컴럼으로 두지는 않는다</b> — 소속 지점은 기사 현황 화면에서 본다.", r:"11 VEN-6 · §4.4"},
    {t:"동기화가 일어나는 네 경우", d:"① 기사가 <b>소속 벤더를 바꾸면</b> 새 벤더의 권역 지점으로 자동 이동 ② 벤더가 <b>권역을 옥기면</b> 따라 이동 ③ 벤더가 <b>권역과 분리되면</b> 기존 지점 유지 ④ 벤더가 <b>처음부터 미연결이면</b> 운영이 지정한 지점에 수동 배치. <b>파생값이 아니라 저장값인 이유가 ③·④</b>다.", r:"11 VEN-6"},
    {t:"타 벤더 소속 기사는 등록되지 않는다", d:"<b>벤더 기사로 등록 가능한 기사 중에서만</b> 검색된다. 이미 다른 벤더에 소속된 기사는 서버에서 등록이 제한된다.", r:"QA2 구현 — PRD 근거 없음, 개발 확인 필요"},
    {t:"벤더가 미연결이면", d:"기사들은 운영이 지정한 지점에 배치된 채로 남고 <b>오더는 받지 못한다.</b> 지점별 기사 수 통계에는 잡히고 실적에는 안 잡힌다. 배치는 <b>기존 기사 관리 화면에서 한다</b> — 이 문서가 새 입구를 만들지 않는다 (VEN-7).", r:"11 VEN-7"}
  ],
  render(){ return head({
      h:"강남 라이더스 — 소속기사",
      p:"기존 그대로다. 이번 개편으로 <b>기사 소속 지점이 자동 동기화</b>되므로(VEN-6) 그 결과가 이 탭에 반영된다.",
      owner:"공급 담당자", review:"벤더 서버 담당 팀"})
  + `<div id="sec-head">`
  + tabs(["기본정보","소속기사","변경 이력"],"소속기사")
  + `</div>`
  + `<div id="sec-agents">`
  + card({title:"기사 소속 등록",tag:"그대로",tagk:"mute",mk:4},
      `<div class="frow" style="max-width:760px"><dt>기사 검색</dt><dd><div style="display:flex;gap:10px;align-items:flex-end"><div class="field ph" style="flex:1">이름 또는 연락처로 검색</div><button class="btn pri">소속 등록</button></div><div class="hint">벤더 기사로 등록 가능한 기사 중에서만 검색된다. <b>타 벤더에 이미 소속된 기사는 서버에서 등록이 제한된다.</b></div></dd></div>`)
  + plain({title:"소속 기사",tag:"총 5명",tagk:"mute",mk:1},
      tbl([{t:"NO",num:1},{t:"기사명"},{t:"연락처",mono:1},{t:"소속 상태"},{t:"등록일",mono:1},{t:""}],[
        ["1","강연_벤더장 <span class=\"pill new\">VO</span>","010-1234-1234",'<span class="pill ok">ACTIVE</span>',"2026-08-10",'<button class="btn sm">해제</button>'],
        ["2","김강연","010-1234-1234",'<span class="pill ok">ACTIVE</span>',"2026-09-02",'<button class="btn sm">해제</button>'],
        ["3","qa2기15","010-1234-1234",'<span class="pill ok">ACTIVE</span>',"2026-09-02",'<button class="btn sm">해제</button>'],
        ["4","강연_부적합","010-1234-1234",'<span class="pill ok">ACTIVE</span>',"2026-09-02",'<button class="btn sm">해제</button>'],
        ["5","강연_대기","010-1234-1234",'<span class="pill ok">ACTIVE</span>',"2026-09-02",'<button class="btn sm">해제</button>']
      ]))
  + `</div>`
  + plain({title:"기사 소속 지점이 움직이는 네 경우",mk:3,axis:"cost"},
      tbl([{t:"#",mono:1},{t:"무슨 일이 있었나"},{t:"소속 지점"}],[
        ["①","기사가 <b>소속 벤더를 바꾸다</b>","새 벤더가 속한 권역의 지점으로 <b>자동 이동</b>"],
        ["②","벤더가 <b>다른 권역으로 옥겨졌다</b> (10 세트 분배 저장)","<b>따라 이동</b> — 저장 시 ① 영향 고지 모달이 이 인원을 보여준다"],
        ["③","벤더가 <b>권역과 분리됐다</b> (세트 분배에서 삭제 · 09에서 권역 해제)","<b>기존 지점을 유지</b>한다"],
        ["④","벤더가 <b>처음부터 미연결</b>이다","운영이 지정한 지점에 <b>수동 배치</b> — <b>기존 기사 관리 화면</b>에서 한다 (VEN-7)"]
      ]))
  + `<div class="foot"${note(5)}><span><b>이 탭에서 고치는 값이 아니다</b> — 소속 지점은 벤더의 권역을 따라간다</span><span><b>수동 배치</b> 기존 기사 관리 화면에서 한다 (VEN-7)</span><span><b>미결 ④</b> 기사 소속 지점 이동 이력 (13 F-6)</span>${mk(5)}</div>`;}
};

/* ---------------- SCR_VEN_004 해지 경고 모달 (§4.3 저장 검사 1·2) ---------------- */
S.ven4 = {
  grp:"벤더 정책 관리", menu:"벤더 관리", axis:"c", sid:"SCR_VEN_004", scr:"해지 경고", doc:"11",
  notes:[
    {t:"해지는 되돌릴 수 없다", d:"<span class='kbd'>대기 → 운영중 ↔ 운영중지 → 해지</span>. <b>해지에서는 되돌아올 수 없으므로</b> 누르기 전에 무엇이 남아 있는지 한 번에 보여준다.", r:"11 VEN-8 · §4.5"},
    {t:"두 검사를 한 모달에 모은다", d:"§4.3 저장 검사 <b>1(권역에 연결된 벤더)</b>과 <b>2(소속 기사가 있는 벤더)</b>는 같은 순간에 확인해야 할 정보다. 09 · 10처럼 모달로 처리하되 <b>단계를 나누지 않고 한 화면에</b> 모은다.", r:"11 §4.3 저장 검사 1·2"},
    {t:"권역 연결은 자동으로 풀리지 않는다", d:"<span class='kbd'>이 벤더는 {배송권역명}에 연결되어 있습니다. 해지하면 세트 분배에서 연결을 해제해야 합니다.</span> — <b>해지가 연결을 대신 끓어주지 않는다.</b> 세트 분배로 가서 행을 빼고 저장해야 한다.", r:"11 §4.3 저장 검사 1 · §4.5"},
    {t:"기사는 수를 보여주고 확인만 받는다", d:"기사 소속 처리는 <b>기존 절차를 따른다</b> — 이 모달이 기사를 옥기지 않는다. 몇 명이 걸려 있는지만 알리고, <b>소속 지점은 그대로 유지된다</b>는 것을 함께 적는다 (VEN-6 ③).", r:"11 §4.3 저장 검사 2 · VEN-6"},
    {t:"막는 모달이 아니다", d:"<span class='kbd'>해지</span>를 누르면 해지된다. <b>정리 순서를 알려주는 장치</b>지 차단 장치가 아니다. 다만 되돌릴 수 없으므로 확인 버튼에 해지라고 적어 무엇을 하는지 분명히 한다.", r:"11 §4.5"}
  ],
  render(){ return head({
      h:"해지 경고 모달",
      p:"<span class='kbd'>해지</span>를 누른 직후 뜸다. <b>권역 연결</b>과 <b>소속 기사</b> 두 가지를 한 화면에 모아 보여주고 확인을 받는다.",
      owner:"공급 담당자", review:"벤더 서버 담당 팀"})
  + modal({title:"벤더를 해지하시겠습니까?",tag:"신규",tagk:"stop",actions:[{t:"취소"},{t:"해지",pri:1}]},
      `<div class="hint g" style="margin:0 0 12px"${note(1)}>» <b>해지는 되돌릴 수 없습니다.</b> 아래를 확인한 뒤 진행하세요.${mk(1)}</div>
      <div${note(3)}>${tbl([{t:"확인할 것"},{t:"현재"},{t:"해지하면"}],[
        ["소속 배송권역",'<span class="lnk">서초 벤더 배송권역</span>',"<b>자동으로 풀리지 않습니다.</b> 세트 분배 관리에서 이 벤더 행을 빼고 저장해야 합니다"],
        ["그 권역의 세트 수","4개","해제하기 전까지는 세트가 이 벤더에 배정된 채로 남습니다"],
        ["소속 기사","<b>18명</b>","<b>소속 지점은 그대로 유지됩니다.</b> 기사 소속 처리는 기존 절차를 따릅니다"],
        ["벤더장(VO)","강연_벤더장","해지 전에 정리합니다"]
      ])}${mk(3)}</div>
      <div class="statemsg" style="margin-top:12px"${note(4)}>이 벤더는 <b>서초 벤더 배송권역</b>에 연결되어 있습니다. 해지하면 <b>세트 분배에서 연결을 해제</b>해야 합니다.${mk(4)}</div>`)
  + card({title:"상태 전이",mk:2}, `<div class="steps" style="font-size:13.5px"><span class="pill mute">대기</span><span>›</span><span class="pill ok">운영중</span><span>↔</span><span class="pill mute">운영중지</span><span>›</span><span class="pill stop">해지</span></div>
      <div class="hint" style="margin-top:10px">대기 → 운영중에는 <b>벤더장(VO) 지정이 필수</b>다 (VEN-8). <b>해지에서는 되돌릴 수 없다.</b> 운영중지는 세트 할당을 회수하되 기사 소속은 유지한다.</div>`)
  + plain({title:"연결된 벤더를 해지한 뒤에 할 일"}, tbl([{t:"순서",mono:1},{t:"어디서"},{t:"무엇을"}],[
      ["1","10. 세트 분배 관리 → 서초 벤더 배송권역","이 벤더 행을 <span class='kbd'>삭제</span>하고 저장한다 — 그 저장이 연결 해제다"],
      ["2","저장 확인 모달","<b>기사 N명은 소속 지점을 그대로 유지합니다</b>로 뜸다 (09 POL-13)"],
      ["3","11. 벤더 관리","이 벤더는 <span class='dash hot'>미연결</span> · <span class='pill stop'>해지</span> 상태로 목록에 남는다 — <b>벤더는 삭제하지 않는다</b>"]
    ]))
  + `<div class="foot"${note(5)}><span><b>액션</b> 취소 · 해지 — 막는 모달이 아니라 정리 순서를 알려주는 모달이다</span><span><b>벤더는 삭제하지 않는다</b> 상태 전이로만 다루다 (VEN-8)</span>${mk(5)}</div>`;}
};
