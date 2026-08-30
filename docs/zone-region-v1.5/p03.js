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
  render(){ return head({h:"영업존 등록",p:"지점을 고르고 그 지점의 세일즈 권역 하나를 고르면 된다. 금액은 <b>판가 요금제 관리</b>에서 정한다.",owner:"영업 담당자",review:"권역 서버 담당 팀"})
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
