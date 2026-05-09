import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchDoctorAppointments, updateAppointmentStatus } from '../features/appointmentSlice';
import { createPrescription } from '../features/prescriptionSlice';
import { useToast } from '../components/ToastProvider';
import { Video, Calendar, Users, DollarSign, XCircle, Clock, FileText, CheckCircle, Plus, X } from 'lucide-react';
import './Dashboard.css';

const DoctorDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { list: appointments, status } = useSelector((state) => state.appointments);
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [rxModal, setRxModal] = useState(null); // holds the appointment to write Rx for
  const [rxForm, setRxForm] = useState({ diagnosis: '', advice: '', medicines: [{ name: '', dosage: '', frequency: '', duration: '' }] });

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchDoctorAppointments(user._id));
    }
  }, [dispatch, user]);

  const handleCancel = (id) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      dispatch(updateAppointmentStatus({ id, status: 'cancelled' }));
      addToast('Appointment cancelled.', 'warning');
    }
  };

  const handleComplete = (id) => {
    dispatch(updateAppointmentStatus({ id, status: 'completed' }));
    addToast('Appointment marked as completed!', 'success');
  };

  const handleOpenRx = (apt) => {
    setRxModal(apt);
    setRxForm({ diagnosis: '', advice: '', medicines: [{ name: '', dosage: '', frequency: '', duration: '' }] });
  };

  const handleAddMedicine = () => {
    setRxForm(prev => ({ ...prev, medicines: [...prev.medicines, { name: '', dosage: '', frequency: '', duration: '' }] }));
  };

  const handleMedicineChange = (index, field, value) => {
    setRxForm(prev => {
      const medicines = [...prev.medicines];
      medicines[index] = { ...medicines[index], [field]: value };
      return { ...prev, medicines };
    });
  };

  const handleSubmitRx = async (e) => {
    e.preventDefault();
    if (!rxForm.diagnosis.trim()) return addToast('Diagnosis is required.', 'error');
    try {
      await dispatch(createPrescription({
        appointmentId: rxModal._id,
        patientId: rxModal.patient._id,
        doctorId: user._id,
        diagnosis: rxForm.diagnosis,
        medicines: rxForm.medicines.filter(m => m.name),
        advice: rxForm.advice,
      })).unwrap();
      addToast('Prescription issued successfully!', 'success');
      setRxModal(null);
    } catch {
      addToast('Failed to issue prescription.', 'error');
    }
  };

  // Derived Statistics & Data
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const upcomingApts = appointments.filter(apt => {
    const aptDate = new Date(`${apt.date.split('T')[0]}T${apt.timeSlot}:00`);
    return aptDate >= now && apt.status !== 'cancelled' && apt.status !== 'completed';
  });

  const todaysApts = upcomingApts.filter(apt => apt.date.split('T')[0] === todayStr);

  const pastApts = appointments.filter(apt => {
    const aptDate = new Date(`${apt.date.split('T')[0]}T${apt.timeSlot}:00`);
    return aptDate < now || apt.status === 'completed' || apt.status === 'cancelled';
  });

  const totalEarnings = appointments
    .filter(apt => apt.status === 'completed' || apt.status === 'confirmed')
    .reduce((sum, apt) => sum + (apt.fee || 0), 0);

  // Extract unique patients
  const uniquePatientsMap = new Map();
  appointments.forEach(apt => {
    if (apt.patient && !uniquePatientsMap.has(apt.patient._id)) {
      uniquePatientsMap.set(apt.patient._id, apt.patient);
    }
  });
  const patients = Array.from(uniquePatientsMap.values());

  // Patient History helper
  const getPatientHistory = (patientId) => {
    return appointments.filter(apt => apt.patient && apt.patient._id === patientId).sort((a,b) => new Date(b.date) - new Date(a.date));
  };

  return (
    <div className="dashboard-page bg-gray">
      <div className="dashboard-header bg-dark">
        <div className="container">
          <h1 style={{ color: 'white' }}>Doctor Portal</h1>
          <p style={{ color: '#cbd5e1' }}>Manage your schedule and patients.</p>
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
              <h3>{todaysApts.length}</h3>
              <p>Today's Appointments</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{backgroundColor: '#fef3c7', color: '#d97706'}}>
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <h3>{upcomingApts.length}</h3>
              <p>Total Upcoming</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{backgroundColor: '#d1fae5', color: '#059669'}}>
              <Users size={24} />
            </div>
            <div className="stat-info">
              <h3>{patients.length}</h3>
              <p>Unique Patients</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{backgroundColor: '#f3e8ff', color: '#9333ea'}}>
              <DollarSign size={24} />
            </div>
            <div className="stat-info">
              <h3>${totalEarnings}</h3>
              <p>Total Earnings</p>
            </div>
          </div>
        </div>

        {/* Custom Tabs */}
        <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem'}}>
          <button 
            className={`btn ${activeTab === 'schedule' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('schedule')}
          >
            My Schedule
          </button>
          <button 
            className={`btn ${activeTab === 'patients' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('patients')}
          >
            My Patients
          </button>
        </div>

        {/* Tab Content: Schedule */}
        {activeTab === 'schedule' && (
          <div className="dashboard-grid animate-fade-in">
            <div className="main-col">
              <section className="dashboard-section">
                <div className="section-header">
                  <h2>Upcoming Appointments</h2>
                </div>
                {upcomingApts.length === 0 ? (
                  <div className="empty-state"><p>Your schedule is clear.</p></div>
                ) : (
                  <div className="appointment-list">
                    {upcomingApts.map(apt => (
                      <div key={apt._id} className="apt-card">
                        <div className="apt-info">
                          <div className="doc-avatar placeholder-avatar"></div>
                          <div>
                            <h4>{apt.patient?.name || 'Patient'}</h4>
                            <p className="apt-time">
                              {new Date(apt.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {apt.timeSlot}
                            </p>
                          </div>
                        </div>
                        <div className="apt-actions">
                          <span className={`status-badge pending`}>{apt.status.toUpperCase()}</span>
                          <Link to={`/room/${apt._id}`} className="btn btn-primary btn-sm d-flex align-items-center gap-sm">
                            <Video size={16} /> Start Call
                          </Link>
                          <button onClick={() => handleComplete(apt._id)} className="btn btn-secondary btn-sm" title="Mark Completed" style={{padding: '0.5rem', color: '#059669'}}>
                            <CheckCircle size={16} />
                          </button>
                          <button onClick={() => handleCancel(apt._id)} className="btn btn-secondary btn-sm" title="Cancel Appointment" style={{padding: '0.5rem', color: '#dc2626'}}>
                            <XCircle size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="dashboard-section">
                <div className="section-header">
                  <h2>Past Appointments</h2>
                </div>
                {pastApts.length === 0 ? (
                  <div className="empty-state"><p>No past appointments.</p></div>
                ) : (
                  <div className="appointment-list">
                    {pastApts.map(apt => (
                      <div key={apt._id} className="apt-card past">
                        <div className="apt-info">
                          <div>
                            <h4>{apt.patient?.name || 'Patient'}</h4>
                            <p className="apt-time text-muted">
                              {new Date(apt.date).toLocaleDateString()} at {apt.timeSlot}
                            </p>
                          </div>
                        </div>
                        <div className="apt-actions">
                           <span className="status-badge" style={{backgroundColor: '#e2e8f0', color: '#64748b'}}>{apt.status.toUpperCase()}</span>
                           {apt.status === 'completed' && (
                             <button onClick={() => handleOpenRx(apt)} className="btn btn-secondary btn-sm d-flex align-items-center gap-sm" style={{fontSize:'0.8rem'}}>
                               <FileText size={14} /> Write Rx
                             </button>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
            
            <div className="sidebar-col">
              <div className="quick-links-card">
                <h3>Earnings Overview</h3>
                <div style={{padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', textAlign: 'center'}}>
                  <p style={{color: 'var(--text-muted)'}}>Pending Payouts</p>
                  <h2 style={{color: 'var(--dark)', fontSize: '2rem', margin: '0.5rem 0'}}>$0.00</h2>
                  <button className="btn btn-primary" style={{width: '100%'}}>Connect Stripe</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Patients */}
        {activeTab === 'patients' && (
          <div className="dashboard-section animate-fade-in">
            <div className="section-header">
              <h2>Patient Roster</h2>
            </div>
            {patients.length === 0 ? (
              <div className="empty-state"><p>You haven't seen any patients yet.</p></div>
            ) : (
              <div className="appointment-list">
                {patients.map(p => (
                  <div key={p._id} className="apt-card">
                    <div className="apt-info">
                      <div className="doc-avatar placeholder-avatar"></div>
                      <div>
                        <h4>{p.name}</h4>
                        <p className="text-muted">{p.email}</p>
                      </div>
                    </div>
                    <div className="apt-actions">
                       <button onClick={() => setSelectedPatient(p)} className="btn btn-secondary btn-sm d-flex align-items-center gap-sm">
                         <FileText size={16} /> View History
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Patient History Modal */}
      {selectedPatient && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '1rem', width: '100%', maxWidth: '600px',
            maxHeight: '80vh', overflowY: 'auto', padding: '2rem'
          }}>
            <div className="d-flex justify-between align-items-center" style={{marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem'}}>
              <h2>{selectedPatient.name}'s History</h2>
              <button onClick={() => setSelectedPatient(null)} style={{background: 'none', border: 'none', cursor: 'pointer'}}>
                <XCircle size={24} color="var(--text-muted)" />
              </button>
            </div>
            
            <div className="appointment-list" style={{borderTop: 'none'}}>
              {getPatientHistory(selectedPatient._id).map(apt => (
                <div key={apt._id} className="apt-card" style={{padding: '1rem 0'}}>
                  <div>
                    <p style={{fontWeight: 600, color: 'var(--dark)'}}>{new Date(apt.date).toLocaleDateString()}</p>
                    <p className="text-muted">{apt.timeSlot}</p>
                  </div>
                  <span className="status-badge" style={{backgroundColor: '#f1f5f9', color: '#475569'}}>{apt.status.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Prescription Modal */}
      {rxModal && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
          <div style={{background:'white',borderRadius:'1rem',width:'100%',maxWidth:'600px',maxHeight:'90vh',overflowY:'auto',padding:'2rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem',borderBottom:'1px solid #e2e8f0',paddingBottom:'1rem'}}>
              <h2 style={{fontSize:'1.25rem',fontWeight:700}}>Write Prescription</h2>
              <button onClick={() => setRxModal(null)} style={{background:'none',border:'none',cursor:'pointer'}}><X size={22} color="var(--text-muted)" /></button>
            </div>
            <p style={{color:'var(--text-muted)',marginBottom:'1.5rem',fontSize:'0.9rem'}}>For: <strong>{rxModal.patient?.name}</strong> · {new Date(rxModal.date).toLocaleDateString()}</p>
            <form onSubmit={handleSubmitRx}>
              <div style={{marginBottom:'1rem'}}>
                <label style={{fontWeight:600,fontSize:'0.875rem',display:'block',marginBottom:'0.4rem'}}>Diagnosis *</label>
                <input value={rxForm.diagnosis} onChange={e => setRxForm(p => ({...p, diagnosis: e.target.value}))} placeholder="e.g. Acute bronchitis" required style={{width:'100%',padding:'0.75rem',border:'1px solid #e2e8f0',borderRadius:'0.5rem',fontFamily:'inherit'}} />
              </div>
              <div style={{marginBottom:'1rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.5rem'}}>
                  <label style={{fontWeight:600,fontSize:'0.875rem'}}>Medicines</label>
                  <button type="button" onClick={handleAddMedicine} className="btn btn-secondary btn-sm" style={{fontSize:'0.8rem',display:'flex',alignItems:'center',gap:'0.3rem'}}><Plus size={14}/> Add</button>
                </div>
                {rxForm.medicines.map((med, i) => (
                  <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem',marginBottom:'0.5rem',padding:'0.75rem',background:'#f8fafc',borderRadius:'0.5rem'}}>
                    <input placeholder="Medicine name" value={med.name} onChange={e => handleMedicineChange(i,'name',e.target.value)} style={{padding:'0.5rem',border:'1px solid #e2e8f0',borderRadius:'0.375rem',fontFamily:'inherit'}} />
                    <input placeholder="Dosage (e.g. 500mg)" value={med.dosage} onChange={e => handleMedicineChange(i,'dosage',e.target.value)} style={{padding:'0.5rem',border:'1px solid #e2e8f0',borderRadius:'0.375rem',fontFamily:'inherit'}} />
                    <input placeholder="Frequency (e.g. Twice daily)" value={med.frequency} onChange={e => handleMedicineChange(i,'frequency',e.target.value)} style={{padding:'0.5rem',border:'1px solid #e2e8f0',borderRadius:'0.375rem',fontFamily:'inherit'}} />
                    <input placeholder="Duration (e.g. 5 days)" value={med.duration} onChange={e => handleMedicineChange(i,'duration',e.target.value)} style={{padding:'0.5rem',border:'1px solid #e2e8f0',borderRadius:'0.375rem',fontFamily:'inherit'}} />
                  </div>
                ))}
              </div>
              <div style={{marginBottom:'1.5rem'}}>
                <label style={{fontWeight:600,fontSize:'0.875rem',display:'block',marginBottom:'0.4rem'}}>Advice / Notes</label>
                <textarea value={rxForm.advice} onChange={e => setRxForm(p => ({...p, advice: e.target.value}))} rows={3} placeholder="e.g. Drink plenty of water, rest well..." style={{width:'100%',padding:'0.75rem',border:'1px solid #e2e8f0',borderRadius:'0.5rem',fontFamily:'inherit',resize:'vertical'}} />
              </div>
              <div style={{display:'flex',gap:'1rem',justifyContent:'flex-end'}}>
                <button type="button" onClick={() => setRxModal(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><FileText size={16} /> Issue Prescription</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
