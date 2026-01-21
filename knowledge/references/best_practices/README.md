# Best Practices 가이드

> 이 폴더의 문서들은 AI가 업무 수행 시 참고하는 기준 문서입니다.
> 각 문서는 프레임워크, 체크리스트, 템플릿, 도메인 예시를 포함합니다.

---

## 📋 문서 목록

| 문서 | 설명 | 핵심 내용 |
|------|------|----------|
| `good_problem_definition.md` | 문제 정의 | 5 Whys, JTBD, 가설 수립, 지표 설계 |
| `good_prd_writing.md` | PRD 작성 | 구조, 템플릿, 작성 원칙 |
| `good_experiment_design.md` | 실험 설계 | A/B 테스트, 가설 검증, 샘플 사이즈 |
| `good_product_roadmap.md` | 로드맵 수립 | Now-Next-Later, 템플릿, 우선순위 |
| `good_prioritization.md` | 우선순위 결정 | RICE, MoSCoW, Impact-Effort |
| `good_okr_kpi_setting.md` | OKR/KPI 설계 | 작성 템플릿, 지표 위계, 운영 |
| `good_user_research.md` | 사용자 리서치 | 인터뷰 질문, 계획 템플릿, 분석 |
| `good_data_analysis_for_pm.md` | 데이터 분석 | 접근 방식, 퍼널/코호트, 지표 설계 |
| `good_stakeholder_management.md` | 이해관계자 관리 | RACI, 커뮤니케이션 템플릿 |
| `good_executive_reporting.md` | 경영진 보고 | BLUF, 보고서 템플릿 |
| `good_project_management.md` | 프로젝트 관리 | 애자일, 리스크, 회고 |
| `good_market_analysis.md` | 시장 분석 | TAM/SAM/SOM, Five Forces |

---

## 🎯 업무 상황별 참조 가이드

### 새로운 기능/프로젝트 시작

```
1. good_problem_definition.md  → 문제 정의 및 가설 수립
2. good_user_research.md       → 사용자 검증 계획
3. good_prd_writing.md         → PRD 작성
4. good_experiment_design.md   → 실험 설계
```

### 분기/연간 계획 수립

```
1. good_okr_kpi_setting.md     → OKR/KPI 설계
2. good_product_roadmap.md     → 로드맵 수립
3. good_prioritization.md      → 우선순위 결정
```

### 프로젝트 진행 중

```
1. good_project_management.md  → 일정/리스크 관리
2. good_stakeholder_management.md → 이해관계자 소통
3. good_data_analysis_for_pm.md   → 데이터 분석
```

### 보고 및 의사소통

```
1. good_executive_reporting.md → 경영진 보고서 작성
2. good_stakeholder_management.md → 상황별 커뮤니케이션
```

### 시장/경쟁 분석

```
1. good_market_analysis.md     → 시장 분석
2. good_user_research.md       → 사용자 리서치
```

---

## 🔗 문서 간 연결 관계

```
                    [문제 발견]
                         │
                         ▼
            ┌─── good_problem_definition.md ───┐
            │                                   │
            ▼                                   ▼
    good_user_research.md              good_data_analysis_for_pm.md
            │                                   │
            └──────────────┬───────────────────┘
                           ▼
                   good_prd_writing.md
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
    good_prioritization  good_experiment  good_product_roadmap
            │              │              │
            └──────────────┼──────────────┘
                           ▼
              good_project_management.md
                           │
            ┌──────────────┴──────────────┐
            ▼                              ▼
    good_stakeholder_management    good_executive_reporting
```

---

## 📝 각 문서의 핵심 구성 요소

### 모든 문서에 공통 포함

- ✅ **원칙/프레임워크**: 판단 기준 제공
- ✅ **체크리스트**: 빠짐없이 검토할 수 있는 목록
- ✅ **템플릿**: 바로 활용 가능한 문서 형식
- ✅ **좋은/나쁜 예시**: 명확한 품질 기준
- ✅ **도메인 예시**: 배달/물류 특화 적용 사례

---

## 🚀 AI 활용 시 참고 사항

### 문서 활용 원칙

1. **관련 문서 먼저 읽기**: 업무 수행 전 해당 문서의 원칙과 체크리스트 확인
2. **템플릿 활용**: 처음부터 작성하지 말고 템플릿 기반으로 작성
3. **체크리스트 적용**: 작성 완료 후 체크리스트로 검토
4. **도메인 예시 참조**: 배달/물류 도메인 예시를 참고하여 맥락 반영

### 문서 우선순위

| 상황 | 최우선 참조 문서 |
|------|----------------|
| PRD 작성 요청 | `good_prd_writing.md` + `good_problem_definition.md` |
| OKR 수립 요청 | `good_okr_kpi_setting.md` |
| 보고서 작성 요청 | `good_executive_reporting.md` |
| 우선순위 결정 요청 | `good_prioritization.md` |
| 리서치 계획 요청 | `good_user_research.md` |
| 실험 설계 요청 | `good_experiment_design.md` |
| 데이터 분석 요청 | `good_data_analysis_for_pm.md` |

---

## 📅 문서 업데이트 이력

| 날짜 | 문서 | 변경 내용 |
|------|------|----------|
| 2026-01-21 | 전체 | 도메인 특화 예시 추가 |
| 2026-01-21 | 개선 필요 6개 문서 | 템플릿 및 가이드 강화 |
| 2026-01-21 | README.md | 인덱스 문서 신규 생성 |

---

*이 문서들은 지속적으로 업데이트됩니다. 새로운 베스트 프랙티스나 개선 사항이 있으면 반영해주세요.*
