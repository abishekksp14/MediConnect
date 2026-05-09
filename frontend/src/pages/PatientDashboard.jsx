import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchPatientAppointments } from '../features/appointmentSlice';
import { fetchPatientPrescriptions } from '../features/prescriptionSlice';
import { useToast } from '../components/ToastProvider';
import { SkeletonCard } from '../components/Skeleton';
import { Video, Calendar, Clock, CheckCircle, DollarSign, FileText, MessageSquare, Plus, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import AISymptomChecker from '../components/AISymptomChecker';
import './Dashboard.css';

const PatientDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { list: appointments, status } = useSelector((state) => state.appointments);
  const { list: prescriptions } = useSelector((state) => state.prescriptions);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchPatientAppointments(user._id));
      dispatch(fetchPatientPrescriptions(user._id));
    }
  }, [dispatch, user]);

  const downloadPrescriptionPDF = (rx) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('MediConnect', 20, 20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Digital Prescription', 20, 30);
    doc.line(20, 35, 190, 35);
    doc.setFontSize(11);
    doc.text(`Patient: ${user?.name}`, 20, 45);
    doc.text(`Doctor: ${rx.doctor?.name}`, 20, 53);
    doc.text(`Date: ${new Date(rx.createdAt).toLocaleDateString()}`, 20, 61);
    doc.line(20, 67, 190, 67);
    doc.setFont('helvetica', 'bold');
    doc.text('Diagnosis:', 20, 77);
    doc.setFont('helvetica', 'normal');
    doc.text(rx.diagnosis, 20, 85);
    doc.setFont('helvetica', 'bold');
    doc.text('Medicines:', 20, 97);
    doc.setFont('helvetica', 'normal');
    rx.medicines?.forEach((med, i) => {
      const y = 105 + i * 20;
      doc.text(`${i + 1}. ${med.name} — ${med.dosage}`, 20, y);
      doc.text(`   Frequency: ${med.frequency} | Duration: ${med.duration}`, 20, y + 8);
    });
    if (rx.advice) {
      const advY = 110 + (rx.medicines?.length || 0) * 20;
      doc.setFont('helvetica', 'bold');
      doc.text('Advice:', 20, advY);
      doc.setFont('helvetica', 'normal');
      doc.text(rx.advice, 20, advY + 8);
    }
    doc.save(`prescription-${rx._id}.pdf`);
  };

  // Derived Statistics
  const now = new Date();
  
  const upcomingApts = appointments.filter(apt => {
    const aptDate = new Date(`${apt.date.split('T')[0]}T${apt.timeSlot}:00`);
    return aptDate >= now && apt.status !== 'cancelled';
  });

  const pastApts = appointments.filter(apt => {
    const aptDate = new Date(`${apt.date.split('T')[0]}T${apt.timeSlot}:00`);
    return aptDate < now || apt.status === 'completed' || apt.status === 'cancelled';
  });

  const totalSpent = appointments.reduce((sum, apt) => sum + (apt.fee || 0), 0);

  return (
    <div className="dashboard-page bg-gray">
      <div className="dashboard-header bg-primary-light">
        <div className="container">
          <div className="d-flex justify-between align-items-center">
            <div>
              <h1>Welcome back, {user?.name?.split(' ')[0]}!</h1>
              <p>Here is an overview of your health journey.</p>
            </div>
            <Link to="/doctors" className="btn btn-primary d-flex align-items-center gap-sm">
              <Plus size={18} /> Book New Appointment
            </Link>
          </div>
        </div>
      </div>

      <div className="container dashboard-content">
        {/* Stats Row */}
        <div className="stats-grid animate-fade-in">
          <div className="stat-card">
            <div className="stat-icon" style={{backgroundColor: '#e0f2fe', color: '#0ea5e9'}}>
              <Calendar size={24} />
            </div>
            <div className="stat-info">
              <h3>{appointments.length}</h3>
              <p>Total Appointments</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{backgroundColor: '#fef3c7', color: '#d97706'}}>
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <h3>{upcomingApts.length}</h3>
              <p>Upcoming</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{backgroundColor: '#d1fae5', color: '#059669'}}>
              <CheckCircle size={24} />
            </div>
            <div className="stat-info">
              <h3>{pastApts.length}</h3>
              <p>Completed</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{backgroundColor: '#f3e8ff', color: '#9333ea'}}>
              <DollarSign size={24} />
            </div>
            <div className="stat-info">
              <h3>${totalSpent}</h3>
              <p>Total Spent</p>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Main Column */}
          <div className="main-col">
            <section className="dashboard-section animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="section-header">
                <h2>Upcoming Consultations</h2>
              </div>
              
              {status === 'loading' && <p>Loading...</p>}
              
              {status === 'succeeded' && upcomingApts.length === 0 && (
                <div className="empty-state">
                  <Calendar size={48} color="var(--text-muted)" style={{opacity: 0.5, marginBottom: '1rem'}} />
                  <p>You have no upcoming appointments.</p>
                  <Link to="/doctors" className="btn btn-secondary mt-1">Browse Doctors</Link>
                </div>
              )}

              {status === 'succeeded' && upcomingApts.length > 0 && (
                <div className="appointment-list">
                  {upcomingApts.map(apt => (
                    <div key={apt._id} className="apt-card">
                      <div className="apt-info">
                        <div className="doc-avatar placeholder-avatar"></div>
                        <div>
                          <h4>{apt.doctor?.name || 'Doctor'}</h4>
                          <p className="apt-time">
                            {new Date(apt.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {apt.timeSlot}
                          </p>
                        </div>
                      </div>
                      <div className="apt-actions">
                        <span className="status-badge pending">PENDING</span>
                        <Link to={`/room/${apt._id}`} className="btn btn-primary d-flex align-items-center gap-sm">
                          <Video size={16} /> Join Call
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="dashboard-section animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="section-header">
                <h2>Past Appointments</h2>
              </div>
              
              {status === 'succeeded' && pastApts.length === 0 && (
                <div className="empty-state">
                  <p>No past appointments.</p>
                </div>
              )}

              {status === 'succeeded' && pastApts.length > 0 && (
                <div className="appointment-list">
                  {pastApts.map(apt => (
                    <div key={apt._id} className="apt-card past">
                      <div className="apt-info">
                        <div>
                          <h4>{apt.doctor?.name || 'Doctor'}</h4>
                          <p className="apt-time text-muted">
                            {new Date(apt.date).toLocaleDateString()} at {apt.timeSlot}
                          </p>
                        </div>
                      </div>
                      <div className="apt-actions">
                         <button className="btn btn-secondary btn-sm">View Details</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="sidebar-col animate-fade-in" style={{animationDelay: '0.3s'}}>
            <section className="quick-links-card">
              <h3 style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                <FileText size={18} /> My Prescriptions
              </h3>
              {prescriptions.length === 0 ? (
                <div className="empty-state" style={{padding: '1.5rem 1rem', textAlign:'center'}}>
                  <FileText size={32} color="var(--text-muted)" style={{opacity: 0.4, display:'block', margin:'0 auto 0.5rem'}} />
                  <p style={{fontSize: '0.875rem', color:'var(--text-muted)'}}>No prescriptions yet.</p>
                </div>
              ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem'}}>
                  {prescriptions.map(rx => (
                    <div key={rx._id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.75rem',background:'var(--bg-main)',borderRadius:'var(--radius-md)',gap:'0.5rem'}}>
                      <div>
                        <p style={{fontWeight:600,fontSize:'0.875rem',color:'var(--dark)'}}>{rx.diagnosis}</p>
                        <p style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>Dr. {rx.doctor?.name} · {new Date(rx.createdAt).toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => downloadPrescriptionPDF(rx)} className="btn btn-secondary btn-sm" title="Download PDF" style={{padding:'0.4rem 0.6rem',flexShrink:0}}>
                        <Download size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
            
            <section className="dashboard-section" style={{marginTop: '1.5rem'}}>
              <AISymptomChecker />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
