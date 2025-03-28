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