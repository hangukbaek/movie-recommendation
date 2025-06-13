const BASE_URL = 'https://api.themoviedb.org/3';
const tmdbKey = '999dc9586a0cbbaf8d1f914c3b6bcdff';

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('query');
  const searchQueryElement = document.getElementById('search-query');
  const movieListContainer = document.getElementById('movie-list-container');

  
  
  // 검색어 표시
  searchQueryElement.textContent = query;

  // 영화 검색 URL
  const searchUrl = `${BASE_URL}/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(query)}&language=ko-KR`;

  // 영화 검색 요청
  fetch(searchUrl)
    .then(response => response.json())
    .then(data => {
      console.log(data);  // 응답 데이터 확인

      movieListContainer.innerHTML = '';  // 이전 콘텐츠 초기화

      if (data.results && data.results.length > 0) {
        // 영화 목록 반복 처리
        data.results.forEach(movie => {
          // 개봉연도와 평점 처리
          const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : '미상';
          const rating = movie.vote_average || 'N/A';

          // 주연 배우 정보 가져오기
          const movieDetailUrl = `${BASE_URL}/movie/${movie.id}/credits?api_key=${tmdbKey}&language=ko-KR`;

          // 주연 배우와 영화 상세 정보 가져오기
          fetch(movieDetailUrl)
            .then(res => res.json())
            .then(credits => {
              const mainCast = credits.cast?.slice(0, 2).map(actor => actor.name).join(', ') || '정보 없음';

              // 영화 카드 생성
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
                    <h4>📅 <strong>개봉연도:</strong> ${releaseYear}</h4>
                    <h4>⭐ <strong>평점:</strong> ${rating}</h4>
                    <h4>🎭 <strong>주연:</strong> ${mainCast}</h4>
                    <button onclick="openMoviePopup(${movie.id})">🔍 자세히 보기</button>
                  </div>
                </div>
              `;
              
              // 영화 카드를 영화 목록에 추가
              movieListContainer.appendChild(movieCard);
            })
            .catch(err => {
              console.error('영화 상세 정보를 불러오는 데 실패했습니다.', err);
            });
        });
      } else {
        movieListContainer.innerHTML = '<p>검색된 영화가 없습니다.</p>';
      }
    })
    .catch(err => {
      console.error('영화 검색에 실패했습니다.', err);
      movieListContainer.innerHTML = '<p>영화 검색에 실패했습니다. 다시 시도해 주세요.</p>';
    });
});

// 팝업을 여는 함수
function openMoviePopup(movieId) {
  const popup = document.getElementById("movie-popup");
  const popupBody = document.getElementById("popup-body");
  popup.style.display = "flex";
  popupBody.innerHTML = "<p>로딩 중...</p>";

  fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${tmdbKey}&language=ko-KR`)
    .then(res => res.json())
    .then(async movie => {
      const creditsRes = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${tmdbKey}&language=ko-KR`);
      const credits = await creditsRes.json();

      const genres = movie.genres.map(g => g.name).join(', ');
      const castList = credits.cast.slice(0, 5).map(actor => actor.name).join(', ');

      popupBody.innerHTML = `
        <h2>${movie.title}</h2>
        <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}" />
        <p><strong>장르:</strong> ${genres}</p>
        <p><strong>주연:</strong> ${castList}</p>
        <p><strong>개봉일:</strong> ${movie.release_date}</p>
        <p><strong>평점:</strong> ${movie.vote_average}</p>
        <p><strong>줄거리:</strong><br>${movie.overview || '줄거리가 제공되지 않았습니다.'}</p>
      `;
    })
    .catch(err => {
      popupBody.innerHTML = "<p>영화 정보를 불러오지 못했습니다.</p>";
      console.error("팝업 오류:", err);
    });
}

// 팝업 외부 클릭 또는 닫기 버튼 처리
window.addEventListener("click", (e) => {
  const popup = document.getElementById("movie-popup");
  if (e.target === popup) popup.style.display = "none";
});
document.getElementById("popup-close").addEventListener("click", () => {
  document.getElementById("movie-popup").style.display = "none";
});