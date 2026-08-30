const MAP_VIS = `<div class="map"><svg viewBox="0 0 640 330" role="img" aria-label="권역 시각화 — 영업존과 배송권역을 겹쳐 보고 연결이 빠진 권역을 빗금으로 표시">
  <defs><pattern id="hatch" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
    <rect width="7" height="7" fill="var(--warn)" fill-opacity=".1"/><line x1="0" y1="0" x2="0" y2="7" stroke="var(--warn)" stroke-width="2.4" opacity=".55"/>
  </pattern></defs>
  ${MAPBG}
  <path d="M86 52 L280 40 L318 140 L240 216 L104 196 Z" fill="var(--cost)" fill-opacity=".14" stroke="var(--cost)" stroke-width="2"/>
  <path d="M356 56 L520 48 L546 148 L432 200 L346 152 Z" fill="var(--cost)" fill-opacity=".14" stroke="var(--cost)" stroke-width="2"/>
  <path d="M120 240 L318 232 L338 302 L146 302 Z" fill="var(--cost)" fill-opacity=".14" stroke="var(--cost)" stroke-width="2"/>
  <path d="M382 218 L560 210 L580 302 L400 302 Z" fill="url(#hatch)" stroke="var(--warn)" stroke-width="2"/>
  <text x="418" y="262" font-family="IBM Plex Sans KR" font-size="13" font-weight="600" fill="var(--warn)">면목 전역</text>
  <text x="418" y="280" font-family="IBM Plex Sans KR" font-size="11" fill="var(--warn)">벤더 0 · 배차 안 됨</text>
  <path d="M96 60 L262 46 L300 132 L246 208 L118 190 Z" fill="none" stroke="var(--sales)" stroke-width="2" stroke-dasharray="6 4"/>
  <text x="128" y="112" font-family="IBM Plex Sans KR" font-size="13" font-weight="600" fill="var(--sales)">성북 1 (영업존)</text>
  <path d="M366 66 L508 58 L534 144 L436 190 L358 148 Z" fill="none" stroke="var(--sales)" stroke-width="2" stroke-dasharray="6 4"/>
  <text x="392" y="116" font-family="IBM Plex Sans KR" font-size="13" font-weight="600" fill="var(--sales)">강북 미아</text>
  <text x="128" y="272" font-family="IBM Plex Sans KR" font-size="12" fill="var(--cost)">성북 남부</text>
  <path d="M322 146 L350 156 L326 226 L252 212 Z" fill="var(--surface-3)" stroke="var(--line-2)" stroke-width="1.5" stroke-dasharray="4 4"/>
  <text x="264" y="298" font-family="IBM Plex Sans KR" font-size="11" fill="var(--faint)">빈 지역 — 그릴지 미결</text>
  <path d="M300 190 L288 288" stroke="var(--line-2)" stroke-width="1" stroke-dasharray="2 3"/>
</svg></div>`;

/* ================= NAV + ROUTER ================= */
const NAV = {
  "nav-region":[["ez","영업존 관리","s"],["vdr","벤더 배송권역 관리","c"],["vis","권역 시각화",""]],
  "nav-price":[["sp","판가 요금제 관리","s"],["ss","판가 할증 관리","s"],["cp","원가 요금제 관리","c"],["cs","원가 할증 관리","c"]],
  "nav-vendor":[["pol","배송권역 정책 관리","c"],["set","세트 분배 관리","c"],["ven","벤더 관리","c"]]
};
