S.vdr2 = {
  grp:"권역 관리", menu:"벤더 배송권역 관리", axis:"c", sid:"SCR_VDR_002", doc:"03",
  notes:[
    {t:"지점 선택 → 공급권역 선택", d:"두 단계다. 지점을 먼저 고르면 그 지점의 공급권역 목록이 나오고 그중 하나를 고른다. 저장되는 것은 고른 공급권역이다.", r:"03 VDR-5 · §5.2"},
    {t:"모두 사용 중이면 목록이 빈다", d:"「이 지점에는 이미 배송권역이 있습니다」로 막지 않는다. 그 지점의 공급권역이 전부 사용 중일 때만 고를 것이 없다.", r:"03 §5.2 · 검사 4"},
    {t:"교체는 막는다", d:"같은 배송권역이 시점에 따라 다른 지역을 가리키면 과거 정산이 어느 지역 실적인지 알 수 없다. 바꾸려면 새로 만든다 — 운영 빈도 확인 필요.", r:"03 §5.2 · 8"},
    {t:"모양은 여기서 못 고친다", d:"원본 공급권역과 항상 같은 모양을 유지한다. 원본이 바뀌면 이 권역도 함께 바뀌고, 쓰는 정책·벤더에게 알린다.", r:"03 VDR-2 · VDR-3 · VDR-7"},
    {t:"연결 상태 섹션", d:"권역을 만들어도 정책·벤더가 붙지 않으면 아무 일도 일어나지 않는다. 어디서 끕겼는지 보이지 않으면 운영자가 모른다.", r:"03 §5.2 섹션4"}
  ],
  render(){ return head({h:"벤더 배송권역 상세",p:"모양을 그리는 것이 아니라 <b>지점의 공급권역을 가리키는 것</b>이다. 벤더 연결과 세트 수는 세트 분배 관리에서 정한다.",owner:"공급 담당자",review:"권역 서버 담당 팀"})
  + card({title:"기본 정보",axis:"cost"}, form([
      {l:"배송권역명",req:1,v:"성북 북부",hint:"공급권역명과 같지 않아도 된다. 운영자가 벤더에게 설명하기 쉬운 이름을 붙이는 자리다."},
      {l:"연동 지점",req:1,mk:1,v:"성북 1 지점",hint:"» 지점을 먼저 고르면 그 지점의 공급권역 목록이 나옵니다.",g:1},
      {l:"연동 공급권역",req:1,mk:3,html:`<div class="pick">
        <div class="r on"><span class="radio"></span><b>성북 1 공급</b><span class="mono">12.4 km²</span><span class="pill ok">선택 가능</span></div>
        <div class="r dis"><span class="radio"></span><span>성북 2 공급</span><span class="mono">9.1 km²</span><span style="font-size:11.5px"><b>성북 남부</b>가 사용 중</span></div>
        <div class="r"><span class="radio"></span><span>성북 3 공급</span><span class="mono">6.0 km²</span><span class="pill ok">선택 가능</span></div>
      </div>`, hint:"» 등록한 뒤에는 다른 공급권역으로 바꿀 수 없습니다. 바꿔야 하면 새 배송권역을 만드세요."+mk(2)}
    ]))
  + plain({title:"지도",tag:"조회 전용",mk:4,axis:"cost"},`<div class="body">${MAP_VDR}
      <div class="maplegend"><span><i style="background:var(--cost)"></i>이 배송권역</span><span><i style="background:var(--line-2)"></i>다른 배송권역</span><span><i style="background:var(--sales);opacity:.45"></i>영업존 (겹쳐 보기)</span><span><i style="background:var(--warn-bg);border:1px dashed var(--warn)"></i>어느 권역에도 없는 지역</span></div>
      <div class="hint">» 모양을 바꾸려면 권역 관리에서 <b>원본 공급권역</b>을 수정해야 합니다. 이웃 권역과 사이의 빈 지역은 <b>벤더가 배송하지 않는 지역</b>이 됩니다.</div>
    </div>`)
  + plain({title:"연결 상태",tag:"조회 전용",mk:5,axis:"cost"},
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
