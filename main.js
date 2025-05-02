// ✅ 장르 버튼 클릭 시 영화 목록 API 호출 및 UI 갱신
// ✅ 초기 로딩 시 '액션' 자동 호출
// ✅ 다크 모드 유지 설정
// ✅ 핫랭킹 슬라이드 기능
// ✅ 사용자 이름 기반 추천 영화 출력
// ✅ 로그인 상태 표시, 로그아웃/마이페이지 버튼 활성화

document.addEventListener("DOMContentLoaded", () => {
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

  // ✅ 사용자 이름 불러와서 UI에 표시 + 추천 API 호출
  const userName = localStorage.getItem("userName") || "게스트";
  const nameEl = document.getElementById("user-name");
  if (nameEl) {
    nameEl.textContent = userName;
  }

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
        card.className = "card";
        card.style.cursor = "pointer";
        card.innerHTML = `
          <img src="${movie.poster}" alt="${movie.title}" />
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

  // ✅ 장르 버튼 클릭 시 API 호출 및 active 처리
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

  // ✅ 초기 로딩 시 첫 번째 장르 자동 실행
  if (genreButtons.length > 0) {
    genreButtons[0].click();
  }
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
