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
    {t:"세일즈 권역 컴럼", d:"어떤 권역에 판가가 걸려 있는지 목록에서 바로 보이게 한다. 용어는 세일즈 권역으로 통일했다.", r:"00 §5.1 · 02 §5.1"},
    {t:"판가 요금제 컴럼", d:"요금제 쪽 목록의 대상 존 수가 0으로 보이는 결함 때문에 존 쪽에서 거꿗로 보여준다. 연결이 없으면 강조한다.", r:"02 §5.1"},
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
