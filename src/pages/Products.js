import { useEffect, useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';

export default function Products() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const { addItem } = useCart();

  const load = async (p = 1) => {
    const { data } = await axios.get('/api/products', { params: { q, page: p, limit: 12 } });
    setItems(data.items || []);
    setPage(data.page);
    setPages(data.pages);
  };

  useEffect(() => { load(1); /* eslint-disable-next-line */ }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Products</h2>
      <div style={{ margin: '8px 0' }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…" />
        <button onClick={() => load(1)} style={{ marginLeft: 8 }}>Search</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
        {items.map(p => (
          <div key={p._id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
            <img alt={p.name} src={p.images?.[0] || 'https://via.placeholder.com/300x200'} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 6 }} />
            <h4 style={{ margin: '8px 0' }}>{p.name}</h4>
            <div style={{ fontSize: 12, color: '#666' }}>{p.category?.name}</div>
            <div style={{ marginTop: 8 }}>
              {(p.variants || []).slice(0,1).map(v => (
                <button key={v.sku} onClick={() => addItem({ productId: p._id, sku: v.sku, quantity: 1 })}>
                  Add to Cart — ${v.price}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        <button disabled={page<=1} onClick={() => load(page-1)}>Prev</button>
        <span style={{ margin: '0 8px' }}>Page {page} / {pages}</span>
        <button disabled={page>=pages} onClick={() => load(page+1)}>Next</button>
      </div>
    </div>
  );
}
