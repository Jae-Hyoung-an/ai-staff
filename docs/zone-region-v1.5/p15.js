/* ---- 10 세트 분배 ---- */
S.set = {
  grp:"벤더 정책 관리", menu:"세트 분배 관리", axis:"c", sid:"SCR_SET_001", doc:"10",
  notes:[
    {t:"한 줄이 권역 하나", d:"기준 축이 존에서 벤더 배송권역으로 바뀐다. 목록의 한 행이 권역 하나다.", r:"10 SET-1 · §2"},
    {t:"정책명을 함께 보여준다", d:"권역은 정책 1개에만 속하므로 항상 하나로 정해진다. 벤더를 붙이는 순간 그 벤더가 받을 원가가 정해지므로 미리 보여준다.", r:"10 §2 · §5.2"},
    {t:"저장이 연결을 겸한다", d:"벤더를 추가하는 것이 연결, 빼는 것이 해제다. 벤더 소속을 지정하는 별도 화면은 만들지 않는다.", r:"10 SET-4 · §1"},
    {t:"권역에 없는 벤더는 이 화면에 안 나온다", d:"어느 권역에도 연결되지 않은 벤더를 찾으려면 11. 벤더 관리의 「권역 미연결」 필터를 쓴다.", r:"10 §5.1 · 11 S-2"}
  ],
  render(){ return head({h:"세트 분배 목록",p:"권역마다 어떤 벤더가 몇 세트를 담당하는지를 관리한다. <b>이 화면의 저장이 벤더 연결을 겸한다.</b>",owner:"공급 담당자",review:"벤더 서버 · 라스트마일 담당 팀"})
  + banner("warn","새 역할","세트 수를 정하는 것만이 아니라 <b>어느 벤더가 이 권역에 소속되는가를 정하는 자리</b>가 된다. 벤더 소속을 지정하는 별도 화면은 만들지 않는다."+mk(3))
  + plain({title:"검색"},`<div class="body" style="padding-bottom:0">${filters([{l:"배송권역명",p:"입력"},{l:"정책명",p:"전체",sel:1},{l:"벤더명",p:"입력"},{l:"연결 상태",p:"전체",sel:1}],[{t:"조회",pri:1}])}</div>`)
  + plain({title:"배송권역별 세트 분배",axis:"cost",mk:1},
      `<div class="body" style="padding-bottom:0">${chips([{t:"총",n:"87건",k:"total"},{t:"벤더 미연결",n:"9건",k:"alert"}])}</div>` +
      tbl([{t:"배송권역명"},{t:"연동 지점"},{t:"정책명",mk:2},{t:"연결 벤더 수",num:1},{t:"수행 세트 수",num:1},{t:"예약"}],[
        ['<span class="lnk" data-go="set2">성북 북부</span>',"성북 1 지점","서울 북부 A","3","46",'<span class="dash">-</span>'],
        ['<span class="lnk" data-go="set2">성북 남부</span>',"성북 1 지점","서울 북부 A","2","28",'<span class="dash">-</span>'],
        ['<span class="lnk" data-go="set2">미아 전역</span>',"강북 미아 지점","서울 북부 A","4","61",'<span class="pill new">09-01 발효</span>'],
        ['<span class="lnk" data-go="set2">면목 전역</span>',"중랑 면목 지점","서울 동부 B",'<span class="dash hot">0</span>','<span class="dash hot">0</span>','<span class="dash">-</span>'],
        ['<span class="lnk" data-go="set2">상계 동부</span>',"노원 상계 지점",'<span class="dash hot">-</span>','<span class="dash hot">0</span>','<span class="dash hot">0</span>','<span class="dash">-</span>']
      ]))
  + card({title:"여기에 안 나오는 것",mk:4},
      `<div class="hint" style="margin:0">이 화면은 <b>권역 기준</b>이라, 어느 권역에도 연결되지 않은 벤더는 어느 행에도 나오지 않는다. 등록만 해 두고 붙이는 걸 잊은 벤더를 찾으려면 <span class="lnk" data-go="ven">11. 벤더 관리</span>에서 <b>연결 상태 = 권역 미연결</b> 로 걸러야 한다.</div>`);}
};
