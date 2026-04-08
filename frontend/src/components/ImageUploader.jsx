import { useRef, useState } from 'react';

// 긴 쪽이 maxPx를 넘으면 축소, 이미 작으면 그대로 반환
function resizeImage(file, maxPx = 1024) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { naturalWidth: w, naturalHeight: h } = img;
      const scale = Math.min(1, maxPx / Math.max(w, h));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      resolve({ base64: dataUrl.split(',')[1], mediaType: 'image/jpeg' });
    };
    img.src = url;
  });
}

export default function ImageUploader({ onAnalyze, loading }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }

  function handleChange(e) {
    handleFile(e.target.files[0]);
  }

  async function handleSubmit() {
    if (!selectedFile) return;
    const { base64, mediaType } = await resizeImage(selectedFile, 1024);
    onAnalyze(base64, mediaType, previewUrl);
  }

  return (
    <div>
      <div
        onClick={() => !loading && inputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        style={{
          border: `2px dashed ${dragOver ? '#111' : '#ddd'}`,
          borderRadius: 12,
          padding: '48px 24px',
          textAlign: 'center',
          cursor: loading ? 'default' : 'pointer',
          background: dragOver ? '#f5f5f5' : '#fff',
          transition: 'all 0.2s',
        }}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="미리보기"
            style={{ maxHeight: 300, maxWidth: '100%', borderRadius: 8, objectFit: 'contain' }}
          />
        ) : (
          <>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
            <p style={{ fontWeight: 500, marginBottom: 4 }}>사진을 드래그하거나 클릭하여 업로드</p>
            <p style={{ fontSize: 13, color: '#aaa' }}>JPG, PNG, WEBP 지원</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleChange}
        />
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        {previewUrl && (
          <button
            onClick={() => { setSelectedFile(null); setPreviewUrl(''); }}
            disabled={loading}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: '1px solid #ddd',
              background: '#fff',
              fontSize: 14,
              color: '#666',
            }}
          >
            다시 선택
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!selectedFile || loading}
          style={{
            flex: previewUrl ? 1 : undefined,
            width: previewUrl ? undefined : '100%',
            padding: '10px 24px',
            borderRadius: 8,
            border: 'none',
            background: selectedFile && !loading ? '#111' : '#ccc',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            transition: 'background 0.2s',
          }}
        >
          {loading ? '분석 중...' : '분석 시작'}
        </button>
      </div>
    </div>
  );
}
