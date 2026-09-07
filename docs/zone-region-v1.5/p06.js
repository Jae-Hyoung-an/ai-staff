/* ---- 04 권역 시각화 ---- */
S.vis = {
  grp:"권역 관리", menu:"권역 시각화", axis:"", sid:"SCR_VIS_001", doc:"04",
  notes:[
    {t:"조회 전용", d:"이 화면은 아무 값도 저장하지 않는다. 문제를 보고 상세로 건너가는 동선이다.", r:"04 §5.1"},
    {t:"레이어 4종 — 기준 권역과 운영용 권역을 가른다", d:"권역 폴리곤이 네 종류로 갈라졌다. 요금제 판단에 쓰는 <b>기준 권역</b>은 실선, 오더 접수 판단에 쓰는 <b>운영용 권역</b>은 점선으로 그린다. 영업 축은 빨강 계열, 공급 축은 파랑 계열이다.", r:"04 §5.3 · 00 §5.1"},
    {t:"중첩 구간은 정상 상태다", d:"벤더 기준 권역끼리는 <b>겹치는 것이 정상</b>이다 — 징검다리로 이어 붙여 권역 외 오더를 줄이는 것이 목적이다. 영업 기준 권역끼리만 겹치지 않는다. <b>표현 방식은 미결</b> — 겹칠수록 진하게 / 겹친 수를 숫자로 중 하나를 정한다.", r:"04 §5.3 · 03 VDR-4 · 13 U-2 · U-3"},
    {t:"연결이 빠진 권역을 찾는 자리", d:"정책이나 벤더가 붙지 않은 권역은 빗금으로 그린다. 이 화면을 보는 이유가 대개 그것이다.", r:"04 §5.3 · S-1"},
    {t:"빈 지역 — 지표로 승격, 표현 범위는 미결", d:"어느 벤더 기준 권역에도 없는 땅의 오더는 프렌즈행이므로 그 면적이 운영 판단 재료가 된다. 다만 전국에서 권역 합집합을 뺀 차집합을 그리는 부담이 커서 <b>지도에 어디까지 표현할지는 정해지지 않았다.</b>", r:"04 §5.3 · 13 F-17"},
    {t:"벤더별로 색을 나누지 않는다", d:"벤더 수만큼 색을 만들면 지도를 알아보기 어렵다. 필터로 좁혀서 본다.", r:"04 S-2"},
    {t:"CM·CMR은 P1", d:"권역이 손해를 내고 있는지를 지도에서 바로 보는 기능. 집계 기준과 하한선이 정해지지 않아 초기 범위에서 제외한다.", r:"04 §5.6 · §8"}
  ],
  render(){ return head({h:"권역 시각화",p:"영업존과 벤더 배송권역을 지도 한 장에서 본다. <b>설정은 하지 않고 보는 용도</b>다.",owner:"영업·공급 담당자 공통",review:"권역 서버 담당 팀"})
  + plain({title:"필터",mk:1},`<div class="body" style="padding-bottom:0">${filters([
      {l:"표시 대상",v:"전체",sel:1},{l:"지점",p:"전체",sel:1},{l:"벤더",p:"전체",sel:1,mk:6},
      {l:"배송권역 정책",p:"전체",sel:1},{l:"연결 상태",v:"정책 미연결",sel:1,mk:4}
    ],[{t:"적용",pri:1},{t:"초기화"}])}</div>`)
  + `<div class="gridsplit">
      <div>${plain({},`${MAP_VIS}<div class="maplegend">
        <span${note(2)}><i style="background:var(--sales)"></i>영업 기준 권역 <small>실선</small>${mk(2)}</span>
        <span${note(2)}><i style="background:var(--cost)"></i>벤더 기준 권역 <small>실선</small></span>
        <span${note(2)}><i style="background:repeating-linear-gradient(90deg,var(--sales),var(--sales) 3px,transparent 3px,transparent 6px)"></i>운영용 세일즈 권역 <small>점선</small></span>
        <span${note(2)}><i style="background:repeating-linear-gradient(90deg,var(--cost),var(--cost) 3px,transparent 3px,transparent 6px)"></i>공급권역 <small>점선</small></span>
        <span${note(3)}><i style="background:var(--cost);opacity:.55"></i>중첩 구간 — 표현 방식 미결${mk(3)}</span>
        <span${note(4)}><i style="background:repeating-linear-gradient(45deg,var(--warn),var(--warn) 2px,transparent 2px,transparent 5px)"></i>연결 없음 (정책·벤더 없음)${mk(4)}</span>
        <span${note(5)}><i style="background:var(--surface-3);border:1px dashed var(--line-2)"></i>빈 지역 — 표현 범위 미결${mk(5)}</span>
      </div>`)}
      ${card({title:"집계와 내려받기",right:'<button class="btn sm">표로 내려받기</button>'},
        chips([{t:"영업존",n:"128건",k:"total"},{t:"배송권역",n:"87건",k:"total"},{t:"정책 미연결",n:"6건",k:"alert"},{t:"벤더 미연결",n:"9건",k:"alert"}])
        + `<div class="hint">지도 이미지가 아니라 <b>지금 거른 결과의 권역 목록</b>을 내려받는다.</div>`)}
      </div>
      <div class="side">
        <h4>지도에 그려진 권역 · 12</h4>
        ${[["성북 북부","서울 북부 A · 벤더 3 · 2겹","c"],["성북 동부","서울 동부 B · 벤더 2 · 2겹","c"],["성북 남부","서울 북부 A · 벤더 2","c"],["미아 전역","서울 북부 A · 벤더 4","c"],["상계 동부","정책 미연결 · 벤더 0","w"],["면목 전역","서울 동부 B · 벤더 0","w"],["성북 1","영업 기준 권역 · G4 통합 A","s"],["강북 미아","영업 기준 권역 · G4 통합 B","s"]]
          .map(([a,b,k])=>`<div class="row"><span class="axis ${k==="w"?"":k}" style="${k==="w"?"background:var(--warn)":""}"></span><span class="g"><b>${a}</b><small>${b}</small></span><span class="pill ${k==="w"?"warn":"mute"}">${k==="w"?"연결 없음":"정상"}</span></div>`).join("")}
        <div class="hint">연결이 빠진 권역을 위로 올린다 — 이 화면을 보는 이유가 대개 그것이기 때문이다.</div>
      </div>
    </div>`
  + card({title:"중첩 구간을 어떻게 그릴 것인가",tag:"미결",tagk:"warn",mk:3},
      `<div class="hint" style="margin:0">벤더 기준 권역끼리 겹치는 것은 <b>오류가 아니라 의도한 상황</b>이다 — 징검다리로 이어 붙여 권역 외 오더를 줄이려는 것이므로, 이 화면은 <b>몇 겹인지</b>를 보여줘야 한다. 지금 목업은 겹친 구간을 진한 면으로 칠하고 <b>2겹</b>이라 적었다. ⓐ 겹칠수록 진하게 ⓑ 겹친 수를 숫자로 — 둘 중 하나를 정해야 한다.<br><b>완전히 같은 모양이거나 한쪽이 다른 쪽을 품는 경우</b>는 중첩 자체는 허용이지만 운영 실수일 수 있어, 지도에서 알아볼 수 있게 그린다. 경고를 둘지는 미결이다.</div>`)
  + card({title:"CM · CMR 표시",tag:"P1 · 초기 범위 제외",tagk:"mute",mk:7},
      `<div class="hint" style="margin:0">권역별 최근 1주 CM·CMR과 하한선 이탈 여부를 색으로 표시한다. <b>집계 기준과 하한선이 정해지지 않아</b> 초기 범위에서 제외한다. 이것이 없는 동안에는 권역을 만들고 나서 그 권역이 잘 돌아가는지를 이 화면에서 알 수 없다.</div>`);}
};
