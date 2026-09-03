S.vdr2 = {
  grp:"권역 관리", menu:"벤더 배송권역 관리", axis:"c", sid:"SCR_VDR_002", doc:"03",
  notes:[
    {t:"고르는 것은 지점 하나뿐", d:"지점 1개를 검색해 연결하면 그 지점의 공급권역이 자동으로 따라온다. 벤더존 지점은 공급권역을 1개만 갖기 때문에 고를 것이 없다. 공급권역을 고르던 두 번째 단계는 없앤다.", r:"03 VDR-5 · §5.2 · 12 INT-2"},
    {t:"차단 기준이 지점으로 바뀐다", d:"「사용 중인 공급권역」이 아니라 「이미 배송권역이 있는 지점」을 지점 선택 목록에서 막는다. 지점 : 배송권역 = 1:1이다.", r:"03 VDR-4 · 검사 3 · 2026-09-01"},
    {t:"중첩은 지점 권역 편집기가 막는다", d:"공급권역 폴리곤끼리 지리적으로 겹치는 것은 이 화면이 아니라 지점 권역 편집기에서 저장이 차단된다. 이 화면은 폴리곤을 입력하지 않는다.", r:"03 VDR-4 · 12 INT-3 · INT-4"},
    {t:"교체는 막는다", d:"같은 배송권역이 시점에 따라 다른 지역을 가리키면 과거 정산이 어느 지역 실적인지 알 수 없다. 바꾸려면 새로 만든다 — 운영 빈도 확인 필요.", r:"03 §5.2 · 8"},
    {t:"모양은 여기서 못 고친다", d:"원본 공급권역과 항상 같은 모양을 유지한다. 원본이 바뀌면 이 권역도 함께 바뀌고, 쓰는 정책·벤더에게 알린다.", r:"03 VDR-2 · VDR-3 · VDR-7"},
    {t:"연결 상태 섹션", d:"권역을 만들어도 정책·벤더가 붙지 않으면 아무 일도 일어나지 않는다. 어디가 빠졌는지 보이지 않으면 운영자가 모른다.", r:"03 §5.2 섹션4"}
  ],
  render(){ return head({h:"벤더 배송권역 상세",p:"모양을 그리는 것이 아니라 <b>지점의 공급권역을 가리키는 것</b>이다. <b>지점 1개만 고르면</b> 공급권역이 자동으로 따라온다. 벤더 연결과 세트 수는 세트 분배 관리에서 정한다.",owner:"공급 담당자",review:"권역 서버 담당 팀"})
  + card({title:"기본 정보",axis:"cost"}, form([
      {l:"배송권역명",req:1,v:"성북 북부",hint:"공급권역명과 같지 않아도 된다. 운영자가 벤더에게 설명하기 쉬운 이름을 붙이는 자리다."},
      {l:"연동 지점",req:1,mk:1,v:"성북 1 지점",hint:"» <b>검색해서 1개를 고릅니다.</b> 지점을 고르면 그 지점의 공급권역이 자동으로 연결됩니다. <b>이미 배송권역이 있는 지점은 선택할 수 없습니다</b> — 지점 하나에는 배송권역 하나만 만들 수 있습니다.",g:1}
    ]) + `<div class="pick" style="margin-top:10px"${note(2)}>
      <div class="r on"><span class="radio"></span><b>성북 1 지점</b><span class="mono">공급권역 1</span><span class="pill ok">선택 가능</span></div>
      <div class="r dis"><span class="radio"></span><span>성북 2 지점</span><span class="mono">공급권역 1</span><span style="font-size:11.5px">이미 배송권역 <b>성북 남부</b> 가 있습니다</span></div>
      <div class="r dis"><span class="radio"></span><span>강북 미아 지점</span><span class="mono">공급권역 2</span><span style="font-size:11.5px">공급권역이 <b>2개 이상</b> — 편집기에서 1개로 정리 필요</span></div>
      <div class="r dis"><span class="radio"></span><span>도봉 창동 지점</span><span class="mono">공급권역 0</span><span style="font-size:11.5px">공급권역이 <b>없습니다</b></span></div>
    </div>
    <div class="hint" style="margin-top:8px"><span class="strike">「그 지점의 공급권역이 모두 사용 중」</span> 이 아니라 <b>「이미 배송권역이 있는 지점」</b> 으로 막는다. 아래 두 줄은 벤더존 지점 제약(공급권역 1개)이 적용되기 전 데이터에서만 나타난다. ${mk(2)}</div>`)
  + plain({title:"연동 공급권역",tag:"조회 전용",mk:3,axis:"cost"}, `<div class="body">
      <div class="hint g" style="margin:0 0 12px">» 배송권역은 지점 공급권역을 불러와서만 만들 수 있습니다. 폴리곤을 직접 그리거나 편집할 수 없습니다. <b>연결한 지점의 공급권역이 그대로 들어옵니다.</b></div>
      ${form([
        {l:"공급권역명",ro:1,v:"성북 1 공급"},
        {l:"면적",ro:1,v:"12.4 km²"},
        {l:"포함 법정동",ro:1,v:"36"}
      ])}
      <div class="hint" style="margin-top:10px">» 등록한 뒤에는 <b>다른 공급권역으로 바꿀 수 없습니다.</b> 바꿔야 하면 새 배송권역을 만드세요. ${mk(4)}</div>
      <div class="hint">공급권역끼리 지리적으로 겹치는 것은 이 화면이 아니라 <b>지점 권역 편집기</b>에서 저장이 막힌다. ${mk(3)}</div>
    </div>`)
  + card({title:"이 화면에서 없어지는 것",mk:2}, tbl([{t:"없어지는 것"},{t:"대신"}],[
      ['<span class="strike">공급권역 선택 컨트롤 (2단계 선택)</span> <span class="pill stop">2026-09-01</span>',"지점 1개를 고르면 그 지점의 공급권역이 자동으로 연결된다 (12 INT-2)"],
      ['<span class="strike">「이미 사용 중인 공급권역입니다」 차단</span>',"「이 지점에는 이미 배송권역 {배송권역명}이 있습니다」 — 지점 단위로 막는다"],
      ['<span class="strike">「선택 가능한 공급권역이 없습니다」 빈 목록</span>',"「이 지점에는 공급권역이 없습니다」 — 편집기에서 먼저 만들도록 안내"],
      ['<span class="strike">중첩 정책 열</span>',"중첩이 성립하지 않으므로 항상 빈 값이 된다"]
    ]))
  + plain({title:"지도",tag:"조회 전용",mk:5,axis:"cost"},`<div class="body">${MAP_VDR}
      <div class="maplegend"><span><i style="background:var(--cost)"></i>이 배송권역</span><span><i style="background:var(--line-2)"></i>다른 배송권역</span><span><i style="background:var(--sales);opacity:.45"></i>영업존 (겹쳐 보기)</span><span><i style="background:var(--warn-bg);border:1px dashed var(--warn)"></i>어느 권역에도 없는 지역</span></div>
      <div class="hint">» 모양을 바꾸려면 <b>지점 권역 편집기</b>에서 원본 공급권역을 수정해야 합니다. 이웃 권역과 사이의 빈 지역은 <b>벤더가 배송하지 않는 지역</b>이 됩니다.</div>
    </div>`)
  + plain({title:"연결 상태",tag:"조회 전용",mk:6,axis:"cost"},
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
