/* =====================================================
   main.js  —  그리드 렌더 / 라이트박스 / prev-next 네비
   ===================================================== */

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('lang')) {
  localStorage.setItem('lang', urlParams.get('lang'));
}
const lbDescEl = document.getElementById('lb-desc');
let LANG = localStorage.getItem('lang') === 'en' ? 'en' : 'kr';
let currentImageIndex = 0;
let validImgs = [];

const CAT_LABEL = {
  kr: {
    all: '전체', commission: '커미션', personal: '개인작',
    commercial: '상업작', '2d-animation': '2D애니메이션',
    '3d-animation': '3D애니메이션', game: '게임',
    character: '캐릭터',
    'cha-commission': '캐릭터 커미션',
    'cha-personal':   '캐릭터 개인작',
    'cha-commercial': '캐릭터 상업작',
    noImage: '이미지 준비 중',
  },
  en: {
    all: 'All', commission: 'Commission', personal: 'Personal',
    commercial: 'Commercial', '2d-animation': '2D Animation',
    '3d-animation': '3D Animation', game: 'Game',
    character: 'Character',
    'cha-commission': 'Cha Commission',
    'cha-personal':   'Cha Personal',
    'cha-commercial': 'Cha Commercial',
    noImage: 'Coming soon',
  },
};


function catLabel(cat) { return CAT_LABEL[LANG][cat] || cat; }

const ILLU_CATS = ['commission', 'personal', 'commercial', 'character', 'cha-commission', 'cha-personal', 'cha-commercial'];
function isIllu(cat) { return ILLU_CATS.includes(cat); }

let currentList  = [];
let currentIndex = 0;

/* =====================================================
   GRID RENDERER
   ===================================================== */
function getColCount() {
  if (window.innerWidth <= 480) return 1;
  if (window.innerWidth <= 768) return 2;
  return 3;
}

function buildCardHTML(work) {
  const title = LANG === 'en' ? work.title_en : work.title;
  if (isIllu(work.category)) {
    const firstImg = (work.images || []).find(s => s && s.trim() !== '');
    return `
      <div class="work-card work-card--illu" data-id="${work.id}">
        <div class="work-full-img">
          ${firstImg
            ? `<img src="${firstImg}" alt="${title}" loading="lazy">`
            : `<div class="work-thumb-placeholder">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <rect x="1" y="1" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.2"/>
                  <circle cx="7" cy="7" r="1.8" stroke="currentColor" stroke-width="1.2"/>
                  <path d="M1 14l5-4.5 4.5 3.5 2.5-2.5L21 17" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                </svg>
                ${CAT_LABEL[LANG].noImage}
               </div>`
          }
        </div>
        <div class="work-meta">
          <div class="work-meta-title">${title}</div>
          <div class="work-meta-tag">${catLabel(work.category)} · ${work.year}</div>
        </div>
      </div>`;
  }
  const hasThumb = work.thumb && work.thumb.trim() !== '';
  return `
    <div class="work-card" data-id="${work.id}">
      <div class="work-thumb">
        ${hasThumb
          ? `<img src="${work.thumb}" alt="${title}" loading="lazy">`
          : `<div class="work-thumb-placeholder">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="1" y="1" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.2"/>
                <circle cx="7" cy="7" r="1.8" stroke="currentColor" stroke-width="1.2"/>
                <path d="M1 14l5-4.5 4.5 3.5 2.5-2.5L21 17" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
              ${CAT_LABEL[LANG].noImage}
             </div>`
        }
      </div>
      <div class="work-meta">
        <div class="work-meta-title">${title}</div>
        <div class="work-meta-tag">${catLabel(work.category)} · ${work.year}</div>
      </div>
    </div>`;
}

function renderGrid(target, cats) {
  const grid = document.querySelector(target);
  if (!grid) return;

  currentList = WORKS
    .filter(w => cats.includes(w.category))
    .sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;
      return orderB - orderA; // order 높을수록 최신
    });

  if (currentList.length === 0) {
    grid.innerHTML = `<p class="empty-msg">${LANG === 'en' ? 'No works yet' : '아직 작업이 없어요'}</p>`;
    return;
  }

  const COLS = getColCount();

  const columns = Array.from({ length: COLS }, () => []);
  currentList.forEach((work, i) => {
    const col = i % COLS;
    columns[col].push(work);
  });

  grid.innerHTML = columns
    .map(col => `<div class="grid-col">${col.map(buildCardHTML).join('')}</div>`)
    .join('');

  grid.querySelectorAll('.work-card').forEach(card => {
    card.addEventListener('click', () => openLightbox(card.dataset.id));
  });
}

/* =====================================================
   CATEGORY FILTER
   ===================================================== */
function initCatFilter(allCats) {
  document.querySelectorAll('.sub-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sub-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat  = btn.dataset.cat;
      const cats = cat === 'all' ? allCats : [cat];
      renderGrid('#work-grid', cats);

      document.querySelectorAll('.nav-dropdown a').forEach(a => {
        const url      = new URL(a.href, location.href);
        const path     = url.pathname.split('/').pop();
        const aCat     = url.searchParams.get('cat');
        const samePage = path === (location.pathname.split('/').pop() || 'index.html');
        const sameCat  = aCat === cat || (!aCat && cat === 'all');
        a.classList.toggle('active', samePage && sameCat);
      });
    });
  });
}

/* =====================================================
   LIGHTBOX
   ===================================================== */
const lbOverlay = document.getElementById('lb-overlay');
const lbTitleEl = document.getElementById('lb-title');
const lbTagEl   = document.getElementById('lb-tag');
const lbScroll  = document.getElementById('lb-scroll');
const lbCloseEl = document.getElementById('lb-close');
const lbPrev    = document.getElementById('lb-prev');
const lbNext    = document.getElementById('lb-next');
const lbCounter = document.getElementById('lb-counter');

let lbObserver = null;

function openLightbox(id) {
  const idx = currentList.findIndex(w => w.id === id);
  if (idx === -1) return;
  currentIndex = idx;
  renderLightbox();
  document.body.style.overflow = 'hidden';
  lbOverlay.classList.add('open');
}

function renderLightbox() {
  const work = currentList[currentIndex];
  if (!work) return;

  const title = LANG === 'en' ? work.title_en : work.title;
  const desc  = LANG === 'en' ? work.description_en : work.description;

  lbTitleEl.textContent = title;
  if (lbDescEl) lbDescEl.textContent = desc || '';

  if (lbPrev) lbPrev.disabled = currentIndex === 0;
  if (lbNext) lbNext.disabled = currentIndex === currentList.length - 1;

  validImgs = (work.images || []).filter(s => s && s.trim() !== '');
  currentImageIndex = 0;
  renderImage();
}

function renderImage() {
  const work  = currentList[currentIndex];
  const title = LANG === 'en' ? work.title_en : work.title;

  lbTagEl.textContent = catLabel(work.category) + ' · ' + work.year
    + (validImgs.length > 1 ? `  (${currentImageIndex + 1} / ${validImgs.length})` : '');

  if (work.video && currentImageIndex === 0 && validImgs.length === 0) {
    const isYoutube = work.video.startsWith('youtube:');
    if (isYoutube) {
      const ytId = work.video.replace('youtube:', '');
      lbScroll.innerHTML = `
        <div class="lb-img">
          <iframe
            src="https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1"
            allow="autoplay; encrypted-media"
            allowfullscreen
            style="width:100%;height:100%;border:none;aspect-ratio:16/9;max-height:100%;">
          </iframe>
        </div>`;
    } else {
      lbScroll.innerHTML = `
        <div class="lb-img">
          <video src="${work.video}" controls autoplay loop playsinline
                style="max-width:100%;max-height:100%;"></video>
        </div>`;
    }
    return;
  }

  // 점 인디케이터 업데이트
const dotsEl = document.getElementById('lb-dots');
if (dotsEl) {
  if (validImgs.length > 1) {
    dotsEl.innerHTML = validImgs.map((_, i) =>
      `<div class="lb-dot ${i === currentImageIndex ? 'active' : ''}"></div>`
    ).join('');
    dotsEl.style.display = 'flex';
  } else {
    dotsEl.style.display = 'none';
  }
}

  const src = validImgs[currentImageIndex] || '';
  lbScroll.innerHTML = src
    ? `<div class="lb-img"><img src="${src}" alt="${title}" loading="eager"></div>`
    : `<div class="lb-img-placeholder">${CAT_LABEL[LANG].noImage}</div>`;
}

function closeLightbox() {
  if (!lbOverlay) return;

  const video = lbScroll.querySelector('video');
  if (video) video.pause();

  const iframe = lbScroll.querySelector('iframe');
  if (iframe) iframe.src = '';

  lbOverlay.classList.remove('open');
  document.body.style.overflow = '';
  if (lbObserver) { lbObserver.disconnect(); lbObserver = null; }
}

/* ── 버튼 이벤트 ── */
if (lbPrev) lbPrev.addEventListener('click', () => {
  if (currentIndex > 0) { currentIndex--; renderLightbox(); }
});
if (lbNext) lbNext.addEventListener('click', () => {
  if (currentIndex < currentList.length - 1) { currentIndex++; renderLightbox(); }
});
if (lbCloseEl) lbCloseEl.addEventListener('click', closeLightbox);
if (lbOverlay) lbOverlay.addEventListener('click', e => {
  if (e.target === lbOverlay) closeLightbox();
});

/* ── 키보드 ── */
document.addEventListener('keydown', e => {
  if (!lbOverlay?.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft'  && currentIndex > 0)                      { currentIndex--; renderLightbox(); }
  if (e.key === 'ArrowRight' && currentIndex < currentList.length - 1) { currentIndex++; renderLightbox(); }
});

/* ── 마우스 휠 ── */
let wheelLocked = false;
if (lbOverlay) {
  lbOverlay.addEventListener('wheel', e => {
    e.preventDefault();
    if (!lbOverlay.classList.contains('open') || wheelLocked) return;

    const goNext = e.deltaY > 0 && currentImageIndex < validImgs.length - 1;
    const goPrev = e.deltaY < 0 && currentImageIndex > 0;
    if (!goNext && !goPrev) return;

    wheelLocked = true;
    setTimeout(() => { wheelLocked = false; }, 320);

    const imgEl = lbScroll.querySelector('.lb-img');
    if (imgEl) imgEl.classList.add('fade-out');

    setTimeout(() => {
      if (goNext) currentImageIndex++;
      if (goPrev) currentImageIndex--;
      renderImage();
    }, 120);
  }, { passive: false });
}

/* ── nav 드롭다운 + nav-btn active 표시 ── */
const currentPath = location.pathname.split('/').pop() || 'index.html';
const currentCat  = urlParams.get('cat');

// 드롭다운 링크 active
document.querySelectorAll('.nav-dropdown a').forEach(a => {
  const url      = new URL(a.href, location.href);
  const path     = url.pathname.split('/').pop();
  const cat      = url.searchParams.get('cat');
  const samePage = path === currentPath;
  const sameCat  = cat === currentCat || (!cat && !currentCat);
  a.classList.toggle('active', samePage && sameCat);
});

// nav-btn 자체 active (현재 페이지 기준)
document.querySelectorAll('.nav-btn').forEach(btn => {
  if (!btn.href) return;
  const url  = new URL(btn.href, location.href);
  const path = url.pathname.split('/').pop();
  btn.classList.toggle('active', path === currentPath);
});

/* ── 언어 텍스트 적용 ── */
document.querySelectorAll('[data-kr][data-en]').forEach(el => {
  el.textContent = LANG === 'en' ? el.dataset.en : el.dataset.kr;
});

// 언어 버튼 active
document.querySelectorAll('.lang-btn').forEach(btn => {
  const isActive = (btn.dataset.lang || btn.textContent.trim().toLowerCase()) === LANG;
  btn.classList.toggle('active', isActive);
});

/* ── 모바일 nav 드롭다운 터치 ── */
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('touchstart', e => {
    e.stopPropagation();
    const isOpen = item.classList.contains('touch-open');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('touch-open'));
    if (!isOpen) item.classList.add('touch-open');
  }, { passive: true });
});

document.addEventListener('touchstart', e => {
  if (!e.target.closest('.nav-item')) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('touch-open'));
  }
}, { passive: true });