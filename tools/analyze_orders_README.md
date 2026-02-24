# 오더 데이터 분석 스크립트

## 한 줄 설명

지점 오더 CSV를 입력받아 요일/시간대별 트렌드와 기사 생산성을 분석하고, 투입 인력을 산출합니다.

## 사용 방법

```bash
python tools/analyze_orders.py <CSV파일경로> [옵션]
```

### 옵션

| 옵션 | 기본값 | 설명 |
|------|--------|------|
| `--branch` | 전체 | 관리지점명 필터 키워드 (예: `중랑직영`) |
| `--days` | `1,2` | 분석 대상 요일. 숫자(0=월~6=일) 또는 한글(월,화,...) |
| `--hours` | `10-22` | 분석 시간 범위 |
| `--slot-size` | `2` | 슬롯 크기 (시간 단위) |
| `--beginner-factor` | `0.5-0.6` | 초보자 생산성 비율 (숙련자 대비) |
| `--coverage` | `0.6-0.7` | 오더 커버리지 목표 범위 |
| `--search-dir` | - | CSV 파일 검색 디렉토리 (한글 파일명 자동 탐색) |
| `--search-keyword` | - | 파일명 검색 키워드 (쉼표 구분) |

### Windows PowerShell 한글 파일명 우회

PowerShell에서 한글 파일명이 깨지는 경우, `--search-dir`과 `--search-keyword`로 대체할 수 있습니다.

또는 별도의 Python 래퍼 스크립트를 만들어 실행하세요:

```python
# run_analysis.py
import sys, pathlib
sys.argv = [
    'analyze_orders.py',
    '--search-dir', str(pathlib.Path.home() / 'Downloads'),
    '--search-keyword', '중랑,오더',
    '--branch', '중랑직영',
    '--days', '1,2',
    '--hours', '10-22',
]
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from analyze_orders import main
main()
```

## 예시

```bash
# 기본 실행 (화/수, 10-22시, 2시간 슬롯)
python tools/analyze_orders.py orders.csv --branch 중랑직영

# 목/금 분석, 3시간 슬롯
python tools/analyze_orders.py orders.csv --branch 강남 --days 3,4 --slot-size 3

# 디렉토리 검색으로 실행
python tools/analyze_orders.py --search-dir ~/Downloads --search-keyword 중랑,오더 --branch 중랑직영
```

## 출력 항목

1. **관리지점별 오더 분포** - 데이터 내 지점 구성 파악
2. **요일별 오더 분포** - 일평균 오더 수
3. **시간대별 오더 분포** - 24시간 히스토그램
4. **슬롯별 분석** - 대상 요일의 슬롯별 오더, 기사 수, 생산성
5. **일자별 기사 생산성** - 개별 날짜의 기사별 수행 건수
6. **인력 투입 권장안** - 초보자 생산성과 커버리지 목표 기반 산출

## 주의사항

- CSV는 UTF-8 인코딩이어야 합니다
- 필수 컬럼: `오더넘버`, `오더_생성_시점`, `수행한_기사_코드`, `관리지점명`
- `오더_생성_시점` 형식: `YYYY-MM-DD HH:MM:SS.sss +0900`
- Python 3.8 이상 필요, 외부 패키지 불필요 (표준 라이브러리만 사용)
