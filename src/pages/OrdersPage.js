import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';

export function OrdersList() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    axios.get('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
      .then(({data}) => setOrders(data));
  }, [token]);
  return (
    <div style={{ padding: 16 }}>
      <h2>My Orders</h2>
      {orders.map(o => (
        <div key={o._id} style={{ border: '1px solid #eee', marginBottom: 8, padding: 8 }}>
          <div>#{o._id}</div>
          <div>Status: {o.status} | Payment: {o.payment?.status}</div>
          <div>Items: {o.items.length} | Total: ${o.totals?.grandTotal}</div>
        </div>
      ))}
    </div>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const [o, setO] = useState(null);
  useEffect(() => {
    axios.get(`/api/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({data}) => setO(data)).catch(()=>{});
  }, [id, token]);
  if (!o) return <div style={{ padding: 16 }}>Loading…</div>;
  return (
    <div style={{ padding: 16 }}>
      <h2>Order #{o._id}</h2>
      <div>Status: {o.status} — Payment: {o.payment?.status}</div>
      <ul>
        {o.items.map((it, idx) => (
          <li key={idx}>{it.name} ({it.sku}) x {it.quantity} — ${it.price}</li>
        ))}
      </ul>
      <div>Total: ${o.totals?.grandTotal}</div>
    </div>
  );
}
