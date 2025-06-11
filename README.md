
# 🎬 오늘의 영화 추천

사용자가 영화 제목, 장르, 인기 순위 등을 기준으로 영화 정보를 검색하고 추천받을 수 있는 웹 애플리케이션입니다. TMDB, API를 활용하여 다양한 영화 정보를 제공합니다.

---

## 📌 기능 소개

- 🔍 영화 검색: 영화 제목으로 실시간 검색
- 🌟 인기 영화: 일간/주간 인기 영화 랭킹 제공
- 🎭 장르별 추천: 선택한 장르에 맞는 영화 추천
- 📄 상세 페이지: 영화 포스터, 줄거리, 평점, 개봉일 등 상세 정보 제공

---

## 💻 기술 스택

- **Frontend**: HTML, CSS, JavaScript (Vanilla JS)
- **Backend**: Node.js (server.js), Express
- **API**: [TMDB (The Movie Database)](https://www.themoviedb.org/)
- **기타**: JWT 인증, 로컬 스토리지 기반 검색 기록 저장 등

---

## 🏗️ 폴더 구조 예시

```plaintext
📦project-root
 ┣ 📂public
 ┃ ┗ 📂scripts
 ┃   ┣ 📜main.js
 ┃   ┣ 📜genre.js
 ┃   ┣ 📜dailyrank.js
 ┃   ┣ 📜weeklyrank.js
 ┃   ┗ 📜searchResearch.js
 ┣ ┗ 📂css
 ┃    ┣ 📜style.css
 ┃    ┣ 📜searchResearch.css
 ┣ ┗ 📂html
 ┃    ┣ 📜index.html
 ┃    ┣ 📜search.html
 ┃    ┣ 📜searchResearch.html
 ┣ 📂server
 ┃ ┗ 📜server.js
 ┣ 📜package.json
 ┣ 📜개발일지.txt
 ┗ 📜README.md
```

---

## ⚙️ 설치 및 실행 방법

1. 저장소 클론
   ```bash
   git clone https://github.com/your-username/movie-recommendation.git
   cd movie-recommendation
   ```

2. 의존성 설치
   ```bash
   npm install
   ```

3. 서버 실행
   ```bash
   node server/server.js
   ```

4. 브라우저에서 확인
   ```
   http://localhost:포트번호
   ```

---

## 🧪 테스트 방법

- 브라우저 콘솔에서 검색 기능, 추천 기능이 정상 작동하는지 확인
- TMDB API 응답 확인

---

## 📌 추후 개선사항

- 사용자 로그인 기능 추가
- 영화 평점 기반 추천 알고리즘 개선
- 다크모드 UI 지원

---

## 🙌 제작자

- 백한국, 윤주상, 이민준 (문제해결프로젝트3 개발팀, 한경국립대학교)
