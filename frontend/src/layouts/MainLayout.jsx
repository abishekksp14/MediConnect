import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const MainLayout = () => {
  return (
    <div className="main-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <footer style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--dark)', color: 'white', marginTop: 'auto' }}>
        <p>&copy; {new Date().getFullYear()} MediConnect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default MainLayout;
