S.set2 = {
  grp:"벤더 정책 관리", menu:"세트 분배 관리", axis:"c", sid:"SCR_SET_002", doc:"10",
  notes:[
    {t:"붙이기 전에 원가를 보여준다", d:"벤더를 이 권역에 붙이는 순간 그 벤더가 받을 원가가 정해진다. 어느 요금제가 붙는지 모른 채 붙이게 하면 안 된다.", r:"10 §5.2 섹션1"},
    {t:"추가 후보는 미연결 벤더만", d:"한 벤더는 권역 1곳에만 속한다. 해지·운영중지 벤더도 후보에서 제외한다.", r:"10 SET-3 · SET-5"},
    {t:"다른 권역에 있는 벤더를 어떻게 보여줄까 — 미결", d:"아예 숨기면 깔끔하지만 「없네」와 「어딘가에 있네」가 구분되지 않는다. 회색으로 두고 연결된 권역을 적으면 어디서 빼와야 하는지 바로 안다.", r:"10 §5.2 · 13 F-10"},
    {t:"이동은 두 단계", d:"한 번에 바꿀 수 없다. 원래 권역에서 빼고 새 권역에서 추가한다. 그 사이 그 벤더의 기사는 어느 권역의 후보도 아니다.", r:"10 S-2"},
    {t:"세트 0도 넣을 수 있다", d:"연결은 되어 있지만 세트를 받지 않는 상태다.", r:"10 §5.2 섹션2"}
  ],
  render(){ return head({h:"세트 분배 상세",p:"이 권역에 어떤 벤더가 몇 세트를 담당하는지를 정한다. <b>저장하면 벤더의 소속 권역도 함께 바뀐다.</b>",owner:"공급 담당자",review:"벤더 서버 · 라스트마일 담당 팀"})
  + card({title:"권역 정보",tag:"조회 전용",mk:1,axis:"cost"}, form([
      {l:"배송권역",ro:1,v:"성북 북부"},{l:"연동 지점",ro:1,v:"성북 1 지점"},
      {l:"속한 정책",ro:1,v:"서울 북부 A"},{l:"적용 원가 요금제",ro:1,v:"북부 표준 원가 A · 기본원가 3,200 원",
        hint:"벤더를 이 권역에 붙이는 순간 <b>그 벤더가 받을 원가가 정해진다.</b> 어느 요금제가 붙는지 모른 채 붙이게 하지 않는다."}
    ]))
  + plain({title:"벤더별 세트 수",axis:"cost",right:'<button class="btn sm">벤더 추가</button>',mk:2},
      tbl([{t:"벤더명"},{t:"소속 기사 수",num:1},{t:"세트 수",num:1,mk:5},{t:"상태"},{t:""}],[
        ["라이더스코리아","28","20",P.ok,"<span class='btn sm'>제거</span>"],
        ["퀵메이트","19","16",P.ok,"<span class='btn sm'>제거</span>"],
        ["북부로지스","14","10",P.ok,"<span class='btn sm'>제거</span>"],
        ["<b>합계</b>","<b>61</b>","<b>46</b>","",""]
      ]) + `<div class="body" style="padding-top:0"><div class="hint g">» 이 화면에서 저장하면 <b>벤더의 소속 권역도 함께 바뀝니다.</b> 벤더를 추가하는 것이 연결, 제거하는 것이 해제입니다.<br>» 한 벤더는 배송권역 한 곳에만 속합니다. 다른 권역에 연결된 벤더는 선택할 수 없습니다.</div></div>`)
  + plain({title:"벤더 추가",tag:"선택 목록",mk:3},`<div class="body">
      <div class="pick">
        <div class="r"><span class="radio"></span><b>서울퀵서비스</b><span class="mono">기사 22</span><span class="pill ok">선택 가능</span></div>
        <div class="r"><span class="radio"></span><b>한강배송</b><span class="mono">기사 9</span><span class="pill ok">선택 가능</span></div>
        <div class="r dis"><span class="radio"></span><span>동부로지스</span><span class="mono">기사 31</span><span style="font-size:11.5px"><b>면목 전역</b>에 연결됨</span></div>
        <div class="r dis"><span class="radio"></span><span>남부딜리버리</span><span class="mono">기사 0</span><span style="font-size:11.5px">해지 상태</span></div>
      </div>
      <div class="banner warn" style="margin-top:11px"><span class="k">미결</span><div><b>다른 권역에 연결된 벤더를 어떻게 보여줄 것인가.</b> ⓐ 아예 목록에서 감춘다 — 깔끔하지만 「그 벤더가 없네」와 「어딘가에 있네」가 구분되지 않는다. ⓑ 위처럼 회색으로 두고 연결된 권역을 적는다 — 어디서 빼와야 하는지 바로 안다. 지금 목업은 ⓑ 로 그렸다.</div></div>
    </div>`)
  + card({title:"벤더를 다른 권역으로 이동할 때",mk:4,tag:"두 단계",tagk:"warn"},
      tbl([{t:"단계"},{t:"하는 일"},{t:"그 사이 상태"}],[
        ["1","원래 권역에서 그 벤더 행을 <b>제거</b>하고 저장","그 벤더는 <b>어느 권역에도 속하지 않는다.</b> 소속 기사는 배차 후보에서 빠진다"],
        ["2","새 권역에서 <b>벤더 추가</b>로 넣고 저장","새 권역의 정책 원가를 받기 시작한다"]
      ]) + `<div class="hint"><b>1번과 2번 사이에 공백이 생긴다.</b> 그 동안 그 벤더의 기사는 제안이 뚝 멈춘다. 한산한 시간대에 하거나 예약 저장으로 두 권역의 발효 시각을 맞춰야 한다 — <b>화면이 이걸 도와주지는 않는다.</b></div>`);}
};
