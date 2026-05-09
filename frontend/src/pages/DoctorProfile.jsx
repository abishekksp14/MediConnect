import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, DollarSign, Award, Calendar, Video, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { SkeletonCard } from '../components/Skeleton';
import './DoctorProfile.css';

const DoctorProfile = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/doctors/${id}`)
      .then(res => { setDoctor(res.data); setLoading(false); })
      .catch(() => { setError('Doctor not found.'); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="container" style={{ paddingTop: '3rem' }}>
      {[1,2,3].map(i => <SkeletonCard key={i} />)}
    </div>
  );

  if (error || !doctor) return (
    <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
      <h2>{error}</h2>
      <Link to="/doctors" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Doctors</Link>
    </div>
  );

  const profile = doctor.profile || {};

  return (
    <div className="doctor-profile-page">
      <div className="container">
        <Link to="/doctors" className="back-link">
          <ArrowLeft size={18} /> Back to Doctors
        </Link>

        <div className="profile-layout">
          {/* Left Column */}
          <aside className="profile-sidebar">
            <div className="profile-card">
              <div className="profile-avatar">{doctor.name?.charAt(0)}</div>
              <h2>{doctor.name}</h2>
              <p className="profile-specialty">{profile.specialty || 'General Physician'}</p>
              <div className="profile-badges">
                {profile.isVerified && <span className="badge-verified">✓ Verified</span>}
                <span className="badge-exp">{profile.experienceYears || '—'} yrs exp</span>
              </div>
              <div className="profile-stats">
                <div className="profile-stat">
                  <DollarSign size={18} color="var(--primary)" />
                  <span>${profile.consultationFee || '—'}</span>
                  <small>per session</small>
                </div>
                <div className="profile-stat">
                  <Clock size={18} color="#10b981" />
                  <span>~30 min</span>
                  <small>avg call</small>
                </div>
                <div className="profile-stat">
                  <Star size={18} color="#f59e0b" />
                  <span>4.9</span>
                  <small>rating</small>
                </div>
              </div>
              <Link to={`/book/${doctor._id}`} className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }}>
                <Calendar size={16} style={{ marginRight: '8px' }} /> Book Appointment
              </Link>
            </div>
          </aside>

          {/* Right Column */}
          <div className="profile-main">
            <section className="profile-section">
              <h3>About</h3>
              <p>{profile.bio || `Dr. ${doctor.name} is an experienced healthcare professional specializing in ${profile.specialty || 'general medicine'}. They are committed to providing high-quality, patient-centered care.`}</p>
            </section>

            {profile.qualifications?.length > 0 && (
              <section className="profile-section">
                <h3>Qualifications</h3>
                <div className="qualifications-list">
                  {profile.qualifications.map((q, i) => (
                    <div key={i} className="qualification-item">
                      <Award size={16} color="var(--primary)" />
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="profile-section">
              <h3>How it Works</h3>
              <div className="how-steps-mini">
                <div className="mini-step">
                  <div className="mini-step-num">1</div>
                  <div><h5>Book a Slot</h5><p>Pick a date and time that suits you.</p></div>
                </div>
                <div className="mini-step">
                  <div className="mini-step-num">2</div>
                  <div><h5>Join the Call</h5><p>Click "Join Call" from your dashboard.</p></div>
                </div>
                <div className="mini-step">
                  <div className="mini-step-num">3</div>
                  <div><h5>Get Prescription</h5><p>Download your PDF prescription instantly.</p></div>
                </div>
              </div>
            </section>

            <div className="profile-cta-strip">
              <div>
                <h4>Ready to consult with {doctor.name?.split(' ')[1] || doctor.name}?</h4>
                <p>Appointments available today. No waiting room.</p>
              </div>
              <Link to={`/book/${doctor._id}`} className="btn btn-primary">
                <Video size={16} style={{ marginRight: '8px' }} /> Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
