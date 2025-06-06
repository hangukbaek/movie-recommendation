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
          // 추가로 credits 정보를 가져오기 위한 fetch
          const movieDetailUrl = `${BASE_URL}/movie/${movie.id}/credits?api_key=${tmdbKey}&language=ko-KR`;

          fetch(movieDetailUrl)
            .then(res => res.json())
            .then(credits => {
              const mainCast = credits.cast
                ?.slice(0, 2)
                .map(actor => actor.name)
                .join(', ') || '정보 없음';

              const movieCard = document.createElement('div');
              movieCard.className = 'movie-card';
              movieCard.innerHTML = `
                <div class="movie-info">
                  <img src="${movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : 'default.png'}" alt="${movie.title}" />
                  <h3>${movie.title}</h3>
                  <p>📅 개봉연도: ${movie.release_date?.split('-')[0] || '미상'}</p>
                  <p>⭐ 평점: ${movie.vote_average || 'N/A'}</p>
                  <p>🎭 주연: ${mainCast}</p>
                  <a href="search.html?id=${movie.id}">자세히 보기</a>
                </div>
              `;
              movieListContainer.appendChild(movieCard);
            })
            .catch(err => {
              console.error('배우 정보 로딩 실패:', err);
            });
        });
      } else {
        movieListContainer.innerHTML = '<p>검색된 영화가 없습니다.</p>';
      }
    })
    .catch(err => {
      console.error('영화 검색 실패:', err);
      movieListContainer.innerHTML = '<p>영화 데이터를 불러오는 데 실패했습니다.</p>';
    });
});

function goBack() {
  window.history.back();
}