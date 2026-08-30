/* ---- 11 벤더 관리 ---- */
S.ven = {
  grp:"벤더 정책 관리", menu:"벤더 관리", axis:"c", sid:"SCR_VEN_001", doc:"11",
  notes:[
    {t:"검색 기준이 바뀐다", d:"소속 존으로 거르던 것을 소속 벤더 배송권역으로 거른다. 라벨은 「배송권역」.", r:"11 §2 · §5.1"},
    {t:"권역 미연결 필터", d:"등록만 해 두고 붙이지 않은 벤더를 찾는 유일한 곳이다. 세트 분배 화면은 권역 기준이라 이 벤더들이 안 나온다.", r:"11 §5.1 · S-2"},
    {t:"세트 수 컬럼", d:"그 권역에서 이 벤더가 받는 세트 수. 누르면 세트 분배 상세로 간다.", r:"11 §5.1"},
    {t:"소속은 여기서 못 바꾼다", d:"입력란을 두지 않고 「세트 분배에서 변경」 버튼만 둔다. 등록 화면에도 소속을 고르는 칸이 없다.", r:"11 VEN-3 · §5.2"}
  ],
  render(){ return head({h:"벤더 목록",p:"벤더를 등록하고 상태를 관리하며, 그 벤더가 <b>어느 배송권역에 속하는지</b>를 보여준다. 소속을 바꾸는 것은 10에서 한다.",owner:"공급 담당자",review:"벤더 서버 담당 팀"})
  + plain({title:"검색",mk:1},`<div class="body" style="padding-bottom:0">${filters([
      {l:"벤더명",p:"입력"},{l:"사업자번호",p:"입력"},
      {l:"배송권역",p:"전체",sel:1,mk:1},{l:"정책명",p:"전체",sel:1},
      {l:"연결 상태",v:"권역 미연결",sel:1,mk:2},{l:"상태",p:"전체",sel:1}
    ],[{t:"조회",pri:1}])}</div>`)
  + plain({title:"벤더",right:'<button class="btn pri">벤더 등록</button>',axis:"cost"},
      `<div class="body" style="padding-bottom:0">${chips([{t:"총",n:"64건",k:"total"},{t:"권역 미연결",n:"7건",k:"alert",mk:2}])}</div>` +
      tbl([{t:"벤더명"},{t:"사업자번호",mono:1},{t:"소속 배송권역",mk:1},{t:"정책명"},{t:"세트 수",num:1,mk:3},{t:"소속 기사 수",num:1},{t:"상태"}],[
        ['<span class="lnk" data-go="ven2">라이더스코리아</span>',"123-45-67890","성북 북부","서울 북부 A","20","28",'<span class="pill ok">운영중</span>'],
        ['<span class="lnk" data-go="ven2">퀵메이트</span>',"234-56-78901","성북 북부","서울 북부 A","16","19",'<span class="pill ok">운영중</span>'],
        ['<span class="lnk" data-go="ven2">동부로지스</span>',"345-67-89012","면목 전역","서울 동부 B","0","31",'<span class="pill ok">운영중</span>'],
        ['<span class="lnk" data-go="ven2">서울퀵서비스</span>',"456-78-90123",'<span class="dash hot">-</span>','<span class="dash hot">-</span>','<span class="dash hot">0</span>',"22",'<span class="pill ok">운영중</span>'],
        ['<span class="lnk" data-go="ven2">남부딜리버리</span>',"567-89-01234",'<span class="dash">-</span>','<span class="dash">-</span>',"0","0",'<span class="pill stop">해지</span>']
      ]))
  + banner("stop","주의","<b>서울퀵서비스</b>는 기사가 22명 있는데 어느 배송권역에도 연결되어 있지 않다. <b>계약은 되었는데 물량이 가지 않는 상태</b>다. 세트 분배 관리에서 권역에 연결해야 한다."+mk(2));}
};
