import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const linkStyle = ({ isActive }) => ({
  padding: '8px 12px',
  borderRadius: 6,
  textDecoration: 'none',
  color: isActive ? '#111' : '#fff',
  background: isActive ? '#ffd54f' : 'transparent',
  marginRight: 8
});

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        background: '#1f2937',
        borderBottom: '1px solid #111',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}
    >
      {/* Brand */}
      <div style={{ color: '#fff', fontWeight: 700 }}>
        MERN Shop + Chat
      </div>

      {/* Left links (public) */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <NavLink to="/" style={linkStyle}>Home</NavLink>
        <NavLink to="/products" style={linkStyle}>Products</NavLink>
        {/* Show Chat link only when logged in */}
        {user && <NavLink to="/chat" style={linkStyle}>Chat</NavLink>}
        {/* Cart/Orders require auth (they’ll also be protected by routes) */}
        {user && <NavLink to="/cart" style={linkStyle}>Cart</NavLink>}
        {user && <NavLink to="/orders" style={linkStyle}>Orders</NavLink>}
        {/* Admin link only for admins */}
        {user?.isAdmin && <NavLink to="/admin" style={linkStyle}>Admin</NavLink>}
      </div>

      {/* Right side: auth controls */}
      <div style={{ display: 'flex', alignItems: 'center', color: '#fff' }}>
        {user ? (
          <>
            <span style={{ marginRight: 10, opacity: 0.9 }}>
              Logged in as <strong>{user.username}</strong>
            </span>
            <NavLink to="/profile" style={linkStyle}>Profile</NavLink>
            <button
              onClick={handleLogout}
              style={{
                marginLeft: 8,
                padding: '8px 12px',
                borderRadius: 6,
                border: 'none',
                background: '#ef4444',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" style={linkStyle}>Login</NavLink>
            <NavLink to="/register" style={linkStyle}>Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
