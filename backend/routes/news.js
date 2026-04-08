import express from 'express';
import * as cheerio from 'cheerio';

const router = express.Router();

const cache = {};
const CACHE_TTL = 30 * 60 * 1000; // 30분

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'ko-KR,ko;q=0.9',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

// fashionn 검색 → 기사 목록
async function fetchFashionnList(keyword, page = 1) {
  const url = `https://www.fashionn.com/board/search.php?sel=all&search=${encodeURIComponent(keyword)}&page=${page}`;
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(8000) });
  const html = await res.text();
  const $ = cheerio.load(html);

  const articles = [];
  $('td.tit a').each((_, el) => {
    const href = $(el).attr('href');
    const title = $(el).attr('title') || $(el).text().trim();
    if (!href || !title) return;

    // 링크를 절대 URL로
    const link = 'https://www.fashionn.com' + href.split('&page=')[0].replace(/&sel=.*/, '').replace(/&search=.*/, '');
    articles.push({ title, link });
  });

  // 날짜 추출 (기사 순서에 맞게)
  const dates = [];
  $('td.date').each((_, el) => dates.push($(el).text().trim()));

  return articles.map((a, i) => ({ ...a, date: dates[i] || '' }));
}

// 기사 페이지 → OG 이미지
async function fetchOgImage(articleUrl) {
  try {
    const res = await fetch(articleUrl, { headers: HEADERS, signal: AbortSignal.timeout(6000) });
    const html = await res.text();
    const $ = cheerio.load(html);
    const candidates = [
      $('meta[property="og:image"]').attr('content'),
      $('meta[name="twitter:image"]').attr('content'),
    ];
    // 유튜브/영상 URL 제외, 실제 이미지만
    const image = candidates.find(url =>
      url && /\.(jpg|jpeg|png|webp)/i.test(url) && !url.includes('youtube') && !url.includes('embed')
    ) || null;
    return image;
  } catch {
    return null;
  }
}

// GET /api/news?celebrity=아이유&style=패션
router.get('/', async (req, res) => {
  const { celebrity = '아이유', style = '' } = req.query;
  const keyword = style && style !== '전체' ? `${celebrity} ${style}` : celebrity;
  const cacheKey = keyword;

  if (cache[cacheKey] && Date.now() - cache[cacheKey].time < CACHE_TTL) {
    return res.json(cache[cacheKey].data);
  }

  try {
    // 2페이지 병렬로 가져와서 합치기
    const [page1, page2] = await Promise.all([
      fetchFashionnList(keyword, 1),
      fetchFashionnList(keyword, 2),
    ]);
    // 제목에 키워드가 포함된 기사만 필터링
    const allArticles = [...page1, ...page2]
      .filter(a => a.title.includes(celebrity))
      .slice(0, 16);

    if (allArticles.length === 0) {
      return res.json([]);
    }

    // OG 이미지 병렬 추출
    const withImages = await Promise.all(
      allArticles.map(async (article, i) => {
        const image = await fetchOgImage(article.link);
        return {
          id: `fashionn_${i}`,
          title: article.title,
          link: article.link,
          date: article.date,
          source: 'fashionn.com',
          image,
        };
      })
    );

    cache[cacheKey] = { data: withImages, time: Date.now() };
    res.json(withImages);
  } catch (e) {
    console.error('크롤링 오류:', e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;
