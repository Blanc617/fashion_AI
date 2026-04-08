import express from 'express';
const router = express.Router();

const CELEBRITIES = [
  {
    id: 'iu',
    name: '아이유',
    realName: '이지은',
    profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face',
    postCount: 12,
    styles: [
      { label: '미니멀', count: 3, color: '#111' },
      { label: '캐주얼', count: 3, color: '#6366f1' },
      { label: '페미닌', count: 2, color: '#ec4899' },
      { label: '걸리시', count: 2, color: '#f59e0b' },
      { label: '포멀', count: 2, color: '#059669' },
    ],
    description: '단아하고 깔끔한 미니멀 스타일부터 러블리한 걸리시 룩까지 다양한 스타일을 소화하는 아이유의 패션을 모아봤어요.',
  },
  {
    id: 'jennie',
    name: '제니',
    realName: '김제니',
    profileImage: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=200&h=200&fit=crop&crop=face',
    postCount: 0,
    styles: [],
    description: '준비 중입니다.',
  },
  {
    id: 'winterr',
    name: '윈터',
    realName: '김민정',
    profileImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop&crop=face',
    postCount: 0,
    styles: [],
    description: '준비 중입니다.',
  },
];

// GET /api/celebrities
router.get('/', (req, res) => {
  res.json(CELEBRITIES);
});

// GET /api/celebrities/:id
router.get('/:id', (req, res) => {
  const cel = CELEBRITIES.find(c => c.id === req.params.id);
  if (!cel) return res.status(404).json({ error: '연예인 정보를 찾을 수 없습니다.' });
  res.json(cel);
});

export default router;
