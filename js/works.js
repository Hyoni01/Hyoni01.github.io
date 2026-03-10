/**
 * =====================================================
 *  works.js 작품 추가는 여기서만
 * =====================================================
 *  category 값:
 *    일러스트 > "commission" | "personal" | "commercial"
 *    애니메이션       → "2d-animation" | "3d-animation"
 *    게임    > "game"
 *    캐릭터 > "character"
 *    order가 높을수록 최신
 *  이미지 경로:
 *    thumb:  "img/works/engname/thumb.jpg"
 *    video: "youtube:dQw4w9WgXcQ" // youtube.com/watch?v=dQw4w9WgXcQ <<이거 
 *    images: ["img/works/engname/01.jpg", ...]
 * =====================================================
 */

const WORKS = [

  
  {
    id: "illu-000",
    category: "personal",
    title: "토스트",   title_en: "toast",
    year: 2021,
    order: 0,
    thumb: "img/works/illust/0/0.png",
    images: ["img/works/illust/0/0.jpg"],
    description: "블렌더 3D",  description_en: "blender 3D",
  },


  {
    id: "illu-001",
    category: "personal",
    title: "해질녘 거리",   title_en: "Street at Sunset",
    year: 2026,
    order: 1,
    thumb: "img/works/illust/1/1.png",
    images: ["img/works/illust/1/1.png"],
    description: "해질녘, 그 거리에.",  description_en: "At sunset, on that street.",
  },

  {
    id: "illu-002",
    category: "personal",
    title: "숲 속 보물",   title_en: "Treasure in the Forest",
    year: 2026,
    order: 2,
    thumb: "img/works/illust/2/2.png",
    images: ["img/works/illust/2/2.png"],
    description: "깊은 숲 속에서 찾아버린거야",  description_en: "I found it deep in the forest.",
  },
  
  {
    id: "illu-003",
    category: "personal",
    title: "따뜻한 아침",   title_en: "Warm morning",
    year: 2026,
    order: 3,
    thumb: "img/works/illust/3/3.png",
    images: ["img/works/illust/3/3.png"],
    description: "따뜻한 주말 아침, 이 아침이 계속 되면 좋겠어",  description_en: "On a warm weekend morning,I wish this morning could last forever.",
  },
    {
    id: "illu-004",
    category: "personal",
    title: "재앙이 들이닥쳐도",   title_en: "Even if disaster strikes",
    year: 2026,
    order: 4,
    thumb: "img/works/illust/4/4.png",
    images: ["img/works/illust/4/4.png"],
    description: "무서운 순간에도 둘이 있으면 괜찮을까",  description_en: "Even in scary moments, will it be okay if we're together?",
  },
  {
    id: "illu-005",
    category: "personal",
    title: "마트 유령",   title_en: "Ghost of the Mart",
    year: 2026,
    order: 5,
    thumb: "img/works/illust/5/5.png",
    images: ["img/works/illust/5/5.png"],
    description: "내가 보인다면 손을 흔들어줘.",  description_en: "If you see me, say hello.",
  },

  {
    id: "illu-006",
    category: "personal",
    title: "바다를 달리는 열차",   title_en: "A train racing across the sea",
    year: 2026,
    order: 6,
    thumb: "img/works/illust/6/6.png",
    images: ["img/works/illust/6/6.png"],
    description: "학교에 지각하면 안될텐데",  description_en: "I really shouldn't be late for school",
  },
  {
    id: "illu-007",
    category: "personal",
    title: "무서워하지마",   title_en: "Don't be scared.",
    year: 2026,
    order: 7,
    thumb: "img/works/illust/7/7.png",
    images: ["img/works/illust/7/7.png"],
    description: "이 꽃을 너에게 줄게.",  description_en: "I'll give you this flower.",
  },
  {
    id: "illu-008",
    category: "personal",
    title: "더이상 못 올라가겠어!",   title_en: "I can't climb any higher!",
    year: 2026,
    order: 8,
    thumb: "img/works/illust/8/8.png",
    images: ["img/works/illust/8/8.png"],
    description: "너도 참 운동 좀 하라니까!",  description_en: "You really should exercise more!",
  },
  {
    id: "illu-009",
    category: "personal",
    title: "이건 불공평해!",   title_en: "it's Unfair!",
    year: 2026,
    order: 9,
    thumb: "img/works/illust/9/9.png",
    images: ["img/works/illust/9/9.png"],
    description: "아, 또 졌어!",  description_en: "Ah, I lost again!",
  },

  {
    id: "illu-010",
    category: "personal",
    title: "새벽의 다과회",   title_en: "The Dawn Tea Party",
    year: 2026,
    order: 10,
    thumb: "img/works/illust/10/10.png",
    images: ["img/works/illust/10/10.png", ],
    description: "맛있겠다, 정말 고마워!",  description_en: "This looks delicious, thank you so much!",
  },
  /* ── 일러스트 · 상업작 ── */

  /* ── 일러스트 · 커미션 ── */
 {
    id: "commi-001",
    category: "commission",
    title: "커미션_260310",   title_en: "Commission_260310",
    year: 2026,
    order: 11,
    thumb: "img/works/illust/11/11.png",
    images: ["img/works/illust/11/11.png", ],
    description: "캐릭터+배경 커미션",  description_en: "character+background commission",
  },

  /* ── 2D · 애니메이션 ── */
  {
    id: "anim-001",
    category: "2d-animation",
    title: "컬트 오브 더 램 팬애니메이션",  title_en: "cotl fan mv",
    year: 2024,
    thumb: "img/works/2Danim/nakama/thumb.png",
    video:"youtube:W5loeS9D1Q4",
    images: [""],
    description: "",  description_en: "",
  },

  /* ── 3D · 애니메이션 ── */
  {
    id: "anim-002",
    category: "3d-animation",
    title: "루프 더 룸 팬애니메이션",  title_en: "looping the rooms fan mv",
    year: 2026,
    thumb: "img/works/3Danim/looptheroom/thumb.png",
    video: "youtube:RI6efeLJ37U",
    images: [""],
    description: "",  description_en: "",
  },

  /* ── 게임 ── */
  {
    // id: "game-001",
    // category: "game",
    // title: "게임 프로젝트 1",  title_en: "Game Project 1",
    // year: 2025,
    // thumb: "",
    // images: [""],
    // description: "작품 설명.",  description_en: "Description.",
  },

  /* -- 캐릭터 -- */
  {
  id: "chara-001",
  category: "cha-personal",
  title:"무제", title_en: "Untitled",
  order: 1,
  year: 2026,
  thumb:"img/works/chara/1/1.png",
  images:["img/works/chara/1/1.png"],
  description:"", description_en:"",
  },
  
  {
  id: "chara-002",
  category: "cha-personal",
  title:"네명의 보스들" , title_en:"four bosses",
  order: 2,
  year: 2026,
  thumb:"img/works/chara/2/2.png",
  images:["img/works/chara/2/2.png"],
  description:"", description_en:"",
  },
  
  {
  id: "chara-003",
  category: "cha-personal",
  title:"아이들", title_en:"children",
  order: 3,
  year: 2026,
  thumb:"img/works/chara/3/3.png",
  images:["img/works/chara/3/3.png"],
  description:"", description_en:"",
  },

  {
  id: "chara-004",
  category: "cha-personal",
  title:"오리지널 캐릭터1",title_en:"OC",
  order: 4,
  year: 2026,
  thumb:"img/works/chara/4/4.png",
  images:["img/works/chara/4/4.png"],
  description:"", description_en:"",
  },
  {
  id: "chara-005",
  category: "cha-personal",
  title: "로봇", title_en:"robot",
  order: 5,
  year: 2026,
  thumb:"img/works/chara/5/5.png",
  images:["img/works/chara/5/5.png"],
  description:"", description_en:"",
  },

    {
  id: "chara-006",
  category: "cha-personal",
  title:"비와 퍼피캣" , title_en:"bee and puppy cat",
  order: 0,
  year: 2021,
  thumb:"img/works/chara/6/6.png",
  images:["img/works/chara/6/6.jpg"],
  description:"", description_en:"",
  },

  {
  id: "chara-007",
  category: "cha-personal",
  title:"나,조립법", title_en:"Me, Build Guide",
  order: 0,
  year: 2021,
  thumb:"img/works/chara/7/7.jpg",
  images:["img/works/chara/7/7.jpg","img/works/chara/7/7-1.jpg"],
  description:"", description_en:"",
  },

  
];
