const MAP_VIS = `<div class="map"><svg viewBox="0 0 640 330" role="img" aria-label="권역 시각화 — 기준 권역은 실선, 운영용 권역은 점선으로 겹쳐 그리고, 벤더 기준 권역의 중첩 구간과 연결이 빠진 권역을 함께 표시">
  <defs><pattern id="hatch" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
    <rect width="7" height="7" fill="var(--warn)" fill-opacity=".1"/><line x1="0" y1="0" x2="0" y2="7" stroke="var(--warn)" stroke-width="2.4" opacity=".55"/>
  </pattern></defs>
  ${MAPBG}
  <path d="M72 48 L252 38 L288 132 L214 208 L90 188 Z" fill="var(--cost)" fill-opacity=".13" stroke="var(--cost)" stroke-width="2"/>
  <path d="M232 52 L412 44 L444 142 L342 206 L240 180 Z" fill="var(--cost)" fill-opacity=".13" stroke="var(--cost)" stroke-width="2"/>
  <path d="M112 238 L302 230 L322 300 L138 302 Z" fill="var(--cost)" fill-opacity=".13" stroke="var(--cost)" stroke-width="2"/>
  <path d="M236 50 L252 38 L288 132 L248 198 L234 142 Z" fill="var(--cost)" fill-opacity=".34" stroke="var(--cost)" stroke-width="1.2" stroke-dasharray="3 3"/>
  <text x="240" y="152" font-family="IBM Plex Sans KR" font-size="12" font-weight="700" fill="var(--cost)">2겹</text>
  <path d="M370 216 L556 208 L578 300 L390 300 Z" fill="url(#hatch)" stroke="var(--warn)" stroke-width="2"/>
  <text x="406" y="254" font-family="IBM Plex Sans KR" font-size="13" font-weight="600" fill="var(--warn)">면목 전역</text>
  <text x="406" y="272" font-family="IBM Plex Sans KR" font-size="11" fill="var(--warn)">벤더 0 · 배차 안 됨</text>
  <path d="M258 66 L400 58 L428 138 L336 192 L262 168 Z" fill="none" stroke="var(--cost)" stroke-width="1.6" stroke-dasharray="6 4" opacity=".7"/>
  <path d="M84 58 L238 48 L266 122 L204 194 L100 176 Z" fill="none" stroke="var(--sales)" stroke-width="2.2"/>
  <path d="M96 68 L258 56 L292 128 L214 184 L112 168 Z" fill="none" stroke="var(--sales)" stroke-width="1.6" stroke-dasharray="6 4" opacity=".75"/>
  <path d="M302 146 L342 158 L328 214 L266 202 Z" fill="var(--surface-3)" stroke="var(--line-2)" stroke-width="1.5" stroke-dasharray="4 4"/>
  <text x="276" y="184" font-family="IBM Plex Sans KR" font-size="10" fill="var(--faint)">빈 지역</text>
  <text x="100" y="84" font-family="IBM Plex Sans KR" font-size="12" font-weight="600" fill="var(--cost)">성북 북부</text>
  <text x="330" y="84" font-family="IBM Plex Sans KR" font-size="12" font-weight="600" fill="var(--cost)">성북 동부</text>
  <text x="146" y="272" font-family="IBM Plex Sans KR" font-size="12" fill="var(--cost)">성북 남부</text>
  <text x="106" y="150" font-family="IBM Plex Sans KR" font-size="12" font-weight="600" fill="var(--sales)">성북 1 (영업 기준)</text>
</svg></div>`;

/* ================= NAV + ROUTER ================= */
const NAV = {
  "nav-region":[["ez","영업존 관리","s"],["vdr","벤더 배송권역 관리","c"],["vis","권역 시각화",""]],
  "nav-price":[["sp","판가 요금제 관리","s"],["ss","판가 할증 관리","s"],["cp","원가 요금제 관리","c"],["cs","원가 할증 관리","c"]],
  "nav-vendor":[["pol","배송권역 정책 관리","c"],["set","세트 분배 관리","c"],["ven","벤더 관리","c"]]
};
