import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analyzeRoute from './routes/analyze.js';
import searchRoute from './routes/search.js';
import postsRoute from './routes/posts.js';
import celebritiesRoute from './routes/celebrities.js';
import newsRoute from './routes/news.js';
import swapRoute from './routes/swap.js';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));

app.use('/api/analyze', analyzeRoute);
app.use('/api/search', searchRoute);
app.use('/api/posts', postsRoute);
app.use('/api/celebrities', celebritiesRoute);
app.use('/api/news', newsRoute);
app.use('/api/swap', swapRoute);

const server = app.listen(PORT, () => {
  console.log(`백엔드 서버 실행 중: http://localhost:${PORT}`);
});

server.timeout = 300000;       // 5분
server.keepAliveTimeout = 310000;
