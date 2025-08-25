import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function AdminPanel() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get('/api/orders/admin/all', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setOrders(data))
      .catch(() => alert('Admin only'));
  }, [token]);

  const updateStatus = async (id, status) => {
    const { data } = await axios.put(`/api/orders/admin/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
    setOrders(prev => prev.map(o => o._id === id ? data : o));
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Admin Panel</h2>
      {orders.map(o => (
        <div key={o._id} style={{ border: '1px solid #eee', marginBottom: 8, padding: 8 }}>
          <div>#{o._id} — {o.status} — ${o.totals?.grandTotal}</div>
          <button onClick={() => updateStatus(o._id, 'confirmed')}>Confirm</button>
          <button onClick={() => updateStatus(o._id, 'shipped')} style={{ marginLeft: 8 }}>Ship</button>
          <button onClick={() => updateStatus(o._id, 'delivered')} style={{ marginLeft: 8 }}>Deliver</button>
        </div>
      ))}
    </div>
  );
}
