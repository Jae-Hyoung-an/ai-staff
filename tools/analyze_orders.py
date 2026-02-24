# -*- coding: utf-8 -*-
"""
오더 데이터 분석 스크립트

지점의 오더 CSV를 입력받아 요일/시간대별 트렌드와
기사 생산성을 분석합니다. 테스트베드 인력 산출의 기초자료로 활용됩니다.

사용법:
    python analyze_orders.py <CSV파일경로> [--branch 지점키워드] [--days 화,수] [--hours 10-22] [--slot-size 2]

예시:
    python analyze_orders.py "중랑직영센터_1월오더정보.csv" --branch 중랑직영 --days 화,수 --hours 10-22
    python analyze_orders.py orders.csv --branch 강남 --days 월,화,수 --hours 8-20 --slot-size 3
"""
import argparse
import csv
import math
import pathlib
import sys
from collections import Counter, defaultdict
from datetime import date, datetime

DAY_NAMES = ['월', '화', '수', '목', '금', '토', '일']
DAY_NAME_TO_IDX = {name: i for i, name in enumerate(DAY_NAMES)}


def parse_args():
    parser = argparse.ArgumentParser(description='오더 데이터 요일/시간대별 분석')
    parser.add_argument('csv_path', nargs='?', default=None,
                        help='오더 CSV 파일 경로 (또는 --search-dir 사용)')
    parser.add_argument('--search-dir', default=None,
                        help='CSV 파일을 검색할 디렉토리 (한글 파일명 자동 탐색)')
    parser.add_argument('--search-keyword', default=None,
                        help='파일명 검색 키워드 (예: 중랑, 오더)')
    parser.add_argument('--branch', default=None,
                        help='관리지점명 필터 키워드 (예: 중랑직영). 미지정시 전체')
    parser.add_argument('--days', default='1,2',
                        help='분석 대상 요일 (쉼표 구분). 숫자(0=월~6=일) 또는 한글(월,화,...) 가능. 기본값: 1,2 (화,수)')
    parser.add_argument('--hours', default='10-22',
                        help='분석 시간 범위 (예: 10-22)')
    parser.add_argument('--slot-size', type=int, default=2,
                        help='슬롯 크기(시간 단위, 기본값: 2)')
    parser.add_argument('--beginner-factor', default='0.5-0.6',
                        help='초보자 생산성 비율 범위 (숙련자 대비, 예: 0.5-0.6)')
    parser.add_argument('--coverage', default='0.6-0.7',
                        help='오더 커버리지 목표 범위 (예: 0.6-0.7)')
    return parser.parse_args()


def load_csv(csv_path, branch_keyword=None):
    """CSV 로드 후 지점 필터링. glob 패턴도 지원."""
    path = pathlib.Path(csv_path)
    if not path.exists():
        parent = path.parent
        if parent.exists():
            candidates = list(parent.glob(path.name))
            if not candidates:
                candidates = list(parent.glob('*.csv'))
                candidates = [c for c in candidates if any(
                    kw in c.name for kw in csv_path.split('_') if len(kw) > 1
                )]
            if candidates:
                path = candidates[0]
                print(f"[INFO] 파일 자동 매칭: {path.name}")
        if not path.exists():
            print(f"[ERROR] 파일을 찾을 수 없습니다: {csv_path}")
            sys.exit(1)

    with open(path, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    print(f"CSV 로드 완료: {len(rows)}건")

    branch_counter = Counter(r['관리지점명'] for r in rows)
    print("\n[관리지점별 오더 분포]")
    for branch, cnt in branch_counter.most_common():
        print(f"  {branch}: {cnt}건")

    if branch_keyword:
        filtered = [r for r in rows if branch_keyword in r['관리지점명']]
        print(f"\n'{branch_keyword}' 필터 적용: {len(filtered)}건")
        return filtered

    return rows


def parse_timestamp(ts_str):
    return datetime.strptime(ts_str.strip()[:19], '%Y-%m-%d %H:%M:%S')


def get_month_day_count(rows, dow):
    """데이터에 포함된 특정 요일의 고유 날짜 수"""
    dates = set()
    for r in rows:
        dt = parse_timestamp(r['오더_생성_시점'])
        if dt.weekday() == dow:
            dates.add(dt.date())
    return len(dates)


def analyze_day_of_week(rows):
    """요일별 분포 분석"""
    dow_counter = Counter()
    for r in rows:
        dt = parse_timestamp(r['오더_생성_시점'])
        dow_counter[dt.weekday()] += 1

    print("\n" + "=" * 60)
    print("[요일별 오더 분포]")
    print(f"  {'요일':<4} {'총 오더':<10} {'해당일수':<8} {'일평균':<10}")
    print("  " + "-" * 36)
    for dow in range(7):
        cnt = dow_counter.get(dow, 0)
        day_count = get_month_day_count(rows, dow)
        avg = cnt / day_count if day_count > 0 else 0
        print(f"  {DAY_NAMES[dow]:<4} {cnt:<10} {day_count:<8} {avg:<10.1f}")

    return dow_counter


def analyze_hourly(rows):
    """시간대별 분포 분석"""
    hour_counter = Counter()
    for r in rows:
        dt = parse_timestamp(r['오더_생성_시점'])
        hour_counter[dt.hour] += 1

    print("\n" + "=" * 60)
    print("[시간대별 오더 분포 (전체 요일)]")
    for h in range(24):
        cnt = hour_counter.get(h, 0)
        bar = "#" * (cnt // 20)
        print(f"  {h:02d}시: {cnt:>5}건  {bar}")

    return hour_counter


def analyze_slots(rows, target_days, hour_start, hour_end, slot_size):
    """대상 요일의 슬롯별 오더/기사 분석"""
    dow_hour_orders = defaultdict(int)
    dow_hour_drivers = defaultdict(set)
    daily_slot_data = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))

    for r in rows:
        dt = parse_timestamp(r['오더_생성_시점'])
        dow = dt.weekday()
        hour = dt.hour
        driver = r['수행한_기사_코드']
        day_key = dt.date()

        dow_hour_orders[(dow, hour)] += 1
        dow_hour_drivers[(dow, hour)].add(driver)
        daily_slot_data[dow][(day_key, hour)][driver] += 1

    results = {}

    for dow in target_days:
        day_count = get_month_day_count(rows, dow)
        if day_count == 0:
            continue

        print(f"\n{'=' * 60}")
        print(f"[{DAY_NAMES[dow]}요일 슬롯 분석 ({hour_start}-{hour_end}시, {slot_size}시간 단위)]")
        print(f"  데이터 기반: {day_count}일")
        print(f"  {'슬롯':<10} {'총 오더':<10} {'일평균':<10} {'기사(평균)':<12} {'생산성':<10}")
        print("  " + "-" * 52)

        slot_results = []
        for slot_start in range(hour_start, hour_end, slot_size):
            slot_end = min(slot_start + slot_size, hour_end)
            total_orders = sum(
                dow_hour_orders.get((dow, h), 0) for h in range(slot_start, slot_end)
            )
            all_drivers = set()
            for h in range(slot_start, slot_end):
                all_drivers.update(dow_hour_drivers.get((dow, h), set()))

            avg_orders = total_orders / day_count
            per_day_driver_counts = []
            per_day_productivities = []

            dates_for_dow = sorted(set(
                dk for (dk, h), _ in daily_slot_data[dow].items()
            ))
            for d in dates_for_dow:
                drivers_on_day = set()
                orders_on_day = 0
                for h in range(slot_start, slot_end):
                    for drv, cnt in daily_slot_data[dow].get((d, h), {}).items():
                        drivers_on_day.add(drv)
                        orders_on_day += cnt
                if drivers_on_day:
                    per_day_driver_counts.append(len(drivers_on_day))
                    per_day_productivities.append(orders_on_day / len(drivers_on_day))

            avg_drivers = (sum(per_day_driver_counts) / len(per_day_driver_counts)
                           if per_day_driver_counts else 0)
            avg_productivity = (sum(per_day_productivities) / len(per_day_productivities)
                                if per_day_productivities else 0)

            print(f"  {slot_start:02d}-{slot_end:02d}시  "
                  f"{total_orders:<10} {avg_orders:<10.1f} "
                  f"{avg_drivers:<12.1f} {avg_productivity:<10.1f}")

            slot_results.append({
                'slot_start': slot_start,
                'slot_end': slot_end,
                'total_orders': total_orders,
                'avg_orders': avg_orders,
                'avg_drivers': avg_drivers,
                'avg_productivity': avg_productivity,
                'per_day_productivities': per_day_productivities,
            })

        results[dow] = {
            'day_count': day_count,
            'slots': slot_results,
        }

    return results


def analyze_daily_drivers(rows, target_days, hour_start, hour_end):
    """일자별 기사 생산성 상세"""
    for dow in target_days:
        print(f"\n{'=' * 60}")
        print(f"[{DAY_NAMES[dow]}요일 일자별 기사 생산성 ({hour_start}-{hour_end}시)]")

        daily = defaultdict(lambda: defaultdict(int))
        for r in rows:
            dt = parse_timestamp(r['오더_생성_시점'])
            if dt.weekday() == dow and hour_start <= dt.hour < hour_end:
                daily[dt.date()][r['수행한_기사_코드']] += 1

        for day_key in sorted(daily.keys()):
            counts = daily[day_key]
            total = sum(counts.values())
            n = len(counts)
            avg = total / n if n > 0 else 0
            print(f"\n  {day_key} ({DAY_NAMES[day_key.weekday()]}): "
                  f"{total}건, {n}명, 평균 {avg:.1f}건/기사")
            for drv, cnt in sorted(counts.items(), key=lambda x: -x[1])[:5]:
                print(f"    기사 {drv}: {cnt}건")
            if len(counts) > 5:
                print(f"    ... 외 {len(counts) - 5}명")


def recommend_staffing(slot_results, beginner_low, beginner_high, cov_low, cov_high):
    """슬롯별 투입 인원 권장안 산출"""
    print(f"\n{'=' * 60}")
    print("[인력 투입 권장안]")
    print(f"  초보자 생산성: 숙련자의 {beginner_low*100:.0f}-{beginner_high*100:.0f}%")
    print(f"  커버리지 목표: {cov_low*100:.0f}-{cov_high*100:.0f}%")

    for dow, data in slot_results.items():
        avg_prod = sum(
            s['avg_productivity'] for s in data['slots']
        ) / len(data['slots']) if data['slots'] else 1

        beginner_prod_low = avg_prod * beginner_low
        beginner_prod_high = avg_prod * beginner_high
        cov_mid = (cov_low + cov_high) / 2

        print(f"\n  --- {DAY_NAMES[dow]}요일 ---")
        print(f"  숙련 기사 평균 생산성: {avg_prod:.1f}건/슬롯")
        print(f"  초보자 예상 생산성: {beginner_prod_low:.1f}-{beginner_prod_high:.1f}건/슬롯")
        print(f"\n  {'슬롯':<10} {'예상오더':<10} {'목표오더':<10} {'권장인원':<12}")
        print("  " + "-" * 42)

        total_person_slots = 0
        for s in data['slots']:
            target_orders = s['avg_orders'] * cov_mid
            staff_low = math.ceil(target_orders / beginner_prod_high) if beginner_prod_high > 0 else 0
            staff_high = math.ceil(target_orders / beginner_prod_low) if beginner_prod_low > 0 else 0
            total_person_slots += (staff_low + staff_high) // 2
            print(f"  {s['slot_start']:02d}-{s['slot_end']:02d}시  "
                  f"{s['avg_orders']:<10.1f} {target_orders:<10.1f} "
                  f"{staff_low}-{staff_high}명")

        print(f"\n  총 연인원: 약 {total_person_slots}명분")


def main():
    args = parse_args()

    target_days = []
    for d in args.days.split(','):
        d = d.strip()
        if d.isdigit() and 0 <= int(d) <= 6:
            target_days.append(int(d))
        elif d in DAY_NAME_TO_IDX:
            target_days.append(DAY_NAME_TO_IDX[d])
        else:
            print(f"[WARNING] 알 수 없는 요일: {d} (숫자 0-6 또는 한글 월~일)")

    if not target_days:
        print("[ERROR] 유효한 대상 요일이 없습니다.")
        sys.exit(1)

    hour_parts = args.hours.replace('=', '').split('-')
    hour_start, hour_end = int(hour_parts[0]), int(hour_parts[1])

    bf_parts = args.beginner_factor.split('-')
    beginner_low, beginner_high = float(bf_parts[0]), float(bf_parts[1])

    cov_parts = args.coverage.split('-')
    cov_low, cov_high = float(cov_parts[0]), float(cov_parts[1])

    csv_path = args.csv_path
    if not csv_path and args.search_dir:
        search_dir = pathlib.Path(args.search_dir)
        keywords = args.search_keyword.split(',') if args.search_keyword else []
        for f in sorted(search_dir.glob('*.csv')):
            if not keywords or all(kw in f.name for kw in keywords):
                csv_path = str(f)
                print(f"[INFO] 파일 발견: {f.name}")
                break
        if not csv_path:
            print(f"[ERROR] {search_dir}에서 조건에 맞는 CSV를 찾지 못했습니다.")
            sys.exit(1)
    elif not csv_path:
        print("[ERROR] csv_path 또는 --search-dir를 지정해주세요.")
        sys.exit(1)

    rows = load_csv(csv_path, args.branch)

    if not rows:
        print("[ERROR] 필터 결과가 비어있습니다.")
        sys.exit(1)

    drivers = set(r['수행한_기사_코드'] for r in rows)
    print(f"\n활동 기사 수: {len(drivers)}명")

    analyze_day_of_week(rows)
    analyze_hourly(rows)
    slot_results = analyze_slots(rows, target_days, hour_start, hour_end, args.slot_size)
    analyze_daily_drivers(rows, target_days, hour_start, hour_end)
    recommend_staffing(slot_results, beginner_low, beginner_high, cov_low, cov_high)


if __name__ == '__main__':
    main()
