import express from 'express';
const router = express.Router();

const IU_POSTS = [
  {
    id: 1,
    celebrity: '아이유',
    celebrityId: 'iu',
    title: '인천공항 출국 - 베이지 오버핏 코트',
    style: '미니멀',
    date: '2024-03-10',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop',
    likes: 1240,
    comments: 89,
    tags: ['공항패션', '베이지', '오버핏코트'],
    author: 'fashionista_kr',
  },
  {
    id: 2,
    celebrity: '아이유',
    celebrityId: 'iu',
    title: '뮤직뱅크 출근룩 - 플로럴 미디원피스',
    style: '페미닌',
    date: '2024-03-08',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=500&fit=crop',
    likes: 2180,
    comments: 134,
    tags: ['방송출근', '원피스', '플로럴'],
    author: 'iu_daily',
  },
  {
    id: 3,
    celebrity: '아이유',
    celebrityId: 'iu',
    title: '성수동 카페 - 캐주얼 데님 온 데님',
    style: '캐주얼',
    date: '2024-03-05',
    image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&h=500&fit=crop',
    likes: 876,
    comments: 62,
    tags: ['데님', '캐주얼', '일상룩'],
    author: 'style_archive',
  },
  {
    id: 4,
    celebrity: '아이유',
    celebrityId: 'iu',
    title: '시상식 레드카펫 - 블랙 이브닝드레스',
    style: '포멀',
    date: '2024-02-28',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=500&fit=crop',
    likes: 5430,
    comments: 312,
    tags: ['레드카펫', '드레스', '블랙'],
    author: 'celebstyle',
  },
  {
    id: 5,
    celebrity: '아이유',
    celebrityId: 'iu',
    title: '일본 도쿄 팬미팅 - 화이트 미니스커트 세트',
    style: '걸리시',
    date: '2024-02-20',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop',
    likes: 3210,
    comments: 198,
    tags: ['팬미팅', '화이트', '미니스커트'],
    author: 'iu_daily',
  },
  {
    id: 6,
    celebrity: '아이유',
    celebrityId: 'iu',
    title: '광고 촬영장 - 올블랙 미니멀룩',
    style: '미니멀',
    date: '2024-02-15',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop',
    likes: 1890,
    comments: 104,
    tags: ['올블랙', '미니멀', '광고'],
    author: 'fashionista_kr',
  },
  {
    id: 7,
    celebrity: '아이유',
    celebrityId: 'iu',
    title: '제주도 휴가 - 스트라이프 리넨 셔츠',
    style: '캐주얼',
    date: '2024-02-10',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop',
    likes: 1560,
    comments: 77,
    tags: ['리넨', '스트라이프', '휴가룩'],
    author: 'style_archive',
  },
  {
    id: 8,
    celebrity: '아이유',
    celebrityId: 'iu',
    title: '브랜드 행사 - 파스텔 트위드 자켓',
    style: '페미닌',
    date: '2024-02-05',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop',
    likes: 2340,
    comments: 156,
    tags: ['트위드', '파스텔', '브랜드행사'],
    author: 'celebstyle',
  },
  {
    id: 9,
    celebrity: '아이유',
    celebrityId: 'iu',
    title: '뮤직비디오 - 빈티지 레이스 드레스',
    style: '걸리시',
    date: '2024-01-28',
    image: 'https://images.unsplash.com/photo-1551803091-e20673f15770?w=400&h=500&fit=crop',
    likes: 4120,
    comments: 287,
    tags: ['뮤직비디오', '레이스', '빈티지'],
    author: 'iu_daily',
  },
  {
    id: 10,
    celebrity: '아이유',
    celebrityId: 'iu',
    title: '인터뷰 - 클린 화이트 미니멀 셋업',
    style: '미니멀',
    date: '2024-01-20',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop',
    likes: 998,
    comments: 55,
    tags: ['인터뷰', '화이트', '셋업'],
    author: 'fashionista_kr',
  },
  {
    id: 11,
    celebrity: '아이유',
    celebrityId: 'iu',
    title: '연말 시상식 - 버건디 새틴 드레스',
    style: '포멀',
    date: '2024-01-15',
    image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&h=500&fit=crop',
    likes: 6780,
    comments: 445,
    tags: ['시상식', '버건디', '새틴드레스'],
    author: 'celebstyle',
  },
  {
    id: 12,
    celebrity: '아이유',
    celebrityId: 'iu',
    title: '편의점 포착 - 후드 조거 편한 사복',
    style: '캐주얼',
    date: '2024-01-10',
    image: 'https://images.unsplash.com/photo-1432163981226-7f43da696818?w=400&h=500&fit=crop',
    likes: 2100,
    comments: 143,
    tags: ['사복', '캐주얼', '후드'],
    author: 'style_archive',
  },
];

// GET /api/posts?celebrity=iu&style=미니멀
router.get('/', (req, res) => {
  const { celebrity, style } = req.query;
  let posts = IU_POSTS;
  if (celebrity) posts = posts.filter(p => p.celebrityId === celebrity);
  if (style && style !== '전체') posts = posts.filter(p => p.style === style);
  res.json(posts);
});

// GET /api/posts/:id
router.get('/:id', (req, res) => {
  const post = IU_POSTS.find(p => p.id === Number(req.params.id));
  if (!post) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
  res.json(post);
});

export default router;
