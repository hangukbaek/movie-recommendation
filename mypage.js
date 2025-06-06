// mypage.js
// 마이페이지: 사용자 선호 장르, 성별, 나이 설정 및 불러오기 + 장르별 추천

const form = document.getElementById('profile-form');
const saveBtn = document.getElementById('save-prefs');
const genreButtons = document.querySelectorAll('.genre-button');
const genderButtons = document.querySelectorAll('.gender-button');
const ageButtons = document.querySelectorAll('.age-button');
const inputGenre = document.getElementById('input-genre');
const inputGender = document.getElementById('input-gender');
const inputAge = document.getElementById('input-age');
const recContainer = document.getElementById('genre-recommendations');

window.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch('/api/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const { userData } = await res.json();
    const prefs = userData.preferences || {};

    document.getElementById('display-name').textContent = `이름: ${userData.displayName || ''}`;
    document.getElementById('display-genre').textContent = `선호 장르: ${prefs.favoriteGenres?.join(', ') || ''}`;
    document.getElementById('display-gender').textContent = `성별: ${prefs.gender || ''}`;
    document.getElementById('display-age').textContent = `연령대: ${prefs.age || ''}`;

    genreButtons.forEach(btn => {
      const val = btn.textContent;
      btn.classList.toggle('selected', prefs.favoriteGenres?.includes(val));
    });
    inputGenre.value = prefs.favoriteGenres?.join(',') || '';
    genderButtons.forEach(btn => {
      const val = btn.dataset.value;
      btn.classList.toggle('selected', prefs.gender === val);
      if (prefs.gender === val) inputGender.value = val;
    });
    ageButtons.forEach(btn => {
      const val = btn.textContent;
      btn.classList.toggle('selected', prefs.age === val);
      if (prefs.age === val) inputAge.value = val;
    });

    loadGenreRecommendations(prefs.favoriteGenres || []);
  } catch (err) {
    console.error('프로필 로드 실패:', err);
  }
});

function setupButtonHandlers() {
  genreButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('selected');
      const selected = Array.from(genreButtons)
        .filter(b => b.classList.contains('selected'))
        .map(b => b.textContent);
      inputGenre.value = selected.join(',');
    });
  });
  genderButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      genderButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      inputGender.value = btn.dataset.value;
    });
  });
  ageButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      ageButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      inputAge.value = btn.textContent;
    });
  });
}
setupButtonHandlers();

form.addEventListener('submit', async e => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  if (!token) {
    alert('로그인이 필요합니다.');
    return;
  }
  const body = {
    favoriteGenres: inputGenre.value ? inputGenre.value.split(',') : [],
    gender: inputGender.value,
    age: inputAge.value
  };
  try {
    const res = await fetch('/api/user/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    const result = await res.json();
    if (result.success) {
      alert('선호 정보가 저장되었습니다!');
      window.location.reload();
    } else {
      alert('저장 실패: ' + result.error);
    }
  } catch (err) {
    console.error('저장 오류:', err);
    alert('서버 오류로 저장에 실패했습니다.');
  }
});

async function loadGenreRecommendations(genres) {
  const token = localStorage.getItem('token');
  if (!token || !Array.isArray(genres)) return;

  recContainer.innerHTML = '';

  if (genres.length === 0) {
    recContainer.innerHTML = `
      <div class="recommend-block">
        <h3>선호 장르 기반 추천 영화</h3>
        <p class="no-genre-msg">선호 장르를 선택해 주세요 (1개 이상)</p>
      </div>
    `;
    return;
  }

  for (const genre of genres) {
    const block = document.createElement('div');
    block.className = 'recommend-block';
    block.innerHTML = `
      <h3>${genre} 추천 영화</h3>
      <div class="recommend-slider-wrapper">
        <div class="recommend-slider" id="slider-${genre}"></div>
      </div>
      <div class="recommend-nav">
        <button onclick="moveSlide('${genre}', -1)">◀</button>
        <button onclick="moveSlide('${genre}', 1)">▶</button>
      </div>
    `;
    recContainer.appendChild(block);

    try {
      const res = await fetch(`/api/recommendations?genre=${encodeURIComponent(genre)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const { results } = await res.json();

      const slider = document.getElementById(`slider-${genre}`);
      const visibleCount = 3;
      const movies = results.slice(0, 12);
      const allMovies = movies.concat(movies.slice(0, visibleCount));

      allMovies.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'recommend-card';
        card.innerHTML = `
          <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}" onclick="location.href='search.html?movieId=${movie.id}'"/>
          <p>${movie.title}</p>
        `;
        slider.appendChild(card);
      });
    } catch (err) {
      console.error(`${genre} 추천 실패:`, err);
    }
  }
}

const sliderPositions = {};
const isTransitioning = {};

function moveSlide(genre, direction) {
  const slider = document.getElementById(`slider-${genre}`);
  const visibleCount = 3;
  const totalSlides = slider.children.length;

  if (!sliderPositions[genre]) sliderPositions[genre] = 0;

  if (isTransitioning[genre]) return;
  isTransitioning[genre] = true;

  slider.style.transition = 'transform 0.5s ease';
  sliderPositions[genre] += direction;

  const offset = (sliderPositions[genre] * (100 / visibleCount));
  slider.style.transform = `translateX(-${offset}%)`;

  setTimeout(() => {
    if (sliderPositions[genre] >= totalSlides - visibleCount) {
      slider.style.transition = 'none';
      sliderPositions[genre] = 0;
      slider.style.transform = 'translateX(0)';
    } else if (sliderPositions[genre] < 0) {
      slider.style.transition = 'none';
      sliderPositions[genre] = totalSlides - visibleCount - 1;
      const resetOffset = (sliderPositions[genre] * (100 / visibleCount));
      slider.style.transform = `translateX(-${resetOffset}%)`;
    }
    isTransitioning[genre] = false;
  }, 500);
}
