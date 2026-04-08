import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookmark } from '../hooks/useBookmark.js';

const PAGE_SIZE = 12;

export default function Home() {
  const [celebrities, setCelebrities] = useState([]);
  const [filter, setFilter] = useState('전체');
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/celebrities')
      .then(r => r.json())
      .then(setCelebrities)
      .catch(() => {});
  }, []);

  const allStyles = ['전체', ...new Set(
    celebrities.flatMap(c => c.styles.map(s => s.label))
  )];

  const categoryFiltered = categoryFilter === '전체'
    ? celebrities
    : celebrities.filter(c => c.category && c.category.includes(categoryFilter));

  const styleFiltered = filter === '전체'
    ? categoryFiltered
    : categoryFiltered.filter(c => c.styles.some(s => s.label === filter));

  const filtered = searchQuery.trim() === ''
    ? styleFiltered
    : styleFiltered.filter(c =>
        c.name.includes(searchQuery.trim()) ||
        c.realName.includes(searchQuery.trim())
      );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const currentPage = Math.min(page, totalPages || 1);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleFilterChange = (newFilter) => { setFilter(newFilter); setPage(1); };
  const handleSearch = (q) => { setSearchQuery(q); setPage(1); };

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', color: '#111' }}>
      {/* 히어로 섹션 */}
      <div style={{
        position: 'relative',
        padding: '90px 40px 72px',
        textAlign: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #fff5fb 0%, #f0f4ff 50%, #fefce8 100%)',
      }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
        {/* 배경 장식 */}
        <div style={{
          position: 'absolute',
          top: -80, right: '5%',
          width: 340, height: 340,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244,114,182,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -60, left: '8%',
          width: 280, height: 280,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(129,140,248,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 16px',
          borderRadius: 99,
          border: '1px solid rgba(244,114,182,0.35)',
          background: 'rgba(244,114,182,0.08)',
          fontSize: 12,
          fontWeight: 700,
          color: '#ec4899',
          marginBottom: 28,
          letterSpacing: '0.06em',
        }}>
          ✦ AI POWERED FASHION
        </div>

        <h1 style={{
          fontSize: 'clamp(34px, 5.5vw, 66px)',
          fontWeight: 900,
          letterSpacing: '-2px',
          lineHeight: 1.1,
          marginBottom: 20,
          color: '#111',
        }}>
          스타의 패션을<br />
          <span style={{
            background: 'linear-gradient(135deg, #f472b6, #818cf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            내 것으로
          </span>
        </h1>

        <p style={{
          fontSize: 16,
          color: '#888',
          maxWidth: 400,
          margin: '0 auto 40px',
          lineHeight: 1.8,
        }}>
          좋아하는 연예인의 스타일을 탐색하고,<br />
          AI로 나만의 룩을 완성해보세요
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button style={{
            padding: '13px 28px',
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg, #f472b6, #818cf8)',
            color: '#fff',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 6px 24px rgba(244,114,182,0.35)',
          }}>
            지금 탐색하기
          </button>
          <button style={{
            padding: '13px 28px',
            borderRadius: 12,
            border: '1.5px solid #e5e7eb',
            background: '#fff',
            color: '#555',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
          }}>
            스타일 스왑 해보기
          </button>
        </div>
      </div>
      </div>

      {/* 필터 + 그리드 */}
      <div id="celeb-feed" style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 40px 80px' }}>
        {/* 섹션 헤더 */}
        <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', color: '#111', marginBottom: 16 }}>
          셀럽 피드
        </h2>

        {/* 검색창 - 가운데 정렬 */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <SearchBar value={searchQuery} onChange={handleSearch} />
        </div>

        {/* 스타일 필터 */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {allStyles.map(style => (
              <button
                key={style}
                onClick={() => handleFilterChange(style)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 99,
                  border: filter === style ? 'none' : '1.5px solid #e5e7eb',
                  background: filter === style
                    ? 'linear-gradient(135deg, #f472b6, #818cf8)'
                    : '#fff',
                  color: filter === style ? '#fff' : '#666',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                  boxShadow: filter === style ? '0 4px 14px rgba(244,114,182,0.3)' : 'none',
                }}
              >
                {style}
              </button>
            ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#888' }}>
              "{searchQuery}"에 대한 검색 결과가 없습니다
            </p>
            <p style={{ fontSize: 13, color: '#bbb', marginTop: 6 }}>
              다른 이름으로 검색해보세요
            </p>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 24,
            }}>
              {paginated.map(cel => (
                <CelebrityCardWrapper
                  key={cel.id}
                  celebrity={cel}
                  onClick={() => navigate(`/celebrity/${cel.id}`)}
                />
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                marginTop: 48,
              }}>
                <PaginationBtn
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  label="←"
                />
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <PaginationBtn
                    key={p}
                    onClick={() => setPage(p)}
                    active={p === currentPage}
                    label={p}
                  />
                ))}
                <PaginationBtn
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  label="→"
                />
              </div>
            )}

            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#bbb' }}>
              {filtered.length}명 중 {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)}명 표시
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function CelebrityCardWrapper({ celebrity, onClick }) {
  const { toggle, isBookmarked } = useBookmark();
  return (
    <CelebrityCard
      celebrity={celebrity}
      onClick={onClick}
      bookmarked={isBookmarked('celebrities', celebrity.id)}
      onBookmark={() => toggle('celebrities', celebrity)}
    />
  );
}

function CelebrityCard({ celebrity, onClick, bookmarked = false, onBookmark }) {
  const [hovered, setHovered] = useState(false);
  const isActive = celebrity.postCount > 0;

  return (
    <div
      onClick={isActive ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 20,
        overflow: 'hidden',
        border: hovered && isActive ? '1.5px solid #f9a8d4' : '1.5px solid #f0f0f0',
        cursor: isActive ? 'pointer' : 'default',
        transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s, border-color 0.3s',
        transform: hovered && isActive ? 'translateY(-6px) scale(1.01)' : 'none',
        boxShadow: hovered && isActive
          ? '0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(244,114,182,0.15)'
          : '0 2px 12px rgba(0,0,0,0.06)',
        background: '#fff',
      }}
    >
      {/* 이미지 */}
      <div style={{ position: 'relative', height: 260, overflow: 'hidden', background: '#f5f5f5' }}>
        <img
          src={celebrity.profileImage}
          alt={celebrity.name}
          style={{
            width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center',
            transition: 'transform 0.5s',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
            filter: !isActive ? 'grayscale(50%) brightness(1.05)' : 'none',
          }}
        />

        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: '50%',
          background: 'linear-gradient(to top, rgba(255,255,255,0.95), transparent)',
          pointerEvents: 'none',
        }} />

        {isActive && (
          <div style={{
            position: 'absolute',
            top: 14, right: 14,
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)',
            color: '#555',
            fontSize: 11,
            fontWeight: 700,
            padding: '5px 11px',
            borderRadius: 99,
            border: '1px solid rgba(0,0,0,0.08)',
          }}>
            {celebrity.postCount} posts
          </div>
        )}

        {/* 북마크 버튼 */}
        <button
          onClick={(e) => { e.stopPropagation(); onBookmark(); }}
          title={bookmarked ? '저장 해제' : '스타일북에 저장'}
          style={{
            position: 'absolute',
            top: 14, left: 14,
            width: 32, height: 32, borderRadius: '50%',
            background: bookmarked ? 'rgba(244,114,182,0.9)' : 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(0,0,0,0.08)',
            backdropFilter: 'blur(8px)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
            opacity: hovered || bookmarked ? 1 : 0,
            transition: 'opacity 0.2s, background 0.2s',
          }}
        >
          🔖
        </button>

        {!isActive && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(6px)',
              color: '#aaa',
              fontSize: 13,
              fontWeight: 600,
              padding: '8px 18px',
              borderRadius: 99,
              border: '1px solid #e5e7eb',
            }}>
              Coming Soon
            </span>
          </div>
        )}

        <div style={{
          position: 'absolute',
          bottom: 14, left: 18,
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.5px', color: '#111' }}>
            {celebrity.name}
          </div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
            {celebrity.realName}
          </div>
        </div>
      </div>

      {/* 정보 */}
      <div style={{ padding: '14px 18px 18px' }}>
        {celebrity.styles.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {celebrity.styles.map(s => (
              <span key={s.label} style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 99,
                background: s.color + '15',
                color: s.color,
                border: `1px solid ${s.color}30`,
              }}>
                {s.label}
              </span>
            ))}
          </div>
        )}

        <p style={{ fontSize: 13, color: '#888', lineHeight: 1.7 }}>
          {celebrity.description}
        </p>

        {isActive && (
          <div style={{
            marginTop: 14,
            fontSize: 13,
            fontWeight: 700,
            color: '#ec4899',
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateX(0)' : 'translateX(-6px)',
            transition: 'opacity 0.25s, transform 0.25s',
          }}>
            스타일 탐색하기 →
          </div>
        )}
      </div>
    </div>
  );
}

function SearchBar({ value, onChange }) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <span style={{
        position: 'absolute', left: 16, fontSize: 16,
        color: focused ? '#ec4899' : '#bbb',
        pointerEvents: 'none', transition: 'color 0.2s',
      }}>
        🔍
      </span>
      <input
        type="text"
        placeholder="연예인 이름 검색..."
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          paddingLeft: 44, paddingRight: value ? 40 : 20,
          paddingTop: 13, paddingBottom: 13,
          borderRadius: 99,
          border: focused ? '1.5px solid #f9a8d4' : '1.5px solid #e5e7eb',
          background: focused ? '#fff' : '#f9f9f9',
          fontSize: 15, fontWeight: 500, color: '#111',
          outline: 'none', width: 480,
          boxShadow: focused ? '0 0 0 4px rgba(244,114,182,0.12)' : '0 2px 8px rgba(0,0,0,0.06)',
          transition: 'all 0.2s',
        }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            position: 'absolute', right: 14,
            background: '#e5e7eb', border: 'none', borderRadius: '50%',
            width: 22, height: 22, cursor: 'pointer',
            fontSize: 11, color: '#888',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

function PaginationBtn({ onClick, disabled, active, label }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: active ? 38 : 36,
        height: active ? 38 : 36,
        borderRadius: 10,
        border: active ? 'none' : '1.5px solid #e5e7eb',
        background: active
          ? 'linear-gradient(135deg, #f472b6, #818cf8)'
          : hovered && !disabled ? '#f9f9f9' : '#fff',
        color: active ? '#fff' : disabled ? '#ccc' : '#555',
        fontSize: 14,
        fontWeight: active ? 800 : 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: active ? '0 4px 14px rgba(244,114,182,0.35)' : 'none',
        transition: 'all 0.18s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {label}
    </button>
  );
}
