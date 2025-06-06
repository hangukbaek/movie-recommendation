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
                    <a href="search.html?id=${movie.id}" target="_blank">🔍 자세히 보기</a>
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

function goBack() {
  window.history.back();
}

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
