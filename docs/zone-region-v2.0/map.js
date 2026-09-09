/* ================= 지도 =================
   실제 지도 타일이 아니라 도식이다. 폴리곤의 모양·위치는 의미 없다. */
const MAPBG = `<rect width="640" height="330" fill="var(--surface-2)"/>
  <g stroke="var(--line)" stroke-width="1" opacity=".7">
    ${Array.from({length:13},(_,i)=>`<line x1="${i*50}" y1="0" x2="${i*50}" y2="330"/>`).join("")}
    ${Array.from({length:7},(_,i)=>`<line x1="0" y1="${i*50}" x2="640" y2="${i*50}"/>`).join("")}
  </g>
  <path d="M0 214 C 90 200, 170 236, 250 220 S 420 186, 520 208 S 620 226, 640 218" fill="none" stroke="var(--cost)" stroke-width="7" opacity=".13" stroke-linecap="round"/>`;

/* 02 §4.3 섹션4 — 표시 대상은 「연결된 영업 기준 권역 1개」뿐이다.
   다른 영업존의 권역도, 겹치는 구간도 그리지 않는다. 중첩 상대는 문구로만 알린다 (02 S-4). */
const MAP_EZ = `<div class="map"><svg viewBox="0 0 640 330" role="img" aria-label="영업존 지도 — 연결된 영업 기준 권역 1개만 표시">
  ${MAPBG}
  <path d="M96 60 L262 46 L300 132 L246 208 L118 190 Z" fill="var(--sales)" fill-opacity=".16" stroke="var(--sales)" stroke-width="2.2"/>
  <text x="140" y="126" font-family="IBM Plex Sans KR" font-size="14" font-weight="600" fill="var(--sales)">미아 zone</text>
  <text x="140" y="146" font-family="IBM Plex Mono" font-size="11" fill="var(--sales)" opacity=".8">법정동 18 · 9.7 km²</text>
</svg></div>`;
