// ✅ 다크 모드 적용 유지
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.documentElement.setAttribute("data-theme", "dark");
}

// ✅ 로그아웃 버튼 이벤트
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

// ✅ 마이페이지 버튼 이벤트
myPageBtn.addEventListener("click", () => {
  window.location.href = "/mypage.html";
});

// ✅ 사용자 이름 불러와서 UI에 표시 (localStorage만 사용)
const userName = localStorage.getItem("userName") || "게스트";
const nameEl = document.getElementById("user-name");
if (nameEl) {
  nameEl.textContent = userName;
}

// ✅ 장르 버튼 클릭 이벤트 등록 (fetch 호출 제외, active 토글 로직만)
const genreButtons = document.querySelectorAll(".genre-buttons button");
const genreContainer = document.getElementById("genre-movie-container");
genreButtons.forEach(button => {
  button.addEventListener("click", () => {
    genreButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    // → fetch 호출은 포함 안함
  });
});

// ✅ 초기 로딩 시 첫 번째 장르 버튼 클릭 (클릭 트리거 자체는 API 영향 X)
if (genreButtons.length > 0) {
  genreButtons[0].click();
}

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

// ✅ 다크모드 토글 함수
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
