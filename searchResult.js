const BASE_URL = "https://api.themoviedb.org/3";
const tmdbUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${query}&language=ko-KR`;

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("query");  // URL에서 'query' 파라미터 가져오기
  const searchQueryElement = document.getElementById("search-query");
  searchQueryElement.textContent = query;  // 검색어를 화면에 표시

  // 장르 ID 가져오기 (예시로 '액션' 장르)
  const genreId = 28;  // '액션' 장르 ID 예시

  // 한국 영화 API URL
  const korUrl = `${BASE_URL}/discover/movie?api_key=${tmdbKey}&language=ko-KR&with_genres=${genreId}&with_original_language=ko&sort_by=vote_average.desc&vote_count.gte=100`;

  // 외국 영화 API URL
  const foreignUrl = `${BASE_URL}/discover/movie?api_key=${tmdbKey}&language=ko-KR&with_genres=${genreId}&without_original_language=ko&sort_by=vote_average.desc&vote_count.gte=100`;

  // 영화 목록 출력할 div들
  const korMovieListContainer = document.getElementById("kor-movie-list-container");
  const foreignMovieListContainer = document.getElementById("foreign-movie-list-container");

  // 한국 영화 API 호출
  fetch(korUrl)
    .then(response => response.json())
    .then(movies => {
      korMovieListContainer.innerHTML = "";  // 기존 내용 초기화

      if (movies.results.length > 0) {
        // 한국 영화 목록 출력
        movies.results.forEach(movie => {
          const movieCard = document.createElement("div");
          movieCard.className = "movie-card";
          movieCard.innerHTML = `
            <div class="movie-info">
              <h3>${movie.title}</h3>  <!-- 영화명 (국문) -->
              <p>제작 연도: ${movie.release_date.split("-")[0]}</p>  <!-- 제작 연도 -->
              <p>영화 코드: ${movie.id}</p>  <!-- 영화 코드 -->
              <a href="movieDetail.html?id=${movie.id}">자세히 보기</a>
            </div>
          `;
          korMovieListContainer.appendChild(movieCard);
        });
      } else {
        korMovieListContainer.innerHTML = "<p>검색된 한국 영화가 없습니다.</p>";
      }
    })
    .catch(err => {
      console.error("한국 영화 데이터를 가져오는 데 실패했습니다:", err);
      korMovieListContainer.innerHTML = "<p>영화 데이터를 불러오는 데 실패했습니다.</p>";
    });

  // 외국 영화 API 호출
  fetch(foreignUrl)
    .then(response => response.json())
    .then(movies => {
      foreignMovieListContainer.innerHTML = "";  // 기존 내용 초기화

      if (movies.results.length > 0) {
        // 외국 영화 목록 출력
        movies.results.forEach(movie => {
          const movieCard = document.createElement("div");
          movieCard.className = "movie-card";
          movieCard.innerHTML = `
            <div class="movie-info">
              <h3>${movie.title}</h3>  <!-- 영화명 (국문) -->
              <p>제작 연도: ${movie.release_date.split("-")[0]}</p>  <!-- 제작 연도 -->
              <p>영화 코드: ${movie.id}</p>  <!-- 영화 코드 -->
              <a href="movieDetail.html?id=${movie.id}">자세히 보기</a>
            </div>
          `;
          foreignMovieListContainer.appendChild(movieCard);
        });
      } else {
        foreignMovieListContainer.innerHTML = "<p>검색된 외국 영화가 없습니다.</p>";
      }
    })
    .catch(err => {
      console.error("외국 영화 데이터를 가져오는 데 실패했습니다:", err);
      foreignMovieListContainer.innerHTML = "<p>영화 데이터를 불러오는 데 실패했습니다.</p>";
    });
});

// 뒤로가기 버튼 기능 구현
function goBack() {
  window.history.back();  // 이전 페이지로 돌아가기
}