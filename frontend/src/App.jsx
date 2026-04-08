import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import CelebrityProfile from './pages/CelebrityProfile.jsx';
import PostDetail from './pages/PostDetail.jsx';
import StyleSwap from './pages/StyleSwap.jsx';
import StyleBook from './pages/StyleBook.jsx';
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
        <Route path="/swap" element={<StyleSwap />} />
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
        <Link to="/swap" style={linkStyle('/swap')}>
          스타일 스왑
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
function AnalyzePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const [celebrityName, setCelebrityName] = useState('');
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
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
      <header style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}>
          패션 분석
        </h1>
        <p style={{ color: '#888', fontSize: 14, marginTop: 6 }}>
          연예인 패션 사진을 업로드하면 의류 아이템을 분석하고 유사상품을 찾아드립니다.
        </p>
      </header>

      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          value={celebrityName}
          onChange={(e) => setCelebrityName(e.target.value)}
          placeholder="연예인 이름 입력 (선택사항) — 예: 제니, 아이유, BTS 뷔"
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 10,
            border: '1px solid #ddd',
            fontSize: 14,
            outline: 'none',
            fontFamily: 'inherit',
            background: '#fff',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => e.target.style.borderColor = '#111'}
          onBlur={(e) => e.target.style.borderColor = '#ddd'}
        />
      </div>

      <ImageUploader onAnalyze={handleAnalyze} loading={loading} />

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
