import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [sku, setSku] = useState('');
  const { addItem } = useCart();

  useEffect(() => {
    axios.get(`/api/products/${id}`).then(({ data }) => {
      setP(data);
      setSku(data.variants?.[0]?.sku || '');
    });
  }, [id]);

  if (!p) return <div style={{ padding: 16 }}>Loading…</div>;

  const selected = p.variants.find(v => v.sku === sku);

  return (
    <div style={{ padding: 16 }}>
      <h2>{p.name}</h2>
      <div style={{ display: 'flex', gap: 16 }}>
        <img alt={p.name} src={p.images?.[0] || 'https://via.placeholder.com/400x300'} style={{ width: 400, height: 300, objectFit: 'cover' }} />
        <div>
          <p>{p.description}</p>
          <div>
            <label>Variant: </label>
            <select value={sku} onChange={e => setSku(e.target.value)}>
              {p.variants.map(v => (
                <option key={v.sku} value={v.sku}>
                  {v.size || ''} {v.color || ''} — ${v.price} — stock {v.stock}
                </option>
              ))}
            </select>
          </div>
          <button disabled={!selected || selected.stock < 1} onClick={() => addItem({ productId: p._id, sku, quantity: 1 })} style={{ marginTop: 10 }}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
