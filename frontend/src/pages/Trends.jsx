import { useEffect, useState } from 'react';

const STYLE_COLOR = {
  '미니멀': '#1a1a1a',
  '캐주얼': '#6366f1',
  '페미닌': '#ec4899',
  '걸리시': '#f59e0b',
  '포멀': '#059669',
};

const STYLE_BG = {
  '미니멀': '#f0f0f0',
  '캐주얼': '#eef0ff',
  '페미닌': '#fdf2f8',
  '걸리시': '#fffbeb',
  '포멀': '#f0fdf4',
};

const COLOR_HEX = {
  '블랙': '#1a1a1a', '화이트': '#e5e5e5', '베이지': '#d4b896',
  '네이비': '#1e3a5f', '그레이': '#9ca3af', '브라운': '#92400e',
  '카키': '#6b7c41', '레드': '#ef4444', '핑크': '#ec4899',
  '블루': '#3b82f6', '그린': '#22c55e', '옐로우': '#facc15',
  '오렌지': '#f97316', '퍼플': '#a855f7', '아이보리': '#d6d0bc',
  '민트': '#6ee7b7', '크림': '#e8e0c8', '차콜': '#374151',
  '버건디': '#7f1d1d', '올리브': '#65a30d', '코럴': '#f87171',
  '라벤더': '#c4b5fd', '머스타드': '#ca8a04', '스카이블루': '#7dd3fc',
  '연베이지': '#e8d5c0', '연그레이': '#d1d5db',
};

function colorToHex(name) {
  if (COLOR_HEX[name]) return COLOR_HEX[name];
  for (const [key, hex] of Object.entries(COLOR_HEX)) {
    if (name.includes(key)) return hex;
  }
  return '#bbb';
}

export default function Trends() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/trends')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 100, color: '#aaa', fontSize: 14 }}>
      트렌드 데이터를 불러오는 중...
    </div>
  );
  if (error) return (
    <div style={{ textAlign: 'center', padding: 100, color: '#e53e3e', fontSize: 14 }}>오류: {error}</div>
  );
  if (!data || data.total === 0) return (
    <div style={{ textAlign: 'center', padding: 100, color: '#aaa' }}>
      <div style={{ fontSize: 32, marginBottom: 16 }}>📊</div>
      <p style={{ fontSize: 16, marginBottom: 8, fontWeight: 600, color: '#555' }}>아직 데이터가 없습니다</p>
      <p style={{ fontSize: 13 }}>연예인 프로필을 방문해 패션 뉴스를 불러오면 트렌드가 집계됩니다.</p>
    </div>
  );

  const maxItemCount = data.topItems[0]?.count || 1;
  const maxColorCount = data.topColors[0]?.count || 1;
  const totalStyles = data.styles.reduce((s, x) => s + x.count, 0);

  return (
    <div style={{ background: '#f7f8fa', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* 헤더 */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.8px', color: '#111' }}>
              트렌드 대시보드
            </h1>
            <span style={{ fontSize: 13, color: '#aaa' }}>fashionn.com 기반</span>
          </div>
          <p style={{ color: '#888', fontSize: 14 }}>
            총 <strong style={{ color: '#111', fontWeight: 700 }}>{data.total}개</strong> 착장 분석 데이터 집계
          </p>
        </div>

        {/* 요약 카드 4개 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
          {[
            { label: '분석된 착장', value: `${data.total}개`, icon: '📋', accent: '#6366f1' },
            { label: '인기 스타일', value: data.styles[0]?.name || '-', icon: '✦', accent: STYLE_COLOR[data.styles[0]?.name] || '#111' },
            { label: '인기 아이템', value: (data.topItems[0]?.name || '-').slice(0, 12), icon: '👗', accent: '#ec4899' },
            { label: '이번 달 급상승', value: (data.risingItems[0]?.name || '-').slice(0, 12), icon: '↑', accent: '#16a34a' },
          ].map(({ label, value, icon, accent }) => (
            <div key={label} style={{
              background: '#fff',
              borderRadius: 16,
              padding: '20px 22px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              borderTop: `3px solid ${accent}`,
            }}>
              <p style={{ fontSize: 12, color: '#aaa', marginBottom: 10, letterSpacing: '0.3px' }}>{label}</p>
              <p style={{ fontSize: 17, fontWeight: 800, color: '#111', letterSpacing: '-0.3px', lineHeight: 1.3 }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* 인기 아이템 + 인기 색상 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <Card title="인기 아이템 TOP 10" sub="전체 기간">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {data.topItems.map((item, i) => (
                <div key={item.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        fontSize: 12, fontWeight: 800,
                        color: i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#cd7f32' : '#ddd',
                        minWidth: 18, textAlign: 'center',
                      }}>
                        {i + 1}
                      </span>
                      <span style={{ fontSize: 14, color: '#222', fontWeight: i < 3 ? 600 : 400 }}>
                        {item.name}
                      </span>
                    </div>
                    <span style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>{item.count}회</span>
                  </div>
                  <div style={{ height: 8, background: '#f0f0f0', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${(item.count / maxItemCount) * 100}%`,
                      background: i === 0
                        ? 'linear-gradient(90deg, #f472b6, #818cf8)'
                        : i === 1
                        ? 'linear-gradient(90deg, #a78bfa, #818cf8)'
                        : '#d1d5db',
                      borderRadius: 6,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="인기 색상 TOP 10" sub="전체 기간">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {data.topColors.map((color, i) => (
                <div key={color.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        fontSize: 12, fontWeight: 800,
                        color: i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#cd7f32' : '#ddd',
                        minWidth: 18, textAlign: 'center',
                      }}>
                        {i + 1}
                      </span>
                      <div style={{
                        width: 16, height: 16, borderRadius: '50%',
                        background: colorToHex(color.name),
                        border: '1.5px solid rgba(0,0,0,0.1)',
                        flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 14, color: '#222', fontWeight: i < 3 ? 600 : 400 }}>
                        {color.name}
                      </span>
                    </div>
                    <span style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>{color.count}회</span>
                  </div>
                  <div style={{ height: 8, background: '#f0f0f0', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${(color.count / maxColorCount) * 100}%`,
                      background: colorToHex(color.name),
                      borderRadius: 6,
                      opacity: color.name === '화이트' || color.name === '아이보리' || color.name === '크림' ? 1 : 0.85,
                      outline: color.name === '화이트' ? '1px solid #eee' : 'none',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 스타일 분포 + 급상승 키워드 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16, alignItems: 'start' }}>

          <Card title="스타일 분포" sub="전체 기간">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {data.styles.slice(0, 5).map(s => {
                const pct = Math.round(s.count / totalStyles * 100);
                return (
                  <div key={s.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{
                        fontSize: 13, fontWeight: 700,
                        padding: '4px 12px', borderRadius: 20,
                        background: STYLE_BG[s.name] || '#f5f5f5',
                        color: STYLE_COLOR[s.name] || '#555',
                      }}>
                        {s.name}
                      </span>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>{pct}%</span>
                        <span style={{ fontSize: 12, color: '#bbb', marginLeft: 6 }}>{s.count}건</span>
                      </div>
                    </div>
                    <div style={{ height: 10, background: '#f0f0f0', borderRadius: 6, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: STYLE_COLOR[s.name] || '#888',
                        borderRadius: 6,
                        opacity: 0.8,
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="이번 달 급상승 키워드" sub={`최근 30일 · ${data.recentArticleCount}건`}>
            {data.risingItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#bbb' }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>📭</div>
                <p style={{ fontSize: 13 }}>최근 30일 데이터가 부족합니다</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {data.risingItems.map((item, i) => {
                  const isNew = item.overallRank >= 50;
                  const rose = item.rankChange > 0;
                  const fell = item.rankChange < 0;
                  return (
                    <div key={item.name} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '14px 0',
                      borderBottom: i < data.risingItems.length - 1 ? '1px solid #f0f0f0' : 'none',
                    }}>
                      <span style={{
                        fontSize: 13, fontWeight: 800,
                        color: i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#cd7f32' : '#ddd',
                        minWidth: 20, textAlign: 'center',
                      }}>
                        {i + 1}
                      </span>
                      <span style={{ flex: 1, fontSize: 14, color: '#222', fontWeight: 500 }}>{item.name}</span>
                      {isNew ? (
                        <span style={{
                          fontSize: 11, fontWeight: 700,
                          padding: '3px 9px', borderRadius: 20,
                          background: '#dcfce7', color: '#16a34a',
                        }}>NEW</span>
                      ) : rose ? (
                        <span style={{
                          fontSize: 11, fontWeight: 700,
                          padding: '3px 9px', borderRadius: 20,
                          background: '#fdf2f8', color: '#ec4899',
                        }}>↑ {item.rankChange}</span>
                      ) : fell ? (
                        <span style={{
                          fontSize: 11, fontWeight: 700,
                          padding: '3px 9px', borderRadius: 20,
                          background: '#f5f5f5', color: '#bbb',
                        }}>↓ {Math.abs(item.rankChange)}</span>
                      ) : (
                        <span style={{ fontSize: 13, color: '#ddd' }}>—</span>
                      )}
                      <span style={{ fontSize: 13, color: '#aaa', minWidth: 36, textAlign: 'right', fontWeight: 600 }}>
                        {item.recentCount}회
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* 최근 착장 */}
        {data.recent.length > 0 && (
          <Card title="최근 분석된 착장" sub="fashionn.com">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              {data.recent.map((article, i) => (
                <a
                  key={i}
                  href={article.link}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    style={{
                      borderRadius: 12,
                      overflow: 'hidden',
                      background: '#f7f8fa',
                      border: '1px solid #eee',
                      transition: 'transform 0.18s, box-shadow 0.18s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ aspectRatio: '4/5', background: '#e5e7eb', overflow: 'hidden' }}>
                      {article.image ? (
                        <img
                          src={article.image}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : null}
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        {article.style && (
                          <span style={{
                            fontSize: 11, fontWeight: 700,
                            padding: '2px 8px', borderRadius: 20,
                            background: STYLE_BG[article.style] || '#f0f0f0',
                            color: STYLE_COLOR[article.style] || '#555',
                          }}>
                            {article.style}
                          </span>
                        )}
                        <span style={{ fontSize: 11, color: '#bbb' }}>{article.celebrity}</span>
                      </div>
                      <p style={{
                        fontSize: 12, color: '#666', lineHeight: 1.6,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {article.description}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function Card({ title, sub, children }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 18,
      padding: '24px 26px',
      boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 22 }}>
        <h2 style={{ fontSize: 15, fontWeight: 800, color: '#111', letterSpacing: '-0.3px' }}>
          {title}
        </h2>
        {sub && <span style={{ fontSize: 12, color: '#bbb' }}>{sub}</span>}
      </div>
      {children}
    </div>
  );
}
