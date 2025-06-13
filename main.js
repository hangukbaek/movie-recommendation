// ✅ DOMContentLoaded 이벤트에서 초기 설정 처리

document.addEventListener("DOMContentLoaded", () => {
  // 🔐 로그인 버튼 클릭 시 현재 경로로 redirect 설정
  const loginBtn = document.getElementById("googleLoginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/auth/google?redirect=${encodeURIComponent(currentPath)}`;
    });
  }

  // 🔐 JWT 토큰 저장 및 URL 정리
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  if (token) {
    localStorage.setItem("token", token);
    console.log("✅ 로그인 성공: JWT가 저장되었습니다.");
    urlParams.delete("token");
    const newUrl = window.location.pathname + (urlParams.toString() ? "?" + urlParams.toString() : "");
    history.replaceState({}, "", newUrl);
  }

  // 🔍 검색 기능
  const searchButton = document.getElementById('search-button');
  const searchInput = document.getElementById('search-input');
  const searchHistory = document.getElementById("search-history");

  function goToSearchResult() {
    const query = searchInput.value.trim();
    if (query) {
      window.location.href = `searchResult.html?query=${encodeURIComponent(query)}`;
    }
  }

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
      goToSearchResult();
    }
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const query = searchInput.value.trim();
      if (query) {
        displaySearchHistory(query);
        goToSearchResult();
      }
    }
  });
});

// ✅ 로그인 상태 확인 및 UI 업데이트
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

loginBtn?.addEventListener("click", () => {
  const currentPath = window.location.pathname + window.location.search;
  window.location.href = `/auth/google?redirect=${encodeURIComponent(currentPath)}`;
});

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

// ✅ 다크모드 설정 유지
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.documentElement.setAttribute("data-theme", "dark");
}

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

// ✅ 슬라이드 컨트롤 (Hot 영화/배우)
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

// ✅ 영화 상세 모달 팝업
function openMoviePopup(movieId) {
  const popup = document.getElementById("movie-popup");
  const popupBody = document.getElementById("popup-body");
  popup.style.display = "flex";
  popupBody.innerHTML = "<p>로딩 중...</p>";

  fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=999dc9586a0cbbaf8d1f914c3b6bcdff&language=ko-KR`)
    .then(res => res.json())
    .then(async data => {
      const creditsRes = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=999dc9586a0cbbaf8d1f914c3b6bcdff&language=ko-KR`);
      const credits = await creditsRes.json();
      const genres = data.genres.map(g => g.name).join(', ');
      const castList = credits.cast.slice(0, 5).map(actor => actor.name).join(', ');

      popupBody.innerHTML = `
        <h2>${data.title}</h2>
        <img src="https://image.tmdb.org/t/p/w300${data.poster_path}" alt="${data.title}" />
        <p><strong>장르:</strong> ${genres}</p>
        <p><strong>주연:</strong> ${castList}</p>
        <p><strong>개봉일:</strong> ${data.release_date}</p>
        <p><strong>평점:</strong> ${data.vote_average}</p>
        <p><strong>줄거리:</strong><br/>${data.overview}</p>
      `;
    })
    .catch(err => {
      popupBody.innerHTML = "<p>영화 정보를 불러오지 못했습니다.</p>";
      console.error("팝업 로딩 실패:", err);
    });
}

document.getElementById("popup-close")?.addEventListener("click", () => {
  document.getElementById("movie-popup").style.display = "none";
});

window.addEventListener("click", (e) => {
  const popup = document.getElementById("movie-popup");
  if (e.target === popup) popup.style.display = "none";
});
