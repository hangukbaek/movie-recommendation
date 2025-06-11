const BASE_URL = 'https://api.themoviedb.org/3';
const tmdbKey = '999dc9586a0cbbaf8d1f914c3b6bcdff';

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('query');
  const searchQueryElement = document.getElementById('search-query');
  const movieListContainer = document.getElementById('movie-list-container');

  searchQueryElement.textContent = query;

  const searchUrl = `${BASE_URL}/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(query)}&language=ko-KR`;

  fetch(searchUrl)
    .then(response => response.json())
    .then(data => {
      movieListContainer.innerHTML = '';

      if (data.results.length > 0) {
        data.results.forEach(movie => {
          const movieDetailUrl = `${BASE_URL}/movie/${movie.id}/credits?api_key=${tmdbKey}&language=ko-KR`;

          fetch(movieDetailUrl)
            .then(res => res.json())
            .then(credits => {
              const mainCast = credits.cast?.slice(0, 2).map(actor => actor.name).join(', ') || '정보 없음';

              const movieCard = document.createElement('div');
              movieCard.className = 'movie-card';
              movieCard.innerHTML = `
                <div class="movie-content">
                  <div class="poster-wrapper">
                    <img src="${movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : 'default.png'}" 
                        alt="${movie.title}" class="poster-image" />
                  </div>
                  <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <p>📅 <strong>개봉연도:</strong> ${movie.release_date?.split('-')[0] || '미상'}</p>
                    <p>⭐ <strong>평점:</strong> ${movie.vote_average || 'N/A'}</p>
                    <p>🎭 <strong>주연:</strong> ${mainCast}</p>
                    <a href="search.html?id=${movie.id}" target="_blank">🔍자세히 보기</a>
                  </div>
                </div>
              `;
              movieListContainer.appendChild(movieCard);
            });
        });
      } else {
        movieListContainer.innerHTML = '<p>검색된 영화가 없습니다.</p>';
      }
    });
});

// 영화 상세 정보를 페이지에 표시하는 함수
function showMovieDetail(movieId) {
  const movieDetailContainer = document.getElementById('movie-detail-container');

  // 영화 정보 가져오기
  fetch(`${BASE_URL}/movie/${movieId}?api_key=${tmdbKey}&language=ko-KR`)
    .then(res => res.json())
    .then(movie => {
      const movieDetailHtml = `
        <h2>${movie.title}</h2>
        <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}" />
        <p><strong>개봉일:</strong> ${movie.release_date}</p>
        <p><strong>평점:</strong> ${movie.vote_average}</p>
        <p><strong>줄거리:</strong> ${movie.overview || '설명이 제공되지 않았습니다.'}</p>
      `;
      movieDetailContainer.innerHTML = movieDetailHtml;
    })
    .catch(err => {
      movieDetailContainer.innerHTML = '<p>영화 정보를 불러오는 데 실패했습니다.</p>';
      console.error(err);
    });
}

// 영화 카드에서 '자세히 보기' 버튼 클릭 시 상세 정보 표시
document.addEventListener('click', (event) => {
  if (event.target && event.target.classList.contains('open-modal')) {
    const movieId = event.target.dataset.movieId;
    showMovieDetail(movieId); // 페이지에서 영화 상세 정보 표시
  }
});

// 뒤로 가기 버튼 클릭 시 이전 페이지로 이동
function goBack() {
  window.history.back();
}

// 다크모드 토글
document.getElementById('theme-toggle').addEventListener('click', () => {
  const root = document.documentElement;
  const isDark = root.getAttribute('data-theme') === 'dark';

  if (isDark) {
    root.removeAttribute('data-theme');
    localStorage.removeItem('theme');
    document.getElementById('theme-toggle').textContent = '🌞 테마 전환';
  } else {
    root.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    document.getElementById('theme-toggle').textContent = '🌙 테마 전환';
  }
});


// 새로고침 버튼 추가
document.addEventListener('DOMContentLoaded', () => {
  const refreshButton = document.createElement('button');
  refreshButton.textContent = '새로고침';
  refreshButton.className = 'refresh-btn';
  refreshButton.addEventListener('click', () => {
    location.reload();  // 페이지 새로고침
  });
});

