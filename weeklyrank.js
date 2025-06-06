const container = document.getElementById('hot-movie-list');

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
      
        const img = document.createElement('img');
        img.src = posterUrl || 'https://via.placeholder.com/200x300?text=No+Image';
        img.alt = movie.movieNm;
        img.style.width = '100%';
        img.style.borderRadius = '8px';
      
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
