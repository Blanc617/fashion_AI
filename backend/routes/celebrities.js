import express from 'express';
import { CELEBRITIES } from '../data/celebrities.js';

const router = express.Router();

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
