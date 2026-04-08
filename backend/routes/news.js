import express from 'express';
import * as cheerio from 'cheerio';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 메모리 캐시 (세션 내 중복 요청 방지)
const memCache = {};
const CACHE_TTL = 10 * 60 * 1000;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'ko-KR,ko;q=0.9',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

// 기사 링크를 고유 ID로 변환
function linkToId(link) {
  return link.replace(/[^a-zA-Z0-9]/g, '_').slice(-80);
}

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
    const link = 'https://www.fashionn.com' + href.split('&page=')[0].replace(/&sel=.*/, '').replace(/&search=.*/, '');
    articles.push({ title, link });
  });

  const dates = [];
  $('td.date').each((_, el) => dates.push($(el).text().trim()));

  return articles.map((a, i) => ({ ...a, date: dates[i] || '' }));
}

// 기사 페이지 → 이미지 URL + base64
async function fetchArticleImage(articleUrl) {
  try {
    const res = await fetch(articleUrl, { headers: HEADERS, signal: AbortSignal.timeout(6000) });
    const html = await res.text();
    const $ = cheerio.load(html);
    const candidates = [
      $('meta[property="og:image"]').attr('content'),
      $('meta[name="twitter:image"]').attr('content'),
    ];
    const imageUrl = candidates.find(url =>
      url && /\.(jpg|jpeg|png|webp)/i.test(url) && !url.includes('youtube') && !url.includes('embed')
    ) || null;

    if (!imageUrl) return { imageUrl: null, base64: null, mediaType: null };

    const imgRes = await fetch(imageUrl, { headers: HEADERS, signal: AbortSignal.timeout(5000) });
    const buffer = await imgRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mediaType = (imgRes.headers.get('content-type') || 'image/jpeg').split(';')[0];

    return { imageUrl, base64, mediaType };
  } catch {
    return { imageUrl: null, base64: null, mediaType: null };
  }
}

// Claude로 착장 분석
async function analyzeFashion(article, imageData, celebrity) {
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const content = [];
    if (imageData.base64) {
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: imageData.mediaType, data: imageData.base64 },
      });
    }
    content.push({
      type: 'text',
      text: `연예인: ${celebrity}\n기사 제목: "${article.title}"\n\n${imageData.base64 ? '이미지를 보고' : '기사 제목을 바탕으로'} 착장을 분석해주세요.\n다음 JSON 형식으로만 응답하세요:\n{"style":"스타일 한 단어 (예: 미니멀/캐주얼/페미닌/포멀/걸리시)","items":["착용한 의류 아이템들 (예: 베이지 오버핏 트렌치코트, 화이트 크롭 이너, 블랙 와이드 슬랙스)"],"colors":["주요 컬러들"],"description":"이 착장의 스타일링 포인트와 분위기를 2문장으로 설명"}`,
    });

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content }],
    });

    const text = response.content[0].text.trim();
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

// 배치 병렬 처리
async function batchAsync(items, fn, batchSize = 5) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

// GET /api/news?celebrity=뷔&searchKeyword=BTS+뷔&style=패션
router.get('/', async (req, res) => {
  const { celebrity = '아이유', searchKeyword, style = '' } = req.query;
  // searchKeyword: 검색·필터용 (예: 'BTS 뷔'), celebrity: 표시명·저장용 (예: '뷔')
  const filterWord = searchKeyword || celebrity;
  const keyword = style && style !== '전체' ? `${filterWord} ${style}` : filterWord;

  // 메모리 캐시 확인
  if (memCache[keyword] && Date.now() - memCache[keyword].time < CACHE_TTL) {
    return res.json(memCache[keyword].data);
  }

  try {
    // 기사 목록 수집
    const [page1, page2, page3] = await Promise.all([
      fetchFashionnList(keyword, 1),
      fetchFashionnList(keyword, 2),
      fetchFashionnList(keyword, 3),
    ]);

    const merged = [...page1, ...page2, ...page3];
    // filterWord로 제목 필터 (예: 'BTS 뷔' 포함 기사만)
    const allArticles = merged.filter(a => a.title.includes(filterWord)).slice(0, 12);

    if (allArticles.length === 0) return res.json([]);

    // Supabase에서 이미 분석된 기사 조회
    const ids = allArticles.map(a => linkToId(a.link));
    const { data: saved } = await supabase
      .from('fashion_articles')
      .select('*')
      .in('id', ids)
      .eq('celebrity', celebrity);

    const savedMap = {};
    (saved || []).forEach(row => { savedMap[row.id] = row; });

    // 미분석 기사만 Claude 처리
    const newArticles = allArticles.filter(a => !savedMap[linkToId(a.link)]);

    if (newArticles.length > 0) {
      const imageDataList = await batchAsync(newArticles, a => fetchArticleImage(a.link), 6);
      const fashionDataList = await batchAsync(
        newArticles.map((a, i) => ({ article: a, imageData: imageDataList[i] })),
        ({ article, imageData }) => analyzeFashion(article, imageData, celebrity),
        5
      );

      // Supabase에 저장
      const rows = newArticles.map((article, i) => ({
        id: linkToId(article.link),
        celebrity,
        link: article.link,
        image_url: imageDataList[i].imageUrl,
        date: article.date,
        source: 'fashionn.com',
        style: fashionDataList[i]?.style || null,
        items: fashionDataList[i]?.items || [],
        colors: fashionDataList[i]?.colors || [],
        description: fashionDataList[i]?.description || null,
      }));

      await supabase.from('fashion_articles').upsert(rows);
      rows.forEach(r => { savedMap[r.id] = r; });
    }

    // 결과 조합 (원래 기사 순서 유지)
    const result = allArticles
      .map(article => {
        const row = savedMap[linkToId(article.link)];
        if (!row) return null;
        return {
          id: row.id,
          link: row.link,
          image: row.image_url,
          date: row.date,
          source: row.source,
          style: row.style,
          items: row.items || [],
          colors: row.colors || [],
          description: row.description,
        };
      })
      .filter(Boolean);

    memCache[keyword] = { data: result, time: Date.now() };
    res.json(result);
  } catch (e) {
    console.error('뉴스 오류:', e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;
