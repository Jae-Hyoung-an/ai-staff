# Git 설정 가이드

> 다른 PC에서 작업한 결과물과 동기화하기 위한 Git 설정 방법

## 1. Git 설치 확인

### Windows에서 Git 설치 여부 확인

PowerShell에서 다음 명령어 실행:
```powershell
git --version
```

### Git이 설치되어 있지 않은 경우

**방법 1: 공식 웹사이트에서 설치 (권장)**
1. https://git-scm.com/download/win 접속
2. 다운로드 후 설치 (기본 설정으로 진행해도 됩니다)
3. 설치 완료 후 PowerShell을 재시작

**방법 2: winget 사용 (Windows 10/11)**
```powershell
winget install --id Git.Git -e --source winget
```

**방법 3: Chocolatey 사용 (설치되어 있는 경우)**
```powershell
choco install git
```

## 2. Git 초기 설정 (최초 1회)

### 사용자 정보 설정

```powershell
git config --global user.name "당신의 이름"
git config --global user.email "당신의이메일@example.com"
```

예시:
```powershell
git config --global user.name "홍길동"
git config --global user.email "hong@example.com"
```

> 💡 이 정보는 모든 Git 저장소에서 사용됩니다. 다른 PC에서도 같은 정보를 사용하는 것을 권장합니다.

## 3. 현재 프로젝트 Git 초기화

프로젝트 폴더에서 다음 명령어 실행:

```powershell
# Git 저장소 초기화
git init

# 모든 파일 추가
git add .

# 첫 번째 커밋
git commit -m "Initial commit: 프로젝트 초기 설정"
```

## 4. 원격 저장소 연결

### GitHub 사용 (권장)

1. **GitHub에서 새 저장소 생성**
   - https://github.com/new 접속
   - 저장소 이름 입력 (예: `ax-leadership-sample`)
   - Public 또는 Private 선택
   - **"Initialize this repository with a README" 체크 해제** (이미 로컬에 파일이 있으므로)
   - "Create repository" 클릭

2. **로컬 저장소와 연결**
   ```powershell
   git remote add origin https://github.com/사용자명/저장소명.git
   ```

3. **원격 저장소로 푸시**
   ```powershell
   git branch -M main
   git push -u origin main
   ```

### 다른 Git 호스팅 서비스 사용

- **GitLab**: https://gitlab.com
- **Bitbucket**: https://bitbucket.org
- **자체 호스팅**: 회사 Git 서버 등

## 5. 다른 PC에서 동기화하기

### 첫 번째 PC에서 작업 후 푸시

```powershell
# 변경사항 확인
git status

# 변경된 파일 추가
git add .

# 커밋 (의미 있는 메시지 작성)
git commit -m "작업 내용 설명"

# 원격 저장소로 푸시
git push
```

### 두 번째 PC에서 클론 및 동기화

**처음 클론하는 경우:**
```powershell
git clone https://github.com/사용자명/저장소명.git
cd 저장소명
```

**이미 클론한 경우 (동기화):**
```powershell
# 원격 저장소의 최신 변경사항 가져오기
git pull

# 작업 후 푸시
git add .
git commit -m "작업 내용"
git push
```

## 6. 일상적인 워크플로우

### 작업 시작 전
```powershell
git pull  # 다른 PC에서 작업한 내용 가져오기
```

### 작업 완료 후
```powershell
git add .
git commit -m "명확한 작업 내용 설명"
git push
```

### 충돌 해결 (같은 파일을 동시에 수정한 경우)

1. `git pull` 시 충돌 메시지 확인
2. 충돌이 발생한 파일 열기
3. 충돌 마커 확인:
   ```
   <<<<<<< HEAD
   현재 PC의 내용
   =======
   다른 PC의 내용
   >>>>>>> branch-name
   ```
4. 충돌 해결 후:
   ```powershell
   git add .
   git commit -m "충돌 해결"
   git push
   ```

## 7. 유용한 Git 명령어

```powershell
# 현재 상태 확인
git status

# 변경 이력 보기
git log --oneline

# 특정 파일만 커밋
git add 파일명.md
git commit -m "메시지"

# 커밋 메시지 수정 (마지막 커밋)
git commit --amend -m "수정된 메시지"

# 원격 저장소 정보 확인
git remote -v
```

## 8. 주의사항

### ✅ 추적해야 할 파일
- 모든 `.md` 파일 (문서)
- `.yaml`, `.yml` 파일 (설정)
- `.gitignore`
- 프로젝트 구조 파일

### ❌ 추적하지 말아야 할 파일
- `.env` (환경 변수, 개인 정보)
- `*.key`, `*.pem` (보안 키)
- OS/에디터 임시 파일
- `node_modules/` (의존성, 필요시 다시 설치)

> 💡 `.gitignore` 파일에 이미 설정되어 있습니다.

## 9. 문제 해결

### "fatal: not a git repository" 오류
→ `git init` 실행 필요

### "Permission denied" 오류
→ GitHub 인증 필요 (Personal Access Token 또는 SSH 키 설정)

### "Your branch is ahead of 'origin/main'" 메시지
→ `git push` 실행 필요

### "Your branch is behind 'origin/main'" 메시지
→ `git pull` 실행 필요

---

## 다음 단계

1. Git 설치 확인
2. 사용자 정보 설정
3. `git init` 실행
4. 원격 저장소 생성 및 연결
5. 첫 번째 커밋 및 푸시

준비되면 알려주세요! 단계별로 도와드리겠습니다.
