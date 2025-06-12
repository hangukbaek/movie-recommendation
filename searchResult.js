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

              console.log(`개봉 연도: ${releaseYear}, 평점: ${rating}, 주연: ${mainCast}`);  // 콘솔에 데이터 확인

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
                    <button onclick="loadMovieDetail(${movie.id})">🔍 자세히 보기</button>
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

  // 새로고침 버튼 추가
  const refreshButton = document.createElement('button');
  refreshButton.textContent = '새로고침';
  refreshButton.className = 'refresh-btn';
  refreshButton.addEventListener('click', () => {
    location.reload();  // 페이지 새로고침
  });

  // 새로고침 버튼을 페이지에 추가
  document.body.appendChild(refreshButton);

// 영화 상세 정보를 기존 페이지에 덮어씌우는 함수
function loadMovieDetail(movieId) {
  const BASE_URL = 'https://api.themoviedb.org/3';
  const tmdbKey = '999dc9586a0cbbaf8d1f914c3b6bcdff';

  // 영화 상세 페이지로 덮어씌울 컨테이너
  const movieDetailContainer = document.getElementById('movie-list-container');

  // API 호출하여 영화 상세 정보 가져오기
  fetch(`${BASE_URL}/movie/${movieId}?api_key=${tmdbKey}&language=ko-KR`)
    .then(response => response.json())
    .then(movie => {
      movieDetailContainer.innerHTML = `
        <div class="movie-detail">
          <h1>${movie.title}</h1>
          <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" />
          <p><strong>📅개봉일:</strong> ${movie.release_date}</p>
          <p><strong>🎬장르:</strong> ${movie.genre_ID}</p>
          <p><span id="star-rating">${displayRating(movie.vote_average)}</span></p>
          <p><strong>평점:</strong> ${movie.vote_average}</p>
          <p><strong>'⭐':2점 '🌟' 1점 '☆':0점
          <p><strong>줄거리:</strong> ${movie.overview || '설명이 제공되지 않았습니다.'}</p>
        </div>
      `;
    })
    .catch(err => {
      console.error('영화 상세 정보를 불러오는 데 실패했습니다.', err);
      movieDetailContainer.innerHTML = '<p>영화 상세 정보를 불러오는 데 실패했습니다.</p>';
    });
}

// 별점 표시 함수
function displayRating(vote_average) {
    const fullStar = '⭐'; // 꽉 찬 별
    const halfStar = '🌟'; // 반별
    const emptyStar = '☆'; // 빈 별
    let stars = '';

    // 평점을 반영한 별의 개수를 계산
    const fullStarsCount = Math.floor(vote_average / 2); // 꽉 찬 별 개수
    const halfStarsCount = vote_average % 2 >= 1 ? 1 : 0; // 반별 개수
    const emptyStarsCount = 5 - fullStarsCount - halfStarsCount; // 빈 별 개수

    // 별 모양을 생성
    stars += fullStar.repeat(fullStarsCount);
    stars += halfStar.repeat(halfStarsCount);
    stars += emptyStar.repeat(emptyStarsCount);

    return stars;
}
