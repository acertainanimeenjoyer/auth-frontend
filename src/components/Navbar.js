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
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 16px',
      background: '#1f2937',
      borderBottom: '1px solid #111',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div style={{ color: '#fff', fontWeight: 700 }}>Auth Demo</div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <NavLink to="/" style={linkStyle}>Home</NavLink>
        {user ? (
          <>
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
