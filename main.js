// main.js

// ———————————————————————————————
// 1) 구글 로그인 redirect 흐름 적용
// ———————————————————————————————
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("googleLoginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      // 현재 페이지 (path + query) 를 서버로 넘겨서
      // 로그인 후 동일 페이지로 돌아오도록 redirect 파라미터 설정
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/auth/google?redirect=${encodeURIComponent(currentPath)}`;
    });
  }

  // 로그인 콜백으로 돌아왔을 때 URL에 token 이 있으면 처리
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  if (token) {
    // 1) localStorage 에 JWT 저장
    localStorage.setItem("token", token);

    // 2) 브라우저 콘솔에 성공 메시지
    console.log("✅ 로그인 성공: JWT가 저장되었습니다.");

    // 3) 주소창에서 token 파라미터 제거
    urlParams.delete("token");
    const newUrl =
      window.location.pathname +
      (urlParams.toString() ? "?" + urlParams.toString() : "");
    history.replaceState({}, "", newUrl);
  }
});


// ———————————————————————————————
// 2) 장르 버튼 클릭, 영화 목록 렌더링
// ———————————————————————————————
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".genre-buttons button");
  const container = document.getElementById("genre-movie-container");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      // active 토글
      buttons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      const selectedGenre = button.textContent;
      console.log(`선택된 장르: ${selectedGenre}`);

      // API 호출 예시
      fetch(`https://api.example.com/movies?genre=${encodeURIComponent(selectedGenre)}`)
        .then(res => res.json())
        .then(movies => {
          container.innerHTML = '';
          movies.forEach(movie => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
              <img src="${movie.poster}" alt="${movie.title}" />
              <p style="text-align:center; margin-top:10px;">${movie.title}</p>
            `;
            container.appendChild(card);
          });
        })
        .catch(err => {
          container.innerHTML = "<p>영화를 불러오지 못했습니다 😥</p>";
          console.error("장르 영화 불러오기 실패:", err);
        });
    });
  });

  // 초기 로딩 시 '액션' 기본 실행
  if (buttons.length) buttons[0].click();
});


// ———————————————————————————————
// 3) 이주의 Hot 랭킹 슬라이더
// ———————————————————————————————
let hotMovieIndex = 0;
let hotActorIndex = 0;

function slideHotMovie(direction) {
  const slider = document.getElementById("hot-movie-slider");
  const items = slider.querySelectorAll(".slider-item");
  const total = items.length;
  if (total <= 1) return;

  hotMovieIndex = Math.max(0, Math.min(hotMovieIndex + direction, total - 1));
  slider.style.transform = `translateX(-${hotMovieIndex * 100}%)`;
}

function slideHotActor(direction) {
  const slider = document.getElementById("hot-actor-slider");
  const items = slider.querySelectorAll(".slider-item");
  const total = items.length;
  if (total <= 1) return;

  hotActorIndex = Math.max(0, Math.min(hotActorIndex + direction, total - 1));
  slider.style.transform = `translateX(-${hotActorIndex * 100}%)`;
}


// ———————————————————————————————
// 4) 추천 영화 동적 로딩
// ———————————————————————————————
document.addEventListener("DOMContentLoaded", () => {
  // (예시) 사용자 정보 — 실제론 로그인 후 JWT 디코딩해서 ID 사용
  const user = { name: "윤주상", id: "user001" };

  // 이름 표시
  const userNameElement = document.getElementById("user-name");
  if (userNameElement) userNameElement.textContent = user.name;

  // 추천 API 호출
  fetch(`https://api.example.com/recommendation?userId=${user.id}`)
    .then(res => res.json())
    .then(movies => {
      const container = document.getElementById("user-recommendation");
      container.innerHTML = '';
      if (!movies.length) {
        container.innerHTML = "<p>추천 영화가 없습니다.</p>";
        return;
      }
      movies.forEach(movie => {
        const card = document.createElement("div");
        card.className = "slider-item";
        card.innerHTML = `
          <img src="${movie.poster}" alt="${movie.title}" style="width:100%; border-radius:12px;">
          <p style="text-align:center; margin-top:10px;">${movie.title}</p>
        `;
        container.appendChild(card);
      });
    })
    .catch(err => {
      console.error("추천 영화 불러오기 실패:", err);
      document.getElementById("user-recommendation").innerHTML = "<p>데이터를 불러오지 못했습니다.</p>";
    });
});


// ———————————————————————————————
// 5) 검색바 & 히스토리
// ———————————————————————————————
document.addEventListener("DOMContentLoaded", () => {
  const searchButton = document.getElementById("search-button");
  const searchInput  = document.getElementById("search-input");

  if (searchButton) {
    searchButton.addEventListener("click", () => {
      const keyword = searchInput.value.trim();
      if (keyword) executeSearch(keyword);
    });
  }

  renderSearchHistory();
});

function handleEnterKey(event) {
  if (event.key === "Enter") {
    const keyword = event.target.value.trim();
    if (keyword) executeSearch(keyword);
  }
}

function executeSearch(keyword) {
  saveSearchKeyword(keyword);
  fetch(`https://api.example.com/search?query=${encodeURIComponent(keyword)}`)
    .then(res => res.json())
    .then(data => {
      console.log("✅ API 검색 결과:", data);
      window.location.href = `search.html?query=${encodeURIComponent(keyword)}`;
    })
    .catch(() => {
      window.location.href = `search.html?query=${encodeURIComponent(keyword)}`;
    });
}

function saveSearchKeyword(keyword) {
  let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  history = history.filter(k => k !== keyword);
  history.unshift(keyword);
  if (history.length > 5) history = history.slice(0, 5);
  localStorage.setItem("searchHistory", JSON.stringify(history));
}

function renderSearchHistory() {
  const container = document.getElementById("search-history");
  const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  if (!history.length) {
    container.style.display = "none";
    return;
  }
  container.innerHTML = '';
  history.forEach(keyword => {
    const item = document.createElement("div");
    item.className = "search-history-item";
    item.innerHTML = `<span onclick="executeSearch('${keyword}')">${keyword}</span>`;
    container.appendChild(item);
  });
  container.style.display = "block";
}
