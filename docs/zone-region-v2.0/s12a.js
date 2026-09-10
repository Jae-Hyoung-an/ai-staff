/* =====================================================================
   12. 앱 · 벤더포털 · 관제 변경사항
   근거: [PRD] 존·권역 구조 개편 v2.0 / 12 §3~§4
   화면 4장 — SCR_VP_001 벤더포털 대시보드
              SCR_VP_002 기사 수행 현황(실시간) · SCR_VP_003 기사 수행 현황(주간)
              SCR_MON_001 관제 오더 상세 · 오더 이력
   기사앱(§4.1 SCR_APP_001)은 이번 범위에서 뺐다.
   근거는 하나다 — 01의 오더-권역 분류. 세 시스템이 같은 값을 각자 쓴다.
   ===================================================================== */

/* 오더-권역 분류 태그 */
const T = {
  in  :'<span class="pill ok">권역 내</span>',
  out :'<span class="pill warn">권역 외</span>',
  back:'<span class="pill new">회귀</span>',
  none:'<span class="pill mute">권역 미포함</span>'
};

/* 벤더포털 껍데기 — 흰 배경 · 검정 상단바 · 왼쪽 메뉴 5개.
   인트라 다크 캔버스 안에서 토큰을 라이트로 덮어써 실물 느낌을 낸다. */
const VPTOKENS = "--bg:#fff;--surface:#fff;--surface-2:#F7F8FA;--surface-3:#EEF0F3;"
  + "--btn:#F1F3F5;--btn-2:#E3E6EA;--ink:#1A1D24;--ink-strong:#0B0D12;--muted:#5A606B;"
  + "--faint:#828994;--dim:#9AA0AC;--line:#E5E7EB;--line-2:#CDD1D8;--line-soft:#EDEFF2;"
  + "--accent:#2563EB;--accent-ink:#fff;--crumb-bg:#EEF0F3;--ok:#137A4E;--warn:#9A5B0B;"
  + "--stop:#C33;--new:#5B3FA8;--danger:#D33;color:#1A1D24";

function vpshell(cur, head, body){
  const M = ["대시보드","기사 수행 현황","기사 관리","정산 보고서","벤더 정보"];
  return `<div style="${VPTOKENS};border:1px solid var(--line-soft);border-radius:8px;overflow:hidden;background:#fff">
    <div style="background:#111319;color:#fff;padding:10px 14px;display:flex;align-items:center;gap:11px;font-size:14px">
      <span style="opacity:.65">☰</span><b style="letter-spacing:-.02em">VROONG</b><span style="font-weight:400;opacity:.85">Vendor</span>
      <span style="flex:1"></span><span style="font-size:12px;opacity:.75">jaehyoung.an@vroong.com (마스터) ⌄</span>
    </div>
    <div style="display:grid;grid-template-columns:132px minmax(0,1fr)">
      <nav style="background:#fff;border-right:1px solid #E5E7EB;padding:8px 0;min-height:340px">${
        M.map(t=>`<div style="padding:8px 14px;font-size:12.5px;${t===cur
          ?"background:#F1F3F5;color:#111319;font-weight:700;box-shadow:inset 3px 0 0 #111319":"color:#5A606B"}">${esc(t)}</div>`).join("")}</nav>
      <div style="background:#fff;padding:16px 18px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
          <b style="font-size:19px;color:#0B0D12">${esc(head)}</b>
          <span style="font-size:11.5px;color:#2563EB;background:#EFF4FF;border-radius:80px;padding:2px 9px">● 점심 피크(10:55~14:00) 진행중</span>
          <span style="font-size:11.5px;color:#5A606B">참여중 5명/15명</span>
          <span style="flex:1"></span><span style="font-size:11.5px;color:#9AA0AC">13:01:36 기준 ↻</span>
        </div>
        ${body}
      </div>
    </div>
  </div>`;
}
/* 벤더포털 탭 */
function vptabs(list, cur){
  return `<div style="display:flex;gap:18px;border-bottom:1px solid #E5E7EB;margin-bottom:16px">${
    list.map(t=>`<div style="padding:0 0 9px;font-size:13.5px;${t===cur
      ?"color:#111319;font-weight:700;box-shadow:inset 0 -2px 0 #111319":"color:#9AA0AC"}">${esc(t)}</div>`).join("")}</div>`;
}
/* 벤더포털 지표 한 칸 */
function vpstat(o){
  return `<div${o.mk?note(o.mk):""} style="min-width:96px;${o.hot?"background:#FFF7ED;border-radius:6px;padding:6px 10px;margin:-6px -4px":""}">
    <div style="font-size:11.5px;color:#5A606B;white-space:nowrap">${esc(o.t)}${o.q?' <span style="color:#9AA0AC">ⓘ</span>':""}${o.mk?mk(o.mk):""}</div>
    <div style="font-size:17px;font-weight:700;color:${o.hot?"#9A5B0B":"#0B0D12"};margin-top:3px">${esc(o.v)}</div>
  </div>`;
}

/* ---------------- SCR_VP_001 벤더포털 대시보드 (§4.2) ---------------- */
S.vp = {
  grp:"벤더포털", menu:"대시보드", axis:"", sid:"SCR_VP_001", scr:"벤더포털 대시보드", doc:"12",
  notes:[
    {t:"직접 빼는 숫자는 하나다", d:"<span class='kbd'>수락 전 취소</span> <b>하나만</b> 바뀐다. 권역 외 · 회귀 오더 제안에 대한 <b>거절 · 무응답 · 타임아웃</b>을 여기서 뺀다. 이 오더들은 벤더 소속 기사가 <b>반드시 수행해야 하는 오더가 아니기 때문</b>이다.", r:"12 VP-1 · VP-2"},
    {t:"거절 물량과 주간 거절률은 따라 줄어든다", d:"<span class='kbd'>거절 물량 = 수락 전 취소 + 수락 후 취소</span>이므로 <b>따로 고치지 않아도 그만큼 함께 줄어든다.</b> 주간 실적의 거절률도 같다. <b>손대는 곳을 하나로 줄이는 것이 이 설계의 요점</b>이다.", r:"12 VP-2"},
    {t:"권역외 오더 · 회귀 오더 (신설 2컬럼)", d:"뺀 건수를 <b>맨 뒤에 두 칸으로</b> 따로 보여준다. <b>숫자가 왜 줄었는지 벤더가 확인할 수 있어야 한다</b> — 이 두 칸이 없으면 「기사는 분명 넘겼는데 숫자에 안 잡힌다」가 된다.", r:"12 VP-3 · S-2"},
    {t:"툴팁을 고쳐야 한다", d:"지금 툴팁은 <span class='kbd'>…응답 없이 제안이 만료된 경우가 <b>모두 포함</b>돼요.</span>다. VP-1이 이 문장을 <b>거짓으로 만든다</b> — 한 줄을 덧붙여 제외 기준을 밝힌다.", r:"12 VP-1 · 신설"},
    {t:"바뀌지 않는 것", d:"<b>수락 후 취소 · 완료 · 배정 물량 · 정산은 그대로</b>다. 권역 외 · 회귀 오더도 <b>수행 건수는 정상 집계되고 정산도 동일하게 지급</b>한다. 이전 판의 「권역 외는 실적·정산에서 제외」는 <b>폐기됐다</b> (2026-09-08 정정).", r:"12 §1 콜아웃 · VP-2"},
    {t:"타임 슬롯 · 시간대별 기록은 손대지 않는다", d:"아래 두 블록은 이번 범위 밖이다. 회귀 오더의 <b>상세 정보 표시</b>도 넣지 않는다 — 넣는 것은 <b>집계 기준 변경과 그 결과 컬럼까지</b>다.", r:"12 VP-5 · §4.2"}
  ],
  render(){ return head({
      h:"벤더포털 대시보드",
      p:"<b>오더-권역 분류가 집계에 나타나는 자리</b>다. 근거는 01의 분류값 하나고, 이 화면은 그것을 <span class='kbd'>수락 전 취소</span>에서 빼는 데 쓴다.",
      owner:"벤더 · 벤더장(VO)", review:"벤더 서버 담당 팀"})
  + `<div id="sec-vp">`
  + vpshell("대시보드","대시보드",
      vptabs(["실적 현황","기사 현황"],"실적 현황")
      + `<div style="font-size:14px;font-weight:700;color:#0B0D12;margin-bottom:12px">09월 10일(목) 실시간 현황</div>
      <div style="border:1px solid #E5E7EB;border-radius:8px;padding:16px 18px;display:flex;align-items:flex-end;gap:26px;flex-wrap:wrap">
        <div style="min-width:180px">
          <div style="font-size:11.5px;color:#5A606B">실시간 달성률</div>
          <div style="font-size:28px;font-weight:800;color:#0B0D12">33.68% <span style="font-size:12px;font-weight:400;color:#9AA0AC">(32건/95건)</span></div>
          <div style="height:4px;background:#E5E7EB;border-radius:4px;margin-top:8px"><div style="width:34%;height:100%;background:#111319;border-radius:4px"></div></div>
        </div>
        ${vpstat({t:"배정 물량",v:"95건"})}
        ${vpstat({t:"처리 물량",v:"32건"})}
        ${vpstat({t:"잔여 물량",v:"63건"})}
        ${vpstat({t:"거절 물량",v:"7건",q:0,mk:2})}
        ${vpstat({t:"수락 전 취소",v:"4건",q:1,mk:1})}
        ${vpstat({t:"수락 후 취소",v:"3건",q:1})}
        ${vpstat({t:"권역외 오더",v:"5건",hot:1,mk:3})}
        ${vpstat({t:"회귀 오더",v:"2건",hot:1,mk:3})}
      </div>
      <div style="margin-top:10px;font-size:12px;color:#5A606B;background:#F7F8FA;border:1px solid #E5E7EB;border-radius:6px;padding:9px 12px"${note(4)}>
        <b>ⓘ 수락 전 취소 툴팁</b> — 기사가 제안받은 배차를 수락하지 않은 건수예요. 직접 거절 했거나, 응답 없이 제안이 만료된 경우가 포함돼요.
        <b style="color:#9A5B0B">단, 권역 외 · 회귀 오더의 거절 · 무응답은 제외돼요.</b>${mk(4)}</div>
      <div style="margin-top:16px;font-size:13px;font-weight:700;color:#0B0D12">타임 슬롯별 현황 <span style="font-weight:400;color:#9AA0AC;font-size:11.5px">· 바뀌지 않는다</span></div>
      <div style="display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin-top:8px">${
        ["아침 240.00%","점심 피크 100.00%","점심 논피크 0.00%","저녁 피크 0.00%","저녁 논피크 0.00%","시간외 —"].map(t=>
          `<div style="border:1px solid #E5E7EB;border-radius:6px;padding:10px;font-size:11.5px;color:#5A606B">${esc(t)}</div>`).join("")}</div>
      <div style="margin-top:16px;font-size:13px;font-weight:700;color:#0B0D12"${note(2)}>주간 실적 <span style="font-weight:400;color:#5A606B;font-size:11.5px">09.09(수)~09.15(화) · 주간 달성률 30.0% · <b style="color:#C33">주간 거절률 1.7%</b></span>${mk(2)}</div>
      <div style="margin-top:8px;border:1px solid #E5E7EB;border-radius:6px;padding:10px 12px;font-size:12px;color:#5A606B">
        <b>거절률도 따라 내려간다</b> — 분자인 <span style="color:#0B0D12">거절 물량</span>이 <span style="color:#0B0D12">수락 전 취소</span>를 품고 있어서, 이 화면에서 따로 고치지 않아도 권역 외 · 회귀만큼 함께 빠진다.
      </div>`)
  + `</div>`
  + plain({title:"무엇이 바뀌고 무엇이 그대로인가",mk:5}, tbl([{t:"지표"},{t:"바뀌나"},{t:"왜"}],[
      ["<b>수락 전 취소</b>",'<span class="pill warn">기준 변경</span>',"권역 외 · 회귀 제안의 거절 · 무응답 · 타임아웃을 뺀다 (VP-1)"],
      ["<b>거절 물량</b>",'<span class="pill warn">따라 줄어든다</span>',"수락 전 취소 + 수락 후 취소이므로 자동이다. <b>따로 고치지 않는다</b> (VP-2)"],
      ["<b>주간 거절률</b>",'<span class="pill warn">따라 줄어든다</span>',"거절 물량을 분자로 쓰므로 자동이다"],
      ["<b>권역외 오더 · 회귀 오더</b>",'<span class="pill new">신설</span>',"뺀 건수를 보여준다 — 없으면 숫자가 왜 줄었는지 알 수 없다 (VP-3)"],
      ["수락 후 취소 · 완료 · 배정 물량",'<span class="pill mute">그대로</span>',"수행한 것은 정상 집계한다"],
      ["<b>정산</b>",'<span class="pill mute">그대로</span>',"권역 외 · 회귀도 <b>다른 오더와 동일하게 지급</b>한다 (2026-09-08 정정)"],
      ["타임 슬롯별 현황 · 시간대별 기록",'<span class="pill mute">그대로</span>',"이번 범위 밖 (VP-5)"]
    ]))
  + `<div class="foot"${note(6)}><span><b>적용 범위</b> 수락 전 취소가 나오는 모든 자리 — 대시보드와 기사 수행 현황 (VP-4)</span><span class="strike">회귀 오더 상세 정보 표시</span>${mk(6)}</div>`;}
};

