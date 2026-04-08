import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const STYLE_COLORS = {
  '미니멀': '#111',
  '캐주얼': '#6366f1',
  '페미닌': '#ec4899',
  '걸리시': '#f59e0b',
  '포멀': '#059669',
};

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/posts/${id}`)
      .then(r => r.json())
      .then(data => {
        setPost(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 80, color: '#888' }}>불러오는 중...</div>
  );
  if (!post || post.error) return (
    <div style={{ textAlign: 'center', padding: 80, color: '#888' }}>게시글을 찾을 수 없습니다.</div>
  );

  const styleColor = STYLE_COLORS[post.style] || '#111';

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px 80px' }}>
      {/* 뒤로가기 */}
      <div style={{ padding: '24px 0 0' }}>
        <button
          onClick={() => navigate(`/celebrity/${post.celebrityId}`)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            color: '#888',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          ← {post.celebrity} 패션 목록으로
        </button>
      </div>

      <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }}>
        {/* 이미지 */}
        <div style={{ borderRadius: 16, overflow: 'hidden', aspectRatio: '4/5', background: '#f0f0f0' }}>
          <img
            src={post.image}
            alt={post.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* 정보 */}
        <div>
          {/* 스타일 뱃지 */}
          <div style={{
            display: 'inline-block',
            background: styleColor,
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            padding: '4px 12px',
            borderRadius: 20,
            marginBottom: 16,
          }}>
            {post.style}
          </div>

          <h1 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.4, marginBottom: 12, color: '#111' }}>
            {post.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#eee',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 600,
              color: '#666',
            }}>
              {post.author?.[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: 13, color: '#555' }}>{post.author}</span>
            <span style={{ fontSize: 13, color: '#ccc' }}>·</span>
            <span style={{ fontSize: 13, color: '#aaa' }}>{post.date}</span>
          </div>

          {/* 태그 */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
            {post.tags.map(tag => (
              <span key={tag} style={{
                fontSize: 13,
                color: '#555',
                padding: '4px 10px',
                background: '#f5f5f5',
                borderRadius: 20,
              }}>
                #{tag}
              </span>
            ))}
          </div>

          {/* 좋아요 / 댓글 */}
          <div style={{
            display: 'flex',
            gap: 16,
            padding: '20px 0',
            borderTop: '1px solid #eee',
            borderBottom: '1px solid #eee',
            marginBottom: 24,
          }}>
            <button
              onClick={() => setLiked(l => !l)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'none',
                border: '1px solid',
                borderColor: liked ? '#ec4899' : '#ddd',
                borderRadius: 20,
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: 14,
                color: liked ? '#ec4899' : '#666',
                fontWeight: liked ? 600 : 400,
                transition: 'all 0.15s',
              }}
            >
              {liked ? '♥' : '♡'} {(post.likes + (liked ? 1 : 0)).toLocaleString()}
            </button>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 14,
              color: '#888',
              padding: '8px 16px',
              border: '1px solid #ddd',
              borderRadius: 20,
            }}>
              ○ 댓글 {post.comments}
            </div>
          </div>

          {/* 패션 분석하기 버튼 */}
          <button
            onClick={() => navigate('/analyze')}
            style={{
              width: '100%',
              padding: '14px 0',
              borderRadius: 12,
              background: '#111',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            이 패션 스타일 분석하기 →
          </button>
        </div>
      </div>
    </div>
  );
}
