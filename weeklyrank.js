// 슬라이더 컨테이너 및 팝업 요소
const container    = document.getElementById('hot-movie-list');
const popup        = document.getElementById('movie-popup');
const popupBody    = document.getElementById('popup-body');

// API 키 및 URL 설정
const tmdbKey      = '999dc9586a0cbbaf8d1f914c3b6bcdff';
const kobisKey     = "?key=5fad6bfd5b7f468ba47fb6907d507185"; 
const today        = new Date();
today.setDate(today.getDate() - 7);
const currentDate  = today.toISOString().split('T')[0].replace(/-/g, '');
const url          = `https://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchWeeklyBoxOfficeList.json${kobisKey}&targetDt=${currentDate}`;

// 슬라이더 설정
const cardWidth    = 240;
const gap          = 16;
const groupSize    = 5;
let   currentIndex;

document.addEventListener('DOMContentLoaded', initSlider);

async function initSlider() {
  const res  = await fetch(url);
  const data = await res.json();
  const list = data.boxOfficeResult?.weeklyBoxOfficeList;
  if (!list) return;

  // 카드 생성
  const movieCards = [];
  for (const movie of list.slice(0, 10)) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    const rank = document.createElement('div');
    rank.className = 'movie-rank';
    rank.innerText = `#${movie.rank}`;

    // TMDB에서 ID & 포스터 정보 가져오기
    const tmdbData = await getMovieInfoFromTMDB(movie.movieNm);

    const img = document.createElement('img');
    img.src = tmdbData?.poster || 'https://via.placeholder.com/200x300?text=No+Image';
    img.alt = movie.movieNm;
    img.style.borderRadius = '8px';
    img.addEventListener('click', () => openMoviePopup(tmdbData?.id));

    const title = document.createElement('h4');
    title.innerText = movie.movieNm;

    card.append(rank, img, title);
    movieCards.push(card);
  }

  // 무한 슬라이드를 위한 클론 추가
  const clonesBefore = movieCards.slice(-groupSize).map(c => c.cloneNode(true));
  const clonesAfter  = movieCards.slice(0, groupSize).map(c => c.cloneNode(true));
  [...clonesBefore, ...movieCards, ...clonesAfter]
    .forEach(c => container.appendChild(c));

  // 초기 위치 설정
  currentIndex = groupSize;
  container.style.transform = `translateX(-${(cardWidth + gap) * currentIndex}px)`;

  container.addEventListener('transitionend', onTransitionEnd);
  setupSlideButtons();
  setupTouchSwipe();
  setupMouseDrag();
}

// TMDB에서 포스터만 가져오던 기존 함수(유지)
async function getPosterFromTMDB(title) {
  const q    = encodeURIComponent(title);
  const url  = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${q}&language=ko-KR`;
  try {
    const res = await fetch(url);
    const d   = await res.json();
    if (d.results?.[0]?.poster_path)
      return `https://image.tmdb.org/t/p/w500${d.results[0].poster_path}`;
  } catch (e) { console.warn(e); }
  return null;
}

// TMDB에서 ID와 포스터 URL을 함께 가져오는 신규 함수
async function getMovieInfoFromTMDB(title) {
  const q     = encodeURIComponent(title);
  const url   = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${q}&language=ko-KR`;
  try {
    const res = await fetch(url);
    const data= await res.json();
    const result = data.results?.[0];
    if (result) {
      return {
        id: result.id,
        poster: result.poster_path ? `https://image.tmdb.org/t/p/w500${result.poster_path}` : null
      };
    }
  } catch (e) { console.error('TMDB 검색 오류:', e); }
  return null;
}

// 슬라이드 리셋 핸들러
function onTransitionEnd() {
  container.style.transition = 'none';
  const total = container.children.length;

  if (currentIndex >= total - groupSize) {
    currentIndex = groupSize;
  } else if (currentIndex < groupSize) {
    currentIndex = total - groupSize * 2;
  }
  container.style.transform = `translateX(-${(cardWidth + gap) * currentIndex}px)`;
  void container.offsetWidth;
  container.style.transition = 'transform 0.5s ease';
}

// 슬라이드 이동 함수
function slideRight() {
  currentIndex += groupSize;
  container.style.transform = `translateX(-${(cardWidth + gap) * currentIndex}px)`;
}
function slideLeft() {
  currentIndex -= groupSize;
  container.style.transform = `translateX(-${(cardWidth + gap) * currentIndex}px)`;
}

// 버튼 이벤트 바인딩
function setupSlideButtons() {
  document.getElementById('slide-left') .addEventListener('click', slideLeft);
  document.getElementById('slide-right').addEventListener('click', slideRight);
}

// 터치 스와이프 설정
function setupTouchSwipe() {
  let startX = 0, dragging = false;
  container.addEventListener('touchstart', e => { startX = e.touches[0].clientX; dragging = true; }, { passive: true });
  container.addEventListener('touchend',   e => {
    if (!dragging) return;
    const delta = e.changedTouches[0].clientX - startX;
    Math.abs(delta) > 50 && (delta > 0 ? slideLeft() : slideRight());
    dragging = false;
  }, { passive: true });
}

// 마우스 드래그 설정
function setupMouseDrag() {
  let startX = 0, dragging = false;
  container.addEventListener('mousedown', e => { startX = e.clientX; dragging = true; });
  container.addEventListener('mouseup',   e => {
    if (!dragging) return;
    const delta = e.clientX - startX;
    Math.abs(delta) > 50 && (delta > 0 ? slideLeft() : slideRight());
    dragging = false;
  });
  container.addEventListener('mouseleave', () => dragging = false);
}

// 모달 열기 함수 (사용자 코드 통합)
function openMoviePopup(movieId) {
  if (!movieId) return;
  popup.style.display = 'flex';
  popupBody.innerHTML = '<p>로딩 중...</p>';

  fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${tmdbKey}&language=ko-KR`)
    .then(res => res.json())
    .then(async movie => {
      const creditsRes = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${tmdbKey}&language=ko-KR`);
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
    })
    .catch(err => {
      popupBody.innerHTML = '<p>영화 정보를 불러오지 못했습니다.</p>';
      console.error('로딩 실패:', err);
    });
}

// 모달 닫기 이벤트
document.getElementById('popup-close')?.addEventListener('click', () => { popup.style.display = 'none'; });
window.addEventListener('click', e => { if (e.target === popup) popup.style.display = 'none'; });
