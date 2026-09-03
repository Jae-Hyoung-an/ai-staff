/* ---- 02-2 영업존 등록 ---- */
S.ez2 = {
  grp:"권역 관리", menu:"영업존 관리", axis:"s", sid:"SCR_EZ_002", doc:"02",
  notes:[
    {t:"고르는 것은 지점 하나뿐", d:"지점 1개를 검색해 연결하면 그 지점의 세일즈 권역이 자동으로 따라온다. 벤더존 지점은 세일즈 권역을 1개만 갖기 때문에 고를 것이 없다.", r:"02 EZ-1 · 12 INT-2"},
    {t:"고를 수 없는 지점 네 가지", d:"① 이미 영업존이 있음 ② 세일즈 권역이 없음 ③ 권역이 2개 이상(전환 이전 데이터) ④ 권역이 다른 영업존과 지리적으로 겹침. ①은 목록에서 막고 ②③④는 저장 단계에서 막는다.", r:"02 EZ-4 · §5.3 검사 1-1·2·3·4"},
    {t:"세일즈 권역 선택 삭제 → 조회 전용", d:"고를 것이 하나뿐이라 선택 컨트롤을 두지 않는다. 연결한 지점의 권역이 그대로 표시된다. 이전 안의 라디오 목록과 성북 예시는 없앤다.", r:"02 §5.2 섹션2 · 2026-09-01"},
    {t:"중첩 검사는 지점 권역 편집기로 이관", d:"이 화면에는 저장할 폴리곤이 없다. 겹치는 권역을 만들지 못하게 막는 곳은 지점 권역 편집기이고, 이 화면은 등록 시점 확인과 오류 상태 표시만 한다.", r:"02 EZ-5 · §5.3 · 12 INT-3 · INT-4"},
    {t:"지도는 연결된 권역 하나만", d:"세일즈 권역 + 픽업지 전체 + 배송지 3겹을 그리던 것을 하나로 줄인다. 배송 반경 원과 배송지 레이어는 없앤다.", r:"02 §5.2 섹션3"},
    {t:"배송 반경 설정 삭제", d:"상점의 배송 접수 반경은 기존 상점 설정을 그대로 따른다. 이 화면에서 입력하지 않는다.", r:"02 EZ-7 · S-7"},
    {t:"이력 신설", d:"어느 지점이 연결되었는지와 그 지점의 세일즈 권역 모양이 바뀐 기록을 남긴다. 권역을 이 화면에서 바꾸지 않게 되었으므로 후자가 판가 적용 범위를 되짚는 유일한 입구다.", r:"02 §5.2 섹션4"}
  ],
  render(){ return head({h:"영업존 등록",p:"<b>지점 1개만 고르면 된다.</b> 세일즈 권역은 그 지점의 것이 자동으로 따라오고, 금액은 <b>판가 요금제 관리</b>에서 정한다.",owner:"영업 담당자",review:"권역 서버 담당 팀"})
  + card({title:"기본 정보",axis:"sales"}, form([
      {l:"영업존 이름",req:1,v:"강북 미아"},
      {l:"지점",req:1,mk:1,v:"강북 미아 지점",hint:"» 벤더존 운영방식의 지점만 <b>검색해</b> 연결할 수 있습니다. <b>지점 하나에는 영업존 하나만</b> 만들 수 있으며, 연결한 뒤에는 다른 지점으로 바꿀 수 없습니다. 영업존의 세일즈 권역은 <b>연결한 지점의 권역을 그대로</b> 따릅니다.",g:1}
    ]) + `<div class="pick" style="margin-top:10px"${note(2)}>
      <div class="r on"><span class="radio"></span><b>강북 미아 지점</b><span class="mono">세일즈 권역 1</span><span class="pill ok">선택 가능</span></div>
      <div class="r dis"><span class="radio"></span><span>성북 1 지점</span><span class="mono">세일즈 권역 1</span><span style="font-size:11.5px">이미 영업존 <b>성북 1</b> 이 있습니다</span></div>
      <div class="r dis"><span class="radio"></span><span>노원 상계 지점</span><span class="mono">세일즈 권역 1</span><span style="font-size:11.5px">이미 영업존 <b>노원 상계</b> 가 있습니다</span></div>
      <div class="r dis"><span class="radio"></span><span>중랑 면목 지점</span><span class="mono">세일즈 권역 2</span><span style="font-size:11.5px">권역이 <b>2개 이상</b> — 편집기에서 1개로 정리 필요</span></div>
      <div class="r dis"><span class="radio"></span><span>도봉 창동 지점</span><span class="mono">세일즈 권역 0</span><span style="font-size:11.5px">세일즈 권역이 <b>없습니다</b></span></div>
    </div>
    <div class="hint" style="margin-top:8px">첫 줄만 고를 수 있다. <span class="kbd">세일즈 권역 2</span> 와 <span class="kbd">세일즈 권역 0</span> 은 벤더존 지점 제약(권역 1개)이 적용되기 전 데이터에서만 나타난다. ${mk(2)}</div>`)
  + plain({title:"세일즈 권역",tag:"조회 전용",mk:3,axis:"sales"}, `<div class="body">
      <div class="hint g" style="margin:0 0 12px">» 영업존의 세일즈 권역은 <b>연결한 지점의 권역을 그대로</b> 따릅니다. 권역의 모양은 <b>지점 권역 편집기</b>에서 관리합니다.</div>
      ${form([
        {l:"권역명",ro:1,v:"미아 zone"},
        {l:"포함 법정동",ro:1,v:"18"},
        {l:"면적",ro:1,v:"9.7 km²"}
      ])}
      <div class="hint" style="margin-top:10px"><b>선택 컨트롤을 두지 않는다.</b> 벤더존 지점은 세일즈 권역을 1개만 갖도록 바뀌어(12 INT-2) 고를 것이 하나뿐이고, 이 화면에서 폴리곤을 입력하지 않으므로 <b>중첩을 만들 수 있는 경로가 지점 권역 편집기 하나로 좁혀진다</b>. ${mk(3)}</div>
      <div style="margin-top:12px"${note(4)}>${banner("warn","중첩", "이 지점의 세일즈 권역이 <b>노원 상계 지점</b>의 <b>상계 zone</b>(영업존: 노원 상계)과 지리적으로 겹칩니다. <b>지점 권역 편집기</b>에서 중첩을 해소한 뒤 등록해주세요 — 이 화면에서는 해소할 수 없습니다." + mk(4))}</div>
    </div>`)
  + plain({title:"지도 · 지역 목록",mk:5,axis:"sales"}, `<div class="body">${MAP_EZ}
      <div class="maplegend"><span><i style="background:var(--sales)"></i>영업존 권역 (연결된 것)</span><span><i style="background:var(--line-2)"></i>다른 영업존 권역</span><span class="strike">배송지 레이어</span><span class="strike">배송 반경 원</span></div>
      <div class="hint" style="margin-top:10px">지점을 아직 고르지 않았으면 <span class="kbd">지점을 선택하면 세일즈 권역이 지도에 표시됩니다.</span> 를 보여준다. 지역 목록 라벨은 <span class="kbd">지역종류</span> / <span class="strike">픽업지명</span> <b>지역명</b> 으로 바로잡고, <b>연결된 권역</b>에 포함된 지역만 보여준다. 행정동·법정동 전환은 유지한다.</div>
    </div>`)
  + card({title:"이 화면에서 없어지는 것",mk:6}, tbl([{t:"없어지는 것"},{t:"대신"}],[
      ['<span class="strike">세일즈 권역 선택 컨트롤</span> <span class="pill stop">2026-09-01</span>',"연결한 지점의 권역이 자동으로 따라온다. 벤더존 지점은 권역을 1개만 갖는다 (12 INT-2)"],
      ['<span class="strike">상점 배송 반경 설정 섹션</span>',"기존 상점 설정을 그대로 따른다. 이 화면에서 입력하지 않는다"],
      ['<span class="strike">상점 판매권역 섹션</span>',"영업존은 세일즈 권역만 구성한다"],
      ['<span class="strike">지도의 반경 원</span>',"그리지 않는다"],
      ['<span class="strike">배송지(도착권역) 부분</span>',"도착권역 개념 폐기"]
    ]))
  + plain({title:"이력",tag:"신규",mk:7,actions:[{t:"삭제"},{t:"목록으로"},{t:"저장",pri:1}]},
      tbl([{t:"일시",mono:1},{t:"변경한 사람"},{t:"바뀐 것"}],[
        ["2026-08-24 14:02","김지점","연결 지점의 세일즈 권역 모양 변경 (9.2 → 9.7 km², 법정동 16 → 18)"],
        ["2026-08-11 09:30","김영업","영업존 생성 · 지점 <b>강북 미아 지점</b> 연결"]
      ])
      + `<div class="body" style="padding-top:0"><div class="hint">권역을 이 화면에서 바꾸지 않게 되었으므로, <b>판가가 어떤 땅에 적용되었는지를 되짚는 입구는 첫 줄(권역 모양 변경 기록)뿐이다.</b></div></div>`);}
};
