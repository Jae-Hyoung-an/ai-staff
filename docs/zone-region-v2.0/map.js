/* ================= 지도 =================
   실제 지도 타일이 아니라 도식이다. 폴리곤의 모양·위치는 의미 없다. */
const MAPBG = `<rect width="640" height="330" fill="var(--surface-2)"/>
  <g stroke="var(--line-soft)" stroke-width="1" opacity=".8">
    ${Array.from({length:13},(_,i)=>`<line x1="${i*50}" y1="0" x2="${i*50}" y2="330"/>`).join("")}
    ${Array.from({length:7},(_,i)=>`<line x1="0" y1="${i*50}" x2="640" y2="${i*50}"/>`).join("")}
  </g>
  <path d="M0 214 C 90 200, 170 236, 250 220 S 420 186, 520 208 S 620 226, 640 218" fill="none" stroke="var(--cost)" stroke-width="7" opacity=".16" stroke-linecap="round"/>`;

/* 02 §4.3 섹션4 — 표시 대상은 「연결된 영업 기준 권역 1개」뿐이다.
   다른 영업존의 권역도, 겹치는 구간도 그리지 않는다. 중첩 상대는 문구로만 알린다 (02 S-4). */
const MAP_EZ = `<div class="map"><svg viewBox="0 0 640 330" role="img" aria-label="영업존 지도 — 연결된 영업 기준 권역 1개만 표시">
  ${MAPBG}
  <path d="M96 60 L262 46 L300 132 L246 208 L118 190 Z" fill="var(--sales)" fill-opacity=".18" stroke="var(--sales)" stroke-width="2.2"/>
  <text x="140" y="126" font-family="Pretendard Variable" font-size="15" font-weight="600" fill="var(--sales)">미아 zone</text>
  <text x="140" y="148" font-family="IBM Plex Mono" font-size="12" fill="var(--sales)" opacity=".85">법정동 18 · 9.7 km²</text>
</svg></div>`;

/* 09 §4.3 섹션3 — 정책에 연결된 권역들을 한 장에. 중첩은 정상이므로 경고 없이 보여준다.
   떨어져 있는 권역끼리 묶여 있어도 정상 (정책은 지리적 단위가 아니다). */
const MAP_POL = `<div class="map"><svg viewBox="0 0 640 330" role="img" aria-label="정책 지도 — 연결된 배송권역 3개, 겹치는 구간, 이웃 사이의 빈 지역, 다른 정책의 권역">
  <defs><pattern id="ovl2" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
    <rect width="7" height="7" fill="var(--cost)" fill-opacity=".12"/><line x1="0" y1="0" x2="0" y2="7" stroke="var(--cost)" stroke-width="2.4" opacity=".55"/>
  </pattern>
  <pattern id="gap" width="7" height="7" patternTransform="rotate(-45)" patternUnits="userSpaceOnUse">
    <rect width="7" height="7" fill="var(--warn)" fill-opacity=".12"/><line x1="0" y1="0" x2="0" y2="7" stroke="var(--warn)" stroke-width="2.2" opacity=".55"/>
  </pattern></defs>
  ${MAPBG}
  <path d="M64 52 L236 40 L272 138 L196 214 L80 194 Z" fill="var(--cost)" fill-opacity=".16" stroke="var(--cost)" stroke-width="2.2"/>
  <path d="M206 46 L378 38 L410 140 L312 208 L212 178 Z" fill="var(--cost)" fill-opacity=".16" stroke="var(--cost)" stroke-width="2.2"/>
  <path d="M120 240 L310 232 L330 302 L146 304 Z" fill="var(--cost)" fill-opacity=".16" stroke="var(--cost)" stroke-width="2.2"/>
  <path d="M206 46 L236 40 L272 138 L212 178 Z" fill="url(#ovl2)" stroke="var(--cost)" stroke-width="1.2" stroke-dasharray="3 3"/>
  <text x="214" y="118" font-family="Pretendard Variable" font-size="12" font-weight="700" fill="var(--cost)">2겹</text>
  <path d="M196 214 L312 208 L310 232 L146 240 L120 240 Z" fill="url(#gap)" stroke="var(--warn)" stroke-width="1.6" stroke-dasharray="5 4"/>
  <text x="196" y="232" font-family="Pretendard Variable" font-size="11" font-weight="600" fill="var(--warn)">빈 지역</text>
  <text x="92" y="112" font-family="Pretendard Variable" font-size="13" font-weight="600" fill="var(--cost)">강남 벤더 배송권역</text>
  <text x="92" y="132" font-family="IBM Plex Mono" font-size="11" fill="var(--cost)" opacity=".85">18.4 km²</text>
  <text x="250" y="104" font-family="Pretendard Variable" font-size="13" font-weight="600" fill="var(--cost)">서초 벤더 배송권역</text>
  <text x="250" y="124" font-family="IBM Plex Mono" font-size="11" fill="var(--cost)" opacity=".85">22.1 km²</text>
  <text x="150" y="276" font-family="Pretendard Variable" font-size="13" font-weight="600" fill="var(--cost)">마포 벤더 배송권역</text>
  <text x="150" y="296" font-family="IBM Plex Mono" font-size="11" fill="var(--cost)" opacity=".85">23.8 km²</text>
  <path d="M404 176 L560 168 L582 288 L420 292 Z" fill="none" stroke="var(--line-2)" stroke-width="1.6" stroke-dasharray="6 4"/>
  <text x="430" y="234" font-family="Pretendard Variable" font-size="12" fill="var(--faint)">송파 벤더 배송권역</text>
  <text x="430" y="252" font-family="Pretendard Variable" font-size="10.5" fill="var(--dim)">수도권 벤더 운영정책 v2</text>
  <path d="M78 60 L226 50 L256 132 L192 196 L92 182 Z" fill="none" stroke="var(--sales)" stroke-width="1.4" stroke-dasharray="4 4" opacity=".75"/>
  <text x="100" y="174" font-family="Pretendard Variable" font-size="11" fill="var(--sales)">영업존 권역 (레이어)</text>
</svg></div>`;
