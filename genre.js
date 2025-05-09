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
      const genreId = genreMap[genreName];
      const container = document.getElementById('genre-movie-container');

      if (currentGenre === genreName) {
        container.classList.add('hidden');
        container.classList.remove('fade-in');
        btn.classList.remove('active');
        currentGenre = null;
        return;
      }

      currentGenre = genreName;
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      fetchAndRenderGenreMovies(genreId, genreName);
    });
  });
});

async function fetchAndRenderGenreMovies(genreId, genreName) {
  const container = document.getElementById('genre-movie-container');
  container.classList.remove('hidden');
  container.classList.add('fade-in');

const korUrl = `${BASE_URL}/discover/movie?api_key=${tmdbKey}&language=ko-KR&with_genres=${genreId}&with_original_language=ko&sort_by=vote_average.desc&vote_count.gte=100`;
const foreignUrl = `${BASE_URL}/discover/movie?api_key=${tmdbKey}&language=ko-KR&with_genres=${genreId}&without_original_language=ko&sort_by=vote_average.desc&vote_count.gte=100`;

  try {
    const [korRes, foreignRes] = await Promise.all([
      fetch(korUrl).then(res => res.json()),
      fetch(foreignUrl).then(res => res.json()),
    ]);

    renderMovies('genre-movie-container', genreName, korRes.results.slice(0, 5), foreignRes.results.slice(0, 5));
  } catch (error) {
    container.innerHTML = `<p>❌ 영화 정보를 불러오는 데 실패했습니다.</p>`;
    console.error(error);
  }
}

function renderMovies(containerId, genreName, koreanMovies, foreignMovies) {
  const container = document.getElementById(containerId);
  container.innerHTML = `
    <h2>🎬 장르 추천</h2>
    <div class="genre-section">
      <div class="genre-block">
        <h3>🇰🇷 국내 영화</h3>
        <div class="genre-slider">${generateMovieCards(koreanMovies)}</div>
      </div>
      <div class="genre-block">
        <h3>🌍 해외 영화</h3>
        <div class="genre-slider">${generateMovieCards(foreignMovies)}</div>
      </div>
    </div>
  `;
}

function generateMovieCards(movies) {
  return movies.map(movie => `
    <div class="movie-card">
      <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}" />
      <p>${movie.title}</p>
    </div>
  `).join('');
}
