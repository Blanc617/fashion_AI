import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import CelebrityProfile from './pages/CelebrityProfile.jsx';
import PostDetail from './pages/PostDetail.jsx';
import StyleBook from './pages/StyleBook.jsx';
import Trends from './pages/Trends.jsx';
import PersonalColor from './pages/PersonalColor.jsx';
import BodyType from './pages/BodyType.jsx';
import ImageUploader from './components/ImageUploader.jsx';
import ClothingCard from './components/ClothingCard.jsx';
import { useBookmark } from './hooks/useBookmark.js';

export default function App() {
  return (
    <BrowserRouter>
      <GlobalNav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/celebrity/:id" element={<CelebrityProfile />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/analyze" element={<AnalyzePage />} />
        <Route path="/trends" element={<Trends />} />
        <Route path="/personal-color" element={<PersonalColor />} />
        <Route path="/body-type" element={<BodyType />} />
        <Route path="/stylebook" element={<StyleBook />} />
      </Routes>
    </BrowserRouter>
  );
}

function GlobalNav() {
  const location = useLocation();
  const { bookmarks } = useBookmark();
  const bookmarkTotal = (bookmarks.celebrities?.length || 0) + (bookmarks.news?.length || 0) + (bookmarks.items?.length || 0);

  const linkStyle = (path) => ({
    fontSize: 14,
    color: location.pathname === path ? '#111' : '#555',
    fontWeight: location.pathname === path ? 700 : 400,
    textDecoration: 'none',
  });

  return (
    <nav style={{
      borderBottom: '1px solid #eee',
      padding: '0 40px',
      display: 'flex',
      alignItems: 'center',
      height: 56,
      background: '#fff',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ maxWidth: 1100, width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', gap: 28 }}>
        {/* 로고 */}
        <Link to="/" style={{ fontWeight: 800, fontSize: 16, color: '#111', textDecoration: 'none', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg, #f472b6, #818cf8)', flexShrink: 0 }} />
          Celebrity Fashion
        </Link>

        {/* 가운데 링크 */}
        <Link to="/#feed" style={linkStyle('/#feed')} onClick={(e) => {
          if (location.pathname === '/') {
            e.preventDefault();
            document.getElementById('celeb-feed')?.scrollIntoView({ behavior: 'smooth' });
          }
        }}>
          셀럽 피드
        </Link>
        <Link to="/analyze" style={linkStyle('/analyze')}>
          패션 분석
        </Link>
        <Link to="/trends" style={linkStyle('/trends')}>
          트렌드
        </Link>
        <Link to="/personal-color" style={linkStyle('/personal-color')}>
          퍼스널 컬러
        </Link>
        <Link to="/body-type" style={linkStyle('/body-type')}>
          체형 분석
        </Link>

        {/* 우측 */}
        <Link to="/stylebook" style={{ ...linkStyle('/stylebook'), marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          🔖 내 스타일북
          {bookmarkTotal > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 700,
              background: 'linear-gradient(135deg, #f472b6, #818cf8)',
              color: '#fff',
              padding: '1px 7px', borderRadius: 99,
            }}>
              {bookmarkTotal}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}

// 기존 분석 페이지를 /analyze로 이동
const BUDGET_PRESETS = [
  { label: '5만원', value: 50000 },
  { label: '10만원', value: 100000 },
  { label: '30만원', value: 300000 },
  { label: '50만원', value: 500000 },
];

function AnalyzePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const [celebrityName, setCelebrityName] = useState('');
  const [budget, setBudget] = useState(0);
  const { toggle, isBookmarked } = useBookmark();

  async function handleAnalyze(imageBase64, mediaType, previewUrl) {
    setLoading(true);
    setError('');
    setItems([]);
    setPreview(previewUrl);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64, mediaType, celebrityName: celebrityName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '분석 실패');
      setItems(data.items);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const totalBudget = items.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 20px' }}>

      {/* 헤더 */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #f472b6, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
            👗
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>패션 분석</h1>
        </div>
        <p style={{ color: '#888', fontSize: 14, marginLeft: 48 }}>
          연예인 패션 사진을 올리면 착용 아이템을 분석하고 유사 상품을 찾아드립니다.
        </p>
      </div>

      {/* 업로드 전: 2열 레이아웃 */}
      {!items.length && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 32, alignItems: 'start' }}>
          {/* 왼쪽: 이용 방법 */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#aaa', letterSpacing: '0.5px', marginBottom: 16 }}>이용 방법</p>
            {[
              { num: '01', title: '사진 업로드', desc: '연예인 패션 사진을 드래그하거나 클릭해서 올려주세요' },
              { num: '02', title: 'AI 아이템 분석', desc: 'Claude AI가 착용한 의류·액세서리를 자동으로 인식합니다' },
              { num: '03', title: '유사 상품 탐색', desc: '각 아이템과 비슷한 상품을 네이버 쇼핑에서 바로 찾아드려요' },
            ].map((step) => (
              <div key={step.num} style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', width: 20, flexShrink: 0, paddingTop: 2 }}>{step.num}</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 3 }}>{step.title}</p>
                  <p style={{ fontSize: 13, color: '#888', lineHeight: 1.5 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 오른쪽: 입력 + 업로더 */}
          <div>
            <input
              type="text"
              value={celebrityName}
              onChange={(e) => setCelebrityName(e.target.value)}
              placeholder="연예인 이름 (선택) — 예: 제니, 아이유"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10,
                border: '1px solid #e8e8e8', fontSize: 14, outline: 'none',
                fontFamily: 'inherit', background: '#fff', boxSizing: 'border-box', marginBottom: 10,
              }}
              onFocus={(e) => e.target.style.borderColor = '#818cf8'}
              onBlur={(e) => e.target.style.borderColor = '#e8e8e8'}
            />
            <ImageUploader onAnalyze={handleAnalyze} loading={loading} />
          </div>
        </div>
      )}

      {/* 업로드 후 (결과 있거나 로딩 중): 입력 + 업로더를 단일 열로 */}
      {(items.length > 0 || loading) && (
        <div style={{ marginBottom: 24 }}>
          <input
            type="text"
            value={celebrityName}
            onChange={(e) => setCelebrityName(e.target.value)}
            placeholder="연예인 이름 (선택) — 예: 제니, 아이유"
            style={{
              width: '100%', padding: '11px 14px', borderRadius: 10,
              border: '1px solid #e8e8e8', fontSize: 14, outline: 'none',
              fontFamily: 'inherit', background: '#fff', boxSizing: 'border-box', marginBottom: 10,
            }}
            onFocus={(e) => e.target.style.borderColor = '#818cf8'}
            onBlur={(e) => e.target.style.borderColor = '#e8e8e8'}
          />
          <ImageUploader onAnalyze={handleAnalyze} loading={loading} />
        </div>
      )}

      {error && (
        <div style={{
          marginTop: 24,
          padding: '12px 16px',
          background: '#fff0f0',
          border: '1px solid #ffd0d0',
          borderRadius: 8,
          color: '#d00',
          fontSize: 14,
        }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <Spinner />
          <p style={{ marginTop: 16, color: '#888', fontSize: 14 }}>
            {celebrityName ? `${celebrityName}의 패션을 분석하고 있습니다...` : 'AI가 의류 아이템을 분석하고 있습니다...'}
          </p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div style={{ marginTop: 40 }}>
          {/* 예산 필터 */}
          <div style={{
            marginBottom: 24,
            padding: '16px 20px',
            background: '#f9f9f9',
            borderRadius: 12,
            border: '1px solid #eee',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#555', flexShrink: 0 }}>
                아이템 예산 상한
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => setBudget(0)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 20,
                    border: '1px solid',
                    borderColor: budget === 0 ? '#111' : '#ddd',
                    background: budget === 0 ? '#111' : '#fff',
                    color: budget === 0 ? '#fff' : '#555',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontWeight: budget === 0 ? 600 : 400,
                  }}
                >
                  제한없음
                </button>
                {BUDGET_PRESETS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setBudget(p.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 20,
                      border: '1px solid',
                      borderColor: budget === p.value ? '#111' : '#ddd',
                      background: budget === p.value ? '#111' : '#fff',
                      color: budget === p.value ? '#fff' : '#555',
                      fontSize: 12,
                      cursor: 'pointer',
                      fontWeight: budget === p.value ? 600 : 400,
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {budget > 0 && (
                <span style={{ fontSize: 12, color: '#888', marginLeft: 4 }}>
                  — 네이버 쇼핑 검색 시 {budget.toLocaleString('ko-KR')}원 이하 상품만 표시
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
            {preview && (
              <div style={{ flexShrink: 0 }}>
                <img
                  src={preview}
                  alt="업로드된 사진"
                  style={{
                    width: 220,
                    borderRadius: 12,
                    objectFit: 'cover',
                    border: '1px solid #eee',
                  }}
                />
                <div style={{
                  marginTop: 12,
                  padding: '14px 16px',
                  background: '#111',
                  borderRadius: 10,
                  color: '#fff',
                  textAlign: 'center',
                }}>
                  <p style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>전체 룩 예상 총액</p>
                  <p style={{ fontSize: 20, fontWeight: 700 }}>
                    {totalBudget.toLocaleString('ko-KR')}원
                  </p>
                </div>
              </div>
            )}
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                {celebrityName ? `${celebrityName} 착용 아이템` : '분석 결과'} — {items.length}개
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {items.map((item) => (
                  <ClothingCard
                    key={item.id}
                    item={item}
                    budget={budget}
                    bookmarked={isBookmarked('items', item.id)}
                    onBookmark={() => toggle('items', item)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: 'inline-block' }}>
      <div style={{
        width: 36,
        height: 36,
        border: '3px solid #eee',
        borderTop: '3px solid #111',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
