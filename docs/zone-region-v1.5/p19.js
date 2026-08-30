/* ================= MAPS ================= */
const MAPBG = `<rect width="640" height="330" fill="var(--surface-2)"/>
  <g stroke="var(--line)" stroke-width="1" opacity=".7">
    ${Array.from({length:13},(_,i)=>`<line x1="${i*50}" y1="0" x2="${i*50}" y2="330"/>`).join("")}
    ${Array.from({length:7},(_,i)=>`<line x1="0" y1="${i*50}" x2="640" y2="${i*50}"/>`).join("")}
  </g>
  <path d="M0 214 C 90 200, 170 236, 250 220 S 420 186, 520 208 S 620 226, 640 218" fill="none" stroke="var(--cost)" stroke-width="7" opacity=".13" stroke-linecap="round"/>`;

const MAP_EZ = `<div class="map"><svg viewBox="0 0 640 330" role="img" aria-label="영업존 지도 — 고른 세일즈 권역 하나만 표시">
  ${MAPBG}
  <path d="M96 60 L262 46 L300 132 L246 208 L118 190 Z" fill="var(--sales)" fill-opacity=".16" stroke="var(--sales)" stroke-width="2"/>
  <text x="150" y="130" font-family="IBM Plex Sans KR" font-size="14" font-weight="600" fill="var(--sales)">미아 zone</text>
  <text x="150" y="150" font-family="IBM Plex Mono" font-size="11" fill="var(--sales)" opacity=".8">법정동 18</text>
  <path d="M330 74 L470 62 L500 150 L410 200 L322 160 Z" fill="none" stroke="var(--line-2)" stroke-width="1.5" stroke-dasharray="5 4"/>
  <text x="360" y="132" font-family="IBM Plex Sans KR" font-size="12" fill="var(--faint)">성북 1 zone (다른 영업존)</text>
  <path d="M150 236 L330 228 L352 300 L176 300 Z" fill="none" stroke="var(--line-2)" stroke-width="1.5" stroke-dasharray="5 4"/>
  <text x="176" y="272" font-family="IBM Plex Sans KR" font-size="12" fill="var(--faint)">상계 zone (다른 영업존)</text>
</svg></div>`;

const MAP_VDR = `<div class="map"><svg viewBox="0 0 640 330" role="img" aria-label="벤더 배송권역 지도 — 이 권역, 이웃 권역, 겹쳐 보는 영업존, 빈 지역">
  ${MAPBG}
  <path d="M96 60 L262 46 L300 132 L246 208 L118 190 Z" fill="none" stroke="var(--sales)" stroke-width="1.5" stroke-dasharray="3 4" opacity=".55"/>
  <path d="M86 52 L280 40 L318 140 L240 216 L104 196 Z" fill="var(--cost)" fill-opacity=".18" stroke="var(--cost)" stroke-width="2.5"/>
  <text x="132" y="118" font-family="IBM Plex Sans KR" font-size="15" font-weight="600" fill="var(--cost)">성북 북부</text>
  <text x="132" y="138" font-family="IBM Plex Mono" font-size="11" fill="var(--cost)" opacity=".85">12.4 km²</text>
  <path d="M356 56 L520 48 L546 148 L432 200 L346 152 Z" fill="var(--cost)" fill-opacity=".07" stroke="var(--line-2)" stroke-width="1.5"/>
  <text x="392" y="120" font-family="IBM Plex Sans KR" font-size="12" fill="var(--muted)">미아 전역</text>
  <path d="M120 240 L318 232 L338 302 L146 302 Z" fill="var(--cost)" fill-opacity=".07" stroke="var(--line-2)" stroke-width="1.5"/>
  <text x="160" y="274" font-family="IBM Plex Sans KR" font-size="12" fill="var(--muted)">성북 남부</text>
  <path d="M318 140 L346 152 L318 232 L240 216 Z" fill="var(--warn)" fill-opacity=".14" stroke="var(--warn)" stroke-width="1.5" stroke-dasharray="4 4"/>
  <text x="248" y="196" font-family="IBM Plex Sans KR" font-size="11" font-weight="600" fill="var(--warn)">빈 지역</text>
</svg></div>`;
