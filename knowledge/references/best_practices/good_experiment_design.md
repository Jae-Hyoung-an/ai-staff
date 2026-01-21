# 좋은 실험설계의 원칙

## 핵심 요약

좋은 실험설계는 **내부 타당도(Internal Validity)**와 **효율성(Efficiency)**을 동시에 갖춘다.

> *"실험의 신뢰성이 보장되지 않는 결과는 조직의 의사결정을 오염시키는 독과 같다."* — Microsoft ExP

---

## 1. 내부 타당도: 외부 요인 통제

### 원칙
> 설정된 가설을 외부 요인의 개입 여지를 최소화한 상태에서 명확히 검증할 수 있어야 한다.

### 왜 중요한가
- 외부 요인을 통제(contain)하지 못하면, 관찰된 결과가 가설 때문인지 다른 요인 때문인지 구분 불가
- "가설이 맞았다/틀렸다"라고 명확히 말할 수 없는 실험은 의미 없음

### 체크리스트
- [ ] 실험군과 대조군이 동질한가? (랜덤 배정, 층화 등)
- [ ] 관찰 기간 동안 다른 변수가 개입할 가능성은 없는가?
- [ ] 계절성, 이벤트, 외부 캠페인 등의 노이즈를 격리했는가?
- [ ] 측정 방식 자체가 결과에 영향을 주지는 않는가?
- [ ] **SRM(Sample Ratio Mismatch) 검증**: 할당 비율이 설계대로 맞는가?

### 흔한 실패 패턴
| 실패 유형 | 예시 |
|-----------|------|
| 선택 편향 | 자발적 참여자만 실험군에 배정 |
| 동시 발생 이벤트 | 실험 기간 중 대규모 프로모션 진행 |
| 오염(Contamination) | 실험군 유저가 대조군에 정보 전파 |
| 이탈 편향 | 실험군에서만 특정 유형의 이탈 발생 |
| SRM | 50:50 설계인데 실제는 50.2:49.8 (기술적 결함 의심) |

---

## 2. 효율성: 최소 리소스로 명확한 결과

### 원칙
> 가능한 한 최소한의 리소스로 명확한 결과를 확인할 수 있어야 한다.

### 왜 중요한가
- 리소스(시간, 비용, 인력)는 항상 제한적
- 불필요하게 긴 실험은 기회비용을 증가시킴
- 빠른 학습 사이클이 경쟁력

### 체크리스트
- [ ] 필요한 샘플 사이즈를 사전에 계산했는가?
- [ ] 검정력(Power)과 유의수준을 적절히 설정했는가?
- [ ] 핵심 지표에 집중하고 있는가? (측정 지표 과다 = 비효율)
- [ ] 조기 종료 기준(Stopping Rule)을 정의했는가?

### 효율성 높이는 방법
1. **MDE(Minimum Detectable Effect) 명확화**: 의미 있는 최소 효과 크기를 먼저 정의
2. **단계적 실험**: 작은 규모로 신호 확인 → 확대
3. **사전 분석 계획**: 분석 방법을 미리 확정하여 사후 해석 오류 방지
4. **순차적 분석(Sequential Testing)**: SPRT 등으로 조기 종료 가능성 확보

---

## 3. 업계 표준 기준

### 가설 수립의 구체성
- 변경 요소(Change), 대상 그룹(Who), 기대 결과(Metric)가 모두 명시되어야 함
- 예시: *"결제 페이지의 입력 필드를 5개에서 3개로 줄이면, 신규 유저의 결제 전환율이 15% 증가할 것이다"*
- 추상적 목표 ❌: "클릭을 늘린다", "사용자 반응을 본다"

### 단일 변수 원칙 (Isolate One Variable)
- 한 실험에서 하나의 변수만 변경
- 여러 요소를 동시에 바꾸면 어떤 변화가 효과를 만들었는지 해석 불가
- 멀티베리에이트 테스트는 충분한 트래픽과 분석 역량이 있을 때만

### 테스트 기간 설정
- 최소 1~2주 또는 비즈니스 사이클 1회 이상 포함
- 요일/시간대/계절적 요인을 반영할 수 있는 기간
- 너무 짧으면 노이즈, 너무 길면 외부 요인 개입 위험

### QA 및 기술적 점검
- [ ] 실험 변형(Variant) 구현에 버그가 없는가?
- [ ] 이벤트 추적(Tracking)이 정확히 동작하는가?
- [ ] 브라우저/디바이스/플랫폼 간 호환성 검증했는가?
- [ ] 동일 사용자에게 일관된 버전이 노출되는가?

### 분석 후 학습 체계
- 단순히 "승자 선정"에 그치지 않음
- 왜 효과가 있었는지, 어떤 세그먼트에서 효과가 있었는지 분석
- 실험 메타데이터와 인사이트를 문서화하여 조직 학습에 재활용

### 지표 품질 기준: STEDII (Microsoft ExP)
| 기준 | 설명 |
|------|------|
| Sensitivity | 실제 변화를 감지할 수 있는가? |
| Trustworthiness | 데이터를 신뢰할 수 있는가? |
| Efficiency | 적은 샘플로 결론을 낼 수 있는가? |
| Debuggability | 문제 발생 시 원인을 찾을 수 있는가? |
| Interpretability | 결과를 해석하기 쉬운가? |
| Inclusivity | 모든 사용자 그룹을 포괄하는가? |

---

## 4. 빅테크 실험 프레임워크

### Microsoft ExP: 신뢰성 최우선
- **핵심 원칙**: 데이터 신뢰성이 보장되지 않으면 의사결정을 오염시킴
- **SRM 자동 탐지**: 실험 시작 후 수 시간 내 카이제곱 검정으로 할당 비율 검증
- **실무 팁**: p-value < 0.001인 SRM 발생 시, 결과 분석 전 엔지니어링 디버깅 먼저

### LinkedIn XLNT: 네트워크 효과 대응
- **핵심 원칙**: 소셜 플랫폼에서는 SUTVA가 성립하지 않음
- **그래프 클러스터 무작위화**: 연결된 사용자 그룹 단위로 할당
- **Metrics You Follow**: 내 지표에 영향 미치는 다른 팀 실험 자동 알림

### Netflix: 인터리빙(Interleaving)
- **핵심 원칙**: 사용자 간 차이(Between-subject Variance) 제거로 민감도 100배↑
- **Team Draft 알고리즘**: 한 사용자에게 A/B 알고리즘 추천을 섞어서 제공
- **적용**: 검색/추천 순위 알고리즘 테스트에 최적

### Airbnb ERF: 실험 지수(EQ)
- **실험 분류**: Market(수요검증) / Engineering(기술안정성) / Imagination(혁신)
- **ID 지속성**: 크로스 디바이스 패턴 대응을 위해 로그인 ID 기준 영구 매핑
- **실무 팁**: 실험 유형별로 성공 지표와 기간을 다르게 설정

### Booking.com: 승자의 저주 보정
- **핵심 원칙**: 실험 실패는 비용이 아니라 자산
- **Shrinkage**: 관찰된 개선율을 보수적으로 하향 조정하여 재무 예측에 반영
- **실무 팁**: 경영진 보고 시 신뢰구간 하한값 또는 과거 "실배포 효과 비율" 적용

---

## 5. 인과추론 이론적 기반

### 루빈 인과 모형 (Rubin Causal Model)
- **인과효과 정의**: 처치를 받았을 때의 결과(Y₁)와 받지 않았을 때의 결과(Y₀)의 차이
- **근본 문제**: 동일 개체에서 Y₁과 Y₀를 동시에 관찰 불가 → 집단 수준 평균(ATE)으로 추정

### SUTVA (Stable Unit Treatment Value Assumption)
- 한 유닛의 결과가 다른 유닛의 처치 여부에 영향받지 않아야 함
- **위배 상황**: 소셜 네트워크, 마켓플레이스, 배달 플랫폼
- **해결책**: Switchback, Cluster Randomization

### 준실험(Quasi-experimental) 설계

#### A. 합성 대조군 (Synthetic Control Method)
- **사용 시점**: 처치받은 단일 유닛의 대조군을 찾기 어려울 때
- **방법**: 처치받지 않은 여러 유닛을 가중 평균하여 가상의 대조군 생성
- **사례**: Uber가 Express POOL 샌프란시스코 출시 효과 측정 시, LA/시카고/뉴욕 데이터로 '합성 샌프란시스코' 생성
- **요구사항**: 처치 이전 데이터 최소 20-30개 시점, 위약 테스트(Placebo Test) 필수

#### B. 회귀 불연속 설계 (RDD)
- **사용 시점**: 특정 임계값 기준으로 처치 여부가 결정될 때
- **논리**: 699점과 701점 사용자는 사실상 동일한 특성 → 비교 가능
- **전제조건**: 임계값 근처에서 조작 불가능해야 함

#### C. 이중차분법 (DiD)
- **방법**: (처치군 전후 차이) - (통제군 전후 차이)
- **핵심 가정**: 평행 추세 가정 (처치 이전 기간 추세가 평행해야 함)

---

## 6. 도메인별 실험설계

| 도메인 | 특징 | 핵심 전략 | 주요 지표 |
|--------|------|----------|----------|
| **E-Commerce** | 높은 트래픽, 즉각적 전환, 계절성 | 퍼널별 A/B, Holdout 그룹 운영 | CVR, AOV, RPV |
| **SaaS (B2B)** | 낮은 트래픽, 긴 세일즈 사이클 | Account 단위 무작위화, 베이지안 | Lead Quality, Retention |
| **Gaming** | 난이도 밸런싱, 헤비 유저 의존 | 생존 분석, 동적 난이도 조절(MAB) | Day-N Retention, ARPU |
| **Media** | 콘텐츠 소비, 개인화 중요 | 인터리빙, Long-term Holdout | Time Spent, Diversity |

### B2B vs B2C 차이
| 구분 | B2C | B2B |
|------|-----|-----|
| 무작위화 단위 | 방문자/디바이스 | 회사(Account/Tenant) |
| p-value 기준 | 0.05 엄격 적용 | 0.10 허용, 실질적 유의성 중시 |
| 보완 방법 | 정량 데이터 위주 | 정성 인터뷰 + 영업팀 피드백 필수 |

### 저트래픽/초기 스타트업 전략
1. **과감한 변경 (Big Bets)**: 버튼 색깔 ❌ → 페이지 레이아웃 전체 변경 ✅
2. **베이지안 통계**: "B안이 더 나을 확률 80%"면 리스크 감수하고 배포
3. **순차적 분석**: 고정 샘플 채우기 전 조기 종료 가능

---

## 7. 고급 실험 기법

### 스위치백 실험 (Switchback)
- **적용**: 배달/승차공유 등 공유 자원이 있는 양면 시장
- **방법**: '시간-지역' 단위로 번갈아 가며 테스트 (오전 A, 오후 B)
- **주의**: Washout Period로 이월 효과(Carryover) 제거 필요

### 장기 홀드아웃 (Long-term Holdout)
- **목적**: 단기 실험으로 놓치는 장기 효과/누적 효과 측정
- **방법**: 전체 트래픽 1~5%를 6개월~1년간 변경 없이 유지
- **비용**: 기술 부채 및 하위 호환성 유지 비용 고려

### 클러스터 무작위화 (Cluster Randomization)
- **적용**: 소셜 네트워크, 협업 툴 등 사용자 간 연결이 강한 서비스
- **주의**: 클러스터 내 상관관계로 유효 샘플 사이즈 감소 → 더 큰 샘플 필요

### 인터리빙 (Interleaving)
- **적용**: 검색/추천 알고리즘 순위 테스트
- **장점**: 사용자 간 차이 상쇄 → A/B 대비 100배 민감도
- **주의**: 선호도 결과가 장기 지표(리텐션)와 상관 있는지 검증 필요

---

## 8. 최신 트렌드 (2025-2027)

### AI/자동화 활용
- 과거 데이터 기반 가설 자동 제안
- 트래픽 배분 자동 최적화 (Multi-armed Bandit)
- 실험 아이디어 우선순위 자동화

### 합성 사용자 (Synthetic Users)
- LLM 페르소나로 인간 행동 시뮬레이션 ("Silicon Sampling")
- **활용**: 설문조사 응답 예측, UI 사용성 테스트, 카피라이팅 선호도
- **전망**: 2026년까지 윤리적 위험이 높은 실험을 안전하게 수행하는 도구로 확산

### Privacy-first 환경 대응
- 서드파티 쿠키 종말 → 서버 사이드 실험으로 전환
- Google Privacy Sandbox: 개인 단위 → 코호트(Cohort) 단위 분석으로 변화
- 클라이언트 + 서버 하이브리드 실험

### Adaptive Experimentation
- 초기 균등 배분 → 유의미한 결과 시 트래픽 유동 조정
- 탐색(Exploration) 단계와 검증(Validation) 단계 분리
- Group Sequential Testing으로 조기 종료 조건 설정

### Multi-metric / 다중 목표
- 단일 KPI만 보지 않고 복합 지표 함께 고려
- 전환율 + 유지율 + LTV + 고객 경험(CX)
- **Guardrail Metrics**: 절대 해쳐서는 안 되는 지표 설정 (레이턴시, 앱 크래시, 고객 문의 수)

---

## 9. 실험 문화와 조직

### 실험 위원회 (Experimentation Council)
- **역할**: 설계 리뷰, 트래픽 충돌 조정, 배포 결정 지원
- **구조**: 데이터 과학자 + 엔지니어 + PM 리더
- **마인드**: '경찰'이 아닌 '가이드'

### 우선순위 프레임워크
| 프레임워크 | 요소 | 적합 상황 |
|-----------|------|----------|
| **RICE** | Reach, Impact, Confidence, Effort | 체계적 우선순위화 필요 시 |
| **ICE** | Impact, Confidence, Ease | 빠른 속도 중시, 초기 스타트업 |

- **Confidence 차등화**: 사용자 인터뷰 기반 100% / 직감 50%

### 실패를 학습 자산으로
- "실패한 실험 = 작동하지 않는 것을 확인한 성과"
- **실패 저장소**: Post-mortem 문서 작성 후 전사 공유
- **실패 축하 파티**: 심리적 안전감 조성

---

## 10. 피해야 할 안티패턴

| 안티패턴 | 문제점 | 대응 방안 |
|----------|--------|-----------|
| **가설 없이 테스트** | 측정/해석 기준 없음 | 실험 전 가설 문서화 필수 |
| **복합 변수 동시 변경** | 원인 특정 불가 | 단일 변수 원칙 준수 |
| **조기 종료 (Peeking)** | False positive 위험 | 사전 정의된 기간/종료 기준 준수 |
| **사후 세분화 (Data Snooping)** | Type I error 증가 | 세분화 기준 사전 정의 |
| **추적/계측 오류** | 데이터 신뢰도 붕괴 | QA 프로세스 필수화 |
| **일관되지 않은 UX** | 사용자 혼란 + 데이터 오염 | 세션/디바이스별 버전 고정 |
| **Proxy Metrics 과의존** | 장기 영향 무시 | LTV, 유지율 등 후행 지표 병행 |
| **편의 표본 사용** | 일반화 불가 | 무작위 배정 또는 층화 추출 |
| **대조군 변경** | 비교 기준 상실 | 실험 기간 중 대조군 동결 |
| **외부 요인 무시** | 결과 왜곡 | 실험 달력 관리, 이벤트 기록 |
| **승자의 저주 무시** | 효과 과대평가 | Shrinkage 보정 적용 |

---

## 11. 윤리 및 개인정보 보호

### 고려 사항
- **사용자 동의**: GDPR, CCPA 등 규정 준수, Opt-in/Opt-out 명확화
- **데이터 최소화**: 실험에 필요한 최소한의 데이터만 수집
- **익명화**: 개인 식별 불가능한 형태로 데이터 처리
- **실험 피로**: 동일 사용자가 과도한 실험에 노출되지 않도록 관리
- **위험 평가**: 실험이 특정 집단에 불이익을 주지 않는지 사전 검토

---

## 12. 재현성 및 문서화

### Experiments as Code (ExaC)
- 실험 설계, 실행, 분석 전 과정을 코드/스크립트로 관리
- 투명성, 감사 가능성, 재실행 가능성 확보

### 문서화 필수 항목
- [ ] 가설 및 배경
- [ ] 실험 설정 (대상, 기간, 배분 비율)
- [ ] 데이터 전처리 절차
- [ ] 분석 방법 및 코드
- [ ] 결과 및 인사이트
- [ ] 후속 액션

---

## 실험 설계 전 자문

1. 이 실험의 결과가 어떻게 나와도 **행동이 달라지는가?**
2. 실험 없이 **기존 데이터로 답을 구할 수는 없는가?**
3. 결과 해석 시 **"~때문"이라고 말할 수 있는 구조인가?**
4. 이 실험을 **다시 실행하면 같은 결과가 나올 수 있는가?**
5. 실험 대상에게 **윤리적으로 문제없는가?**

---

## 실험 설계 결정 트리

```
간섭 효과가 있는가?
├── Yes → Switchback / Cluster Randomization
└── No
    └── 트래픽이 적은가?
        ├── Yes → Bayesian / Synthetic Control / Big Bets
        └── No
            └── 랭킹/추천 알고리즘인가?
                ├── Yes → Interleaving
                └── No → User-level A/B Test
```

---

## 좋은 실험설계 공식

```
좋은 실험 = 명확한 가설 + 외부요인 통제 + 최소 리소스 + 재현 가능성
```

| 요소 | 질문 |
|------|------|
| 명확한 가설 | "무엇이 어떻게 변할 것인가?"가 구체적인가? |
| 외부요인 통제 | 결과가 오직 실험 변인 때문이라고 확신할 수 있는가? |
| 최소 리소스 | 이보다 더 적은 비용으로 같은 결론을 낼 수 없는가? |
| 재현 가능성 | 다른 사람이 같은 실험을 반복할 수 있는가? |

---

*"좋은 실험은 질문에 답하고, 나쁜 실험은 더 많은 질문을 만든다."*

---

## 참고 자료

### 빅테크 플랫폼 & 아키텍처
- Microsoft Research: Experimentation Platform (ExP) - [링크](https://www.microsoft.com/en-us/research/group/experimentation-platform-exp/articles/)
- LinkedIn Engineering: A/B Testing Platform Evolution - [링크](https://engineering.linkedin.com/ab-testing/evolution-ab-testing-platform-linkedin)
- Netflix Tech Blog: Interleaving - [링크](https://netflixtechblog.com/using-interleaving-in-online-experiments-to-accelerate-algorithm-innovation-at-netflix-a04ee392ec55)
- Airbnb Engineering: Safeguarding Changes in Production - [링크](https://medium.com/airbnb-engineering/how-airbnb-safeguards-changes-in-production-9fc9024f3446)
- Booking.com: Democratizing Experiments - [ResearchGate](https://www.researchgate.net/publication/320582817_Democratizing_online_controlled_experiments_at_Bookingcom)

### 인과추론 & 방법론
- DoorDash: Switchback Experiment Analysis - [링크](https://careersatdoordash.com/blog/experiment-rigor-for-switchback-experiment-analysis/)
- Harvard Business School: Design and Analysis of Switchback Experiments - [PDF](https://www.hbs.edu/ris/Publication%20Files/WP21-034.pdf)
- Alberto Abadie: Synthetic Control Method - [AEA](https://www.aeaweb.org/content/file?id=12409)
- PubMed: Quasi-Experimental Designs for Causal Inference - [링크](https://pmc.ncbi.nlm.nih.gov/articles/PMC6086368/)

### 도메인 & 조직 문화
- Statsig: A/B Testing for B2B Best Practices - [링크](https://www.statsig.com/perspectives/ab-testing-b2b-best-practices)
- Lukas Vermeer: Organising for Scaled Experimentation - [링크](https://www.lukasvermeer.nl/publications/2022/03/09/organising-for-scaled-experimentation.html)
- ProductPlan: RICE Scoring Model - [링크](https://www.productplan.com/glossary/rice-scoring-model/)

### 미래 트렌드
- arXiv: Synthetic Founders - AI-Generated Social Simulations - [링크](https://arxiv.org/html/2509.02605v1)
- Dynamic Yield: Client-side vs Server-side Testing - [링크](https://www.dynamicyield.com/lesson/client-side-vs-server-side/)
- Avenga: Google Privacy Sandbox Explained - [링크](https://www.avenga.com/magazine/chrome-privacy-sandbox-explained/)
