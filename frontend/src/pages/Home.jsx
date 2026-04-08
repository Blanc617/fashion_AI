import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [celebrities, setCelebrities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/celebrities')
      .then(r => r.json())
      .then(setCelebrities)
      .catch(() => {});
  }, []);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 20px' }}>
      <header style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px' }}>
          Celebrity Fashion
        </h1>
        <p style={{ color: '#888', fontSize: 14, marginTop: 6 }}>
          좋아하는 연예인의 패션을 스타일별로 모아보세요
        </p>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 20,
      }}>
        {celebrities.map(cel => (
          <CelebrityCard
            key={cel.id}
            celebrity={cel}
            onClick={() => navigate(`/celebrity/${cel.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

function CelebrityCard({ celebrity, onClick }) {
  const [hovered, setHovered] = useState(false);
  const isActive = celebrity.postCount > 0;

  return (
    <div
      onClick={isActive ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid #eee',
        cursor: isActive ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        transform: hovered && isActive ? 'translateY(-4px)' : 'none',
        boxShadow: hovered && isActive ? '0 12px 32px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.04)',
        background: '#fff',
      }}
    >
      {/* 프로필 이미지 */}
      <div style={{ position: 'relative', height: 220, overflow: 'hidden', background: '#f5f5f5' }}>
        <img
          src={celebrity.profileImage}
          alt={celebrity.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* 포스트 수 뱃지 */}
        {isActive && (
          <div style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 20,
            backdropFilter: 'blur(4px)',
          }}>
            {celebrity.postCount}개 포스트
          </div>
        )}
        {!isActive && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255,255,255,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            color: '#888',
            fontWeight: 500,
          }}>
            준비 중
          </div>
        )}
      </div>

      {/* 정보 */}
      <div style={{ padding: '16px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{celebrity.name}</h2>
          <span style={{ fontSize: 13, color: '#aaa' }}>{celebrity.realName}</span>
        </div>

        {/* 스타일 태그 */}
        {celebrity.styles.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {celebrity.styles.map(s => (
              <span key={s.label} style={{
                fontSize: 11,
                fontWeight: 600,
                padding: '3px 9px',
                borderRadius: 20,
                background: s.color,
                color: '#fff',
              }}>
                {s.label}
              </span>
            ))}
          </div>
        )}

        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
          {celebrity.description}
        </p>
      </div>
    </div>
  );
}
