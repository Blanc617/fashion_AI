import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookmark } from '../hooks/useBookmark.js';

const STYLE_TABS = ['전체', '패션', '공항', '화보', '무대', '일상'];

const ITEM_CATEGORIES = [
  { key: '전체', icon: '👗', label: '전체' },
  { key: '아우터', icon: '🧥', label: '아우터', keywords: ['코트', '재킷', '점퍼', '패딩', '집업', '가디건', '블레이저', '베스트', '조끼', '파카', '아우터', '트렌치'] },
  { key: '상의', icon: '👕', label: '상의', keywords: ['티셔츠', '블라우스', '셔츠', '니트', '스웨터', '후드', '맨투맨', '탑', '이너', '크롭', '레이어', '터틀넥', '가디건', '피케', '브이넥', '라운드넥', '상의'] },
  { key: '하의', icon: '👖', label: '하의', keywords: ['팬츠', '슬랙스', '청바지', '진', '스커트', '미니스커트', '반바지', '쇼츠', '와이드', '조거', '레깅스', '하의', '치마'] },
  { key: '원피스', icon: '👘', label: '원피스', keywords: ['드레스', '원피스', '점프수트', '로브', '미니드레스', '맥시드레스'] },
  { key: '신발', icon: '👟', label: '신발', keywords: ['스니커즈', '부츠', '힐', '샌들', '로퍼', '구두', '슈즈', '플랫', '뮬', '슬리퍼', '신발', '운동화'] },
  { key: '가방', icon: '👜', label: '가방', keywords: ['백', '가방', '숄더백', '크로스백', '클러치', '토트백', '핸드백', '파우치', '버킷백', '미니백', '에코백'] },
  { key: '모자', icon: '🧢', label: '모자', keywords: ['모자', '캡', '비니', '버킷햇', '베레모', '볼캡', '햇', '헤드'] },
  { key: '액세서리', icon: '💍', label: '액세서리', keywords: ['목걸이', '귀걸이', '반지', '팔찌', '벨트', '선글라스', '안경', '스카프', '머플러', '시계', '브로치', '헤어핀'] },
];

function detectCategory(items = []) {
  const text = items.join(' ');
  for (const cat of ITEM_CATEGORIES.slice(1)) {
    if (cat.keywords.some(kw => text.includes(kw))) return cat.key;
  }
  return null;
}

function postHasCategory(post, categoryKey) {
  if (categoryKey === '전체') return true;
  const cat = ITEM_CATEGORIES.find(c => c.key === categoryKey);
  if (!cat) return false;
  const text = (post.items || []).join(' ');
  return cat.keywords.some(kw => text.includes(kw));
}

export default function CelebrityProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [celebrity, setCelebrity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeStyle, setActiveStyle] = useState('전체');
  const [activeCategory, setActiveCategory] = useState('전체');
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(false);
  const { toggle, isBookmarked } = useBookmark();

  useEffect(() => {
    fetch(`/api/celebrities/${id}`)
      .then(r => r.json())
      .then(setCelebrity)
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!celebrity) return;
    const style = activeStyle === '전체' ? '' : activeStyle;
    setNewsLoading(true);
    const searchKeyword = celebrity.searchKeyword || celebrity.name;
    fetch(`/api/news?celebrity=${encodeURIComponent(celebrity.name)}&searchKeyword=${encodeURIComponent(searchKeyword)}&style=${encodeURIComponent(style)}`)
      .then(r => r.json())
      .then(data => {
        setPosts(Array.isArray(data) ? data : []);
        setLoading(false);
        setNewsLoading(false);
      })
      .catch(() => { setLoading(false); setNewsLoading(false); });
  }, [celebrity, activeStyle]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 80, color: '#888' }}>불러오는 중...</div>
  );
  if (!celebrity) return (
    <div style={{ textAlign: 'center', padding: 80, color: '#888' }}>연예인 정보를 찾을 수 없습니다.</div>
  );

  const totalPosts = celebrity.styles?.reduce((s, st) => s + st.count, 0) || 1;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px 60px' }}>
      {/* 뒤로가기 */}
      <div style={{ padding: '24px 0 0' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 14, color: '#888', padding: 0,
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          ← 목록으로
        </button>
      </div>

      {/* 프로필 헤더 */}
      <div style={{
        display: 'flex', gap: 32, alignItems: 'flex-start',
        padding: '32px 0 40px', borderBottom: '1px solid #eee',
      }}>
        <img
          src={celebrity.profileImage}
          alt={celebrity.name}
          style={{
            width: 100, height: 100, borderRadius: '50%',
            objectFit: 'cover', border: '3px solid #eee', flexShrink: 0,
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 26, fontWeight: 700 }}>{celebrity.name}</h1>
            <span style={{ fontSize: 14, color: '#aaa' }}>{celebrity.realName}</span>
            {celebrity.category && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 10px',
                borderRadius: 99, background: 'rgba(168,85,247,0.1)',
                color: '#a855f7', border: '1px solid rgba(168,85,247,0.25)',
              }}>
                {celebrity.category}
              </span>
            )}
            <button
              onClick={() => toggle('celebrities', celebrity)}
              title={isBookmarked('celebrities', celebrity.id) ? '저장 해제' : '스타일북에 저장'}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: isBookmarked('celebrities', celebrity.id) ? '1.5px solid #f472b6' : '1.5px solid #e5e7eb',
                background: isBookmarked('celebrities', celebrity.id) ? '#fff0f7' : '#fff',
                color: isBookmarked('celebrities', celebrity.id) ? '#ec4899' : '#888',
                fontSize: 12, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                transition: 'all 0.18s',
              }}
            >
              🔖 {isBookmarked('celebrities', celebrity.id) ? '저장됨' : '저장'}
            </button>
          </div>
          <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: 20, maxWidth: 480 }}>
            {celebrity.description}
          </p>

          {/* 스타일 분포 */}
          {celebrity.styles?.length > 0 && (
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                스타일 분포
              </p>
              <div style={{ display: 'flex', height: 8, borderRadius: 8, overflow: 'hidden', width: 360, marginBottom: 12 }}>
                {celebrity.styles.map(s => (
                  <div key={s.label} style={{
                    width: `${(s.count / totalPosts) * 100}%`,
                    background: STYLE_COLORS[s.label] || '#ccc',
                  }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                {celebrity.styles.map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: STYLE_COLORS[s.label] || '#ccc', flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 12, color: '#555' }}>
                      {s.label} <span style={{ color: '#aaa' }}>({Math.round((s.count / totalPosts) * 100)}%)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 스타일 필터 탭 */}
      <div style={{
        display: 'flex', gap: 8, padding: '24px 0 16px',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {STYLE_TABS.map(tab => {
          const isActive = activeStyle === tab;
          return (
            <button
              key={tab}
              onClick={() => { setActiveStyle(tab); setActiveCategory('전체'); }}
              style={{
                padding: '7px 18px', borderRadius: 20,
                border: isActive ? 'none' : '1px solid #ddd',
                background: isActive ? '#111' : '#fff',
                color: isActive ? '#fff' : '#555',
                fontSize: 13, fontWeight: isActive ? 600 : 400,
                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* 아이템 카테고리 필터 */}
      {!newsLoading && posts.length > 0 && (
        <div style={{
          display: 'flex', gap: 8, paddingBottom: 28,
          overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          {ITEM_CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.key;
            const count = cat.key === '전체'
              ? posts.length
              : posts.filter(p => postHasCategory(p, cat.key)).length;
            if (cat.key !== '전체' && count === 0) return null;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 14px', borderRadius: 20, whiteSpace: 'nowrap',
                  border: isActive ? '1.5px solid transparent' : '1.5px solid #e5e7eb',
                  background: isActive ? 'linear-gradient(135deg, #f472b6, #818cf8)' : '#fff',
                  color: isActive ? '#fff' : '#555',
                  fontSize: 12, fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer', transition: 'all 0.15s',
                  boxShadow: isActive ? '0 3px 10px rgba(244,114,182,0.3)' : 'none',
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  background: isActive ? 'rgba(255,255,255,0.25)' : '#f0f0f0',
                  color: isActive ? '#fff' : '#888',
                  padding: '1px 6px', borderRadius: 99,
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 뉴스 이미지 그리드 */}
      {newsLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa', fontSize: 14 }}>
          최신 뉴스 불러오는 중...
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa', fontSize: 14 }}>
          관련 뉴스가 없습니다.
        </div>
      ) : (() => {
        const filtered = posts.filter(p => postHasCategory(p, activeCategory));
        return filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa', fontSize: 14 }}>
            해당 카테고리의 착장 정보가 없습니다.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 16,
          }}>
            {filtered.map(post => (
              <NewsCard
                key={post.id}
                post={{ ...post, celebrity: celebrity.name }}
                bookmarked={isBookmarked('news', post.id)}
                onBookmark={() => toggle('news', { ...post, celebrity: celebrity.name })}
              />
            ))}
          </div>
        );
      })()}
    </div>
  );
}

const STYLE_COLORS = {
  '미니멀': '#111', '캐주얼': '#6366f1', '페미닌': '#ec4899',
  '걸리시': '#f59e0b', '포멀': '#059669',
};

function NewsCard({ post, bookmarked = false, onBookmark }) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 14, overflow: 'hidden',
        border: '1px solid #eee', background: '#fff',
        transition: 'transform 0.2s, box-shadow 0.2s',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 10px 28px rgba(0,0,0,0.1)' : '0 2px 6px rgba(0,0,0,0.04)',
        position: 'relative',
      }}
    >
      {/* 북마크 버튼 */}
      {onBookmark && (
        <button
          onClick={(e) => { e.stopPropagation(); onBookmark(); }}
          title={bookmarked ? '저장 해제' : '스타일북에 저장'}
          style={{
            position: 'absolute', top: 8, right: 8, zIndex: 2,
            width: 30, height: 30, borderRadius: '50%',
            background: bookmarked ? 'rgba(244,114,182,0.9)' : 'rgba(255,255,255,0.9)',
            border: '1px solid rgba(0,0,0,0.08)',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 13,
            backdropFilter: 'blur(6px)',
            transition: 'all 0.18s',
          }}
        >
          {bookmarked ? '🔖' : '🔖'}
        </button>
      )}

      <a
        href={post.link}
        target="_blank"
        rel="noreferrer"
        style={{ textDecoration: 'none', display: 'block', color: 'inherit' }}
      >
      {/* 썸네일 */}
      <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', background: '#f5f5f5' }}>
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
            width: '100%', height: '100%', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#ddd',
          }}>
            👗
          </div>
        )}
        {/* 스타일 뱃지 */}
        {post.style && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: STYLE_COLORS[post.style] || '#333',
            color: '#fff', fontSize: 11, fontWeight: 700,
            padding: '3px 9px', borderRadius: 20,
          }}>
            {post.style}
          </div>
        )}
        {/* 날짜 */}
        <div style={{
          position: 'absolute', bottom: 8, right: 10,
          color: 'rgba(255,255,255,0.85)', fontSize: 10,
          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
        }}>
          {post.date}
        </div>
      </div>

      {/* 착장 정보 */}
      <div style={{ padding: '14px 16px 18px', borderTop: '1px solid #f0f0f0' }}>

        {/* 아이템 목록 */}
        {post.items?.length > 0 && (
          <div style={{ margin: '0 0 10px' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#aaa', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              착장 쇼핑
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {post.items.slice(0, 4).map((item, i) => (
                <ShopTag key={i} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* 컬러 팔레트 */}
        {post.colors?.length > 0 && (
          <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap', marginBottom: post.description ? 10 : 0 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#aaa', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Color</span>
            {post.colors.map(c => (
              <span key={c} style={{
                fontSize: 12, fontWeight: 600, color: '#444',
                background: '#f4f4f6', padding: '3px 9px', borderRadius: 8,
                border: '1px solid #ebebeb',
              }}>
                {c}
              </span>
            ))}
          </div>
        )}

        {/* 설명 */}
        {post.description && (
          <p style={{
            fontSize: 12, color: '#666', lineHeight: 1.7,
            margin: 0, paddingTop: 8, borderTop: post.colors?.length > 0 || post.items?.length > 0 ? '1px solid #f4f4f4' : 'none',
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {post.description}
          </p>
        )}
      </div>
      </a>
    </div>
  );
}

function getItemIcon(item) {
  for (const cat of ITEM_CATEGORIES.slice(1)) {
    if (cat.keywords.some(kw => item.includes(kw))) return cat.icon;
  }
  return '👗';
}

function ShopTag({ item }) {
  const [hovered, setHovered] = useState(false);
  const icon = getItemIcon(item);
  return (
    <a
      href={`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(item)}`}
      target="_blank"
      rel="noreferrer"
      onClick={e => e.stopPropagation()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '4px 10px',
        borderRadius: 99,
        border: hovered ? '1px solid #f472b6' : '1px solid #e5e7eb',
        background: hovered ? '#fff0f7' : '#f9f9f9',
        color: hovered ? '#ec4899' : '#444',
        fontSize: 12, fontWeight: 500,
        textDecoration: 'none',
        transition: 'all 0.15s',
        cursor: 'pointer',
      }}
    >
      <span style={{ flexShrink: 0, display: 'flex' }}>{icon}</span>
      {item}
    </a>
  );
}
