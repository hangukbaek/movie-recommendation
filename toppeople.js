let currentTab = 'director';

const hotDirectors = ['봉준호', '박찬욱', '류승완', '김한민', '최동훈'];
const hotActors = ['송강호', '이병헌', '최민식', '하정우', '황정민'];

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".person-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".person-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentTab = tab.dataset.role;
      loadPeople();
    });
  });

  document.querySelector(".close-btn").addEventListener("click", () => {
    document.getElementById("person-modal").classList.add("hidden");
  });

  loadPeople(); // 첫 로딩
});

async function loadPeople() {
  const names = currentTab === 'director' ? hotDirectors : hotActors;
  const container = document.getElementById("person-list");
  container.innerHTML = "";

  for (const name of names) {
    const res = await fetch(`https://api.themoviedb.org/3/search/person?api_key=${tmdbKey}&language=ko-KR&query=${name}`);
    const data = await res.json();
    const person = data.results[0];
    if (!person) continue;

    const card = document.createElement("div");
    card.className = "person-card";
    card.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w300${person.profile_path}" alt="${name}" />
      <p>${name}</p>
    `;
    card.addEventListener("click", () => showPersonModal(person));
    container.appendChild(card);
  }
}

async function showPersonModal(person) {
  const modal = document.getElementById("person-modal");
  const nameEl = document.getElementById("modal-name");
  const profileImg = document.getElementById("modal-profile");
  const movieList = document.getElementById("modal-movies");

  nameEl.textContent = person.name;
  profileImg.src = `https://image.tmdb.org/t/p/w300${person.profile_path}`;
  movieList.innerHTML = "";

  const tmdbRes = await fetch(`https://api.themoviedb.org/3/person/${person.id}/movie_credits?api_key=${tmdbKey}&language=ko-KR`);
  const tmdbData = await tmdbRes.json();

  const rawList = currentTab === 'director'
    ? tmdbData.crew.filter(m => m.job === 'Director')
    : tmdbData.cast;

  const koreanMovies = rawList.filter(m =>
    m.poster_path &&
    m.vote_count &&
    m.original_language === "ko"
  );

  const sorted = koreanMovies
    .sort((a, b) => b.vote_count - a.vote_count)
    .slice(0, 10); // 최대 10개만 표시

  sorted.forEach(movie => {
    const card = document.createElement("div");
    card.className = "modal-movie-card";
    card.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}" />
      <p title="${movie.title}">${movie.title}</p>
    `;
    movieList.appendChild(card);
  });

  modal.classList.remove("hidden");
}
