import { useState, useRef } from 'react';
import ProductGrid from '../components/ProductGrid.jsx';

const TYPES = [
  { key: 'straight',         emoji: '💎', name: '스트레이트형', rep: '제니',  keyword: '탄탄한 직선미',   gradient: 'linear-gradient(135deg,#1a1a1a,#444)' },
  { key: 'wave',             emoji: '🌸', name: '웨이브형',     rep: '아이유', keyword: '부드러운 곡선미', gradient: 'linear-gradient(135deg,#f472b6,#fb7185)' },
  { key: 'natural',          emoji: '🍃', name: '내추럴형',     rep: '정호연', keyword: '자연스러운 골격미', gradient: 'linear-gradient(135deg,#334155,#475569)' },
  { key: 'straight_wave',    emoji: '✨', name: '스트레이트+웨이브', rep: '수지', keyword: '균형 잡힌 라인', gradient: 'linear-gradient(135deg,#818cf8,#a78bfa)' },
  { key: 'wave_natural',     emoji: '🎀', name: '웨이브+내추럴', rep: '로제', keyword: '여리한 골격+곡선', gradient: 'linear-gradient(135deg,#34d399,#6ee7b7)' },
  { key: 'straight_natural', emoji: '🖤', name: '스트레이트+내추럴', rep: '제시', keyword: '강인한 직선+골격', gradient: 'linear-gradient(135deg,#0f172a,#1e293b)' },
  { key: 'extreme_wave',     emoji: '🌙', name: '극강 웨이브형', rep: '태연', keyword: '극강의 부드러운 선', gradient: 'linear-gradient(135deg,#fb7185,#f472b6)' },
];

const TYPE_THEME = {
  straight:         { bg: '#111',     text: '#fff',    soft: '#333',    badge: '#444' },
  wave:             { bg: '#fce7f3',  text: '#9d174d', soft: '#fdf2f8', badge: '#fbcfe8' },
  natural:          { bg: '#1e293b',  text: '#e2e8f0', soft: '#334155', badge: '#475569' },
  straight_wave:    { bg: '#ede9fe',  text: '#5b21b6', soft: '#f5f3ff', badge: '#c4b5fd' },
  wave_natural:     { bg: '#d1fae5',  text: '#065f46', soft: '#ecfdf5', badge: '#6ee7b7' },
  straight_natural: { bg: '#0f172a',  text: '#e2e8f0', soft: '#1e293b', badge: '#334155' },
  extreme_wave:     { bg: '#ffe4e6',  text: '#9f1239', soft: '#fff1f2', badge: '#fecdd3' },
};

export default function BodyType() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [products, setProducts] = useState({});
  const [shopLoading, setShopLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  async function handleShopClick(item) {
    if (selectedItem?.label === item.label) { setSelectedItem(null); return; }
    setSelectedItem(item);
    if (products[item.query]) return;
    setShopLoading(true);
    try {
      const res = await fetch(`/api/search?query=${encodeURIComponent(item.query)}`);
      const data = await res.json();
      setProducts(prev => ({ ...prev, [item.query]: data.products || [] }));
    } catch {
      setProducts(prev => ({ ...prev, [item.query]: [] }));
    } finally {
      setShopLoading(false);
    }
  }

  function resizeImage(file) {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 1024;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve({ base64: e.target.result.split(',')[1], mediaType: 'image/jpeg' });
          reader.readAsDataURL(blob);
        }, 'image/jpeg', 0.88);
      };
      img.src = url;
    });
  }

  async function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    setPreview(URL.createObjectURL(file));
    setResult(null); setError(''); setLoading(true);
    try {
      const { base64, mediaType } = await resizeImage(file);
      const res = await fetch('/api/body-type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mediaType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '분석 실패');
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const theme = result ? (TYPE_THEME[result.type] || TYPE_THEME['straight']) : null;
  const typeInfo = result ? TYPES.find(t => t.key === result.type) : null;

  return (
    <div style={{ background: '#f7f8fa', minHeight: '100vh' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* 히어로 헤더 */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        padding: '56px 24px 48px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* 배경 장식 원 */}
        {[
          { w: 300, h: 300, top: -80, left: -60, op: 0.06 },
          { w: 200, h: 200, top: 20, right: -40, op: 0.05 },
          { w: 150, h: 150, bottom: -40, left: '40%', op: 0.07 },
        ].map((c, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%',
            width: c.w, height: c.h,
            top: c.top, left: c.left, right: c.right, bottom: c.bottom,
            background: 'white', opacity: c.op, pointerEvents: 'none',
          }} />
        ))}
        <div style={{
          display: 'inline-block',
          fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: 'rgba(255,255,255,0.5)', marginBottom: 16, textTransform: 'uppercase',
        }}>
          AI Body Type Analysis
        </div>
        <h1 style={{
          fontSize: 36, fontWeight: 900, color: '#fff',
          letterSpacing: '-1px', marginBottom: 14, lineHeight: 1.1,
        }}>
          체형 분석
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
          골격과 비율을 분석해 나에게 맞는 체형 유형과<br />맞춤 코디를 추천해드립니다
        </p>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* 초기 화면: 체형 카드 + 업로드 */}
        {!result && (
          <>
            {/* 체형 유형 카드 */}
            <div style={{ marginBottom: 36 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#aaa', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>
                7가지 체형 유형
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {TYPES.map(t => (
                  <div key={t.key} style={{
                    borderRadius: 14,
                    padding: '16px 14px',
                    background: '#fff',
                    border: '1px solid #eee',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    transition: 'transform 0.18s, box-shadow 0.18s',
                    cursor: 'default',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, marginBottom: 10,
                      background: t.gradient,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18,
                    }}>
                      {t.emoji}
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#222', marginBottom: 3, lineHeight: 1.4 }}>{t.name}</p>
                    <p style={{ fontSize: 11, color: '#aaa' }}>{t.rep} 타입</p>
                  </div>
                ))}
                {/* 마지막 칸: 업로드 유도 */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    borderRadius: 14, padding: '16px 14px',
                    background: 'linear-gradient(135deg,#818cf8,#f472b6)',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 6,
                    boxShadow: '0 4px 16px rgba(129,140,248,0.35)',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <div style={{ fontSize: 22 }}>📷</div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.4 }}>내 체형<br />분석하기</p>
                </div>
              </div>
            </div>

            {/* 업로드 존 */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              style={{
                border: `2px dashed ${dragOver ? '#818cf8' : '#d1d5db'}`,
                borderRadius: 20,
                padding: preview ? '24px' : '60px 24px',
                textAlign: 'center', cursor: 'pointer',
                background: dragOver ? '#f5f3ff' : '#fff',
                transition: 'all 0.2s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              {preview ? (
                <img src={preview} alt="preview" style={{ maxHeight: 280, maxWidth: '100%', borderRadius: 12, objectFit: 'cover' }} />
              ) : (
                <>
                  <div style={{
                    width: 64, height: 64, borderRadius: 18,
                    background: 'linear-gradient(135deg,#ede9fe,#fce7f3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28, margin: '0 auto 16px',
                  }}>
                    👤
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#222', marginBottom: 6 }}>전신 사진을 업로드하세요</p>
                  <p style={{ fontSize: 13, color: '#aaa' }}>어깨·허리·힙 비율이 잘 보이는 사진 권장</p>
                  <p style={{ fontSize: 12, color: '#c4b5fd', marginTop: 10, fontWeight: 600 }}>클릭 또는 드래그 앤 드롭</p>
                </>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            </div>
          </>
        )}

        {/* 로딩 */}
        {loading && (
          <div style={{ marginTop: 48, textAlign: 'center', animation: 'fadeUp 0.4s ease' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              border: '4px solid #ede9fe', borderTop: '4px solid #818cf8',
              animation: 'spin 0.9s linear infinite', margin: '0 auto 20px',
            }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: '#333', marginBottom: 6 }}>골격과 비율을 분석 중입니다</p>
            <p style={{ fontSize: 13, color: '#aaa' }}>잠시만 기다려주세요...</p>
          </div>
        )}

        {error && (
          <div style={{ marginTop: 24, padding: '14px 18px', background: '#fff0f0', border: '1px solid #fecdd3', borderRadius: 12, color: '#e11d48', fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* 결과 */}
        {result && theme && (
          <div style={{ animation: 'fadeUp 0.5s ease' }}>

            {/* 결과 히어로 카드 */}
            <div style={{
              borderRadius: 24, overflow: 'hidden',
              boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
              marginBottom: 20,
            }}>
              {/* 상단: 그라디언트 배경 */}
              <div style={{
                background: typeInfo?.gradient || '#111',
                padding: '36px 32px 28px',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', width: 200, height: 200,
                  borderRadius: '50%', background: 'rgba(255,255,255,0.07)',
                  top: -60, right: -40, pointerEvents: 'none',
                }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  {preview && (
                    <img src={preview} alt="uploaded" style={{
                      width: 80, height: 80, borderRadius: 16,
                      objectFit: 'cover', flexShrink: 0,
                      border: '2px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    }} />
                  )}
                  <div>
                    <div style={{ fontSize: 36, marginBottom: 6 }}>{result.emoji}</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                      {result.name}
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>
                      {result.representative} 타입 · {result.keyword}
                    </div>
                  </div>
                  {/* 신뢰도 뱃지 */}
                  <div style={{
                    marginLeft: 'auto', flexShrink: 0,
                    padding: '6px 14px', borderRadius: 99,
                    background: 'rgba(255,255,255,0.15)',
                    fontSize: 12, fontWeight: 700, color: '#fff',
                    backdropFilter: 'blur(4px)',
                  }}>
                    신뢰도 {result.confidence}
                  </div>
                </div>
              </div>

              {/* 하단: 분석 이유 */}
              <div style={{
                background: '#fff', padding: '22px 32px',
                borderTop: '1px solid rgba(0,0,0,0.06)',
              }}>
                <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8 }}>{result.reason}</p>
              </div>
            </div>

            {/* 체형 설명 */}
            <div style={{
              background: '#fff', borderRadius: 18, padding: '22px 26px',
              marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              borderLeft: `4px solid ${typeInfo?.gradient.match(/#[a-f0-9]{6}/i)?.[0] || '#818cf8'}`,
            }}>
              <p style={{ fontSize: 14, color: '#444', lineHeight: 1.8 }}>{result.description}</p>
            </div>

            {/* 추천 / 피해야 할 스타일 나란히 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              {/* 추천 아이템 */}
              <div style={{ background: '#fff', borderRadius: 18, padding: '22px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#111', marginBottom: 4 }}>추천 코디</h3>
                <p style={{ fontSize: 12, color: '#bbb', marginBottom: 16 }}>클릭하면 상품을 바로 확인할 수 있어요</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.recommend?.map((item, i) => {
                    const isOpen = selectedItem?.label === item.label;
                    return (
                      <div key={i}>
                        <div
                          onClick={() => handleShopClick(item)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '12px 14px',
                            background: isOpen ? '#f5f3ff' : '#f9f9f9',
                            borderRadius: isOpen ? '10px 10px 0 0' : 10,
                            border: `1px solid ${isOpen ? '#c4b5fd' : '#eee'}`,
                            borderBottom: isOpen ? '1px solid #ede9fe' : undefined,
                            cursor: 'pointer', transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = '#f5f3ff'; }}
                          onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = '#f9f9f9'; }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                              fontSize: 10, fontWeight: 800,
                              color: '#c4b5fd', minWidth: 18,
                            }}>
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#222' }}>{item.label}</span>
                          </div>
                          <span style={{ fontSize: 12, color: isOpen ? '#a78bfa' : '#818cf8', fontWeight: 600, flexShrink: 0 }}>
                            {isOpen ? '닫기' : '쇼핑 →'}
                          </span>
                        </div>
                        {isOpen && (
                          <div style={{ padding: '16px 12px', background: '#f5f3ff', border: '1px solid #c4b5fd', borderTop: 'none', borderRadius: '0 0 10px 10px' }}>
                            {shopLoading && !products[item.query] ? (
                              <div style={{ textAlign: 'center', padding: '20px 0', color: '#aaa', fontSize: 13 }}>불러오는 중...</div>
                            ) : (
                              <ProductGrid products={products[item.query] || []} query={item.query} />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 피해야 할 스타일 */}
              <div style={{ background: '#fff', borderRadius: 18, padding: '22px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#111', marginBottom: 16 }}>피해야 할 스타일</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.avoid?.map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                      padding: '12px 14px', borderRadius: 10,
                      background: '#fff1f2', border: '1px solid #fecdd3',
                    }}>
                      <span style={{ color: '#fb7185', fontWeight: 800, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✕</span>
                      <span style={{ fontSize: 13, color: '#444', lineHeight: 1.6 }}>{item}</span>
                    </div>
                  ))}
                </div>

                {/* 스타일링 팁 */}
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#111', marginTop: 20, marginBottom: 12 }}>스타일링 팁</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.tips?.map((tip, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                      padding: '12px 14px', borderRadius: 10, background: '#f9f9f9',
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#818cf8', flexShrink: 0, marginTop: 2 }}>
                        0{i + 1}
                      </span>
                      <span style={{ fontSize: 13, color: '#444', lineHeight: 1.6 }}>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 다시 분석 버튼 */}
            <button
              onClick={() => { setResult(null); setPreview(''); setSelectedItem(null); fileInputRef.current?.click(); }}
              style={{
                width: '100%', padding: '16px',
                borderRadius: 14, border: 'none',
                background: 'linear-gradient(135deg, #818cf8, #f472b6)',
                color: '#fff', fontWeight: 800, fontSize: 15,
                cursor: 'pointer', letterSpacing: '-0.3px',
                boxShadow: '0 4px 20px rgba(129,140,248,0.35)',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              다시 분석하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
