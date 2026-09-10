/* 12. 앱 · 벤더포털 · 관제 변경사항 — 이어지는 파일. s12a.js 를 먼저 불러야 한다. */

/* ---------------- SCR_VP_002 기사 수행 현황 · 실시간 (§4.3) ---------------- */
function vpAgentTable(rows, weekly){
  const cols = weekly
    ? [{t:"No",num:1},{t:"이름"},{t:"연락처",mono:1},{t:"수락 전 취소",num:1},{t:"수락 후 취소",num:1},{t:"오더 취소",num:1},{t:"완료",num:1},{t:"권역외 오더",num:1},{t:"회귀 오더",num:1},{t:"아침",num:1},{t:"점심 피크",num:1}]
    : [{t:"우선순위",num:1},{t:"이름"},{t:"연락처",mono:1},{t:"상태"},{t:"수락 전 취소",num:1},{t:"수락 후 취소",num:1},{t:"오더 취소",num:1},{t:"완료",num:1},{t:"권역외 오더",num:1},{t:"회귀 오더",num:1},{t:"아침",num:1},{t:"점심 피크",num:1}];
  return tbl(cols, rows);
}
S.vp2 = {
  grp:"벤더포털", menu:"기사 수행 현황", axis:"", sid:"SCR_VP_002", scr:"기사 수행 현황 · 실시간", doc:"12",
  notes:[
    {t:"대시보드와 같은 기준을 쓴다", d:"<span class='kbd'>수락 전 취소</span>가 나오는 <b>모든 자리</b>에 같은 기준을 쓴다. <b>한쪽만 고치면 벤더 합계와 기사들의 합이 어긋난다</b> — 벤더장이 가장 먼저 알아채는 종류의 버그다.", r:"12 VP-4"},
    {t:"완료 다음에 두 컬럼", d:"<b>권역외 오더 · 회귀 오더</b>를 <span class='kbd'>완료</span> 뒤, 슬롯 컬럼 앞에 넣는다. 취소 3종 → 완료 → <b>제외된 것 2종</b> → 슬롯별 순서가 된다.", r:"12 §4.3"},
    {t:"헤더 합계 배지도 함께 간다", d:"기준 화면은 컬럼 헤더 아래에 <b>표 전체 합계</b>를 작게 붙인다(<span class='kbd'>0건</span> · <span class='kbd'>34건/95건</span>). 신설 컬럼도 같은 자리에 합계를 붙인다 — 벤더장이 표를 훑지 않고 한 번에 본다.", r:"12 §4.3 · 기준 화면"},
    {t:"비활성화 기사 표도 같이 바뀐다", d:"아래쪽 <b>비활성화 기사 표</b>는 활성 기사 표와 <b>컬럼 구성이 같다.</b> 한쪽만 고치면 표 둘의 모양이 어긋난다.", r:"12 §4.3"},
    {t:"기사별로도 확인할 수 있어야 한다", d:"벤더장이 「이번 주 숫자가 왜 달라졌나」를 볼 때, 벤더 전체 합계만으로는 <b>어느 기사에게서 빠졌는지</b> 알 수 없다. 기사별 두 컬럼이 그 답이다.", r:"12 S-2 · VP-3"},
    {t:"기사가 손해 보지 않는다", d:"권역 외 · 회귀는 <b>반드시 수행해야 하는 오더가 아니다.</b> 넘겨도 거절로 세지 않는다. 다만 <b>기사에게 「이건 안 세니 넘겨도 된다」고 알려주지는 않는다</b> — 기사앱은 태그만 붙이고 판단은 기사에게 맡긴다.", r:"12 APP-3 · S-1"}
  ],
  render(){ return head({
      h:"기사 수행 현황 · 실시간",
      p:"기사별 <span class='kbd'>수락 전 취소</span>에도 <b>대시보드와 같은 기준</b>을 쓴다. 활성 기사 표와 비활성화 기사 표 <b>양쪽</b>이 바뀐다.",
      owner:"벤더 · 벤더장(VO)", review:"벤더 서버 담당 팀"})
  + `<div id="sec-vp2">`
  + vpshell("기사 수행 현황","기사 수행 현황",
      vptabs(["실시간 현황","주간 현황"],"실시간 현황")
      + `<div style="font-size:14px;font-weight:700;color:#0B0D12;margin-bottom:6px">09월 10일(목) 실시간 현황</div>
      <div style="display:flex;gap:22px;font-size:12px;color:#5A606B;margin-bottom:14px"><span>점심 피크 참여 가능 <b style="color:#0B0D12;font-size:14px">5명/15명</b></span><span>순번 대기 ⓘ <b style="color:#0B0D12;font-size:14px">0명</b></span></div>
      <div style="font-size:13px;font-weight:700;color:#0B0D12;margin-bottom:6px">활성 기사 <span style="font-weight:400;color:#9AA0AC">총 45명</span></div>
      <div${note(3)}>${vpAgentTable([
        ["1","전영진","010-8006-4282",'<span class="pill ok">배달중</span>','<span class="dash">-</span>','<span class="dash">-</span>','<span class="dash">-</span>',"<b>9건</b>","<b>2건</b>",'<span class="dash">-</span>',"4건","5건"],
        ["2","김종철","010-3038-6616",'<span class="pill mute">대기중</span>',"1건",'<span class="dash">-</span>',"1건","<b>5건</b>",'<span class="dash">-</span>',"1건",'<span class="dash">-</span>',"5건"],
        ["3","이재헌","010-5131-6081",'<span class="pill ok">배달중</span>','<span class="dash">-</span>','<span class="dash">-</span>','<span class="dash">-</span>',"<b>8건</b>","<b>3건</b>","1건","2건","6건"],
        ["4","안주원","010-6276-4856",'<span class="pill ok">배달중</span>','<span class="dash">-</span>','<span class="dash">-</span>','<span class="dash">-</span>',"<b>3건</b>",'<span class="dash">-</span>','<span class="dash">-</span>','<span class="dash">-</span>',"3건"],
        ["5","이대헌","010-2451-6382",'<span class="pill ok">배달중</span>','<span class="dash">-</span>','<span class="dash">-</span>','<span class="dash">-</span>',"<b>4건</b>",'<span class="dash">-</span>','<span class="dash">-</span>',"3건","1건"],
        ["6",'<span class="dash">비어있음</span>','<span class="dash">-</span>','<span class="dash">-</span>','<span class="dash">-</span>','<span class="dash">-</span>','<span class="dash">-</span>','<span class="dash">-</span>','<span class="dash">-</span>','<span class="dash">-</span>','<span class="dash">-</span>','<span class="dash">-</span>']
      ])}${mk(3)}</div>
      <div style="margin-top:8px;font-size:12px;color:#5A606B">헤더 아래 합계 배지 — <span style="color:#0B0D12">수락 전 취소 <b>1건</b></span> · <span style="color:#9A5B0B">권역외 오더 <b>5건</b> · 회귀 오더 <b>2건</b></span></div>
      <div style="margin-top:18px;font-size:13px;font-weight:700;color:#0B0D12"${note(4)}>비활성화 기사 <span style="font-weight:400;color:#9AA0AC">총 0명</span>${mk(4)}</div>
      <div style="margin-top:6px;border:1px dashed #CDD1D8;border-radius:6px;padding:14px;text-align:center;font-size:12.5px;color:#9AA0AC">
        비활성화 기사가 없습니다. <b style="color:#5A606B">컬럼 구성은 활성 기사 표와 같으므로 두 컬럼이 여기에도 들어간다.</b></div>`)
  + `</div>`
  + plain({title:"컬럼이 놓이는 자리"}, tbl([{t:"순서",mono:1},{t:"컬럼"},{t:"비고"}],[
      ["1~4","우선순위 · 이름 · 연락처 · 상태",'<span class="pill mute">그대로</span>'],
      ["5","<b>수락 전 취소</b>",'<span class="pill warn">기준 변경</span> — 권역 외 · 회귀 제외 (VP-1)'],
      ["6~7","수락 후 취소 · 오더 취소",'<span class="pill mute">그대로</span>'],
      ["8","완료",'<span class="pill mute">그대로</span> — 권역 외 · 회귀도 수행하면 정상 집계'],
      ["9","<b>권역외 오더</b>",'<span class="pill new">신설</span>'],
      ["10","<b>회귀 오더</b>",'<span class="pill new">신설</span>'],
      ["11~15","슬롯 5종",'<span class="pill mute">그대로</span>'],
      ["16","벤더 모드",'<span class="pill mute">그대로</span> — 주간 탭에는 없다']
    ]))
  + `<div class="foot"${note(6)}><span><b>같은 변경이 네 곳</b> 대시보드 · 실시간(활성) · 실시간(비활성) · 주간 (VP-4)</span><span><b>기사에게 알리지 않는다</b> 앱은 태그만 붙인다 (APP-3)</span>${mk(6)}</div>`;}
};

/* ---------------- SCR_VP_003 기사 수행 현황 · 주간 (§4.3) ---------------- */
S.vp3 = {
  grp:"벤더포털", menu:"기사 수행 현황", axis:"", sid:"SCR_VP_003", scr:"기사 수행 현황 · 주간", doc:"12",
  notes:[
    {t:"컬럼 구성이 실시간과 다르다", d:"주간 탭에는 <b>상태와 벤더 모드가 없다.</b> 실시간 화면의 컬럼을 그대로 복사하면 어긋난다 — 신설 두 컬럼만 같은 자리(<span class='kbd'>완료</span> 뒤)에 넣는다.", r:"12 §4.3 · 기준 화면"},
    {t:"여기가 벤더장이 실제로 보는 화면이다", d:"실시간은 지금 이 순간이고, <b>「이번 주 숫자가 왜 달라졌나」는 주간에서 확인한다.</b> 요일 칩으로 하루씩 좁혀 볼 수도 있다.", r:"12 S-2"},
    {t:"기준은 실시간과 같다", d:"<span class='kbd'>수락 전 취소</span>에서 권역 외 · 회귀를 뺀다. <b>네 곳이 전부 같은 기준</b>이어야 한다 — 대시보드 · 실시간 활성 · 실시간 비활성 · 주간.", r:"12 VP-4"},
    {t:"완료와 정산은 그대로다", d:"권역 외 · 회귀 오더를 <b>수행하면</b> 다른 오더와 똑같이 세고 똑같이 지급한다. 빠지는 것은 <b>「수락하지 않은 것」</b>뿐이다.", r:"12 VP-2 · S-2"},
    {t:"주간 범위와 요일 칩은 그대로", d:"상단의 주간 범위 셀렉트와 <span class='kbd'>전체 / 09.09(수) … 09.15(화)</span> 칩은 손대지 않는다.", r:"12 §4.3"}
  ],
  render(){ return head({
      h:"기사 수행 현황 · 주간",
      p:"벤더장이 <b>「이번 주 숫자가 왜 달라졌나」</b>를 확인하는 자리다. 컬럼 구성이 실시간과 달라 따로 그렸다.",
      owner:"벤더 · 벤더장(VO)", review:"벤더 서버 담당 팀"})
  + `<div id="sec-vp3">`
  + vpshell("기사 수행 현황","기사 수행 현황",
      vptabs(["실시간 현황","주간 현황"],"주간 현황")
      + `<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <b style="font-size:14px;color:#0B0D12">주간 현황</b><span style="font-size:12.5px;color:#5A606B">09.09(수)~09.15(화) ⌄</span></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px"${note(5)}>${
        ["전체","09.09(수)","09.10(목)","09.11(금)","09.12(토)","09.13(일)","09.14(월)","09.15(화)"].map((t,i)=>
          `<span style="font-size:11.5px;border-radius:80px;padding:3px 11px;${i===0
            ?"background:#EFF4FF;color:#2563EB;border:1px solid #C7D9FF":"background:#F7F8FA;color:#9AA0AC;border:1px solid #E5E7EB"}">${esc(t)}</span>`).join("")}${mk(5)}</div>
      <div${note(1)}>${vpAgentTable([
        ["1","김화현","010-6395-0017",'<span class="dash">-</span>','<span class="dash">-</span>','<span class="dash">-</span>',"<b>41건</b>","<b>6건</b>","<b>2건</b>","6건","10건"],
        ["2","이재헌","010-5131-6081",'<span class="dash">-</span>',"2건",'<span class="dash">-</span>',"<b>41건</b>","<b>4건</b>",'<span class="dash">-</span>',"7건","16건"],
        ["3","전영진","010-8006-4282",'<span class="dash">-</span>','<span class="dash">-</span>','<span class="dash">-</span>',"<b>39건</b>","<b>3건</b>","1건","7건","11건"],
        ["4","이대헌","010-2451-6382","1건",'<span class="dash">-</span>','<span class="dash">-</span>',"<b>26건</b>",'<span class="dash">-</span>','<span class="dash">-</span>',"5건","6건"],
        ["5","배효재","010-2076-2617","1건",'<span class="dash">-</span>','<span class="dash">-</span>',"<b>22건</b>","<b>2건</b>",'<span class="dash">-</span>','<span class="dash">-</span>','<span class="dash">-</span>'],
        ["6","안주원","010-6276-4856",'<span class="dash">-</span>','<span class="dash">-</span>','<span class="dash">-</span>',"<b>20건</b>",'<span class="dash">-</span>',"1건","2건","9건"]
      ], true)}${mk(1)}</div>
      <div style="margin-top:8px;font-size:12px;color:#5A606B">헤더 합계 — <span style="color:#0B0D12">수락 전 취소 <b>2건</b> · 완료 <b>237건/750건</b></span> · <span style="color:#9A5B0B">권역외 오더 <b>15건</b> · 회귀 오더 <b>4건</b></span></div>`)
  + `</div>`
  + card({title:"실시간 탭과 무엇이 다른가",mk:1}, tbl([{t:"컬럼"},{t:"실시간"},{t:"주간"}],[
      ["우선순위 / No",'<span class="pill ok">우선순위</span>','<span class="pill ok">No</span>'],
      ["상태",'<span class="pill ok">있다</span>','<span class="pill stop">없다</span>'],
      ["취소 3종 · 완료",'<span class="pill ok">있다</span>','<span class="pill ok">있다</span>'],
      ["<b>권역외 오더 · 회귀 오더</b>",'<span class="pill new">신설</span>','<span class="pill new">신설</span>'],
      ["슬롯 5종",'<span class="pill ok">있다</span>','<span class="pill ok">있다</span>'],
      ["벤더 모드",'<span class="pill ok">있다</span>','<span class="pill stop">없다</span>'],
      ["비활성화 기사 표",'<span class="pill ok">있다</span>','<span class="pill stop">없다</span>']
    ]))
  + `<div class="foot"${note(3)}><span><b>네 곳이 같은 기준</b> 대시보드 · 실시간 활성 · 실시간 비활성 · 주간</span><span><b>완료와 정산은 그대로</b> 빠지는 것은 「수락하지 않은 것」뿐이다</span>${mk(3)}</div>`;}
};

