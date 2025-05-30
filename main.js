
document.addEventListener("DOMContentLoaded", () => {
  // ✅ 검색 버튼 클릭 및 엔터키 입력 시 결과 페이지로 이동
  const searchButton = document.getElementById('search-button');
  const searchInput = document.getElementById('search-input');

  function goToSearchResult() {
    const query = searchInput.value.trim();
    if (query) {
      window.location.href = `searchResult.html?query=${encodeURIComponent(query)}`;
    }
  }

  searchButton.addEventListener("click", goToSearchResult);
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") goToSearchResult();
  });

  // ✅ 로그인 처리
  const loginBtn = document.getElementById("googleLoginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/auth/google?redirect=${encodeURIComponent(currentPath)}`;
    });
  }

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (token) {
    localStorage.setItem("token", token);
    urlParams.delete("token");
    const newUrl = window.location.pathname + (urlParams.toString() ? "?" + urlParams.toString() : "");
    history.replaceState({}, "", newUrl);
    initializeAfterHeaderLoad();
  }

  // ✅ 검색 기록 기능
  const searchHistory = document.getElementById("search-history");

  function displaySearchHistory(query) {
    const historyItem = document.createElement("div");
    historyItem.textContent = query;
    historyItem.classList.add("search-history-item");

    const deleteButton = document.createElement("span");
    deleteButton.textContent = "❌";
    deleteButton.classList.add("delete-button");
    deleteButton.addEventListener("click", () => {
      historyItem.remove();
    });

    historyItem.appendChild(deleteButton);
    searchHistory.appendChild(historyItem);
  }

  searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query) {
      displaySearchHistory(query);
    }
  });

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const query = searchInput.value.trim();
      if (query) {
        displaySearchHistory(query);
      }
    }
  });
});

function initializeAfterHeaderLoad() {
  // ✅ 다크 모드 유지
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  }

  // ✅ 로그인 상태 확인 및 UI 갱신
  const token = localStorage.getItem("token");
  const loginStatus = document.getElementById("login-status");
  const loginBtn = document.getElementById("googleLoginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const myPageBtn = document.getElementById("myPageBtn");

  if (token) {
    fetch("/api/profile", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.userData) {
          const displayName = data.userData.displayName || "사용자";
          loginStatus.textContent = `${displayName}님이 로그인하였습니다`;
          loginBtn.style.display = "none";
          logoutBtn.style.display = "inline-block";
          myPageBtn.style.display = "inline-block";
          localStorage.setItem("userName", displayName);
        }
      })
      .catch(err => {
        console.error("프로필 정보 확인 실패:", err);
        localStorage.removeItem("token");
      });
  }

  loginBtn.addEventListener("click", () => {
    const currentPath = window.location.pathname + window.location.search;
    window.location.href = `/auth/google?redirect=${encodeURIComponent(currentPath)}`;
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    loginStatus.textContent = "";
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    myPageBtn.style.display = "none";
    alert("로그아웃되었습니다.");
    window.location.reload();
  });

  myPageBtn.addEventListener("click", () => {
    window.location.href = "/mypage.html";
  });

  // ✅ 장르 버튼 API 호출
  const genreButtons = document.querySelectorAll(".genre-buttons button");
  const genreContainer = document.getElementById("genre-movie-container");
  genreButtons.forEach(button => {
    button.addEventListener("click", () => {
      genreButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      const selectedGenre = button.textContent;
      fetch(`https://api.example.com/movies?genre=${encodeURIComponent(selectedGenre)}`)
        .then(res => res.json())
        .then(movies => {
          genreContainer.innerHTML = "";
          movies.forEach(movie => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
              <img src="${movie.poster}" alt="${movie.title}" />
              <p style="text-align:center; margin-top:10px;">${movie.title}</p>
            `;
            genreContainer.appendChild(card);
          });
        })
        .catch(err => {
          genreContainer.innerHTML = "<p>영화를 불러오지 못했습니다 😥</p>";
          console.error("장르 영화 불러오기 실패:", err);
        });
    });
  });

  if (genreButtons.length > 0) {
    genreButtons[0].click();
  }
}

// ✅ 슬라이드 제어 함수
let hotMovieIndex = 0;
let hotActorIndex = 0;

function slideHotMovie(direction) {
  const slider = document.getElementById("hot-movie-slider");
  const items = slider.querySelectorAll(".slider-item");
  if (items.length <= 1) return;
  hotMovieIndex = Math.max(0, Math.min(hotMovieIndex + direction, items.length - 1));
  slider.style.transform = `translateX(-${hotMovieIndex * 100}%)`;
}

function slideHotActor(direction) {
  const slider = document.getElementById("hot-actor-slider");
  const items = slider.querySelectorAll(".slider-item");
  if (items.length <= 1) return;
  hotActorIndex = Math.max(0, Math.min(hotActorIndex + direction, items.length - 1));
  slider.style.transform = `translateX(-${hotActorIndex * 100}%)`;
}

// ✅ TMDB API 키 설정 (자신의 키로 교체 필요)
const tmdbKey = '999dc9586a0cbbaf8d1f914c3b6bcdff';
