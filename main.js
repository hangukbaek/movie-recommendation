document.addEventListener("DOMContentLoaded", () => {
  // ✅ 다크 모드 유지
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  }

  // ✅ 구글 로그인 버튼 설정
  const loginBtn = document.getElementById("googleLoginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const myPageBtn = document.getElementById("myPageBtn");
  const loginStatus = document.getElementById("login-status");

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/auth/google?redirect=${encodeURIComponent(currentPath)}`;
    });
  }

  // ✅ 로그인 콜백으로 돌아온 경우 token 처리
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  if (token) {
    localStorage.setItem("token", token);
    console.log("✅ 로그인 성공: JWT가 저장되었습니다.");
    urlParams.delete("token");
    const newUrl = window.location.pathname + (urlParams.toString() ? "?" + urlParams.toString() : "");
    history.replaceState({}, "", newUrl);
  }

  // ✅ 로그인 상태 확인 및 UI 갱신
  const storedToken = localStorage.getItem("token");
  if (storedToken) {
    fetch("/api/profile", { headers: { Authorization: `Bearer ${storedToken}` } })
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
        console.error("프로필 확인 실패:", err);
        localStorage.removeItem("token");
      });
  }

  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    loginStatus.textContent = "";
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    myPageBtn.style.display = "none";
    alert("로그아웃되었습니다.");
    window.location.reload();
  });

  myPageBtn?.addEventListener("click", () => {
    window.location.href = "/mypage.html";
  });

  // ✅ 사용자 기반 추천 영화
  const userName = localStorage.getItem("userName") || "게스트";
  const nameEl = document.getElementById("user-name");
  if (nameEl) nameEl.textContent = userName;

  fetch(`https://api.example.com/recommendation?user=${encodeURIComponent(userName)}`)
    .then(res => res.json())
    .then(recommendations => {
      const container = document.getElementById("user-recommendation");
      if (!recommendations.length) {
        container.innerHTML = "<p>추천 영화를 찾을 수 없습니다.</p>";
        return;
      }
      container.innerHTML = "";
      recommendations.forEach(movie => {
        const card = document.createElement("div");
        card.className = "slider-item";
        card.innerHTML = `
          <img src="${movie.poster}" alt="${movie.title}" style="width:100%; border-radius:12px;">
          <p style="text-align:center; margin-top:10px;">${movie.title}</p>
        `;
        card.addEventListener("click", () => {
          window.location.href = `detail.html?title=${encodeURIComponent(movie.title)}`;
        });
        container.appendChild(card);
      });
    })
    .catch(err => {
      const container = document.getElementById("user-recommendation");
      container.innerHTML = "<p>추천 영화를 불러오는 데 실패했습니다 😥</p>";
      console.error("추천 영화 API 실패:", err);
    });

  // ✅ 장르 버튼 클릭 시 API 호출
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

  // ✅ 검색바 기능
  const searchButton = document.getElementById("search-button");
  const searchInput = document.getElementById("search-input");

  searchButton?.addEventListener("click", () => {
    const keyword = searchInput.value.trim();
    if (keyword) executeSearch(keyword);
  });

  renderSearchHistory();
});

// ✅ 핫랭킹 슬라이드 함수
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

// ✅ 검색 실행 함수
function executeSearch(keyword) {
  saveSearchKeyword(keyword);
  fetch(`https://api.example.com/search?query=${encodeURIComponent(keyword)}`)
    .then(res => res.json())
    .then(() => {
      window.location.href = `search.html?query=${encodeURIComponent(keyword)}`;
    })
    .catch(() => {
      window.location.href = `search.html?query=${encodeURIComponent(keyword)}`;
    });
}

function handleEnterKey(event) {
  if (event.key === "Enter") {
    const keyword = event.target.value.trim();
    if (keyword) executeSearch(keyword);
  }
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
  container.innerHTML = "";
  history.forEach(keyword => {
    const item = document.createElement("div");
    item.className = "search-history-item";
    item.innerHTML = `<span onclick="executeSearch('${keyword}')">${keyword}</span>`;
    container.appendChild(item);
  });
  container.style.display = "block";
}

// ✅ 다크모드 토글
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  if (currentTheme === "dark") {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
  }
}
