const genreButtons = document.querySelectorAll('.genre-button');
const genderButtons = document.querySelectorAll('.gender-button');
const ageButtons = document.querySelectorAll('.age-button');
const inputGenre = document.getElementById('input-genre');
const inputGender = document.getElementById('input-gender');
const inputAge = document.getElementById('input-age');
const editBtn = document.getElementById('edit-profile');
let isEditing = false;

function markEditing() {
  if (!isEditing) {
    editBtn.textContent = '수정 중...';
    isEditing = true;
  }
}

// 장르
genreButtons.forEach(button => {
  button.addEventListener('click', () => {
    button.classList.toggle('selected');
    const selectedGenres = Array.from(genreButtons)
      .filter(btn => btn.classList.contains('selected'))
      .map(btn => btn.textContent);
    inputGenre.value = selectedGenres.join(',');
    markEditing();
  });
});

// 성별
genderButtons.forEach(button => {
  button.addEventListener('click', () => {
    genderButtons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    inputGender.value = button.dataset.value;
    markEditing();
  });
});

// 연령대
ageButtons.forEach(button => {
  button.addEventListener('click', () => {
    ageButtons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    inputAge.value = button.textContent;
    markEditing();
  });
});

// 이름 입력 시
document.getElementById('input-name').addEventListener('input', markEditing);

// 저장
document.getElementById('profile-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('input-name').value;
  const gender = inputGender.value;
  const genre = inputGenre.value;
  const age = inputAge.value;

  localStorage.setItem('profileName', name);
  localStorage.setItem('profileGender', gender);
  localStorage.setItem('profileGenre', genre);
  localStorage.setItem('profileAge', age);

  alert('저장되었습니다!');
  displayProfile();

  editBtn.textContent = '수정 완료!';
  isEditing = false;
  setTimeout(() => {
    if (!isEditing) editBtn.textContent = '프로필 수정';
  }, 1500);
});

// 수정 모드 진입 시 기존 정보 채우기
editBtn.addEventListener('click', () => {
  document.getElementById('input-name').value = localStorage.getItem('profileName') || '';

  genderButtons.forEach(btn => {
    const val = localStorage.getItem('profileGender');
    btn.classList.toggle('selected', btn.dataset.value === val);
    if (btn.classList.contains('selected')) inputGender.value = val;
  });

  const selectedGenres = (localStorage.getItem('profileGenre') || '').split(',');
  genreButtons.forEach(btn => {
    btn.classList.toggle('selected', selectedGenres.includes(btn.textContent));
  });
  inputGenre.value = selectedGenres.join(',');

  ageButtons.forEach(btn => {
    const val = localStorage.getItem('profileAge');
    btn.classList.toggle('selected', btn.textContent === val);
    if (btn.classList.contains('selected')) inputAge.value = val;
  });

  markEditing();
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

// 화면 로드 시
window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.getElementById('theme-toggle').textContent = '🌙 테마 전환';
  }
  displayProfile();
});

// 정보 표시
function displayProfile() {
  document.getElementById('display-name').textContent = `이름: ${localStorage.getItem('profileName') || ''}`;
  document.getElementById('display-gender').textContent = `성별: ${localStorage.getItem('profileGender') || ''}`;
  document.getElementById('display-genre').textContent = `선호 장르: ${localStorage.getItem('profileGenre') || ''}`;
  document.getElementById('display-age').textContent = `연령대: ${localStorage.getItem('profileAge') || ''}`;
}
