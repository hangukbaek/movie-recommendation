// 이번 달의 주차 구간 계산
function getWeekRangesOfCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const weeks = [];

  let start = new Date(firstDay);
  while (start <= lastDay) {
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    if (end > lastDay) end.setDate(lastDay.getDate());

    weeks.push({
      label: `${weeks.length + 1}주차`,
      start: start.toISOString().split("T")[0],
      end:   end.toISOString().split("T")[0]
    });

    start.setDate(start.getDate() + 7);
  }
  return weeks;
}

// 주차별 개봉예정작 데이터 가져오기
async function fetchUpcomingMoviesFiltered(startDate, endDate) {
  const url = `${BASE_URL}/discover/movie?` +
    `api_key=${tmdbKey}&language=ko-KR&region=KR` +
    `&sort_by=popularity.desc` +
    `&primary_release_date.gte=${startDate}` +
    `&primary_release_date.lte=${endDate}`;

  const res  = await fetch(url);
  const data = await res.json();
  const all  = data.results || [];

  const korean  = all.filter(m => m.original_language === 'ko');
  const foreign = all.filter(m => m.original_language !== 'ko' && m.vote_count >= 10);

  return [...korean, ...foreign];
}

// 주차별 섹션 렌더링 (기존 슬라이더 유지)
async function renderUpcomingWeek(week) {
  const { start, end, label } = week;
  const container = document.getElementById("upcoming-week-container");
  container.innerHTML = "";

  const movies = await fetchUpcomingMoviesFiltered(start, end);
  if (movies.length === 0) {
    container.innerHTML = `<p>${label} (${start} ~ ${end}) 개봉 예정작이 없습니다.</p>`;
    return;
  }

  const block = document.createElement("div");
  block.className = "week-block";

  const title = document.createElement("h3");
  title.textContent = `${label} (${start} ~ ${end})`;

  const sliderWrapper = document.createElement("div");
  sliderWrapper.className = "slider-wrapper upcoming";

  const movieList = document.createElement("div");
  movieList.className = "upcoming-movie-list";
  movieList.style.display        = 'flex';
  movieList.style.gap            = '16px';
  movieList.style.overflowX      = 'auto';
  movieList.style.scrollSnapType = 'x mandatory';
  movieList.style.paddingBottom  = '8px';

  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.style.flex            = '0 0 240px';
    card.style.scrollSnapAlign = 'start';

    // 이미지 엘리먼트 생성 및 클릭 리스너 추가
    const img = document.createElement('img');
    img.src = `https://image.tmdb.org/t/p/w300${movie.poster_path}`;
    img.alt = movie.title;
    img.style.width = '100%';
    img.style.borderRadius = '8px';
    img.addEventListener('click', () => openMoviePopup(movie.id));

    const info = document.createElement('div');
    info.innerHTML = `
      <p><strong>${movie.title}</strong></p>
      <p style="font-size:13px;color:#888;">${movie.release_date || '개봉일 미정'}</p>
    `;

    card.appendChild(img);
    card.appendChild(info);
    movieList.appendChild(card);
  });

  sliderWrapper.appendChild(movieList);
  block.appendChild(title);
  block.appendChild(sliderWrapper);
  container.appendChild(block);
}

// 탭 버튼 렌더링
function renderWeekTabs(weeks) {
  const tabContainer = document.getElementById("week-tab-buttons");
  tabContainer.innerHTML = '';

  weeks.forEach((week, idx) => {
    const tab = document.createElement('button');
    tab.className = 'week-tab';
    tab.textContent = week.label;
    tab.addEventListener('click', () => {
      document.querySelectorAll('.week-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderUpcomingWeek(week);
    });
    tabContainer.appendChild(tab);
  });

  // 첫 탭 자동 선택
  const first = tabContainer.querySelector('.week-tab');
  if (first) {
    first.classList.add('active');
    renderUpcomingWeek(weeks[0]);
  }
}

// DOM 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  const weeks = getWeekRangesOfCurrentMonth();
  renderWeekTabs(weeks);
});

// 모달 팝업 함수 (기존 openMoviePopup 재사용)
async function openMoviePopup(movieId) {
  if (!movieId) return;
  const popup     = document.getElementById('movie-popup');
  const popupBody = document.getElementById('popup-body');
  popup.style.display = 'flex';
  popupBody.innerHTML = '<p>로딩 중...</p>';

  try {
    const movieRes   = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${tmdbKey}&language=ko-KR`);
    const movie      = await movieRes.json();
    const creditsRes = await fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${tmdbKey}&language=ko-KR`);
    const credits    = await creditsRes.json();

    const genres = movie.genres.map(g => g.name).join(', ');
    const cast   = credits.cast.slice(0,5).map(c=>c.name).join(', ');

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

// 모달 닫기 이벤트 핸들러
document.getElementById('popup-close').addEventListener('click', () => {
  document.getElementById('movie-popup').style.display = 'none';
});
window.addEventListener('click', e => {
  if (e.target.id === 'movie-popup') {
    e.target.style.display = 'none';
  }
});