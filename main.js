document.addEventListener("DOMContentLoaded", () => {
      const loginBtn = document.getElementById("googleLoginBtn");
      if (loginBtn) {
        loginBtn.addEventListener("click", () => {
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = `/auth/google?redirect=${encodeURIComponent(currentPath)}`;
        });
      }

      // JWT 저장 처리
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      if (token) {
        localStorage.setItem("token", token);
        console.log("✅ 로그인 성공: JWT가 저장되었습니다.");

        // token 제거한 URL로 새로고침 없이 주소창 정리
        urlParams.delete("token");
        const newUrl =
          window.location.pathname +
          (urlParams.toString() ? "?" + urlParams.toString() : "");
        history.replaceState({}, "", newUrl);
      }
    });
// HTML 문서가 완전히 로딩된 후 실행
document.addEventListener("DOMContentLoaded", () => {
  // 🔍 검색창 및 버튼, 검색 기록 영역 DOM 요소 참조
  const searchButton = document.getElementById('search-button');
  const searchInput = document.getElementById('search-input');
  const searchHistory = document.getElementById("search-history");

  // ✅ 검색어를 기반으로 결과 페이지로 이동하는 함수
  function goToSearchResult() {
    const query = searchInput.value.trim();
    if (query) {
      window.location.href = `searchResult.html?query=${encodeURIComponent(query)}`;
    }
  }

  // ✅ 검색어를 검색 기록 영역에 표시하는 함수
  function displaySearchHistory(query) {
    const historyItem = document.createElement("div");
    historyItem.textContent = query;
    historyItem.classList.add("search-history-item");

    // ❌ X 버튼을 추가하여 검색 기록 개별 삭제 가능
    const deleteButton = document.createElement("span");
    deleteButton.textContent = "❌";
    deleteButton.classList.add("delete-button");
    deleteButton.addEventListener("click", () => {
      historyItem.remove();
    });

    historyItem.appendChild(deleteButton);
    searchHistory.appendChild(historyItem);
  }

  // 🔍 검색 버튼 클릭 시: 검색 기록 추가 후 검색 결과 페이지로 이동
  searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query) {
      displaySearchHistory(query);
      goToSearchResult();
    }
  });

  // 🔍 엔터키 입력 시: 검색 기록 추가 후 검색 결과 페이지로 이동
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const query = searchInput.value.trim();
      if (query) {
        displaySearchHistory(query);
        goToSearchResult();
      }
    }
  });

  // 🔐 구글 로그인 버튼 클릭 시: 현재 페이지 주소를 redirect 파라미터로 포함하여 로그인 요청
  const loginBtn = document.getElementById("googleLoginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/auth/google?redirect=${encodeURIComponent(currentPath)}`;
    });
  }

  // 🔐 로그인 후 리디렉션된 URL에 토큰이 있을 경우 로컬스토리지에 저장 후 주소 정리
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (token) {
    localStorage.setItem("token", token); // JWT 저장
    urlParams.delete("token"); // URL 깔끔하게 만들기
    const newUrl = window.location.pathname + (urlParams.toString() ? "?" + urlParams.toString() : "");
    history.replaceState({}, "", newUrl);
  }
});

// 🔐 로그인 상태 확인 및 UI 갱신 처리
const token = localStorage.getItem("token");
const loginStatus = document.getElementById("login-status");
const loginBtn = document.getElementById("googleLoginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const myPageBtn = document.getElementById("myPageBtn");

if (token) {
  // 서버에 사용자 정보 요청 → UI에 반영
  fetch("/api/profile", { headers: { Authorization: `Bearer ${token}` } })
    .then(res => res.json())
    .then(data => {
      if (data.userData) {
        const displayName = data.userData.displayName || "사용자";
        loginStatus.textContent = `${displayName}님이 로그인하였습니다`;
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
        myPageBtn.style.display = "inline-block";
        localStorage.setItem("userName", displayName); // 이름도 저장
      }
    })
    .catch(err => {
      console.error("프로필 정보 확인 실패:", err);
      localStorage.removeItem("token"); // 토큰이 유효하지 않으면 삭제
    });
}

// 🔐 로그인 버튼 클릭 시: 리디렉션 포함 로그인 요청
loginBtn.addEventListener("click", () => {
  const currentPath = window.location.pathname + window.location.search;
  window.location.href = `/auth/google?redirect=${encodeURIComponent(currentPath)}`;
});

// 🔓 로그아웃 버튼 클릭 시: 토큰 제거 + UI 초기화 + 페이지 새로고침
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

// 🧍 마이페이지 버튼 클릭 시: 마이페이지로 이동
myPageBtn.addEventListener("click", () => {
  window.location.href = "/mypage.html";
});
