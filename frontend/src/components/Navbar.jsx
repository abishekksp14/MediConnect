import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Activity, LogOut, Settings, Moon, Sun } from 'lucide-react';
import { logoutUser } from '../features/authSlice';
import { useToast } from './ToastProvider';
import { useTheme } from '../contexts/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
    } finally {
      addToast('You have been logged out.', 'info');
      navigate('/');
    }
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          <Activity size={28} color="var(--primary)" />
          <span>MediConnect</span>
        </Link>
        <div className="navbar-links">
          <NavLink to="/doctors" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Find Doctors
          </NavLink>
          <NavLink to="/how-it-works" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            How it Works
          </NavLink>
        </div>
        <div className="navbar-auth">
          <button onClick={toggleTheme} className="btn btn-secondary icon-link" style={{ marginRight: '0.75rem', padding: '0.5rem' }} title="Toggle Theme">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ marginRight: '0.5rem' }}>
                Dashboard
              </NavLink>
              <NavLink to="/settings" className={({ isActive }) => `nav-link icon-link ${isActive ? 'active' : ''}`} title="Settings">
                <Settings size={18} />
              </NavLink>
              <div className="user-chip">
                <div className="user-avatar">{user?.name?.charAt(0) || 'U'}</div>
                <span>{user?.name?.split(' ')[0] || 'User'}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary logout-btn">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" style={{ marginRight: '0.75rem' }}>Log In</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
