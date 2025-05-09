const genreButtons = document.querySelectorAll('.genre-button');
const genderButtons = document.querySelectorAll('.gender-button');
const ageButtons = document.querySelectorAll('.age-button');
const inputGenre = document.getElementById('input-genre');
const inputGender = document.getElementById('input-gender');
const inputAge = document.getElementById('input-age');

function saveProfile() {
  localStorage.setItem('profileGender', inputGender.value);
  localStorage.setItem('profileGenre', inputGenre.value);
  localStorage.setItem('profileAge', inputAge.value);
}

// 장르 선택
genreButtons.forEach(button => {
  button.addEventListener('click', () => {
    button.classList.toggle('selected');
    const selected = Array.from(genreButtons)
      .filter(btn => btn.classList.contains('selected'))
      .map(btn => btn.textContent);
    inputGenre.value = selected.join(',');
    saveProfile();
  });
});

// 성별 선택
genderButtons.forEach(button => {
  button.addEventListener('click', () => {
    genderButtons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    inputGender.value = button.dataset.value;
    saveProfile();
  });
});

// 연령대 선택
ageButtons.forEach(button => {
  button.addEventListener('click', () => {
    ageButtons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    inputAge.value = button.textContent;
    saveProfile();
  });
});

// 테마 전환
document.getElementById('theme-toggle').addEventListener('click', () => {
  const root = document.documentElement;
  const isDark = root.getAttribute('data-theme') === 'dark';
  if (isDark) {
    root.removeAttribute('data-theme');
    localStorage.removeItem('theme');
    document.getElementById('theme-toggle').textContent = '🌞 테마 전환';
  } else {
    root.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    document.getElementById('theme-toggle').textContent = '🌙 테마 전환';
  }
});

// 초기화
window.addEventListener('DOMContentLoaded', () => {
  inputGender.value = localStorage.getItem('profileGender') || '';
  inputGenre.value = localStorage.getItem('profileGenre') || '';
  inputAge.value = localStorage.getItem('profileAge') || '';

  genreButtons.forEach(btn => {
    if ((inputGenre.value || '').split(',').includes(btn.textContent)) {
      btn.classList.add('selected');
    }
  });

  genderButtons.forEach(btn => {
    if (btn.dataset.value === inputGender.value) {
      btn.classList.add('selected');
    }
  });

  ageButtons.forEach(btn => {
    if (btn.textContent === inputAge.value) {
      btn.classList.add('selected');
    }
  });

  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.getElementById('theme-toggle').textContent = '🌙 테마 전환';
  }

  // 추천 영화 이미지 주입
  const recommend = document.getElementById('user-recommend-content');
  const posters = ['movie1.jpg', 'movie2.jpg', 'movie3.jpg'];
  recommend.innerHTML = posters.map(src => `
    <img src="${src}" alt="추천 영화 포스터" />
  `).join('');
});
