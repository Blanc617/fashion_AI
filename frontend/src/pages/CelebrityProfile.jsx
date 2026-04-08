import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const STYLE_COLORS = {
  '미니멀': '#111',
  '캐주얼': '#6366f1',
  '페미닌': '#ec4899',
  '걸리시': '#f59e0b',
  '포멀': '#059669',
};

const STYLE_TABS = ['전체', '패션', '공항', '화보', '무대', '일상'];

export default function CelebrityProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [celebrity, setCelebrity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeStyle, setActiveStyle] = useState('전체');
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/celebrities/${id}`)
      .then(r => r.json())
      .then(setCelebrity)
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!celebrity) return;
    const style = activeStyle === '전체' ? '패션' : activeStyle;
    setNewsLoading(true);
    fetch(`/api/news?celebrity=${encodeURIComponent(celebrity.name)}&style=${encodeURIComponent(style)}`)
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
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700 }}>{celebrity.name}</h1>
            <span style={{ fontSize: 14, color: '#aaa' }}>{celebrity.realName}</span>
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
        display: 'flex', gap: 8, padding: '24px 0 28px',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {STYLE_TABS.map(tab => {
          const isActive = activeStyle === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveStyle(tab)}
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

      {/* 뉴스 이미지 그리드 */}
      {newsLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa', fontSize: 14 }}>
          최신 뉴스 불러오는 중...
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa', fontSize: 14 }}>
          관련 뉴스가 없습니다.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 16,
        }}>
          {posts.map(post => (
            <NewsCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

function NewsCard({ post }) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <a
      href={post.link}
      target="_blank"
      rel="noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
        border: '1px solid #eee', background: '#fff',
        transition: 'transform 0.2s, box-shadow 0.2s',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.1)' : '0 2px 6px rgba(0,0,0,0.04)',
        textDecoration: 'none', display: 'block', color: 'inherit',
      }}
    >
      {/* 이미지 */}
      <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#f0f0f0' }}>
        {post.image && !imgError ? (
          <img
            src={post.image}
            alt={post.title}
            onError={() => setImgError(true)}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.3s',
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
            }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 32, color: '#ddd',
          }}>
            📰
          </div>
        )}
        {/* 출처 뱃지 */}
        <div style={{
          position: 'absolute', bottom: 8, left: 8,
          background: 'rgba(0,0,0,0.6)', color: '#fff',
          fontSize: 10, fontWeight: 600, padding: '2px 7px',
          borderRadius: 4, backdropFilter: 'blur(4px)',
        }}>
          {post.source}
        </div>
      </div>

      {/* 정보 */}
      <div style={{ padding: '12px 14px 14px' }}>
        <p style={{
          fontSize: 13, fontWeight: 600, color: '#111', lineHeight: 1.5,
          marginBottom: 6,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {post.title}
        </p>
        <p style={{
          fontSize: 12, color: '#888', lineHeight: 1.5, marginBottom: 8,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {post.description}
        </p>
        <p style={{ fontSize: 11, color: '#bbb' }}>{post.date}</p>
      </div>
    </a>
  );
}
