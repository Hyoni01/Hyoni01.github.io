/**
 * =====================================================
 *  devlog.js 개발일지 글 추가는 여기서만
 *  (보통은 admin.html 개발일지 탭에서 자동으로 갱신돼요)
 * =====================================================
 *  id:    "post-001"          ← 이미지 폴더 이름과 동일하게
 *  game:  GAME_LABEL 의 key   ← 게임 태그 필터에 표시됨
 *  date:  "YYYY-MM-DD"        ← 최신순 정렬 기준
 *  tags:  ["자유태그"]         ← 목록에서 필터링에 쓰여요
 *
 *  이미지 경로:
 *    thumb: "img/devlog/post-001/thumb.webp"
 *    본문:  "img/devlog/post-001/01.webp"
 *
 *  content:
 *    에디터가 만든 HTML 문자열 그대로 저장돼요.
 *    devlog.html 상세 화면의 .post-content 안에 innerHTML 로 들어갑니다.
 *    (예전에 쓰던 블록 배열 형식도 계속 렌더링돼요 — devlog-main.js 에서 분기)
 * =====================================================
 */

/* 게임 태그 라벨 — 새 게임을 추가하면 여기에도 넣어주세요 */
const GAME_LABEL = {
  kr: { 'project-a': '프로젝트 A' },
  en: { 'project-a': 'Project A' },
};

const POSTS = [
  {
   
  },
];
