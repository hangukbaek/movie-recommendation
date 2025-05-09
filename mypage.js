// mypage.js
// 마이페이지: 사용자 선호 장르, 성별, 나이 설정 및 불러오기

const form = document.getElementById('profile-form');
const saveBtn = document.getElementById('save-prefs');
const genreButtons = document.querySelectorAll('.genre-button');
const genderButtons = document.querySelectorAll('.gender-button');
const ageButtons = document.querySelectorAll('.age-button');
const inputGenre = document.getElementById('input-genre');
const inputGender = document.getElementById('input-gender');
const inputAge = document.getElementById('input-age');

// 1) 페이지 초기 로드: /api/profile에서 사용자 정보 가져와 화면 및 폼 설정
window.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch('/api/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const { userData } = await res.json();
    const prefs = userData.preferences || {};

    // 화면에 표시
    document.getElementById('display-name').textContent = `이름: ${userData.displayName || ''}`;
    document.getElementById('display-genre').textContent = `선호 장르: ${prefs.favoriteGenres?.join(', ') || ''}`;
    document.getElementById('display-gender').textContent = `성별: ${prefs.gender || ''}`;
    document.getElementById('display-age').textContent = `연령대: ${prefs.age || ''}`;

    // 폼 초기 설정
    // 장르
    genreButtons.forEach(btn => {
      const val = btn.textContent;
      btn.classList.toggle('selected', prefs.favoriteGenres?.includes(val));
    });
    inputGenre.value = prefs.favoriteGenres?.join(',') || '';
    // 성별
    genderButtons.forEach(btn => {
      const val = btn.dataset.value;
      btn.classList.toggle('selected', prefs.gender === val);
      if (prefs.gender === val) inputGender.value = val;
    });
    // 나이
    ageButtons.forEach(btn => {
      const val = btn.textContent;
      btn.classList.toggle('selected', prefs.age === val);
      if (prefs.age === val) inputAge.value = val;
    });

  } catch (err) {
    console.error('프로필 로드 실패:', err);
  }
});

// 2) 버튼 클릭 핸들러: 선택 상태 토글 및 hidden input 업데이트
function setupButtonHandlers() {
  genreButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('selected');
      const selected = Array.from(genreButtons)
        .filter(b => b.classList.contains('selected'))
        .map(b => b.textContent);
      inputGenre.value = selected.join(',');
    });
  });
  genderButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      genderButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      inputGender.value = btn.dataset.value;
    });
  });
  ageButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      ageButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      inputAge.value = btn.textContent;
    });
  });
}
setupButtonHandlers();

// 3) 저장: POST /api/user/preferences
form.addEventListener('submit', async e => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  if (!token) {
    alert('로그인이 필요합니다.');
    return;
  }
  const body = {
    favoriteGenres: inputGenre.value ? inputGenre.value.split(',') : [],
    gender: inputGender.value,
    age: inputAge.value
  };
  try {
    const res = await fetch('/api/user/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    const result = await res.json();
    if (result.success) {
      alert('선호 정보가 저장되었습니다!');
      window.location.reload();
    } else {
      alert('저장 실패: ' + result.error);
    }
  } catch (err) {
    console.error('저장 오류:', err);
    alert('서버 오류로 저장에 실패했습니다.');
  }
});
