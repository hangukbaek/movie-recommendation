
const KOBIS_API_KEY = '5fad6bfd5b7f468ba47fb6907d507185';
const TMDB_API_KEY = '999dc9586a0cbbaf8d1f914c3b6bcdff';

const top100Movies = [
  "명량", "극한직업", "신과함께-죄와 벌", "국제시장", "베테랑", "서울의 봄", "괴물", "도둑들", "7번방의 선물", "암살",
  "범죄도시2", "광해, 왕이 된 남자", "왕의 남자", "신과함께-인과 연", "택시운전사", "파묘", "태극기 휘날리며", "부산행", "범죄도시4", "해운대",
  "변호인", "실미도", "범죄도시3", "기생충", "검사외전", "엑시트", "설국열차", "관상", "해적: 바다로 간 산적", "수상한 그녀",
  "국가대표", "디워", "백두산", "과속스캔들", "웰컴 투 동막골", "공조", "히말라야", "베테랑2", "밀정", "최종병기 활",
  "써니", "화려한 휴가", "한산: 용의 출현", "1987", "베를린", "마스터", "터널", "내부자들", "인천상륙작전", "공조2: 인터내셔날",
  "럭키", "은밀하게 위대하게", "곡성", "범죄도시", "타짜", "좋은 놈, 나쁜 놈, 이상한 놈", "늑대소년", "미녀는 괴로워", "군함도", "아저씨",
  "사도", "전우치", "투사부일체", "연평해전", "쉬리", "청년경찰", "가문의 위기", "숨바꼭질", "덕혜옹주", "더 테러 라이브",
  "감시자들", "의형제", "검은 사제들", "안시성", "더 킹", "완득이", "완벽한 타인", "살인의 추억", "타워", "말아톤",
  "밀수", "추격자", "독전", "공작", "동갑내기 과외하기", "하얼빈", "바람과 함께 사라지다", "님아, 그 강을 건너지 마오", "봉오동 전투", "조선명탐정 : 각시투구꽃의 비밀",
  "군도: 민란의 시대", "남산의 부장들", "범죄와의 전쟁: 나쁜놈들 전성시대", "파일럿", "신세계", "도가니", "내 아내의 모든 것", "판도라", "나쁜 녀석들: 더 무비", "노량: 죽음의 바다"
];

let currentRound = [];
let nextRound = [];
let matchIndex = 0;
let currentRoundSize = 0;

async function fetchBoxOfficeMovies() {
  return top100Movies.map(title => ({ movieNm: title }));
}

async function fetchTMDBTrailer(title) {
  try {
    const searchRes = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&language=ko-KR`);
    const searchData = await searchRes.json();
    if (!searchData.results || searchData.results.length === 0) return null;

    const movieId = searchData.results[0].id;
    const videoRes = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=ko-KR`);
    const videoData = await videoRes.json();
    const trailer = videoData.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');

    return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
  } catch (err) {
    console.error("❌ 예고편 검색 오류:", err);
    return null;
  }
}

function getRandomMovies(allMovies, count) {
  const shuffled = [...allMovies].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

async function startTournament(roundCount) {
  const allMovies = await fetchBoxOfficeMovies();
  if (allMovies.length === 0) return;

  const selected = getRandomMovies(allMovies, roundCount);
  const movies = await Promise.all(
    selected.map(async (movie) => {
      const trailer = await fetchTMDBTrailer(movie.movieNm);
      return { title: movie.movieNm, trailer };
    })
  );

  currentRoundSize = movies.length;
  initializeBracket(movies);
}

function initializeBracket(movies) {
  currentRound = movies;
  nextRound = [];
  matchIndex = 0;
  updateRoundLabel();
  showNextMatch();
}

function showNextMatch() {
  const container = document.getElementById("match-area");
  container.innerHTML = "";

  if (matchIndex >= currentRound.length) {
    if (nextRound.length === 1) {
      showWinner(nextRound[0]);
    } else {
      currentRound = nextRound;
      currentRoundSize = currentRound.length;
      nextRound = [];
      matchIndex = 0;
      updateRoundLabel();
      showNextMatch();
    }
    return;
  }

  const movie1 = currentRound[matchIndex];
  const movie2 = currentRound[matchIndex + 1];
  renderMatch(container, movie1, movie2);
  updateRoundLabel();
}

function renderMatch(container, movie1, movie2) {
  container.innerHTML = `
    <div class="match-row" style="display: flex; width: 100vw; height: 80vh;">
      ${renderMovieCard(movie1, matchIndex, 0)}
      <div class="vs-label" style="align-self: center; font-size: 2rem; color: white; padding: 10px;">VS</div>
      ${renderMovieCard(movie2, matchIndex, 1)}
    </div>
  `;
}

function renderMovieCard(movie, index, side) {
  const sideClass = side === 0 ? "left" : "right";
  const buttonColor = side === 0 ? "#e74c3c" : "#2980b9";
  const trailerContent = movie.trailer
    ? `<iframe src="${movie.trailer}" style="width: 100%; height: 100%; border: none; flex-grow: 1;" allow="autoplay; encrypted-media" allowfullscreen></iframe>`
    : `<div style="flex-grow:1; display:flex; justify-content:center; align-items:center; background:#111; color:white; font-size:1.2rem;">예고편 없음</div>`;

  return `
    <div class="tournament-card" style="flex: 1; position: relative; display: flex; flex-direction: column;">
      ${trailerContent}
      <div class="movie-title" style="text-align: center; color: white; font-size: 20px; background: rgba(0,0,0,0.4); padding: 8px 0;">
        ${movie.title}
      </div>
      <button class="select-button ${sideClass}" onclick="chooseMovie(${index}, ${side})"
        style="width: 100%; padding: 12px; background: ${buttonColor}; color: white; border: none; font-size: 20px; cursor: pointer;">
        ✔ 선택
      </button>
    </div>
  `;
}

function chooseMovie(index, selected) {
  const winner = selected === 0 ? currentRound[index] : currentRound[index + 1];
  nextRound.push(winner);
  matchIndex += 2;
  showNextMatch();
}

function showWinner(movie) {
  const winnerBox = document.getElementById("winner-box");
  const trailerContent = movie.trailer
    ? `<iframe width="600" height="360" src="${movie.trailer}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`
    : `<div style="width:600px; height:360px; background:#111; display:flex; justify-content:center; align-items:center; color:white;">예고편 없음</div>`;

  winnerBox.innerHTML = `
    <p>🎉 당신의 최종 선택!</p>
    ${trailerContent}
    <h2 style="color: white;">${movie.title}</h2>
  `;
  winnerBox.style.display = "block";
}

function updateRoundLabel() {
  const roundLabel = document.getElementById("round-label");
  const roundName = currentRoundSize + "강";
  const matchNum = Math.floor(matchIndex / 2) + 1;
  const totalMatches = currentRoundSize / 2;
  roundLabel.textContent = `${roundName} ${matchNum}/${totalMatches}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const startBtn = document.getElementById("start-btn");
  const roundSelect = document.getElementById("round-select");
  const infoText = document.getElementById("info-text");

  roundSelect.addEventListener("change", () => {
    const value = roundSelect.value;
    infoText.textContent = `총 100개의 영화 중 무작위로 ${value}개가 대결합니다.`;
  });

  startBtn.addEventListener("click", () => {
    const roundCount = parseInt(roundSelect.value, 10);
    modal.style.display = "none";
    document.getElementById("tournament-area").style.display = "block";
    startTournament(roundCount);
  });
});
