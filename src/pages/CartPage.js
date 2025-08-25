import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';

export default function CartPage() {
  const { cart, updateItem, removeItem, clear } = useCart();
  const navigate = useNavigate();

  const subtotal = (cart.items || []).reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = Math.round(subtotal * 0.1 * 100) / 100;
  const grand = Math.round((subtotal + shipping + tax) * 100) / 100;

  return (
    <div style={{ padding: 16 }}>
      <h2>Your Cart</h2>
      {cart.items?.length ? (
        <>
          {cart.items.map(i => (
            <div key={i._id} style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
              <div>SKU: {i.sku}</div>
              <div>Price: ${i.price}</div>
              <div>
                Qty:
                <input type="number" min="1" value={i.quantity} onChange={e => updateItem(i._id, Number(e.target.value))} style={{ width: 60, marginLeft: 8 }} />
                <button onClick={() => removeItem(i._id)} style={{ marginLeft: 8 }}>Remove</button>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 12 }}>
            <div>Subtotal: ${subtotal.toFixed(2)}</div>
            <div>Shipping: ${shipping.toFixed(2)}</div>
            <div>Tax: ${tax.toFixed(2)}</div>
            <strong>Total: ${grand.toFixed(2)}</strong>
          </div>
          <div style={{ marginTop: 12 }}>
            <button onClick={() => navigate('/checkout')}>Checkout</button>
            <button onClick={clear} style={{ marginLeft: 8 }}>Clear</button>
          </div>
        </>
      ) : (
        <p>Cart is empty. <Link to="/products">Shop</Link></p>
      )}
    </div>
  );
}
