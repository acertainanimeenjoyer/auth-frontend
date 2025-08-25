import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function CheckoutPage() {
  const { token } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [addr, setAddr] = useState({ fullName:'', line1:'', line2:'', city:'', state:'', postalCode:'', country:'', phone:'' });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const headers = { Authorization: `Bearer ${token}` };

  const submit = async (e) => {
    e.preventDefault();
    if (!cart.items?.length) return alert('Cart empty');
    try {
      const { data } = await axios.post('/api/orders/checkout', { shippingAddress: addr, paymentMethod }, { headers });
      alert('Order placed!');
      navigate(`/orders/${data._id}`);
    } catch (e) {
      alert(e.response?.data?.message || 'Checkout failed');
    }
  };

  return (
    <form onSubmit={submit} style={{ padding: 16, maxWidth: 600 }}>
      <h2>Checkout</h2>
      <input placeholder="Full name" value={addr.fullName} onChange={e=>setAddr({...addr, fullName:e.target.value})} required />
      <input placeholder="Line 1" value={addr.line1} onChange={e=>setAddr({...addr, line1:e.target.value})} required />
      <input placeholder="Line 2" value={addr.line2} onChange={e=>setAddr({...addr, line2:e.target.value})} />
      <input placeholder="City" value={addr.city} onChange={e=>setAddr({...addr, city:e.target.value})} required />
      <input placeholder="State" value={addr.state} onChange={e=>setAddr({...addr, state:e.target.value})} />
      <input placeholder="Postal Code" value={addr.postalCode} onChange={e=>setAddr({...addr, postalCode:e.target.value})} required />
      <input placeholder="Country" value={addr.country} onChange={e=>setAddr({...addr, country:e.target.value})} required />
      <input placeholder="Phone" value={addr.phone} onChange={e=>setAddr({...addr, phone:e.target.value})} />
      <div style={{ margin: '8px 0' }}>
        Payment:
        <select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)}>
          <option value="cod">Cash on Delivery</option>
        </select>
      </div>
      <button type="submit">Place Order</button>
    </form>
  );
}
