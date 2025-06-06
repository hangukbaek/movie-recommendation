// ✅ 다크 모드 적용 유지
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.documentElement.setAttribute("data-theme", "dark");
}

// ✅ 로그인 상태 확인 및 버튼 활성화
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

// ✅ 슬라이드 버튼 제어 함수 (핫랭킹용)
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

// ✅ 다크모드 전환
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

// 영화 상세 정보 페이지
window.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get('movieId');

  const detailContainer = document.getElementById('movie-detail');

  if (!movieId) {
    detailContainer.innerHTML = '<p>유효한 영화 ID가 없습니다.</p>';
    return;
  }

  try {
    // 영화 기본 정보 요청
    const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=999dc9586a0cbbaf8d1f914c3b6bcdff&language=ko-KR`);
    const movie = await res.json();

    // 출연진 정보 요청
    const creditRes = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=999dc9586a0cbbaf8d1f914c3b6bcdff&language=ko-KR`);
    const credits = await creditRes.json();

    // 장르와 주연 배우 추출
    const genres = movie.genres.map(g => g.name).join(', ');
    const castList = credits.cast.slice(0, 5).map(actor => actor.name).join(', ');

    detailContainer.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" />
      <h2>제목: ${movie.title}</h2>
      <p><strong>장르:</strong> ${genres}</p>
      <p><strong>주연:</strong> ${castList}</p>
      <p><strong>개봉일:</strong> ${movie.release_date}</p>
      <p><strong>평점:</strong> ${movie.vote_average}</p>
      <p><strong>줄거리:</strong> ${movie.overview || '줄거리가 제공되지 않았습니다.'}</p>
    `;
  } catch (err) {
    detailContainer.innerHTML = '<p>영화 정보를 불러오는 데 실패했습니다.</p>';
    console.error(err);
  }
});
