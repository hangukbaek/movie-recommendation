// 탭 상태 및 인기 인물 목록
let currentTab = "director";
const hotDirectors = ["봉준호", "박찬욱", "류승완", "김한민", "최동훈", "이준익", "윤제균"];
const hotActors = ["송강호", "이병헌", "최민식", "하정우", "황정민", "이정재", "오달수"];

document.addEventListener("DOMContentLoaded", () => {
  // 탭 전환
  document.querySelectorAll(".person-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".person-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentTab = tab.dataset.role;
      loadPeople();
    });
  });

  // 모달 닫기 (기존 버튼)
  document.querySelector(".close-btn").addEventListener("click", () => {
    document.getElementById("person-modal").classList.add("hidden");
  });

  document.addEventListener("click", (e) => {
  const modal = document.getElementById("person-modal");

  // 모달이 숨겨져 있으면 무시
  if (modal.classList.contains("hidden")) return;

  // 모달 내용 영역을 제외한 다른 영역 클릭 시만 닫기
  const isInsideModalContent = e.target.closest(".modal-content"); // `.modal-content`는 실제 내부 영역 클래스
  if (!isInsideModalContent) {
    modal.classList.add("hidden");
    }
  });


  loadPeople();  // 초기 로딩
});

// TMDB 검색 및 카드 렌더링
async function loadPeople() {
  const names = currentTab === "director" ? hotDirectors : hotActors;
  const container = document.getElementById("person-list");
  container.innerHTML = "";

  for (const name of names) {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/person?api_key=${tmdbKey}&language=ko-KR&query=${encodeURIComponent(name)}`
      );
      const data = await res.json();
      const person = data.results[0];
      if (!person) continue;

      const card = document.createElement("div");
      card.className = "person-card";
      card.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w300${person.profile_path}" alt="${person.name}" />
        <p>${person.name}</p>
      `;
      card.addEventListener("click", () => showPersonModal(person));
      container.appendChild(card);

    } catch (err) {
      console.error("TMDB API 에러:", err);
    }
  }
}

// 위키백과 검색 → 첫 결과 선택 → summary 추출
async function fetchWikiSummary(name) {
  // 1) 검색
  const searchUrl = 
    `https://ko.wikipedia.org/w/api.php?` +
    `action=query&list=search&srsearch=${encodeURIComponent(name)}` +
    `&format=json&origin=*`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();
  const hits = searchData.query.search;
  if (!hits || hits.length === 0) {
    throw new Error("위키백과에 검색 결과가 없습니다.");
  }

  // 2) 요약 가져오기 (첫 번째 제목)
  const title = hits[0].title;
  const summaryUrl = 
    `https://ko.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const summaryRes = await fetch(summaryUrl);
  const summaryData = await summaryRes.json();
  if (summaryData.extract) {
    return summaryData.extract;
  }
  throw new Error("요약 정보를 찾을 수 없습니다.");
}

// 모달 열기 + 프로필(위키백과) + 필모그래피(TMDB)
async function showPersonModal(person) {
  const modal      = document.getElementById("person-modal");
  const nameEl     = document.getElementById("modal-name");
  const profileImg = document.getElementById("modal-profile");
  const bioEl      = document.getElementById("modal-bio");
  const movieList  = document.getElementById("modal-movies");

  nameEl.textContent   = person.name;
  profileImg.src       = `https://image.tmdb.org/t/p/w300${person.profile_path}`;
  movieList.innerHTML  = "";

  // 프로필 로딩
  bioEl.innerHTML = "<p>약력을 불러오는 중...</p>";
  try {
    const text = await fetchWikiSummary(person.name);
    bioEl.textContent = text;
  } catch (err) {
    console.warn(err);
    bioEl.textContent = "약력 불러오기 실패";
  }

  // 필모그래피 로딩
  try {
    const tmdbRes  = await fetch(
      `https://api.themoviedb.org/3/person/${person.id}/movie_credits?` +
      `api_key=${tmdbKey}&language=ko-KR`
    );
    const tmdbData = await tmdbRes.json();

    const rawList = currentTab === "director"
      ? tmdbData.crew.filter(m => m.job === "Director")
      : tmdbData.cast;

    const filtered = rawList
      .filter(m => m.poster_path && m.vote_count)
      .sort((a, b) => b.vote_count - a.vote_count)
      .slice(0, 10);

    filtered.forEach(movie => {
      const card = document.createElement("div");
      card.className = "modal-movie-card";
      card.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}" />
        <p title="${movie.title}">${movie.title}</p>
      `;
      movieList.appendChild(card);
    });

  } catch (err) {
    console.error("TMDB 필모그래피 로드 에러:", err);
  }

  modal.classList.remove("hidden");
}