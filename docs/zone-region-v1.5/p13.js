/* ---- 09 배송권역 정책 ---- */
S.pol = {
  grp:"벤더 정책 관리", menu:"배송권역 정책 관리", axis:"c", sid:"SCR_POL_001", doc:"09",
  notes:[
    {t:"상태는 자동 판단", d:"권역이 1개 이상 있고 원가 요금제를 골랐는가로 정해진다. 손으로 켜거나 멈출 수 없다.", r:"09 POL-6 · §2"},
    {t:"미활성이면 사유를 함께 적는다", d:"바꾸라고 보여주는 게 아니라 왜 안 돌고 있는지를 알려주려고 둔다.", r:"09 §5.1"},
    {t:"삭제·활성·비활성 버튼 없음", d:"멈추려면 권역 매핑을 비운다. 상태는 자동 판단 결과라 손으로 꺼도 조건이 충족되면 다시 켜진다.", r:"09 POL-8 · S-3"},
    {t:"예약 적용", d:"발효 일시를 지정해 둔다. 정책당 예약은 하나다. 같은 권역을 두 정책이 예약하면 발효 시점에 이중 소속이 되므로 예약 단계에서 막는다.", r:"09 POL-9 · 검사 6"}
  ],
  render(){ return head({h:"배송권역 정책 목록",p:"벤더 배송권역들을 묶어, 그 권역들이 공통으로 쓸 <b>원가 요금제</b>와 <b>슬롯별 단위물량·보상</b>을 정한다.",owner:"공급 담당자",review:"벤더 서버 · 라스트마일 담당 팀"})
  + plain({title:"검색"},`<div class="body" style="padding-bottom:0">${filters([{l:"정책명",p:"입력"},{l:"배송권역명",p:"입력"},{l:"벤더명",p:"입력"},{l:"원가 요금제",p:"전체",sel:1},{l:"상태",p:"전체",sel:1,mk:1}],[{t:"조회",pri:1}])}</div>`)
  + plain({title:"배송권역 정책",right:'<button class="btn pri">정책 등록</button>',axis:"cost",mk:3},
      tbl([{t:"정책명"},{t:"배송권역 수",num:1},{t:"연결 벤더 수",num:1},{t:"원가 요금제"},{t:"활성 슬롯",num:1},{t:"상태",mk:2},{t:"예약",mk:4}],[
        ['<span class="lnk" data-go="pol2">서울 북부 A</span>',"3","9","북부 표준 원가 A","14",P.ok,'<span class="dash">-</span>'],
        ['<span class="lnk" data-go="pol2">서울 동부 B</span>',"2","0","동부 표준 원가 B","14",P.ok,'<span class="pill new">09-01 00:00 발효</span>'],
        ['<span class="lnk" data-go="pol2">서울 서부 C</span>',"2","4","북부 표준 원가 A","10",P.ok,'<span class="dash">-</span>'],
        ['<span class="lnk" data-go="pol2">경기 남부 D</span>',"1","2",'<span class="dash hot">-</span>',"0",'<span class="pill stop">미활성</span><span class="sub">요금제 미선택</span>','<span class="dash">-</span>'],
        ['<span class="lnk" data-go="pol2">신규 정책 (작성 중)</span>','<span class="dash hot">0</span>',"0",'<span class="dash hot">-</span>',"0",'<span class="pill stop">미활성</span><span class="sub">권역 없음 · 요금제 미선택</span>','<span class="dash">-</span>']
      ]))
  + card({title:"상태를 손으로 못 바꾸는 이유",mk:3},
      `<div class="hint" style="margin:0">상태는 <b>권역 ≥ 1 이고 원가 요금제를 골랐는가</b>로 자동 판단한다. 손으로 꺼도 조건이 충족되면 다시 켜지므로 버튼이 거짓말을 하게 된다. 설정을 멈추고 싶으면 <b>권역 매핑을 비운다.</b> 화면에 남는 것은 <span class="strike">활성화</span> <span class="strike">비활성화</span> <span class="strike">삭제</span> 가 아니라 <b>왜 안 돌고 있는지에 대한 설명</b>이다.</div>`);}
};
