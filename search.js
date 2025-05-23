window.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get('movieId');

  const detailContainer = document.getElementById('movie-detail');

  if (!movieId) {
    detailContainer.innerHTML = '<p>유효한 영화 ID가 없습니다.</p>';
    return;
  }

  try {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=999dc9586a0cbbaf8d1f914c3b6bcdff&language=ko-KR`);
    const movie = await res.json();

    detailContainer.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" />
      <h2>${movie.title}</h2>
      <p><strong>개봉일:</strong> ${movie.release_date}</p>
      <p><strong>평점:</strong> ${movie.vote_average}</p>
      <p><strong>줄거리:</strong> ${movie.overview || '설명이 제공되지 않았습니다.'}</p>
    `;
  } catch (err) {
    detailContainer.innerHTML = '<p>영화 정보를 불러오는 데 실패했습니다.</p>';
    console.error(err);
  }
});
