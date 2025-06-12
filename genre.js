// genre.js: 장르별 영화 추천 + 모달 팝업 통합

const BASE_URL = 'https://api.themoviedb.org/3';

const genreMap = {
  '액션': 28,
  '코미디': 35,
  'SF': 878,
  '공포': 27,
  '스릴러': 53,
  '로맨스': 10749,
  '음악': 10402,
  '애니메이션': 16,
  '다큐멘터리': 99,
  '판타지': 14,
};

let currentGenre = null;

document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.genre-buttons button');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const genreName = btn.textContent.trim();
      const genreId   = genreMap[genreName];
      const container = document.getElementById('genre-movie-container');

      // 동일 장르 클릭 시 토글
      if (currentGenre === genreName) {
        container.classList.add('hidden');
        container.classList.remove('fade-in');
        btn.classList.remove('active');
        currentGenre = null;
        return;
      }

      // 새로운 장르 선택
      currentGenre = genreName;
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // 컨테이너 표시
      container.classList.remove('hidden');
      container.classList.add('fade-in');

      // 영화 데이터 로드 및 렌더
      fetchAndRenderGenreMovies(genreId, genreName);
    });
  });
});

async function fetchAndRenderGenreMovies(genreId, genreName) {
  const container = document.getElementById('genre-movie-container');
  container.classList.remove('hidden');
  container.classList.add('fade-in');

  const korUrl     = `${BASE_URL}/discover/movie?api_key=${tmdbKey}&language=ko-KR&with_genres=${genreId}&with_original_language=ko&sort_by=vote_average.desc&vote_count.gte=100`;
  const foreignUrl = `${BASE_URL}/discover/movie?api_key=${tmdbKey}&language=ko-KR&with_genres=${genreId}&without_original_language=ko&sort_by=vote_average.desc&vote_count.gte=100`;

  try {
    const [korRes, foreignRes] = await Promise.all([
      fetch(korUrl).then(res => res.json()),
      fetch(foreignUrl).then(res => res.json()),
    ]);
    const localMovies   = korRes.results.slice(0, 5);
    const foreignMovies = foreignRes.results.slice(0, 5);

    renderMovies('genre-movie-container', genreName, localMovies, foreignMovies);
  } catch (error) {
    container.innerHTML = `<p>❌ 영화 정보를 불러오는 데 실패했습니다.</p>`;
    console.error(error);
  }
}

function renderMovies(containerId, genreName, koreanMovies, foreignMovies) {
  const container = document.getElementById(containerId);
  container.innerHTML = `
    <h2>🎬 ${genreName} 추천 영화</h2>
    <div class="genre-section">
      <div class="genre-block">
        <h3>🇰🇷 국내 영화</h3>
        <div class="genre-slider">
          ${generateMovieCards(koreanMovies)}
        </div>
      </div>
      <div class="genre-block">
        <h3>🌍 해외 영화</h3>
        <div class="genre-slider">
          ${generateMovieCards(foreignMovies)}
        </div>
      </div>
    </div>
  `;

  // 슬라이더 로직이 있다면 여기에 호출
  if (typeof initializeGenreSlider === 'function') {
    initializeGenreSlider();
  }
}

function generateMovieCards(movies) {
  return movies.map(movie => `
    <div class="movie-card">
      <img
        src="https://image.tmdb.org/t/p/w200${movie.poster_path}" 
        alt="${movie.title}"
        onclick="openMoviePopup(${movie.id})" 
      />
      <p>${movie.title}</p>
    </div>
  `).join('');
}

async function openMoviePopup(movieId) {
  if (!movieId) return;
  const popup     = document.getElementById('movie-popup');
  const popupBody = document.getElementById('popup-body');
  popup.style.display     = 'flex';
  popupBody.innerHTML     = '<p>로딩 중...</p>';

  try {
    const movieRes   = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${tmdbKey}&language=ko-KR`);
    const movie      = await movieRes.json();
    const creditsRes = await fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${tmdbKey}&language=ko-KR`);
    const credits    = await creditsRes.json();

    const genres = movie.genres.map(g => g.name).join(', ');
    const cast   = credits.cast.slice(0, 5).map(c => c.name).join(', ');

    popupBody.innerHTML = `
      <h2>${movie.title}</h2>
      <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}" />
      <p><strong>장르:</strong> ${genres}</p>
      <p><strong>주연:</strong> ${cast}</p>
      <p><strong>개봉일:</strong> ${movie.release_date}</p>
      <p><strong>평점:</strong> ${movie.vote_average}</p>
      <p><strong>줄거리:</strong><br/>${movie.overview || '줄거리가 제공되지 않았습니다.'}</p>
    `;
  } catch (err) {
    popupBody.innerHTML = '<p>영화 정보를 불러오지 못했습니다.</p>';
    console.error('팝업 오류:', err);
  }
}

// 모달 닫기
document.getElementById('popup-close').addEventListener('click', () => {
  document.getElementById('movie-popup').style.display = 'none';
});
window.addEventListener('click', e => {
  if (e.target.id === 'movie-popup') {
    e.target.style.display = 'none';
  }
});
