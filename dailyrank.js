const dailyTargetDate = (() => {
    const today = new Date();
    today.setDate(today.getDate() - 1); // 어제 날짜
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  })();
  
  const kobisDailyUrl = `https://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=5fad6bfd5b7f468ba47fb6907d507185&targetDt=${dailyTargetDate}`;
  
  fetch(kobisDailyUrl)
    .then(response => response.json())
    .then(data => {
      const list = data.boxOfficeResult.dailyBoxOfficeList;
      const listElement = document.getElementById('boxoffice-list');
      listElement.innerHTML = "";
  
      list.slice(0, 10).forEach(movie => {
        const li = document.createElement('li');
        li.className = 'boxoffice-item';
        li.innerHTML = `
          <span class="rank">${movie.rank}.</span>
          <span class="title">${movie.movieNm}</span>
        `;
        listElement.appendChild(li);
      });
    })
    .catch(error => {
      console.error('박스오피스 불러오기 실패:', error);
    });
  