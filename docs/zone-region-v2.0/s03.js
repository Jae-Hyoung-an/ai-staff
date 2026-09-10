/* =====================================================================
   03. 지점 설정 변경사항 — 지역 관리 > 지점 관리 > 지점 조회 > 영업존·벤더 배송권역 탭
   근거: [PRD] 존·권역 구조 개편 v2.0 / 03. 지점 설정 변경사항 §4
   화면 4장 — SCR_PT_001 탭 · SCR_PT_002 중첩 안내 팝업
              SCR_PT_003 운영방식 변경 차단 팝업 · SCR_PT_004 편집 충돌 팝업
   메뉴가 아니라 지점 상세의 탭 하나다. 기준 화면은 같은 자리의 「영업 기준 권역」 탭.
   권역 편집기는 기존 것을 그대로 쓰므로 그리지 않는다 (§4.5).
   ===================================================================== */

/* 지점 조회 왼쪽 세로 탭 레일 — 기존 11개 + 신설 1개 */
function ptrail(cur){
  const L = ["기본 정보","M캐시 조정 관리","M캐시 조정 내역","오더 관리","세일즈 권역","공급 권역","제한 권역","영업 기준 권역","영업존·벤더 배송권역","다지점 관제 관리","상점 노출 관리","오더 대리 접수 관리"];
  return `<nav style="border:1px solid var(--line-soft);border-radius:8px;overflow:hidden;background:var(--surface-2)">${
    L.map(t=>{
      const on = t===cur, nw = t==="영업존·벤더 배송권역";
      return `<div style="display:flex;align-items:center;gap:6px;padding:9px 12px;font-size:13px;border-bottom:1px solid var(--line-soft);${
        on?"background:var(--accent);color:var(--accent-ink);font-weight:700":"color:var(--muted)"}">
        <span style="flex:1">${esc(t)}</span>${nw?`<span class="pill new" style="font-size:10px;padding:1px 7px">신설</span>`:""}<span style="opacity:.5">›</span></div>`;
    }).join("")}</nav>`;
}

/* 03 §4.2 — 이 지점의 권역 둘만 한 장에. 기존 운영용 권역은 그리지 않는다. */
const MAP_PT = `<div class="map"><svg viewBox="0 0 640 330" role="img" aria-label="권역 지도 — 이 지점의 영업존 권역과 벤더 배송권역">
  ${MAPBG}
  <path d="M78 62 L268 48 L306 140 L240 214 L100 194 Z" fill="var(--sales)" fill-opacity=".15" stroke="var(--sales)" stroke-width="2.2"/>
  <path d="M132 96 L392 74 L440 186 L330 274 L164 248 Z" fill="var(--cost)" fill-opacity=".13" stroke="var(--cost)" stroke-width="2.2"/>
  <text x="96" y="96" font-family="IBM Plex Sans KR" font-size="12.5" font-weight="600" fill="var(--sales)">영업존 권역</text>
  <text x="96" y="114" font-family="IBM Plex Mono" font-size="10.5" fill="var(--sales)" opacity=".85">법정동 12 · 8.4 km²</text>
  <text x="346" y="238" font-family="IBM Plex Sans KR" font-size="12.5" font-weight="600" fill="var(--cost)">벤더 배송권역</text>
  <text x="346" y="256" font-family="IBM Plex Mono" font-size="10.5" fill="var(--cost)" opacity=".85">법정동 21 · 19.6 km²</text>
</svg>
<div class="maplegend">
  <span><i style="background:var(--sales)"></i>영업존 권역</span>
  <span><i style="background:var(--cost)"></i>벤더 배송권역</span>
  <span style="color:var(--dim)">운영용 세일즈 권역 · 공급 권역 · 제한 권역 · 영업 기준 권역은 그리지 않는다</span>
</div></div>`;

/* 지역 목록 (행정동/법정동) — 기준 화면 그대로 */
function areaside(list){
  return `<div class="side">
    <div class="radiorow"><span class="rr"><i></i>행정동</span><span class="rr on"><i></i>법정동</span></div>
    ${tbl([{t:"지역종류"},{t:"주소"}], list.map(a=>["법정동",a]))}
  </div>`;
}

/* ---------------- SCR_PT_001 영업존·벤더 배송권역 탭 (§4.1~4.4) ---------------- */
S.pt = {
  grp:"지역 관리", menu:"지점 관리", axis:"", sid:"SCR_PT_001", scr:"영업존·벤더 배송권역 탭", doc:"03",
  notes:[
    {t:"메뉴가 아니라 탭 하나다", d:"지점 조회 왼쪽 탭 목록의 <b>「영업 기준 권역」 바로 다음</b>에 둔다. 이번 개편으로 지점 쪽에 생기는 변경은 이것 하나뿐이고, <b>기존 권역 4종(세일즈 · 공급 · 제한 · 영업 기준)은 그대로 둔다.</b>", r:"03 §4.1 · PT-3"},
    {t:"보이는 조건이 둘이다", d:"운영방식이 <span class='kbd'>벤더 존</span>인 지점에만, 그리고 <b>지점을 저장한 뒤에</b> 보인다. 지점 등록 화면에는 이 탭이 없다.", r:"03 PT-1"},
    {t:"권역 지도 — 이 지점의 둘만", d:"영업존 권역과 벤더 배송권역을 <b>한 장에 겹쳐</b> 보여주고 범례로 구분한다. <b>기존 운영용 권역은 그리지 않는다</b> — 섞이면 어느 것이 요금제 판단용인지 알 수 없다. 겹치는 것은 정상이라 따로 강조하지 않는다.", r:"03 §4.2"},
    {t:"각 1개 · 추가 버튼 없음", d:"기준 화면의 <span class='strike'>총 N개</span>와 <span class='strike'>＋ 추가</span>는 <b>Spec-out</b>이다. 한 지점이 갖는 것은 <b>영업존 권역 1개 · 벤더 배송권역 1개</b>뿐이라 셀 것도 늘릴 것도 없다. 표 대신 <b>한 줄</b>로 보여준다.", r:"03 PT-2 · §4.3"},
    {t:"삭제 버튼을 두지 않는다", d:"참조 중인 권역은 지울 수 없고, <b>도형을 전부 비워 저장하는 우회 경로도 막는다.</b> 먼저 영업존과 정책에서 연결을 끊어야 한다. 그래서 행에 삭제 버튼 자리를 만들지 않았다.", r:"03 PT-9 · §4.7 4번"},
    {t:"연결 상태 (신설)", d:"영업존 권역은 <b>어느 영업존이 쓰는지</b>, 벤더 배송권역은 <b>속한 정책</b>을 보여주고 각 상세로 이동한다(새 탭). <span class='kbd'>연결 없음</span>이면 <b>영업존 권역의 중첩 검사를 하지 않는다</b> — 판가에 영향이 없기 때문이다.", r:"03 §4.3 · §4.4 · PT-4"},
    {t:"중첩은 한쪽만 막는다", d:"<b>영업존 권역</b>은 다른 영업존이 쓰는 권역과 겹치면 저장을 막는다 — 한 상점에 판가가 둘 생기기 때문이다. <b>벤더 배송권역</b>은 검사하지 않고 경고도 없다 — 겹치는 것은 징검다리를 위해 <b>의도한 상황</b>이다.", r:"03 PT-4 · PT-5"},
    {t:"두 섹션은 따로 저장한다", d:"각 섹션이 <span class='kbd'>수정 내역</span>과 <span class='kbd'>저장</span>을 따로 갖는다. 한쪽을 저장해도 <b>다른 쪽의 초안은 남는다.</b> 기준 화면의 「픽업지 저장 / 공급지 저장」과 같은 구조다.", r:"03 PT-6 · §4.3"},
    {t:"저장 사유는 필수다", d:"저장을 누르면 <b>사유 입력 모달</b>이 뜬다 — 10번의 <span class='kbd'>SCR_SET_004</span>와 같은 모양이다. <b>공란으로는 저장할 수 없고</b> 사유는 변경 이력에 함께 남는다.", r:"03 PT-7 · 루트 공통 규칙"},
    {t:"편집기는 새로 만들지 않는다", d:"<span class='kbd'>편집</span>을 누르면 <b>기존 권역 편집기가 그대로 열린다.</b> 이 문서가 정하는 것은 둘뿐이다 — 도형은 권역당 <b>1개</b>, 편집기의 저장은 <b>초안을 탭으로 돌려보낼 뿐</b>이고 서버에 남는 것은 탭의 저장을 눌렀을 때다.", r:"03 §4.5 · PT-2"},
    {t:"입력 모달</b>이 뜬다 — 10번의 <span class='kbd'>SCR_SET_004</span>와 같은 모양이다. <b>공란으로는 저장할 수 없고</b> 사유는 변경 이력에 함께 남는다.", r:"03 PT-7 · 루트 공통 규칙"},
    {t:"편집기는 새로 만들지 않는다", d:"<span class='kbd'>편집</span>을 누르면 <b>기존 권역 편집기가 그대로 열린다.</b> 이 문서가 정하는 것은 둘뿐이다 — 도형은 권역당 <b>1개</b>, 편집기의 저장은 <b>초안을 탭으로 돌려보낼 뿐</b>이고 서버에 남는 것은 탭의 저장을 눌렀을 때다.", r:"03 §4.5 · PT-2"},
    {t:"편집 경로가 둘이다", d:"이 탭 말고 <b>04 지점 권역 관리에서도 같은 권역을 고칠 수 있다.</b> 두 화면이 같은 원본을 보므로 <b>중첩 검사를 두 곳에 똑같이</b> 두어야 한다 — 한 쪽이라도 빠지면 그곳이 우회로가 된다. 판정 방식은 설계할 때 04 담당과 함께 정한다.", r:"03 PT-10 · 13 C-1"}
  ],
  render(){ return head({
      h:"지점 조회 — 영업존·벤더 배송권역",
      p:"영업존(02)과 벤더 배송권역 정책(09)이 <b>불러다 쓰는 권역 둘을 그리는 자리</b>다. 02·09는 그려 놓은 결과를 쓸 뿐 모양을 고치지 않는다.",
      owner:"권역 담당자", review:"권역 서버 담당 팀"})

  + `<div id="sec-head">`
  + `<div style="display:flex;gap:10px;align-items:center;margin-bottom:12px;font-size:14px;color:var(--muted)">
      <b style="color:var(--ink-strong);font-size:17px">부릉 강남2지점</b><span class="mono" style="color:var(--dim)">p563A</span>
      <span class="pill ok">운영방식 벤더 존</span><span class="pill mute">저장됨</span></div>`
  + `<div${note(2)}>${banner("ok","조건","이 탭은 <b>운영방식이 「벤더 존」인 지점</b>에만, 그리고 <b>지점을 저장한 뒤에</b> 보인다. 지점 등록 화면에는 없다."+mk(2))}</div>`
  + `</div>`

  + `<div id="sec-tab" style="display:grid;grid-template-columns:210px minmax(0,1fr);gap:18px;margin-top:16px">
      <div${note(1)}>${ptrail("영업존·벤더 배송권역")}${mk(1)}</div>
      <div>`

  /* 권역 지도 */
  + `<div id="sec-map">`
  + plain({title:"권역 지도",mk:3}, `<div class="body">${MAP_PT}</div>`)
  + `</div>`

  /* 영업존 권역 */
  + `<div id="sec-sales">`
  + plain({title:"영업존 권역",tag:"신설",tagk:"new",axis:"sales",mk:4}, `<div class="body">
      <div class="gridsplit">
        <div>
          <div class="foot" style="margin:0 0 12px;padding:0;border:0"><span class="strike">총 N개</span><span class="strike">＋ 추가</span><span class="strike">삭제</span><span>1개뿐이라 셀 것도 늘릴 것도 없다</span></div>
          <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-top:2px solid var(--line-2);border-bottom:1px solid var(--line)">
            <b style="font-size:15.5px;color:var(--ink-strong)">부릉 강남2지점 영업존 권역</b>
            <span${note(6)} style="font-size:13px;color:var(--muted)">연결 상태 ${ext("강남 영업존")}${mk(6)}</span>
            <span style="flex:1"></span><button class="btn sm">편집</button>
          </div>
          <div class="hint">연결 상태를 누르면 그 <b>영업존 상세</b>로 이동한다(새 탭). <span class="kbd">연결 없음</span>이면 저장할 때 <b>중첩 검사를 하지 않는다</b> — 판가에 영향이 없다.</div>
        </div>
        ${areaside(["신사동","압구정동","논현동","역삼동"])}
      </div></div>`)
  + `<div class="actions" style="margin-top:-6px"><button class="btn">수정 내역</button><button class="btn pri">저장</button></div>`
  + `</div>`

  /* 벤더 배송권역 */
  + `<div id="sec-cost">`
  + plain({title:"벤더 배송권역",tag:"신설",tagk:"new",axis:"cost",mk:7}, `<div class="body">
      <div class="hint g" style="margin:0 0 14px">» 겹치는 구간은 오류가 아닙니다. 이웃 지점까지 겹치게 그려 권역 외 오더를 줄이는 것이 목적입니다.</div>
      <div class="gridsplit">
        <div>
          <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-top:2px solid var(--line-2);border-bottom:1px solid var(--line)">
            <b style="font-size:15.5px;color:var(--ink-strong)">강남 벤더 배송권역 A</b>
            <span style="font-size:13px;color:var(--muted)">속한 정책 ${ext("수도권 벤더 운영정책 v3")}</span>
            <span style="flex:1"></span><button class="btn sm">편집</button>
          </div>
          <div class="hint">중첩 검사를 <b>하지 않는다</b>. 경고도 띄우지 않는다 (PT-5).</div>
        </div>
        ${areaside(["신사동","압구정동","논현동","역삼동","서초동","반포동"])}
      </div></div>`)
  + `<div class="actions" style="margin-top:-6px"${note(8)}><button class="btn">수정 내역</button><button class="btn pri">저장</button>${mk(8)}</div>`
  + `</div>`

  /* 빈 상태 */
  + `<div id="sec-empty">`
  + plain({title:"권역이 없을 때",tag:"참고",tagk:"mute",mk:5}, `<div class="body">
      ${state("<b>영업존 권역이 없습니다.</b> 권역을 그려야 영업존에서 이 지점을 고를 수 있습니다.")}
      <div class="actions" style="justify-content:flex-start;padding-left:0"><button class="btn pri">권역 만들기</button></div>
      <div class="hint">기준 화면의 <span class="kbd">등록된 권역이 없습니다.</span> 자리다. <b>왜 그려야 하는지를 함께 적는다</b> — 권역이 없는 지점은 02·09의 지점 선택 목록에서 감춰지기 때문이다 (02 EZ-4).</div>
    </div>`)
  + `</div>`

  /* 저장 검사 */
  + `<div id="sec-check">`
  + plain({title:"저장할 때 검사하는 것",mk:9}, tbl([{t:"#",mono:1},{t:"상황"},{t:"화면이 하는 일"}],[
      ["1","영업존이 쓰는 권역을 <b>다른 영업존의 권역과 겹치게</b> 저장","<b>막는다.</b> 중첩 안내 팝업으로 어느 영업존과 겹치는지 보여준다 (SCR_PT_002)"],
      ["2","<b>어느 영업존도 쓰지 않는</b> 권역을 겹치게 저장","<b>막지 않는다.</b> 판가에 영향이 없다. 단 이 지점을 영업존에 연결하려 할 때 02가 막는다 (02 EZ-5 ①)"],
      ["3","벤더 배송권역을 겹치게 저장","<b>막지 않는다.</b> 경고도 하지 않는다 (PT-5)"],
      ["4","도형을 <b>전부 비우고</b> 저장","쓰는 곳이 없으면 허용한다. <b>쓰는 곳이 있으면 막는다</b> — <span class='kbd'>이 권역은 {영업존명 / 정책명}이 쓰고 있어 비울 수 없습니다.</span>"],
      ["5","사유를 비워 둔 채 저장","<b>막는다.</b> 공란은 허용하지 않는다 (PT-7)"],
      ["6","내가 편집하는 사이 <b>다른 사람이 04에서</b> 같은 권역을 고쳐 저장","<b>충돌로 보고 저장을 막는다.</b> 내 초안으로 덮어쓰지 않는다 (SCR_PT_004)"],
      ["7","운영방식을 바꾸려 함 — <b>쓰는 곳이 없을 때</b>","<b>그냥 바뀐다.</b> 탭이 사라지고 경고도 없다. 그려 둔 권역은 <b>보관</b>되어 있다가 다시 「벤더 존」으로 되돌리면 그대로 나온다"],
      ["8","운영방식을 바꾸려 함 — <b>쓰는 곳이 있을 때</b>","<b>막는다.</b> 어디서 쓰고 있는지를 팝업으로 보여준다 (SCR_PT_003)"]
    ]))
  + `<div style="display:flex;gap:7px;margin:12px 0 0"><button class="btn sm" data-go="pt2">중첩 안내 팝업 보기</button><button class="btn sm" data-go="pt3">운영방식 변경 차단 보기</button><button class="btn sm" data-go="pt4">편집 충돌 보기</button></div>`
  + `</div>`
  + `</div></div>`
  + `<div class="foot"${note(11)}><span><b>같은 권역을 04 지점 권역 관리에서도 고칠 수 있다</b> — 중첩 검사를 두 곳에 똑같이 두어야 한다 (PT-10 · 13 C-1)</span><span><b>저장 사유</b> 10번 SCR_SET_004와 같은 모달로 받는다</span>${mk(11)}</div>`;}
};

/* ---------------- SCR_PT_002 중첩 안내 팝업 (§4.6) ---------------- */
S.pt2 = {
  grp:"지역 관리", menu:"지점 관리", axis:"", sid:"SCR_PT_002", scr:"중첩 안내 팝업", doc:"03",
  notes:[
    {t:"영업존 권역에서만 뜬다", d:"벤더 배송권역 섹션에서는 <b>어떤 경우에도 뜨지 않는다.</b> 겹침이 오류인 축과 의도인 축이 갈라져 있다.", r:"03 §4.6 · PT-5"},
    {t:"왜 막는가", d:"겹치는 구간의 상점이 <b>판가를 둘 갖게 되기 때문</b>이다. 어느 영업존의 요금제를 써야 할지 정할 수 없다. 그래서 원천에서 막는다.", r:"03 S-2 · 02 EZ-5"},
    {t:"영업존명과 지점명을 함께 적는다", d:"영업존명만으로는 어디를 줄여야 할지 모른다. <b>그 영업존이 담고 있는 지점명</b>까지 보여주고, 누르면 그 영업존 상세로 이동한다(새 탭). 여럿이면 전부 보여준다.", r:"03 §4.6"},
    {t:"강행 저장이 없다", d:"버튼은 <span class='kbd'>확인</span> 하나뿐이다. <b>밀어붙일 선택지를 두지 않는다</b> — 겹치면 판가가 정해지지 않으므로 예외를 만들 수 없다.", r:"03 §4.6"},
    {t:"초안은 남는다", d:"닫아도 그려 둔 초안은 사라지지 않는다. 다시 <span class='kbd'>편집</span>으로 들어가 겹치는 구간만 줄이면 된다.", r:"03 §4.6"},
    {t:"막는 곳이 세 곳이다", d:"① <b>영업존을 저장할 때</b>(02 EZ-5) ② <b>이 탭에서 저장할 때</b>(PT-4) ③ <b>04 지점 권역 관리에서 저장할 때</b>(PT-10). <b>세 곳이 같은 판정 기준</b>을 써야 한다 — 한 곳이라도 빠지면 그곳이 우회로가 된다.", r:"03 §3 콜아웃 · 13 C-1"}
  ],
  render(){ return head({
      h:"중첩 안내 팝업",
      p:"<b>영업존 권역 섹션</b>에서 저장을 누르고 다른 영업존의 권역과 겹쳤을 때 뜬다. 벤더 배송권역에서는 뜨지 않는다.",
      owner:"권역 담당자", review:"권역 서버 담당 팀"})
  + modal({title:"저장할 수 없습니다",tag:"신설",tagk:"stop",actions:[{t:"확인",pri:1}]},
      `<div class="hint g" style="margin:0 0 12px"${note(2)}>» 이 권역이 아래 영업존의 권역과 겹칩니다. 겹치는 구간을 없앤 뒤에 저장해주세요.${mk(2)}</div>
      <div${note(3)}>${tbl([{t:"겹치는 영업존"},{t:"그 영업존의 지점"}],[
        [ext("서초 영업존"),"부릉 서초지점 · 부릉 반포지점"],
        [ext("송파 영업존"),"부릉 송파지점"]
      ])}${mk(3)}</div>
      <div class="statemsg" style="margin-top:12px"${note(5)}>닫아도 <b>초안은 그대로 남는다.</b> 다시 <span class="kbd">편집</span>으로 들어가 겹치는 구간을 줄이면 된다.${mk(5)}</div>`)
  + card({title:"겹쳐도 되는 경우 · 안 되는 경우",mk:1}, tbl([{t:"무엇을 겹쳤나"},{t:"쓰는 영업존"},{t:"저장"}],[
      ["영업존 권역","<b>있다</b>",'<span class="pill stop">막는다</span> — 이 팝업이 뜬다'],
      ["영업존 권역","없다 <span class='pill mute'>연결 없음</span>",'<span class="pill ok">막지 않는다</span> — 판가에 영향이 없고 검사 부담도 줄어든다'],
      ["벤더 배송권역","해당 없음",'<span class="pill ok">막지 않는다</span> — 경고도 없다 (PT-5)']
    ]))
  + plain({title:"막는 문이 세 곳이다",mk:6}, tbl([{t:"#",mono:1},{t:"어디서"},{t:"근거"}],[
      ["①","<b>영업존을 저장할 때</b> — 권역이 영업존에 들어오는 문","02 EZ-5"],
      ["②","<b>이 탭에서 저장할 때</b> — 권역 모양이 바뀌는 문","03 PT-4"],
      ["③","<b>04 지점 권역 관리에서 저장할 때</b> — 같은 원본을 보는 또 하나의 문","03 PT-10"]
    ]))
  + `<div class="foot"${note(4)}><span><b>액션</b> 확인 하나 — <b>강행 저장 선택지를 두지 않는다</b></span><span><b>판정 방식</b> 설계할 때 04 담당과 함께 정한다 (13 C-1)</span>${mk(4)}</div>`;}
};

/* ---------------- SCR_PT_003 운영방식 변경 차단 팝업 (§4.7 8번) ---------------- */
S.pt3 = {
  grp:"지역 관리", menu:"지점 관리", axis:"", sid:"SCR_PT_003", scr:"운영방식 변경 차단", doc:"03",
  notes:[
    {t:"이 팝업은 기본 정보 탭에서 뜬다", d:"권역 탭이 아니라 <b>지점 기본 정보의 「운영방식」</b>을 <span class='kbd'>벤더 존</span>에서 다른 것으로 바꾸려 할 때 뜬다. 권역이 딸린 설정이라 여기서도 검사한다.", r:"03 §4.7 8번 · PT-11"},
    {t:"쓰는 곳이 없으면 그냥 바뀐다", d:"<b>경고하지 않는다.</b> 탭이 사라지고 끝이다. 그려 둔 권역은 <b>지워지지 않고 보관되며</b>, 다시 <span class='kbd'>벤더 존</span>으로 되돌리면 그대로 나온다.", r:"03 PT-11 · §4.7 7번"},
    {t:"쓰는 곳이 있으면 막는다", d:"영업존이나 벤더 배송권역 정책이 이 지점의 권역을 쓰고 있으면 <b>운영방식을 바꿀 수 없다.</b> 바꾸는 순간 그 영업존·정책이 근거를 잃기 때문이다.", r:"03 PT-11"},
    {t:"어디서 쓰는지를 적는다", d:"<b>영업존명과 정책명</b>을 줄마다 보여주고 누르면 그 상세로 이동한다(새 탭). <b>먼저 그곳에서 연결을 끊어야</b> 운영방식을 바꿀 수 있다 — 순서를 알려주는 팝업이다.", r:"03 PT-11 · §4.7 8번"},
    {t:"삭제와 같은 원칙이다", d:"참조 중인 권역은 지울 수 없고(PT-9), 도형을 비워 저장하는 우회도 막고, <b>운영방식을 바꿔 탭째로 없애는 우회도 막는다.</b> 세 경로가 같은 규칙을 쓴다.", r:"03 PT-9 · PT-11"}
  ],
  render(){ return head({
      h:"운영방식 변경 차단 팝업",
      p:"지점 기본 정보에서 운영방식을 <span class='kbd'>벤더 존</span>에서 다른 것으로 바꾸려 할 때, <b>그 지점의 권역을 쓰는 곳이 있으면</b> 뜬다.",
      owner:"권역 담당자", review:"권역 서버 담당 팀"})
  + modal({title:"운영방식을 바꿀 수 없습니다",tag:"신설",tagk:"stop",actions:[{t:"확인",pri:1}]},
      `<div class="hint g" style="margin:0 0 12px"${note(4)}>» 이 지점의 권역을 아래에서 쓰고 있어 운영방식을 바꿀 수 없습니다.${mk(4)}</div>
      ${tbl([{t:"쓰는 곳"},{t:"무엇을"},{t:"먼저 할 일"}],[
        [ext("강남 영업존"),"<b>영업존 권역</b>","02에서 이 지점을 빼고 저장한다"],
        [ext("수도권 벤더 운영정책 v3"),"<b>벤더 배송권역</b>","09에서 이 권역의 연결을 끊고 저장한다"]
      ])}
      <div class="statemsg" style="margin-top:12px">둘 다 끊은 뒤에 다시 시도한다. <b>이 팝업은 순서를 알려주는 것</b>이지 대신 끊어주지 않는다.</div>`)
  + card({title:"경우에 따라 달라진다",mk:2}, tbl([{t:"쓰는 곳"},{t:"운영방식 변경"},{t:"그려 둔 권역"}],[
      ["<b>없다</b>",'<span class="pill ok">그냥 바뀐다</span> — 경고도 하지 않는다',"<b>지워지지 않고 보관된다.</b> 다시 「벤더 존」으로 되돌리면 그대로 나온다"],
      ["<b>있다</b>",'<span class="pill stop">막는다</span> — 이 팝업이 뜬다',"손대지 않는다"]
    ]))
  + plain({title:"권역을 없애는 경로를 전부 막는다",mk:5}, tbl([{t:"경로"},{t:"쓰는 곳이 있으면"},{t:"근거"}],[
      ["섹션에서 <b>삭제</b>","버튼 자체를 두지 않는다","PT-9"],
      ["도형을 <b>전부 비우고 저장</b>","막는다 — <span class='kbd'>이 권역은 {영업존명 / 정책명}이 쓰고 있어 비울 수 없습니다.</span>","PT-9 · §4.7 4번"],
      ["<b>운영방식을 바꿔</b> 탭째로 없애기","막는다 — <b>이 팝업</b>","PT-11 · §4.7 8번"]
    ]))
  + `<div class="foot"${note(3)}><span><b>액션</b> 확인 하나 — 강행할 선택지를 두지 않는다</span><span><b>탭이 사라져도 데이터는 남는다</b> 되돌리면 그대로 나온다 (PT-11)</span>${mk(3)}</div>`;}
};

/* ---------------- SCR_PT_004 편집 충돌 팝업 (§4.7 6번) ---------------- */
S.pt4 = {
  grp:"지역 관리", menu:"지점 관리", axis:"", sid:"SCR_PT_004", scr:"편집 충돌", doc:"03",
  notes:[
    {t:"편집 경로가 둘이라 생기는 일", d:"같은 권역을 <b>이 탭</b>과 <b>04 지점 권역 관리</b> 두 곳에서 고칠 수 있다. 두 화면이 <b>같은 원본</b>을 보므로, 내가 편집기를 열어 둔 사이 다른 사람이 04에서 저장하면 원본이 달라져 있다.", r:"03 PT-10 · §4.7 6번"},
    {t:"덮어쓰지 않는다", d:"<b>내 초안으로 상대의 저장을 지우지 않는다.</b> 마지막에 누른 사람이 이기는 방식이면 권역이 조용히 되돌아가고, 그 사이 중첩 검사를 통과했던 근거도 무의미해진다.", r:"03 §4.7 6번"},
    {t:"누가 언제 고쳤는지를 적는다", d:"상대의 <b>이름 · 저장 시각 · 저장 사유</b>를 보여준다. 사유가 필수이므로(PT-7) 왜 고쳤는지가 항상 남아 있다 — 다시 그리기 전에 읽어볼 수 있다.", r:"03 PT-7 · §4.7 6번"},
    {t:"다시 불러오고 다시 그린다", d:"<span class='kbd'>다시 불러오기</span>로 상대가 저장한 모양을 받은 뒤 그 위에 다시 그린다. <b>내 초안을 자동으로 합치지 않는다</b> — 폴리곤을 기계적으로 병합하면 의도하지 않은 모양이 나온다.", r:"03 §4.7 6번"},
    {t:"04에도 똑같이 있어야 한다", d:"04에서 편집하는 사이 이 탭에서 저장된 경우도 <b>같은 방식으로 막아야 한다.</b> 한쪽만 막으면 그쪽이 덮어쓰기 경로가 된다.", r:"03 PT-10"}
  ],
  render(){ return head({
      h:"편집 충돌 팝업",
      p:"내가 편집하는 사이 <b>다른 사람이 04 지점 권역 관리에서</b> 같은 권역을 고쳐 저장했을 때 뜬다.",
      owner:"권역 담당자", review:"권역 서버 담당 팀"})
  + modal({title:"저장할 수 없습니다 — 다른 곳에서 먼저 바뀌었습니다",tag:"신설",tagk:"stop",actions:[{t:"닫기"},{t:"다시 불러오기",pri:1}]},
      `<div class="hint g" style="margin:0 0 12px"${note(2)}>» 이 권역이 <b>04 지점 권역 관리</b>에서 먼저 저장되었습니다. 내 초안으로 덮어쓰지 않습니다.${mk(2)}</div>
      <div${note(3)}>${tbl([{t:"항목"},{t:"내용"}],[
        ["대상 권역","<b>부릉 강남2지점 영업존 권역</b>"],
        ["고친 사람","김현준B"],
        ["저장 시각",'<span class="mono">2026-09-10 11:24</span>'],
        ["저장 사유","강남대로 동편 경계 정리 — 서초 영업존과의 중복 해소"]
      ])}${mk(3)}</div>
      <div class="statemsg" style="margin-top:12px"${note(4)}><span class="kbd">다시 불러오기</span>를 누르면 <b>상대가 저장한 모양</b>을 받아온다. 내 초안은 사라지므로 그 위에 다시 그린다 — <b>자동으로 합치지 않는다.</b>${mk(4)}</div>`)
  + card({title:"왜 편집 경로가 둘인가",mk:1}, tbl([{t:"화면"},{t:"누가 쓰나"},{t:"보는 데이터"}],[
      ["<b>03 지점 조회 → 이 탭</b>","그 지점을 보고 있는 담당자","이 지점의 권역 2개"],
      ["<b>04 지점 권역 관리</b>","여러 지점을 한 화면에서 보는 담당자","<b>같은 원본</b>"]
    ])
    + `<div class="hint" style="margin-top:10px">둘이 같은 원본을 보므로 <b>중첩 검사도 충돌 검사도 두 곳에 똑같이</b> 두어야 한다. 한 쪽이라도 빠지면 그곳이 우회로가 된다 (PT-10 · 13 C-1).</div>`)
  + `<div class="foot"${note(5)}><span><b>액션</b> 닫기 · 다시 불러오기 — 강제 저장을 두지 않는다</span><span><b>04에도 같은 팝업이 필요하다</b> 한쪽만 막으면 그쪽이 덮어쓰기 경로가 된다</span>${mk(5)}</div>`;}
};
