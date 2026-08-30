S.sp2 = {
  grp:"요금 상품 관리", menu:"판가 요금제 관리", axis:"s", sid:"SCR_SP_002", doc:"05",
  notes:[
    {t:"거리별 판가 구간", d:"첫 구간의 시작은 기본 거리를 이어받고, 그 다음부터는 직전 구간의 종료 값을 이어받는다. 사람이 직접 적지 않는다.", r:"05 SP-4"},
    {t:"영업존 직접 매핑", d:"영업존당 판가 요금제는 1개다. 이미 다른 요금제가 적용된 영업존은 고를 수 없다.", r:"05 SP-1 · SP-2"},
    {t:"권역 외 할증은 여기에 없다", d:"권역 외 할증은 원가에만 가산하고 판가에는 반영하지 않는다.", r:"05 SP-6 · 01 §4"},
    {t:"탭으로 나누지 않는다", d:"한 화면에 섹션을 나열한다. 요금 상품 4종이 같은 구조를 쓴다.", r:"05 SP-5"}
  ],
  render(){ return head({h:"판가 요금제 상세",p:"금액과 적용 대상을 한 화면에서 정한다. 이 요금제가 <b>어떤 오더에 붙는지</b>는 산정 관문 세 가지를 통과해야 정해진다.",owner:"영업 담당자",review:"핀테크 팀"})
  + card({title:"기본 정보",axis:"sales",mk:4}, form([
      {l:"요금제명",req:1,v:"G4 통합 A"},{l:"기본 거리",req:1,v:"3.0 km"},{l:"기본 판가",req:1,v:"4,500 원"},{l:"사용 여부",req:1,v:"사용"}
    ]))
  + plain({title:"거리별 판가",mk:1,axis:"sales"}, tbl([{t:"구간"},{t:"시작",num:1},{t:"종료",num:1},{t:"추가 금액",num:1},{t:""}],[
      ["1","3.0 km <span class='pill mute'>기본 거리 이어받음</span>","4.0 km","600 원","<span class='btn sm'>삭제</span>"],
      ["2","4.0 km <span class='pill mute'>직전 종료 값 이어받음</span>","6.0 km","1,400 원","<span class='btn sm'>삭제</span>"],
      ["3","6.0 km","9.0 km","2,600 원","<span class='btn sm'>삭제</span>"]
    ]) + `<div class="body" style="padding-top:0"><button class="btn sm">구간 추가</button><div class="hint">거리 상한 단일 필드는 두지 않는다. <b>마지막 구간의 종료 값이 상한 역할</b>을 한다.</div></div>`)
  + plain({title:"적용 영업존",mk:2,axis:"sales"}, tbl([{t:"영업존"},{t:"지점명"},{t:"세일즈 권역"},{t:"상태"},{t:""}],[
      ["성북 1","성북 1 지점","성북 1 zone",P.ok,"<span class='btn sm'>제외</span>"],
      ["성북 2","성북 2 지점","성북 2 zone",P.ok,"<span class='btn sm'>제외</span>"],
      ["강북 미아","강북 미아 지점","미아 zone",'<span class="pill warn">통합요금제 미지정</span>',"<span class='btn sm'>제외</span>"]
    ]) + `<div class="body" style="padding-top:0"><button class="btn sm">영업존 추가</button><div class="hint">영업존당 판가 요금제는 <b>1개</b>다. 이미 다른 요금제가 적용된 영업존은 고를 수 없고 어느 요금제가 쓰는지 보여준다.</div></div>`)
  + plain({title:"적용 판가 할증",axis:"sales",actions:[{t:"삭제"},{t:"목록으로"},{t:"저장",pri:1}]},
      tbl([{t:"할증명"},{t:"종류"},{t:"판가 금액",num:1},{t:"적용 조건"},{t:""}],[
        ["우천 할증","기상","1,000 원","강수 1단계 이상","<span class='btn sm'>해제</span>"],
        ["심야 할증","요일·시간대","1,500 원","매일 22:00–02:00","<span class='btn sm'>해제</span>"],
        ["주말 피크","요일·시간대","1,000 원","토·일 17:00–21:00","<span class='btn sm'>해제</span>"],
        ["명절 특수","특수","2,000 원","수동 ON/OFF","<span class='btn sm'>해제</span>"]
      ]) + `<div class="body" style="padding-top:0"${note(3)}><div class="hint">할증 화면에서 골라도 여기에 반영된다 (양방향). <b>권역 외 할증은 이 목록에 나오지 않는다</b> — 원가에만 가산하고 판가에는 반영하지 않는다.${mk(3)}</div></div>`);}
};
