/* =====================================================
   devlog-main.js  —  개발일지 목록 / 상세 렌더
   -----------------------------------------------------
   main.js 를 먼저 로드해야 해요.
   LANG · nav active · 언어 텍스트 교체는 main.js 것을 그대로 씁니다.
   전역 이름 충돌을 막으려고 이 파일의 변수·함수는 전부 devlog 접두사.
   ===================================================== */

const DEVLOG_PER_PAGE = 5;

let devlogList   = [];   // 정렬 + 필터가 적용된 목록
let devlogFilter = null; // { type: 'game' | 'tag', value } (null = 전체)
let devlogPage   = 1;    // 현재 페이지 (1부터)
let devlogPushed = 0;    // 목록에서 상세로 들어가며 쌓은 히스토리 수

function gameLabel(game) { return (GAME_LABEL[LANG] || {})[game] || game; }

/* "2026-03-08" → "2026.03.08" */
function devlogDate(date) { return (date || '').replace(/-/g, '.'); }

function devlogEscape(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* 현재 lang 등 쿼리는 유지하면서 post 파라미터만 바꾼 URL */
function devlogUrl(postId) {
  const params = new URLSearchParams(location.search);
  if (postId) params.set('post', postId);
  else        params.delete('post');
  const query = params.toString();
  return 'devlog.html' + (query ? `?${query}` : '');
}

/* =====================================================
   INIT
   ===================================================== */
function initDevlog() {
  initFilterNav();
  applyDevlogFilter();

  const postId = new URLSearchParams(location.search).get('post');
  if (postId && POSTS.some(p => p.id === postId)) {
    renderPost(postId);
  } else {
    renderDevlogList();
  }

  window.addEventListener('popstate', () => {
    const id = new URLSearchParams(location.search).get('post');
    if (devlogPushed > 0) devlogPushed--;
    if (id && POSTS.some(p => p.id === id)) renderPost(id);
    else renderDevlogList();
  });
}

/* 날짜 최신순 정렬 + 게임/태그 필터 */
function applyDevlogFilter() {
  devlogList = POSTS
    .filter(p => {
      if (!p.id) return false;
      if (!devlogFilter) return true;
      if (devlogFilter.type === 'game') return p.game === devlogFilter.value;
      return (p.tags || []).includes(devlogFilter.value);
    })
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/* =====================================================
   필터 바 — 게임 태그 + 자유 태그 (기존 .tag-btn 스타일 재사용)
   ===================================================== */
function initFilterNav() {
  const tagNav = document.getElementById('tag-nav');
  if (!tagNav) return;

  const games = [...new Set(POSTS.map(p => p.game).filter(Boolean))];
  const tags  = [...new Set(POSTS.flatMap(p => p.tags || []).filter(Boolean))];
  if (games.length === 0 && tags.length === 0) return;

  tagNav.innerHTML =
    games.map(g =>
      `<button class="tag-btn" data-type="game" data-value="${devlogEscape(g)}"># ${devlogEscape(gameLabel(g))}</button>`
    ).join('') +
    tags.map(t =>
      `<button class="tag-btn" data-type="tag" data-value="${devlogEscape(t)}"># ${devlogEscape(t)}</button>`
    ).join('');

  tagNav.querySelectorAll('.tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const { type, value } = btn.dataset;
      // 같은 버튼을 다시 누르면 해제
      const same = devlogFilter && devlogFilter.type === type && devlogFilter.value === value;
      devlogFilter = same ? null : { type, value };

      tagNav.querySelectorAll('.tag-btn').forEach(b => {
        b.classList.toggle('active', !!devlogFilter
          && b.dataset.type === devlogFilter.type
          && b.dataset.value === devlogFilter.value);
      });

      devlogPage = 1;
      applyDevlogFilter();
      renderDevlogList();
    });
  });
}

/* =====================================================
   목록
   ===================================================== */
function buildPostCardHTML(post) {
  const title   = LANG === 'en' ? (post.title_en   || post.title)   : post.title;
  const excerpt = LANG === 'en' ? (post.excerpt_en || post.excerpt) : post.excerpt;
  const hasThumb = post.thumb && post.thumb.trim() !== '';

  const tagChips = (post.tags || [])
    .map(t => `<span class="devlog-card-chip"># ${devlogEscape(t)}</span>`).join('');

  return `
    <article class="devlog-card" data-id="${post.id}">
      <div class="devlog-card-thumb">
        ${hasThumb
          ? `<img src="${post.thumb}" alt="${devlogEscape(title)}" loading="lazy"
                  onerror="this.style.display='none'">`
          : `<div class="devlog-thumb-placeholder">${CAT_LABEL[LANG].noImage}</div>`
        }
      </div>
      <div class="devlog-card-body">
        <div class="devlog-card-tag">
          ${post.game ? `# ${devlogEscape(gameLabel(post.game))}` : ''}${tagChips}
        </div>
        <h2 class="devlog-card-title">${devlogEscape(title)}</h2>
        <div class="devlog-card-date">${devlogDate(post.date)}</div>
        <p class="devlog-card-excerpt">${devlogEscape(excerpt || '')}</p>
      </div>
    </article>`;
}

function renderDevlogList() {
  document.getElementById('devlog-post-view').style.display = 'none';
  document.getElementById('devlog-list-view').style.display = 'block';

  const list = document.getElementById('devlog-list');
  if (!list) return;

  const totalPages = Math.max(1, Math.ceil(devlogList.length / DEVLOG_PER_PAGE));
  if (devlogPage > totalPages) devlogPage = totalPages;

  if (devlogList.length === 0) {
    list.innerHTML = `<p class="empty-msg">${LANG === 'en' ? 'No posts yet' : '아직 글이 없어요'}</p>`;
    document.getElementById('devlog-pager').innerHTML = '';
    return;
  }

  const start = (devlogPage - 1) * DEVLOG_PER_PAGE;
  list.innerHTML = devlogList
    .slice(start, start + DEVLOG_PER_PAGE)
    .map(buildPostCardHTML)
    .join('');

  list.querySelectorAll('.devlog-card').forEach(card => {
    card.addEventListener('click', () => openPost(card.dataset.id));
  });

  renderPager(totalPages);
  window.scrollTo(0, 0);
}

function renderPager(totalPages) {
  const pager = document.getElementById('devlog-pager');
  if (!pager) return;

  pager.innerHTML = `
    <button class="devlog-page-btn" id="devlog-prev-page" ${devlogPage === 1 ? 'disabled' : ''}>&lt;</button>
    <span class="devlog-page-num">${devlogPage} / ${totalPages}</span>
    <button class="devlog-page-btn" id="devlog-next-page" ${devlogPage === totalPages ? 'disabled' : ''}>&gt;</button>`;

  document.getElementById('devlog-prev-page').addEventListener('click', () => {
    if (devlogPage > 1) { devlogPage--; renderDevlogList(); }
  });
  document.getElementById('devlog-next-page').addEventListener('click', () => {
    if (devlogPage < totalPages) { devlogPage++; renderDevlogList(); }
  });
}

/* =====================================================
   상세
   ===================================================== */
function openPost(id) {
  history.pushState({ devlogPost: id }, '', devlogUrl(id));
  devlogPushed++;
  renderPost(id);
}

/* 예전 글은 content 가 블록 배열이라 그대로 렌더링해줘요 */
function buildBlockHTML(block) {
  if (block.type === 'text') {
    return `<p>${devlogEscape(block.value).replace(/\n/g, '<br>')}</p>`;
  }
  const caption = block.caption && block.caption.trim() !== ''
    ? `<figcaption>${devlogEscape(block.caption)}</figcaption>` : '';
  return `
    <figure>
      <img src="${block.src}" alt="" loading="lazy" onerror="this.style.display='none'">
      ${caption}
    </figure>`;
}

function devlogContentHTML(content) {
  if (Array.isArray(content)) return content.map(buildBlockHTML).join('');  // 예전 형식
  return content || '';                                                     // 에디터 HTML
}

function renderPost(id) {
  const post = POSTS.find(p => p.id === id);
  if (!post) { renderDevlogList(); return; }

  document.getElementById('devlog-list-view').style.display = 'none';
  document.getElementById('devlog-post-view').style.display = 'block';

  const title = LANG === 'en' ? (post.title_en || post.title) : post.title;

  const tagChips = (post.tags || [])
    .map(t => `<span class="devlog-card-chip"># ${devlogEscape(t)}</span>`).join('');

  document.getElementById('devlog-post-tag').innerHTML =
    `${post.game ? `# ${devlogEscape(gameLabel(post.game))}` : ''}${tagChips}`;
  document.getElementById('devlog-post-title').textContent = title;
  document.getElementById('devlog-post-date').textContent  = devlogDate(post.date);
  document.getElementById('devlog-post-body').innerHTML    = devlogContentHTML(post.content);

  const backBtn = document.getElementById('devlog-back');
  backBtn.textContent = LANG === 'en' ? '← Back to list' : '← 목록으로';
  backBtn.onclick = goDevlogList;

  renderPostNav(post);
  window.scrollTo(0, 0);
}

/* 이전 글(과거) / 다음 글(최신) — 현재 필터 안에서 이동 */
function renderPostNav(post) {
  const nav = document.getElementById('devlog-post-nav');
  if (!nav) return;

  // 필터에 걸려 목록에 없는 글이면 전체 목록 기준으로 이동
  let list = devlogList;
  if (!list.some(p => p.id === post.id)) {
    list = [...POSTS].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }

  const idx  = list.findIndex(p => p.id === post.id);
  const next = list[idx - 1];   // 더 최신 글
  const prev = list[idx + 1];   // 더 예전 글

  const label = (p, kr, en) => {
    const t = p ? (LANG === 'en' ? (p.title_en || p.title) : p.title)
                : (LANG === 'en' ? 'None' : '없음');
    return `
      <button class="devlog-post-nav-btn" ${p ? `data-id="${p.id}"` : 'disabled'}>
        <span class="devlog-post-nav-label">${LANG === 'en' ? en : kr}</span>
        <span class="devlog-post-nav-title">${devlogEscape(t)}</span>
      </button>`;
  };

  nav.innerHTML = label(prev, '이전 글', 'Previous') + label(next, '다음 글', 'Next');

  nav.querySelectorAll('.devlog-post-nav-btn[data-id]').forEach(btn => {
    btn.addEventListener('click', () => openPost(btn.dataset.id));
  });
}

/* "← 목록으로" — 상세로 들어온 히스토리가 있으면 뒤로가기로 처리 */
function goDevlogList() {
  if (devlogPushed > 0) {
    history.back();          // popstate 에서 목록을 다시 그려요
  } else {
    history.replaceState({}, '', devlogUrl(null));
    renderDevlogList();
  }
}
