document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".genre-buttons button");

    buttons.forEach(button => {
      button.addEventListener("click", () => {
        // 모든 버튼에서 active 제거
        buttons.forEach(btn => btn.classList.remove("active"));
        // 클릭한 버튼에 active 추가
        button.classList.add("active");

        // 여기에 장르에 따라 API 호출 또는 필터링 로직 추가 가능
        const genre = button.textContent;
        console.log(`선택된 장르: ${genre}`);
      });
    });
  });

  //버튼 클릭시 API호출 UI 갱신
  document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".genre-buttons button");
    const container = document.getElementById("genre-movie-container");

    buttons.forEach(button => {
      button.addEventListener("click", () => {
        // 1. active 클래스 토글
        buttons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        // 2. 장르 텍스트 추출
        const selectedGenre = button.textContent;

        // 3. API 호출
        fetch(`https://api.example.com/movies?genre=${encodeURIComponent(selectedGenre)}`)
          .then(res => res.json())
          .then(movies => {
            // 4. 영화 목록 그리기
            container.innerHTML = ''; // 기존 내용 초기화

            movies.forEach(movie => {
              const card = document.createElement("div");
              card.className = "card";

              card.innerHTML = `
                <img src="${movie.poster}" alt="${movie.title}" />
                <p style="text-align:center; margin-top:10px;">${movie.title}</p>
              `;

              container.appendChild(card);
            });
          })
          .catch(err => {
            container.innerHTML = "<p>영화를 불러오지 못했습니다 😥</p>";
            console.error("장르 영화 불러오기 실패:", err);
          });
      });
    });

    // 초기 로딩 시 '액션' 장르 기본 실행
    buttons[0].click();
  });

  document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const genre = params.get("genre");
    const container = document.getElementById("genre-result");

    if (!genre) {
      container.innerHTML = "<p>장르 정보가 없습니다.</p>";
      return;
    }

    fetch(`https://api.example.com/movies?genre=${encodeURIComponent(genre)}`)
      .then(res => res.json())
      .then(movies => {
        if (!movies.length) {
          container.innerHTML = `<p>${genre} 장르의 영화가 없습니다.</p>`;
          return;
        }

        movies.forEach(movie => {
          const card = document.createElement("div");
          card.className = "card";
          card.style.cursor = "pointer";

          card.innerHTML = `
            <img src="${movie.poster}" alt="${movie.title}" />
            <p style="text-align:center; margin-top:10px;">${movie.title}</p>
          `;

          // 카드 클릭 시 상세 페이지로 이동
          card.addEventListener("click", () => {
            // 예: id 또는 title 사용 (id가 있다면 더 좋음)
            window.location.href = `detail.html?title=${encodeURIComponent(movie.title)}`;
          });

          container.appendChild(card);
        });
      })
      .catch(err => {
        container.innerHTML = "<p>영화를 불러오는 데 실패했습니다 😥</p>";
        console.error(err);
      });
  });
//이주의 핫랭킹 버튼 슬라이드 기능을 위한 코드 
let hotMovieIndex = 0;
let hotActorIndex = 0;

function slideHotMovie(direction) {
  const slider = document.getElementById("hot-movie-slider");
  const items = slider.querySelectorAll(".slider-item");
  const total = items.length;

  if (total <= 1) return;

  hotMovieIndex += direction;
  if (hotMovieIndex < 0) hotMovieIndex = 0;
  if (hotMovieIndex >= total) hotMovieIndex = total - 1;

  slider.style.transform = `translateX(-${hotMovieIndex * 100}%)`;
}

function slideHotActor(direction) {
  const slider = document.getElementById("hot-actor-slider");
  const items = slider.querySelectorAll(".slider-item");
  const total = items.length;

  if (total <= 1) return;

  hotActorIndex += direction;
  if (hotActorIndex < 0) hotActorIndex = 0;
  if (hotActorIndex >= total) hotActorIndex = total - 1;

  slider.style.transform = `translateX(-${hotActorIndex * 100}%)`;
}

//홍길동님을 위한 추천 영화 동적 변경을 위한 코드 구현 
document.addEventListener("DOMContentLoaded", () => {
  // 1. 사용자 이름을 받아온다고 가정 (나중엔 로그인된 사용자 정보로 대체 가능)
  const user = {
    name: "윤주상", // 서버 또는 로컬스토리지 등에서 받아올 수 있음
    id: "user001"
  };

  // 2. 사용자 이름을 HTML에 반영
  const userNameElement = document.getElementById("user-name");
  if (userNameElement) {
    userNameElement.textContent = user.name;
  }

  // 3. 사용자 기반 추천 API 호출 (가정)
  fetch(`https://api.example.com/recommendation?userId=${user.id}`)
    .then(res => res.json())
    .then(movies => {
      const container = document.getElementById("user-recommendation");
      container.innerHTML = '';

      if (!movies.length) {
        container.innerHTML = "<p>추천 영화가 없습니다.</p>";
        return;
      }

      movies.forEach(movie => {
        const card = document.createElement("div");
        card.className = "slider-item"; // 슬라이드용 구조에도 호환되게
        card.innerHTML = `
          <img src="${movie.poster}" alt="${movie.title}" style="width:100%; border-radius:12px;">
          <p style="text-align:center; margin-top:10px;">${movie.title}</p>
        `;
        container.appendChild(card);
      });
    })
    .catch(err => {
      console.error("추천 영화 불러오기 실패:", err);
      document.getElementById("user-recommendation").innerHTML = "<p>데이터를 불러오지 못했습니다.</p>";
    });
});


//검색바 기록 남기기 및 엔터 또는 돋보기 클릭시 가능
document.addEventListener("DOMContentLoaded", () => {
  const searchButton = document.getElementById("search-button");
  const searchInput = document.getElementById("search-input");

  if (searchButton) {
    searchButton.addEventListener("click", () => {
      const keyword = searchInput.value.trim();
      if (keyword !== "") {
        executeSearch(keyword);
      }
    });
  }

  renderSearchHistory();
});

function handleEnterKey(event) {
  if (event.key === "Enter") {
    const keyword = event.target.value.trim();
    if (keyword !== "") {
      executeSearch(keyword);
    }
  }
}

function executeSearch(keyword) {
  // 기록 저장
  saveSearchKeyword(keyword);

  // ✅ API 호출
  fetch(`https://api.example.com/search?query=${encodeURIComponent(keyword)}`)
    .then(response => response.json())
    .then(data => {
      console.log("✅ API 검색 결과:", data);

      // 예: 검색 페이지로 이동
      window.location.href = `search.html?query=${encodeURIComponent(keyword)}`;
    })
    .catch(error => {
      console.error("❌ API 호출 실패:", error);
      // 실패하더라도 검색 페이지로 이동
      window.location.href = `search.html?query=${encodeURIComponent(keyword)}`;
    });
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
    item.innerHTML = `
      <span onclick="goToSearch('${keyword}')">${keyword}</span>
    `;
    container.appendChild(item);
  });

  container.style.display = "block";
}

function goToSearch(keyword) {
  executeSearch(keyword);
}