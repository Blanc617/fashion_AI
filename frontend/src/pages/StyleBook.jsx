import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookmark } from '../hooks/useBookmark';

const TABS = [
  { key: 'celebrities', label: '연예인', icon: '⭐' },
  { key: 'news', label: '패션 뉴스', icon: '📰' },
  { key: 'items', label: '아이템', icon: '👗' },
];

const CATEGORY_ICON = {
  '아우터': '🧥', '상의': '👕', '하의': '👖',
  '신발': '👟', '가방': '👜', '액세서리': '💍',
};

const TIER_STYLE = {
  '럭셔리': { background: '#111', color: '#fff' },
  '중가': { background: '#e8f0fe', color: '#1a56db' },
  '저가': { background: '#f0fdf4', color: '#16a34a' },
};

export default function StyleBook() {
  const [activeTab, setActiveTab] = useState('celebrities');
  const { bookmarks, remove } = useBookmark();
  const navigate = useNavigate();

  const counts = {
    celebrities: bookmarks.celebrities.length,
    news: bookmarks.news.length,
    items: bookmarks.items.length,
  };
  const total = counts.celebrities + counts.news + counts.items;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 20px 80px' }}>
      {/* 헤더 */}
      <header style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #f472b6, #818cf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>
            🔖
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', color: '#111' }}>
              내 스타일북
            </h1>
            <p style={{ fontSize: 13, color: '#888', marginTop: 2 }}>
              저장한 항목 {total}개
            </p>
          </div>
        </div>
      </header>

      {/* 탭 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32, borderBottom: '1px solid #f0f0f0', paddingBottom: 0 }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#111' : '#888',
                borderBottom: isActive ? '2px solid #111' : '2px solid transparent',
                marginBottom: -1,
                transition: 'all 0.15s',
              }}
            >
              {tab.icon} {tab.label}
              {counts[tab.key] > 0 && (
                <span style={{
                  marginLeft: 6, fontSize: 11, fontWeight: 700,
                  background: isActive ? '#111' : '#eee',
                  color: isActive ? '#fff' : '#666',
                  padding: '1px 7px', borderRadius: 99,
                }}>
                  {counts[tab.key]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 연예인 탭 */}
      {activeTab === 'celebrities' && (
        bookmarks.celebrities.length === 0
          ? <EmptyState label="저장한 연예인이 없습니다" sub="연예인 카드의 북마크 버튼을 눌러 저장해보세요" />
          : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 20,
            }}>
              {bookmarks.celebrities.map(cel => (
                <CelebCard
                  key={cel.id}
                  celebrity={cel}
                  onRemove={() => remove('celebrities', cel.id)}
                  onClick={() => navigate(`/celebrity/${cel.id}`)}
                />
              ))}
            </div>
          )
      )}

      {/* 뉴스 탭 */}
      {activeTab === 'news' && (
        bookmarks.news.length === 0
          ? <EmptyState label="저장한 패션 뉴스가 없습니다" sub="연예인 프로필에서 마음에 드는 패션을 저장해보세요" />
          : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 16,
            }}>
              {bookmarks.news.map(post => (
                <SavedNewsCard
                  key={post.id}
                  post={post}
                  onRemove={() => remove('news', post.id)}
                />
              ))}
            </div>
          )
      )}

      {/* 아이템 탭 */}
      {activeTab === 'items' && (
        bookmarks.items.length === 0
          ? <EmptyState label="저장한 아이템이 없습니다" sub="패션 분석 후 마음에 드는 아이템을 저장해보세요" />
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {bookmarks.items.map(item => (
                <SavedItemCard
                  key={item.id}
                  item={item}
                  onRemove={() => remove('items', item.id)}
                />
              ))}
            </div>
          )
      )}
    </div>
  );
}

function CelebCard({ celebrity, onRemove, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 16,
        overflow: 'hidden',
        border: hovered ? '1.5px solid #f9a8d4' : '1.5px solid #f0f0f0',
        background: '#fff',
        transition: 'transform 0.25s, box-shadow 0.25s, border-color 0.25s',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 14px 30px rgba(0,0,0,0.09)' : '0 2px 8px rgba(0,0,0,0.05)',
        position: 'relative',
      }}
    >
      {/* 북마크 해제 버튼 */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        title="저장 해제"
        style={{
          position: 'absolute', top: 10, right: 10, zIndex: 2,
          width: 30, height: 30, borderRadius: '50%',
          background: 'rgba(255,255,255,0.9)',
          border: '1px solid rgba(0,0,0,0.08)',
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 14,
          backdropFilter: 'blur(6px)',
        }}
      >
        🔖
      </button>

      {/* 이미지 */}
      <div
        onClick={onClick}
        style={{ cursor: 'pointer', height: 200, overflow: 'hidden', background: '#f5f5f5' }}
      >
        <img
          src={celebrity.profileImage}
          alt={celebrity.name}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.4s',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
          }}
        />
      </div>

      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>{celebrity.name}</div>
        <div style={{ fontSize: 12, color: '#aaa', marginTop: 2, marginBottom: 8 }}>{celebrity.realName}</div>
        {celebrity.styles?.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {celebrity.styles.slice(0, 3).map(s => (
              <span key={s.label} style={{
                fontSize: 10, fontWeight: 700,
                padding: '2px 8px', borderRadius: 99,
                background: (s.color || '#888') + '18',
                color: s.color || '#888',
              }}>
                {s.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SavedNewsCard({ post, onRemove }) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const STYLE_COLORS = {
    '미니멀': '#111', '캐주얼': '#6366f1', '페미닌': '#ec4899',
    '걸리시': '#f59e0b', '포멀': '#059669',
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 14, overflow: 'hidden',
        border: '1px solid #eee', background: '#fff',
        transition: 'transform 0.2s, box-shadow 0.2s',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 10px 24px rgba(0,0,0,0.09)' : '0 2px 6px rgba(0,0,0,0.04)',
        position: 'relative',
      }}
    >
      {/* 북마크 해제 버튼 */}
      <button
        onClick={onRemove}
        title="저장 해제"
        style={{
          position: 'absolute', top: 8, right: 8, zIndex: 2,
          width: 28, height: 28, borderRadius: '50%',
          background: 'rgba(255,255,255,0.9)',
          border: '1px solid rgba(0,0,0,0.08)',
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 13,
          backdropFilter: 'blur(6px)',
        }}
      >
        🔖
      </button>

      <a href={post.link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        {/* 썸네일 */}
        <div style={{ aspectRatio: '3/4', overflow: 'hidden', background: '#f5f5f5', position: 'relative' }}>
          {post.image && !imgError ? (
            <img
              src={post.image}
              alt="fashion"
              onError={() => setImgError(true)}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transition: 'transform 0.35s',
                transform: hovered ? 'scale(1.05)' : 'scale(1)',
              }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, color: '#ddd',
            }}>
              👗
            </div>
          )}
          {post.style && (
            <div style={{
              position: 'absolute', bottom: 8, left: 10,
              background: STYLE_COLORS[post.style] || '#333',
              color: '#fff', fontSize: 10, fontWeight: 700,
              padding: '2px 8px', borderRadius: 20,
            }}>
              {post.style}
            </div>
          )}
        </div>

        {/* 정보 */}
        <div style={{ padding: '10px 12px 12px' }}>
          {post.celebrity && (
            <div style={{ fontSize: 11, fontWeight: 700, color: '#ec4899', marginBottom: 4 }}>
              {post.celebrity}
            </div>
          )}
          {post.items?.length > 0 && (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {post.items.slice(0, 3).map((item, i) => (
                <li key={i} style={{ fontSize: 11, color: '#555', lineHeight: 1.6 }}>· {item}</li>
              ))}
            </ul>
          )}
        </div>
      </a>
    </div>
  );
}

function SavedItemCard({ item, onRemove }) {
  const shoppingUrl = `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(item.searchQuery)}`;
  const icon = CATEGORY_ICON[item.category] || '👗';
  const tier = TIER_STYLE[item.priceTier];

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #eee',
      borderRadius: 12,
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
    }}>
      {/* 아이콘 */}
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: '#f5f5f5', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0,
      }}>
        {icon}
      </div>

      {/* 정보 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>
            {item.category}
          </span>
          {tier && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '1px 6px',
              borderRadius: 20, background: tier.background, color: tier.color,
            }}>
              {item.priceTier}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>{item.name}</span>
          {item.brand && <span style={{ fontSize: 12, color: '#aaa' }}>{item.brand}</span>}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#888' }}>색상: {item.color}</span>
          {item.estimatedPrice > 0 && (
            <span style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>
              약 {item.estimatedPrice.toLocaleString('ko-KR')}원
            </span>
          )}
        </div>
      </div>

      {/* 버튼들 */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <a
          href={shoppingUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            padding: '7px 14px', borderRadius: 8,
            border: '1px solid #111', background: '#fff',
            color: '#111', fontSize: 12, fontWeight: 500,
            textDecoration: 'none', whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#111'; }}
        >
          쇼핑 검색 →
        </a>
        <button
          onClick={onRemove}
          title="저장 해제"
          style={{
            padding: '7px 10px', borderRadius: 8,
            border: '1px solid #eee', background: '#fff',
            color: '#aaa', fontSize: 13, cursor: 'pointer',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fff5f5'; e.currentTarget.style.color = '#e55'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#aaa'; }}
        >
          🔖
        </button>
      </div>
    </div>
  );
}

function EmptyState({ label, sub }) {
  return (
    <div style={{
      textAlign: 'center', padding: '80px 20px',
      color: '#bbb',
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔖</div>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#888', marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 13, color: '#bbb' }}>{sub}</p>
    </div>
  );
}
