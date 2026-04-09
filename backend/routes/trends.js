import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { CELEBRITIES } from '../data/celebrities.js';

dotenv.config({ path: '../.env' });

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('fashion_articles')
      .select('celebrity, style, items, colors, date, image_url, description, link')
      .not('style', 'is', null)
      .limit(500);

    if (error) throw error;

    const articles = data || [];

    // 아이템 집계
    const itemCount = {};
    articles.forEach(a => {
      (a.items || []).forEach(item => {
        const key = item.trim();
        if (key) itemCount[key] = (itemCount[key] || 0) + 1;
      });
    });
    const topItems = Object.entries(itemCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // 색상 집계
    const colorCount = {};
    articles.forEach(a => {
      (a.colors || []).forEach(color => {
        const key = color.trim();
        if (key) colorCount[key] = (colorCount[key] || 0) + 1;
      });
    });
    const topColors = Object.entries(colorCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // 스타일 분포
    const styleCount = {};
    articles.forEach(a => {
      if (a.style) styleCount[a.style] = (styleCount[a.style] || 0) + 1;
    });
    const styles = Object.entries(styleCount)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({ name, count }));

    // 이번 달 급상승 키워드
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    function parseArticleDate(str) {
      if (!str) return null;
      const m = str.match(/(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/);
      if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
      return null;
    }

    const recentArticles = articles.filter(a => {
      const d = parseArticleDate(a.date);
      return d && d >= thirtyDaysAgo;
    });

    const recentItemCount = {};
    recentArticles.forEach(a => {
      (a.items || []).forEach(item => {
        const key = item.trim();
        if (key) recentItemCount[key] = (recentItemCount[key] || 0) + 1;
      });
    });

    // 전체 랭킹 맵 (이름 → 순위)
    const overallRankMap = {};
    Object.entries(itemCount)
      .sort(([, a], [, b]) => b - a)
      .forEach(([name], idx) => { overallRankMap[name] = idx + 1; });

    const risingItems = Object.entries(recentItemCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, recentCount], idx) => {
        const recentRank = idx + 1;
        const overallRank = overallRankMap[name] || 999;
        const rankChange = overallRank - recentRank; // 양수 = 순위 상승
        return { name, recentCount, recentRank, overallRank, rankChange };
      });

    // 최근 착장 (이미지 있는 것만)
    const recent = articles
      .filter(a => a.image_url)
      .slice(0, 8)
      .map(a => ({
        image: a.image_url,
        celebrity: a.celebrity,
        style: a.style,
        description: a.description,
        date: a.date,
        link: a.link,
      }));

    res.json({
      topItems,
      topColors,
      styles,
      risingItems,
      recentArticleCount: recentArticles.length,
      total: articles.length,
      recent,
    });
  } catch (e) {
    console.error('트렌드 오류:', e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;
