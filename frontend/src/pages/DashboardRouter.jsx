import { useSelector } from 'react-redux';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';

const DashboardRouter = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return null;

  if (user.role === 'doctor') {
    return <DoctorDashboard />;
  }

  // Default to patient dashboard
  return <PatientDashboard />;
};

export default DashboardRouter;
