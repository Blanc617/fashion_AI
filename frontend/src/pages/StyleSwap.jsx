import { useState, useRef } from 'react';

const STYLE_COLORS = {
  '미니멀': '#111', '캐주얼': '#6366f1', '페미닌': '#ec4899',
  '걸리시': '#f59e0b', '포멀': '#059669', '스트릿': '#ef4444',
};

const CATEGORY_ICON = {
  '아우터': '🧥', '상의': '👕', '하의': '👖',
  '신발': '👟', '가방': '👜', '액세서리': '💍',
};

export default function StyleSwap() {
  const [sideA, setSideA] = useState({ file: null, preview: null, name: '' });
  const [sideB, setSideB] = useState({ file: null, preview: null, name: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('A'); // 'A' or 'B' swap 결과 탭
  const refA = useRef();
  const refB = useRef();

  function handleFile(side, file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target.result;
      if (side === 'A') setSideA(s => ({ ...s, file, preview }));
      else setSideB(s => ({ ...s, file, preview }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSwap() {
    if (!sideA.file || !sideB.file) {
      setError('두 장의 사진을 모두 업로드해주세요.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    function toBase64(dataUrl) {
      return dataUrl.split(',')[1];
    }
    function getMediaType(dataUrl) {
      return dataUrl.split(';')[0].split(':')[1];
    }

    try {
      const res = await fetch('/api/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageA: toBase64(sideA.preview),
          mediaTypeA: getMediaType(sideA.preview),
          nameA: sideA.name || 'A',
          imageB: toBase64(sideB.preview),
          mediaTypeB: getMediaType(sideB.preview),
          nameB: sideB.name || 'B',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '분석 실패');
      setResult(data);
      setActiveTab('A');
      window.scrollTo({ top: 400, behavior: 'smooth' });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 20px 80px' }}>
      <header style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}>
          스타일 스왑
        </h1>
        <p style={{ color: '#888', fontSize: 14, marginTop: 6 }}>
          두 사람의 패션 사진을 올리면 AI가 서로 옷을 바꿔입혀 드립니다
        </p>
      </header>

      {/* 업로드 영역 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center', marginBottom: 32 }}>
        <UploadZone
          label="사진 A"
          side={sideA}
          onChange={(f) => handleFile('A', f)}
          onNameChange={(n) => setSideA(s => ({ ...s, name: n }))}
          inputRef={refA}
        />

        {/* 스왑 아이콘 */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 28, color: '#ccc', lineHeight: 1 }}>⇄</div>
          <p style={{ fontSize: 11, color: '#ccc', marginTop: 4 }}>SWAP</p>
        </div>

        <UploadZone
          label="사진 B"
          side={sideB}
          onChange={(f) => handleFile('B', f)}
          onNameChange={(n) => setSideB(s => ({ ...s, name: n }))}
          inputRef={refB}
        />
      </div>

      {/* 분석 버튼 */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <button
          onClick={handleSwap}
          disabled={loading || !sideA.file || !sideB.file}
          style={{
            padding: '14px 48px',
            borderRadius: 12,
            background: loading || !sideA.file || !sideB.file ? '#eee' : '#111',
            color: loading || !sideA.file || !sideB.file ? '#aaa' : '#fff',
            fontSize: 15,
            fontWeight: 600,
            border: 'none',
            cursor: loading || !sideA.file || !sideB.file ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {loading ? '분석 중...' : '옷 바꿔입기 ✦'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px', background: '#fff0f0',
          border: '1px solid #ffd0d0', borderRadius: 8,
          color: '#d00', fontSize: 14, marginBottom: 24,
        }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spinner />
          <p style={{ color: '#888', fontSize: 14, marginTop: 16 }}>
            AI가 옷을 합성하고 있어요...
          </p>
          <p style={{ color: '#bbb', fontSize: 12, marginTop: 6 }}>
            보통 30~60초 정도 걸려요
          </p>
        </div>
      )}

      {/* 결과 */}
      {result && !loading && (
        <SwapResult
          result={result}
          previewA={sideA.preview}
          previewB={sideB.preview}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          nameA={sideA.name || 'A'}
          nameB={sideB.name || 'B'}
        />
      )}
    </div>
  );
}

function UploadZone({ label, side, onChange, onNameChange, inputRef }) {
  const [dragging, setDragging] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) onChange(file);
  }

  return (
    <div>
      {/* 이름 입력 */}
      <input
        type="text"
        value={side.name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder={`이름 입력 (예: 카리나)`}
        style={{
          width: '100%', padding: '9px 12px', borderRadius: 8,
          border: '1px solid #ddd', fontSize: 13, marginBottom: 10,
          outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
        }}
        onFocus={e => e.target.style.borderColor = '#111'}
        onBlur={e => e.target.style.borderColor = '#ddd'}
      />

      {/* 드롭존 */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? '#111' : '#ddd'}`,
          borderRadius: 16,
          aspectRatio: '3/4',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
          background: dragging ? '#f8f8f8' : '#fafafa',
          transition: 'all 0.15s',
          position: 'relative',
        }}
      >
        {side.preview ? (
          <img
            src={side.preview}
            alt={label}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <>
            <div style={{ fontSize: 36, marginBottom: 12, color: '#ccc' }}>+</div>
            <p style={{ fontSize: 13, color: '#aaa', fontWeight: 600 }}>{label} 업로드</p>
            <p style={{ fontSize: 12, color: '#ccc', marginTop: 4 }}>클릭 또는 드래그</p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => onChange(e.target.files[0])}
      />
    </div>
  );
}

function SwapResult({ result, previewA, previewB, activeTab, setActiveTab, nameA, nameB }) {
  const { personA, personB, swapA, swapB, generatedA, generatedB } = result;
  const swapData = activeTab === 'A' ? swapA : swapB;
  const swapPerson = activeTab === 'A' ? personA : personB;
  const originalPerson = activeTab === 'A' ? personB : personA;
  const swapPreview = activeTab === 'A' ? previewA : previewB;
  const generatedImage = activeTab === 'A' ? generatedA : generatedB;

  return (
    <div>
      {/* 원본 스타일 요약 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
        {[{ p: personA, preview: previewA }, { p: personB, preview: previewB }].map(({ p, preview }) => (
          <div key={p.name} style={{
            border: '1px solid #eee', borderRadius: 16, overflow: 'hidden', background: '#fff',
          }}>
            <div style={{ display: 'flex', gap: 16, padding: 16, alignItems: 'flex-start' }}>
              <img src={preview} alt={p.name} style={{
                width: 72, height: 90, objectFit: 'cover', borderRadius: 10, flexShrink: 0,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                    background: STYLE_COLORS[p.outfit.style] || '#111', color: '#fff',
                  }}>
                    {p.outfit.style}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6, marginBottom: 6 }}>
                  {p.outfit.summary}
                </p>
                <p style={{ fontSize: 12, color: '#aaa', fontStyle: 'italic' }}>{p.outfit.mood}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 스왑 결과 탭 */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#888', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          스타일 스왑 결과
        </p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['A', 'B'].map(tab => {
            const person = tab === 'A' ? personA : personB;
            const other = tab === 'A' ? personB : personA;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 20px', borderRadius: 20, cursor: 'pointer',
                  border: isActive ? 'none' : '1px solid #ddd',
                  background: isActive ? '#111' : '#fff',
                  color: isActive ? '#fff' : '#555',
                  fontSize: 13, fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.15s',
                }}
              >
                {person.name} → {other.name}의 옷
              </button>
            );
          })}
        </div>

        {/* 합성 이미지 + 원본 비교 */}
        {(generatedImage || swapPreview) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {/* 원본 */}
            <div style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', background: '#f0f0f0' }}>
              <img src={swapPreview} alt="원본"
                style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }} />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                padding: '24px 12px 10px', textAlign: 'center',
              }}>
                <p style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{swapPerson.name} 원본</p>
              </div>
            </div>

            {/* 합성 결과 */}
            <div style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', background: '#f0f0f0' }}>
              {generatedImage ? (
                <>
                  <img src={generatedImage} alt="합성 결과"
                    style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }} />
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    padding: '24px 12px 10px', textAlign: 'center',
                  }}>
                    <p style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>
                      {swapPerson.name} × {originalPerson.name}의 옷 ✦
                    </p>
                  </div>
                </>
              ) : (
                <div style={{
                  width: '100%', aspectRatio: '3/4', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: 8,
                }}>
                  <p style={{ fontSize: 13, color: '#aaa' }}>합성 실패</p>
                  <p style={{ fontSize: 11, color: '#ccc' }}>다시 시도해보세요</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 스왑 카드 */}
        <div style={{ border: '1px solid #eee', borderRadius: 20, overflow: 'hidden', background: '#fff' }}>
          <div style={{ display: 'flex', gap: 0, alignItems: 'stretch' }}>
            {/* 스왑 설명 */}
            <div style={{ flex: 1, padding: 24 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#f5f5f5', borderRadius: 20, padding: '4px 12px',
                fontSize: 12, color: '#555', marginBottom: 16,
              }}>
                ✦ {swapPerson.name} → {originalPerson.name}의 옷
              </div>

              <p style={{ fontSize: 14, lineHeight: 1.8, color: '#333', marginBottom: 12 }}>
                {swapData.description}
              </p>

              <div style={{
                padding: '12px 16px', background: '#f9f9f9',
                borderRadius: 10, fontSize: 13, color: '#666',
                lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic',
              }}>
                💬 {swapData.styleComment}
              </div>

              {/* 아이템 리스트 */}
              <p style={{ fontSize: 12, fontWeight: 600, color: '#aaa', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                착용 아이템
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {swapData.items.map((item, i) => (
                  <a
                    key={i}
                    href={`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(item.searchQuery)}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', borderRadius: 10,
                      border: '1px solid #eee', background: '#fff',
                      textDecoration: 'none', color: 'inherit',
                      transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#111'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#eee'}
                  >
                    <span style={{ fontSize: 20 }}>{CATEGORY_ICON[item.category] || '👗'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</span>
                        <span style={{ fontSize: 11, color: '#aaa' }}>{item.color}</span>
                      </div>
                      <p style={{ fontSize: 12, color: '#888', marginTop: 1 }}>{item.description}</p>
                    </div>
                    <span style={{ fontSize: 11, color: '#aaa', flexShrink: 0 }}>쇼핑 →</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: 'inline-block' }}>
      <div style={{
        width: 36, height: 36,
        border: '3px solid #eee', borderTop: '3px solid #111',
        borderRadius: '50%', animation: 'spin 0.8s linear infinite',
      }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
