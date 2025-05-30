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
