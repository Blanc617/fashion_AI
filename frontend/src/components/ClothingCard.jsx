const CATEGORY_ICON = {
  '아우터': '🧥',
  '상의': '👕',
  '하의': '👖',
  '신발': '👟',
  '가방': '👜',
  '액세서리': '💍',
};

const TIER_STYLE = {
  '럭셔리': { background: '#111', color: '#fff', label: '✦ 럭셔리' },
  '중가':   { background: '#e8f0fe', color: '#1a56db', label: '● 중가' },
  '저가':   { background: '#f0fdf4', color: '#16a34a', label: '● 저가' },
};

export default function ClothingCard({ item, bookmarked = false, onBookmark }) {
  const shoppingUrl = `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(item.searchQuery)}`;
  const icon = CATEGORY_ICON[item.category] || '👗';
  const tier = TIER_STYLE[item.priceTier];

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #eee',
      borderRadius: 12,
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 10,
        background: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24,
        flexShrink: 0,
      }}>
        {icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {item.category}
          </span>
          {tier && (
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 20,
              background: tier.background,
              color: tier.color,
              letterSpacing: '0.3px',
            }}>
              {tier.label}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '2px 0 3px' }}>
          <p style={{ fontWeight: 600, fontSize: 15 }}>{item.name}</p>
          {item.brand && (
            <span style={{ fontSize: 12, color: '#999' }}>{item.brand}</span>
          )}
        </div>

        <p style={{ fontSize: 13, color: '#555', marginBottom: 6 }}>{item.description}</p>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <Tag label={`색상: ${item.color}`} />
          <Tag label={`소재: ${item.material}`} />
          {item.estimatedPrice > 0 && (
            <span style={{ fontSize: 12, fontWeight: 600, color: '#111', marginLeft: 2 }}>
              약 {item.estimatedPrice.toLocaleString('ko-KR')}원
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        {onBookmark && (
          <button
            onClick={onBookmark}
            title={bookmarked ? '저장 해제' : '스타일북에 저장'}
            style={{
              padding: '8px 10px',
              borderRadius: 8,
              border: bookmarked ? '1px solid #f472b6' : '1px solid #ddd',
              background: bookmarked ? '#fff0f7' : '#fff',
              color: bookmarked ? '#ec4899' : '#bbb',
              fontSize: 16,
              cursor: 'pointer',
              transition: 'all 0.18s',
            }}
            onMouseEnter={(e) => { if (!bookmarked) { e.currentTarget.style.borderColor = '#f9a8d4'; e.currentTarget.style.color = '#ec4899'; } }}
            onMouseLeave={(e) => { if (!bookmarked) { e.currentTarget.style.borderColor = '#ddd'; e.currentTarget.style.color = '#bbb'; } }}
          >
            {bookmarked ? '🔖' : '🔖'}
          </button>
        )}
        <a
          href={shoppingUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            flexShrink: 0,
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #111',
            background: '#fff',
            color: '#111',
            fontSize: 13,
            fontWeight: 500,
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
            display: 'inline-block',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#111'; }}
        >
          네이버 쇼핑 검색 →
        </a>
      </div>
    </div>
  );
}

function Tag({ label }) {
  return (
    <span style={{
      fontSize: 12,
      padding: '2px 8px',
      background: '#f0f0f0',
      borderRadius: 20,
      color: '#555',
    }}>
      {label}
    </span>
  );
}
