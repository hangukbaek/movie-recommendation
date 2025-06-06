window.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get('movieId');

  const detailContainer = document.getElementById('movie-detail');

  if (!movieId) {
    detailContainer.innerHTML = '<p>유효한 영화 ID가 없습니다.</p>';
    return;
  }

  try {
  // 영화 기본 정보 요청
  const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=999dc9586a0cbbaf8d1f914c3b6bcdff&language=ko-KR`);
  const movie = await res.json();

  // 출연진 정보 요청
  const creditRes = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=999dc9586a0cbbaf8d1f914c3b6bcdff&language=ko-KR`);
  const credits = await creditRes.json();

  // 장르와 주연 배우 추출
  const genres = movie.genres.map(g => g.name).join(', ');
  const castList = credits.cast.slice(0, 5).map(actor => actor.name).join(', ');

  detailContainer.innerHTML = `
    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" />
    <h2>제목: ${movie.title}</h2>
    <p><strong>장르:</strong> ${genres}</p>
    <p><strong>주연:</strong> ${castList}</p>
    <p><strong>개봉일:</strong> ${movie.release_date}</p>
    <p><strong>평점:</strong> ${movie.vote_average}</p>
    <p><strong>줄거리:</strong> ${movie.overview || '줄거리가 제공되지 않았습니다.'}</p>
  `;
  } catch (err) {
    detailContainer.innerHTML = '<p>영화 정보를 불러오는 데 실패했습니다.</p>';
    console.error(err);
  }
});

// const tmdbKey = '999dc9586a0cbbaf8d1f914c3b6bcdff'; // 본인의 TMDB API 키
// const BASE_URL = 'https://api.themoviedb.org/3';

//   document.addEventListener('DOMContentLoaded', () => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const movieId = urlParams.get('id');

//     if (!movieId) {
//       document.body.innerHTML = '<p>❌ 영화 ID가 존재하지 않습니다.</p>';
//       return;
//     }

//     const detailUrl = `${BASE_URL}/movie/${movieId}?api_key=${tmdbKey}&language=ko-KR`;
//     const creditsUrl = `${BASE_URL}/movie/${movieId}/credits?api_key=${tmdbKey}&language=ko-KR`;

//     Promise.all([
//       fetch(detailUrl).then(res => res.json()),
//       fetch(creditsUrl).then(res => res.json())
//     ])
//     .then(([movie, credits]) => {
//       const mainCast = credits.cast?.slice(0, 3).map(actor => actor.name).join(', ') || '정보 없음';

//       const content = `
//         <div class="movie-detail">
//           <h1>${movie.title}</h1>
//           <img src="${movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : 'default.png'}" alt="${movie.title}" />
//           <p>📅 개봉일: ${movie.release_date || '미상'}</p>
//           <p>🕐 상영 시간: ${movie.runtime}분</p>
//           <p>⭐ 평점: ${movie.vote_average}</p>
//           <p>🎭 주연 배우: ${mainCast}</p>
//           <p>📝 줄거리: ${movie.overview || '줄거리 정보 없음'}</p>
//         </div>
//       `;

//       document.body.innerHTML = content;
//     })
//     .catch(err => {
//       console.error('영화 상세정보 불러오기 실패:', err);
//       document.body.innerHTML = '<p>❌ 영화 상세 정보를 불러올 수 없습니다.</p>';
//     });
//   });