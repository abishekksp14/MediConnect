import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Doctors from './pages/Doctors';
import DoctorProfile from './pages/DoctorProfile';
import HowItWorks from './pages/HowItWorks';
import BookAppointment from './pages/BookAppointment';
import DashboardRouter from './pages/DashboardRouter';
import VideoRoom from './pages/VideoRoom';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Landing />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="doctors" element={<Doctors />} />
            <Route path="doctor/:id" element={<DoctorProfile />} />
            <Route path="book/:doctorId" element={<BookAppointment />} />
            <Route path="dashboard" element={<DashboardRouter />} />
            <Route path="room/:roomId" element={<VideoRoom />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
