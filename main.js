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