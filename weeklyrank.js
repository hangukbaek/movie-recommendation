const container = document.getElementById('hot-movie-list');
const popup = document.getElementById("movie-popup");
const popupBody = document.getElementById("popup-body");

const tmdbKey = '999dc9586a0cbbaf8d1f914c3b6bcdff'; 

const today = new Date();
today.setDate(today.getDate() - 7);
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
const currentDate = `${year}${month}${day}`;

const kobisKey = "?key=5fad6bfd5b7f468ba47fb6907d507185";
const targetDt = "&targetDt=" + currentDate;
const url = "https://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchWeeklyBoxOfficeList.json"
  + kobisKey
  + targetDt;

let currentIndex = 0;
const cardWidth = 220;
let maxIndex = 0;

fetch(url)
  .then(response => response.json())
  .then(async function (item) {
    const list = item.boxOfficeResult?.weeklyBoxOfficeList;
    if (!list) {
      console.error("박스오피스 데이터 없음");
      return;
    }

    for (const movie of list.slice(0, 10)) {
        const card = document.createElement('div');
        card.classList.add('movie-card');
      
        // TMDB 포스터 가져오기
        const posterUrl = await getPosterFromTMDB(movie.movieNm);
        const tmdbData = await getMovieInfoFromTMDB(movie.movieNm);
      
      
        const img = document.createElement('img');
        img.src = posterUrl || 'https://via.placeholder.com/200x300?text=No+Image';
        img.alt = movie.movieNm;
        img.style.width = '100%';
        img.style.borderRadius = '8px';
        img.onclick = () => openMoviePopup(tmdbData?.id);  // 모달 열기
      
        const movieNm = document.createElement('h4');
        movieNm.innerText = movie.movieNm;
      
        const openDt = document.createElement('p');
        openDt.innerText = `개봉일: ${movie.openDt}`;
      
        // ✅ 순위(rank) 완전히 제거!
        card.appendChild(img);
        card.appendChild(movieNm);
        card.appendChild(openDt);
      
        container.appendChild(card);
      }
      

    maxIndex = container.children.length - 3;
  });

async function getPosterFromTMDB(title) {
  const query = encodeURIComponent(title);
  const tmdbUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${query}&language=ko-KR`;

  try {
    const res = await fetch(tmdbUrl);
    const data = await res.json();
    if (data.results && data.results.length > 0 && data.results[0].poster_path) {
      return `https://image.tmdb.org/t/p/w500${data.results[0].poster_path}`;
    }
  } catch (e) {
    console.error('TMDB 검색 오류:', e);
  }
  return null;
}

async function getMovieInfoFromTMDB(title) {
  const query = encodeURIComponent(title);
  const tmdbUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${query}&language=ko-KR`;

  try {
    const res = await fetch(tmdbUrl);
    const data = await res.json();
    const result = data.results?.[0];
    if (result) {
      return {
        id: result.id,
        poster: result.poster_path ? `https://image.tmdb.org/t/p/w500${result.poster_path}` : null
      };
    }
  } catch (e) {
    console.error('TMDB 검색 오류:', e);
  }
  return null;
}

function openMoviePopup(movieId) {
  if (!movieId) return;
  popup.style.display = "flex";
  popupBody.innerHTML = "<p>로딩 중...</p>";

  fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${tmdbKey}&language=ko-KR`)
    .then(res => res.json())
    .then(async (movie) => {
      const creditsRes = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${tmdbKey}&language=ko-KR`);
      const credits = await creditsRes.json();

      const genres = movie.genres.map(g => g.name).join(', ');
      const cast = credits.cast.slice(0, 5).map(c => c.name).join(', ');

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
      popupBody.innerHTML = "<p>영화 정보를 불러오지 못했습니다.</p>";
      console.error("로딩 실패:", err);
    });
}

document.getElementById("popup-close")?.addEventListener("click", () => {
  popup.style.display = "none";
});
window.addEventListener("click", (e) => {
  if (e.target === popup) popup.style.display = "none";
});

function updateSlider() {
  container.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
}

document.getElementById('slide-left').addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex--;
    updateSlider();
  }
});

document.getElementById('slide-right').addEventListener('click', () => {
  if (currentIndex < maxIndex) {
    currentIndex++;
    updateSlider();
  }
});
