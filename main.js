document.addEventListener("DOMContentLoaded", () => {

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
});

// ✅ 사용자 이름 불러와서 UI에 표시 (localStorage만 사용)
const userName = localStorage.getItem("userName") || "게스트";
const nameEl = document.getElementById("user-name");
if (nameEl) {
  nameEl.textContent = userName;
}