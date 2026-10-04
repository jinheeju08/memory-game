const yokaiData = [
  { 
    id: 'otorisama', 
    name: '오토리사마', 
    desc: '병아리의 신. 닭이 되지 못하고 죽은 병아리들을 기억하기 위해 만들어진 신이다.', 
    image: 'images/오토리사마.png'
  },
  { 
    id: 'onamasama', 
    name: '오나마사마', 
    desc: '붉고 푸른 오니. 일년에 1번 집을 찾아가 게으름뱅이들을 혼내준다.', 
    image: 'images/오나마사마.png' 
  },
  { 
    id: 'susuwatari', 
    name: '스스와타리', 
    desc: '숯 검둥이의 신. 숯 검둥이가 오랜 세월을 거쳐 정령이 되어 탄생하였다.', 
    image: 'images/스스와타리.png'
  },
  { 
    id: 'kasugasama', 
    name: '카스가사마', 
    desc: '카스가타이샤 신사의 신. 일본 각지에 있는 신들이 배를 타고 모인다.', 
    image: 'images/카스가사마.png'
  },
  { 
    id: 'frog', 
    name: '개구리 관리자', 
    desc: '아부라야 온천장의 일꾼 개구리이다.', 
    image: 'images/개구리관리자.png' 
  },
  { 
    id: 'oshirasama', 
    name: '오시라사마', 
    desc: '무의 신, 농업의 신. 인간을 좋아하고 선량한 신이다.', 
    image: 'images/오시라사마.png' 
  },
  { 
    id: 'ushionisama', 
    name: '우시오니사마', 
    desc: '머리는 소, 몸통은 오니의 형태를 가진 신이다.', 
    image: 'images/우시오니사마.png' 
  },
  { 
    id: 'okusaresama', 
    name: '오쿠사레사마', 
    desc: '오물신. 이름있는 강의 신이었지만 쓰레기로 인해 오물신이 되어버렸다.', 
    image: 'images/오물신.png'
  },
  { 
    id: 'kaonashi', 
    name: '가오나시', 
    desc: '얼굴이 없는 요괴. 타인의 욕망을 흡수하고 외로움을 타는 존재이다.', 
    image: 'images/가오나시.png'
  },
  { 
    id: 'kamaji', 
    name: '가마지', 
    desc: '아부라야 온천장의 보일러실을 담당하는 여섯 팔의 노인이다.', 
    image: 'images/가마지.png' 
  },
   { 
    id: 'ganguisin', 
    name: '강의신', 
    desc: '쓰레기로 인해 오물의 신으로 오해를 받았었다.', 
    image: 'images/강의신.png'
  },
   { 
    id: 'haku', 
    name: '하쿠', 
    desc: '진짜 정체는 니기하야미 코하쿠누시로 코하쿠 강의 신이자 강의 정령이다.', 
    image: 'images/하쿠.png' 
  }
];

const difficultyConfig = {
  easy: { label: '쉬움 · 2 × 4 / 4쌍', pairs: 4, columns: 4 },
  normal: { label: '중간 · 3 × 4 / 6쌍', pairs: 6, columns: 4 },
  hard: { label: '어려움 · 4 × 4 / 8쌍', pairs: 8, columns: 4 }
};

// 도감 화면(gallery)이 추가되었습니다.
const screens = { 
  start: document.querySelector('#start-screen'), 
  difficulty: document.querySelector('#difficulty-screen'), 
  game: document.querySelector('#game-screen'),
  gallery: document.querySelector('#gallery-screen') 
};

const cardGrid = document.querySelector('#card-grid');
const modal = document.querySelector('#modal');
const modalTitle = document.querySelector('#modal-title');
const modalMessage = document.querySelector('#modal-message');
const modalResult = document.querySelector('#modal-result');
const modalPrimary = document.querySelector('#modal-primary');
const modalSecondary = document.querySelector('#modal-secondary');
const movesCount = document.querySelector('#moves-count');
const matchesCount = document.querySelector('#matches-count');
const pairsCount = document.querySelector('#pairs-count');
const timeCount = document.querySelector('#time-count');
const progressBar = document.querySelector('#progress-bar');

let currentDifficulty = null;
let cards = [];
let firstCard = null;
let locked = false;
let matchedPairs = 0;
let moves = 0;
let elapsedSeconds = 0;
let timerId = null;
let isPaused = false;

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function showScreen(name) {
  Object.entries(screens).forEach(([key, screen]) => screen.classList.toggle('hidden', key !== name));
}

function formatTime(totalSeconds) {
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;
}

function updateStats() {
  movesCount.textContent = moves;
  matchesCount.textContent = matchedPairs;
  timeCount.textContent = formatTime(elapsedSeconds);
  progressBar.style.width = `${(matchedPairs / difficultyConfig[currentDifficulty].pairs) * 100}%`;
}

function createCard(yokai, index) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'card';
  card.dataset.id = yokai.id;
  card.dataset.index = index;
  card.setAttribute('aria-label', '뒤집힌 카드');
  card.innerHTML = `
    <span class="card-inner">
      <span class="card-face card-back">
        <svg class="compass-mark" viewBox="0 0 100 100" fill="none" aria-hidden="true"><circle cx="50" cy="50" r="34" stroke-width="1" stroke-dasharray="3 3"/><path d="m50 15 6 29 29 6-29 6-6 29-6-29-29-6 29-6 6-29Z" stroke-width="1.5"/><path d="m50 28 4 18 18 4-18 4-4 18-4-18-18-4 18-4 4-18Z" stroke-width="1"/><circle cx="50" cy="50" r="4" fill="currentColor" stroke="none"/></svg>
        <span>記憶のかけら</span>
      </span>
      <span class="card-face card-front"><img src="${yokai.image}" alt="${yokai.name}"></span>
    </span>`;
  card.addEventListener('click', () => handleCardClick(card));
  return card;
}

function createBoard(difficulty) {
  currentDifficulty = difficulty;
  const config = difficultyConfig[difficulty];
  const selected = shuffle(yokaiData).slice(0, config.pairs);
  cards = shuffle([...selected, ...selected]);
  firstCard = null;
  locked = true; // 1. 카드를 보여주는 3초 동안 클릭하지 못하게 잠금
  matchedPairs = 0;
  moves = 0;
  elapsedSeconds = 0;
  isPaused = false;
  document.querySelector('#difficulty-label').textContent = config.label;
  pairsCount.textContent = config.pairs;
  cardGrid.className = `card-grid columns-${config.columns}`;
  
  // 카드를 생성하고 화면에 추가
  const cardElements = cards.map(createCard);
  cardGrid.replaceChildren(...cardElements);
  
  // 2. 생성된 모든 카드를 강제로 앞면(is-face-up)으로 뒤집기
  cardElements.forEach(card => card.classList.add('is-face-up'));
  
  updateStats();
  showScreen('game');
  clearInterval(timerId);
  
  // 3. 3초(3000ms) 후에 실행될 동작 설정
  setTimeout(() => {
    // 모든 카드를 다시 뒷면으로 덮기
    cardElements.forEach(card => card.classList.remove('is-face-up'));
    locked = false; // 카드 클릭 잠금 해제
    
    // 이때부터 1초마다 타이머 증가
    timerId = setInterval(() => { 
      if (!isPaused) { 
        elapsedSeconds += 1; 
        updateStats(); 
      } 
    }, 1000);
  }, 3000);
}

function beginGame(difficulty) {
  createBoard(difficulty);
}

function handleCardClick(card) {
  if (isPaused || locked) return;
  if (card.classList.contains('is-matched')) {
    if (card.dataset.detailReady === 'true') {
      card.classList.add('is-detail');
      card.setAttribute('aria-label', `${card.querySelector('img').alt} 설명`);
    }
    return;
  }
  if (card === firstCard) return;
  card.classList.add('is-face-up');
  if (!firstCard) { firstCard = card; return; }

  moves += 1;
  const secondCard = card;
  const isMatch = firstCard.dataset.id === secondCard.dataset.id;
  updateStats();
  if (isMatch) {
    const matchedCard = secondCard;
    firstCard.classList.add('is-matched');
    secondCard.classList.add('is-matched');
    matchedCard.dataset.detailReady = 'true';
    const detail = document.createElement('span');
    detail.className = 'detail-content';
    detail.innerHTML = `<strong>${cards.find(item => item.id === matchedCard.dataset.id).name}</strong><span>${cards.find(item => item.id === matchedCard.dataset.id).desc}</span>`;
    matchedCard.querySelector('.card-front').append(detail);
    matchedPairs += 1;
    firstCard = null;
    updateStats();
    if (matchedPairs === difficultyConfig[currentDifficulty].pairs) setTimeout(showCompleteModal, 650);
  } else {
    locked = true;
    setTimeout(() => { firstCard.classList.remove('is-face-up'); secondCard.classList.remove('is-face-up'); firstCard = null; locked = false; }, 850);
  }
}

function openPauseModal() {
  isPaused = true;
  modalTitle.textContent = '잠시 쉬어가세요';
  modalMessage.textContent = '게임은 그대로 멈춰 있습니다.';
  modalResult.classList.add('hidden');
  modalPrimary.textContent = '이어하기';
  modalSecondary.textContent = '그만하기';
  modal.classList.remove('hidden');
}

function showCompleteModal() {
  isPaused = true;
  modalTitle.textContent = 'All Clear';
  modalMessage.textContent = '모든 신령의 기억을 찾아냈습니다.';
  modalResult.innerHTML = `<div><strong>${moves}</strong><span>이동</span></div><div><strong>${formatTime(elapsedSeconds)}</strong><span>시간</span></div><div><strong>${matchedPairs}/${difficultyConfig[currentDifficulty].pairs}</strong><span>매칭</span></div>`;
  modalResult.classList.remove('hidden');
  modalPrimary.textContent = '다시하기';
  modalSecondary.textContent = '메인으로';
  modal.classList.remove('hidden');
}

function closeModal() { modal.classList.add('hidden'); isPaused = false; }
function goToDifficulty() { clearInterval(timerId); closeModal(); showScreen('difficulty'); }
function goHome() { clearInterval(timerId); closeModal(); showScreen('start'); }

/* === 이벤트 리스너 === */
document.querySelector('#start-button').addEventListener('click', () => showScreen('difficulty'));
document.querySelector('#difficulty-back').addEventListener('click', () => showScreen('start'));
document.querySelectorAll('[data-difficulty]').forEach(button => button.addEventListener('click', () => beginGame(button.dataset.difficulty)));
document.querySelector('#pause-button').addEventListener('click', openPauseModal);
document.querySelector('#game-back').addEventListener('click', openPauseModal);
document.querySelector('#restart-button').addEventListener('click', () => createBoard(currentDifficulty));

modalPrimary.addEventListener('click', () => { 
  if (modalResult.classList.contains('hidden')) {
    closeModal(); 
  } else {
    closeModal(); 
    beginGame(currentDifficulty); 
  }
});

modalSecondary.addEventListener('click', () => { 
  if (modalResult.classList.contains('hidden')) goToDifficulty(); 
  else goHome(); 
});


/* === 도감(Gallery) 관련 코드 수정 === */

function initGallery() {
  const galleryGrid = document.querySelector('#gallery-grid');
  galleryGrid.innerHTML = ''; 
  
  yokaiData.forEach(yokai => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML = `
      <img src="${yokai.image}" alt="${yokai.name}">
      <h3>${yokai.name}</h3>
    `;
    
    // 카드를 클릭했을 때 그림과 커진 글씨가 모달창에 뜨도록 설정
    item.addEventListener('click', () => {
      modalTitle.textContent = yokai.name;
      modalMessage.textContent = yokai.desc;
      modalResult.classList.add('hidden');
      modalPrimary.textContent = '확인';
      modalSecondary.classList.add('hidden'); // '그만하기' 버튼 숨기기
      
      // 모달창 제목(h2) 위에 이미지가 없으면 추가하고, 있으면 이미지를 바꿔치기
      let modalImg = modal.querySelector('.modal-gallery-img');
      if (!modalImg) {
        modalImg = document.createElement('img');
        modalImg.className = 'modal-gallery-img';
        modalTitle.before(modalImg); // h2 태그 바로 위에 이미지 삽입
      }
      modalImg.src = yokai.image;
      modalImg.alt = yokai.name;

      modal.classList.remove('hidden');
    });

    galleryGrid.appendChild(item);
  });
}

// 2. 메인 화면에서 '신령·요괴 도감 보러가기' 버튼 클릭 시
document.querySelector('#gallery-button').addEventListener('click', () => {
  initGallery(); 
  showScreen('gallery'); 
});

// 3. 도감 화면에서 '처음으로(뒤로가기)' 버튼 클릭 시
document.querySelector('#gallery-back').addEventListener('click', () => {
  showScreen('start'); 
});

// 모달 '확인' 버튼을 눌렀을 때 처리
modalPrimary.addEventListener('click', () => {
  modalSecondary.classList.remove('hidden');
});