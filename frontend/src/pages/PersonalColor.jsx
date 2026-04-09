import { useState, useRef } from 'react';

const SEASONS = [
  { key: '봄 웜톤', emoji: '🌸', keyword: '밝고 생기있는', gradient: 'linear-gradient(135deg, #fde68a, #fb923c)', colors: ['#fde68a', '#fcd34d', '#fb923c', '#f97316', '#fbbf24'] },
  { key: '여름 쿨톤', emoji: '🩵', keyword: '부드럽고 시원한', gradient: 'linear-gradient(135deg, #bfdbfe, #a78bfa)', colors: ['#bfdbfe', '#93c5fd', '#c4b5fd', '#a78bfa', '#e0e7ff'] },
  { key: '가을 웜톤', emoji: '🍂', keyword: '깊고 따뜻한', gradient: 'linear-gradient(135deg, #fbbf24, #92400e)', colors: ['#d97706', '#b45309', '#92400e', '#78350f', '#fbbf24'] },
  { key: '겨울 쿨톤', emoji: '❄️', keyword: '선명하고 도시적인', gradient: 'linear-gradient(135deg, #6366f1, #1e1b4b)', colors: ['#6366f1', '#4f46e5', '#312e81', '#1e1b4b', '#818cf8'] },
];

export default function PersonalColor() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const fileInputRef = useRef(null);

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
    setResult(null);
    setError('');
    setLoading(true);
    try {
      const { base64, mediaType } = await resizeImage(file);
      const res = await fetch('/api/personal-color', {
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

  function handleDrop(e) {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  }

  const seasonInfo = result ? SEASONS.find(s => s.key === result.season) || SEASONS[0] : null;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 20px' }}>

      {/* 헤더 */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>
          퍼스널 컬러 진단
        </h1>
        <p style={{ color: '#888', fontSize: 14 }}>
          셀카를 업로드하면 AI가 피부톤·머리카락·눈동자를 분석해 나만의 컬러를 찾아드립니다
        </p>
      </div>

      {/* 4시즌 미리보기 (결과 없을 때만) */}
      {!result && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 32 }}>
          {SEASONS.map((s) => (
            <div key={s.key} style={{ borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ height: 72, background: s.gradient }} />
              <div style={{ padding: '10px 12px', background: '#fff', border: '1px solid #f0f0f0', borderTop: 'none', borderRadius: '0 0 14px 14px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#222', marginBottom: 2 }}>
                  {s.emoji} {s.key}
                </div>
                <div style={{ fontSize: 11, color: '#999' }}>{s.keyword}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 업로드 영역 */}
      {!result && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          style={{
            border: '2px dashed #e0e0e0', borderRadius: 16,
            padding: preview ? '20px' : '52px 24px',
            textAlign: 'center', cursor: 'pointer',
            background: '#fafafa', transition: 'border-color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#818cf8'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
        >
          {preview ? (
            <div>
              <img src={preview} alt="preview" style={{ maxHeight: 260, maxWidth: '100%', borderRadius: 12, objectFit: 'cover' }} />
              <p style={{ marginTop: 12, fontSize: 13, color: '#aaa' }}>다른 사진을 선택하려면 클릭하세요</p>
            </div>
          ) : (
            <>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #f472b6, #818cf8)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                🎨
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#222', marginBottom: 6 }}>얼굴 셀카를 업로드하세요</p>
              <p style={{ fontSize: 13, color: '#aaa' }}>피부·머리카락·눈동자가 잘 보이는 사진 권장</p>
            </>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
        </div>
      )}

      {/* 로딩 */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ display: 'inline-block', width: 40, height: 40, border: '3px solid #f0f0f0', borderTop: '3px solid #818cf8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ marginTop: 16, fontSize: 14, color: '#888' }}>퍼스널 컬러를 분석하고 있습니다...</p>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 20, padding: '12px 16px', background: '#fff0f0', border: '1px solid #ffd0d0', borderRadius: 8, color: '#d00', fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* 결과 */}
      {result && seasonInfo && (
        <div>
          {/* 상단: 사진 + 시즌 결과 */}
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 20, marginBottom: 28 }}>
            <img src={preview} alt="uploaded" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 16, border: '1px solid #eee' }} />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 99, background: '#f5f5f5', fontSize: 12, color: '#888', marginBottom: 12, width: 'fit-content' }}>
                {result.tone}
              </div>
              <div style={{ fontSize: 32, marginBottom: 4 }}>{seasonInfo.emoji}</div>
              <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8, color: '#111' }}>
                {result.season}
              </h2>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7, marginBottom: 16 }}>
                {result.skinAnalysis}
              </p>
              <div style={{ display: 'flex', gap: 6 }}>
                {seasonInfo.colors.map((c, i) => (
                  <div key={i} style={{ width: 28, height: 28, borderRadius: 8, background: c, border: '1px solid rgba(0,0,0,0.06)' }} />
                ))}
              </div>
            </div>
          </div>

          {/* 설명 */}
          <div style={{ padding: '18px 20px', background: '#f9f9f9', borderRadius: 12, marginBottom: 24, fontSize: 14, color: '#444', lineHeight: 1.8 }}>
            {result.description}
          </div>

          {/* 어울리는 색상 / 피해야 할 색상 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: 14, border: '1px solid #dcfce7' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', marginBottom: 14 }}>잘 어울리는 색상</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {result.bestColors?.map((color, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: result.bestColorHex?.[i] || '#ccc', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }} />
                    <span style={{ fontSize: 11, color: '#555' }}>{color}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '20px', background: '#fff1f2', borderRadius: 14, border: '1px solid #fecdd3' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#e11d48', marginBottom: 14 }}>피해야 할 색상</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {result.worstColors?.map((color, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: result.worstColorHex?.[i] || '#ccc', border: '1px solid rgba(0,0,0,0.07)', opacity: 0.6 }} />
                    <span style={{ fontSize: 11, color: '#888' }}>{color}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 패션 팁 */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#111' }}>패션 팁</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {result.fashionTips?.map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '13px 16px', background: '#fff', borderRadius: 10, border: '1px solid #f0f0f0' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', flexShrink: 0, marginTop: 1 }}>0{i + 1}</span>
                  <span style={{ fontSize: 14, color: '#444', lineHeight: 1.6 }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 비슷한 연예인 */}
          {result.matchingCelebrities?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#111' }}>비슷한 퍼스널 컬러 연예인</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {result.matchingCelebrities.map((celeb, i) => (
                  <span key={i} style={{ padding: '7px 16px', borderRadius: 99, background: '#f5f5f5', color: '#333', fontSize: 13, fontWeight: 600, border: '1px solid #eee' }}>
                    {celeb}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => { setResult(null); setPreview(''); }}
            style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #f472b6, #818cf8)',
              color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer',
            }}
          >
            다시 진단하기
          </button>
        </div>
      )}
    </div>
  );
}
