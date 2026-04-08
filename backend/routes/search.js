import express from 'express';
import https from 'https';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const router = express.Router();

router.get('/', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: '검색어가 없습니다.' });
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: '네이버 API 키가 설정되지 않았습니다.' });
  }

  const encodedQuery = encodeURIComponent(query);
  const options = {
    hostname: 'openapi.naver.com',
    path: `/v1/search/shop.json?query=${encodedQuery}&display=6&sort=sim`,
    method: 'GET',
    headers: {
      'X-Naver-Client-Id': clientId,
      'X-Naver-Client-Secret': clientSecret,
    },
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = '';
    apiRes.on('data', (chunk) => (data += chunk));
    apiRes.on('end', () => {
      try {
        console.log('[네이버 쇼핑 응답]', data.slice(0, 500));
        const parsed = JSON.parse(data);
        const products = (parsed.items || []).map((item) => ({
          title: item.title.replace(/<\/?b>/g, ''),
          price: parseInt(item.lprice).toLocaleString('ko-KR'),
          image: item.image,
          link: item.link,
          mallName: item.mallName,
        }));
        res.json({ products });
      } catch (e) {
        res.status(500).json({ error: '쇼핑 검색 결과 파싱 오류' });
      }
    });
  });

  apiReq.on('error', (e) => {
    console.error('네이버 API 오류:', e);
    res.status(500).json({ error: '쇼핑 검색 중 오류가 발생했습니다.' });
  });

  apiReq.end();
});

export default router;
