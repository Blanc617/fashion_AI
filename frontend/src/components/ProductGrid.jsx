export default function ProductGrid({ products, query }) {
  if (!products || products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '12px 0' }}>
        <p style={{ fontSize: 13, color: '#aaa', marginBottom: 8 }}>검색 결과가 없습니다.</p>
        <a
          href={`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(query)}`}
          target="_blank"
          rel="noreferrer"
          style={{
            fontSize: 13,
            color: '#111',
            textDecoration: 'underline',
          }}
        >
          네이버 쇼핑에서 직접 검색하기 →
        </a>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10,
      }}>
        {products.map((product, i) => (
          <a
            key={i}
            href={product.link}
            target="_blank"
            rel="noreferrer"
            style={{
              background: '#fff',
              borderRadius: 10,
              border: '1px solid #eee',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'box-shadow 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ aspectRatio: '1', overflow: 'hidden', background: '#f5f5f5' }}>
              <img
                src={product.image}
                alt={product.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <div style={{ padding: '10px 10px 12px' }}>
              <p style={{
                fontSize: 12,
                color: '#333',
                marginBottom: 6,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.4,
              }}>
                {product.title}
              </p>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>
                {product.price}원
              </p>
              {product.mallName && (
                <p style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{product.mallName}</p>
              )}
            </div>
          </a>
        ))}
      </div>
      <div style={{ marginTop: 10, textAlign: 'right' }}>
        <a
          href={`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(query)}`}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: 12, color: '#888' }}
        >
          네이버 쇼핑에서 더 보기 →
        </a>
      </div>
    </div>
  );
}
