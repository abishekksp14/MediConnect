import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShieldCheck, Video, Calendar, Star, ArrowRight, Heart, Zap, Users } from 'lucide-react';
import './Landing.css';

const stats = [
  { value: '500+', label: 'Verified Doctors' },
  { value: '24/7', label: 'Always Available' },
  { value: '50k+', label: 'Happy Patients' },
  { value: '4.9★', label: 'Average Rating' },
];

const specialties = ['Cardiology','Dermatology','Neurology','Pediatrics','Orthopedics','Psychiatry'];

const testimonials = [
  { name: 'Aisha Patel', role: 'Patient', text: "MediConnect changed how I manage my health. I saw a cardiologist within the hour — no waiting rooms, no hassle.", avatar: 'AP', rating: 5 },
  { name: 'James Okonkwo', role: 'Patient', text: "The video call was crystal clear and the doctor was incredibly thorough. Best telehealth experience I've ever had.", avatar: 'JO', rating: 5 },
  { name: 'Sarah Lin', role: 'Patient', text: "I had my prescription downloaded as a PDF within minutes of my consultation. Absolutely seamless.", avatar: 'SL', rating: 5 },
  { name: 'Rahul Mehta', role: 'Patient', text: "As someone with a busy schedule, MediConnect is a lifesaver. I consult my doctor on my lunch break.", avatar: 'RM', rating: 5 },
];

const features = [
  { icon: <Video size={28} />, color: '#0066ff', bg: '#e6f0ff', title: 'HD Video Consultations', desc: 'Secure peer-to-peer WebRTC video calls. No downloads, no plugins — just open your browser.' },
  { icon: <ShieldCheck size={28} />, color: '#10b981', bg: '#d1fae5', title: 'Private & Encrypted', desc: 'Your health data is protected with industry-standard encryption. Only you and your doctor can access it.' },
  { icon: <Calendar size={28} />, color: '#8b5cf6', bg: '#ede9fe', title: 'Instant Scheduling', desc: 'Browse real-time availability and book an appointment in under 60 seconds.' },
  { icon: <Heart size={28} />, color: '#ef4444', bg: '#fee2e2', title: 'Digital Prescriptions', desc: 'Receive PDF prescriptions signed by your doctor immediately after your consultation.' },
  { icon: <Zap size={28} />, color: '#f59e0b', bg: '#fef3c7', title: 'Real-Time Updates', desc: 'Get instant notifications when your appointment is confirmed, updated, or cancelled.' },
  { icon: <Users size={28} />, color: '#0ea5e9', bg: '#e0f2fe', title: '500+ Specialists', desc: 'From cardiologists to dermatologists, find the exact specialist you need from our vetted network.' },
];

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const marqueeRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  return (
    <div className="landing-page">

      {/* HERO */}
      <section className="hero">
        <div className="hero-blobs">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
        </div>
        <div className="container hero-container">
          <div className="hero-content animate-fade-in">
            <div className="hero-badge">
              <span className="badge-dot" />
              Healthcare Reimagined
            </div>
            <h1>Your doctor,<br /><span className="gradient-text">one click away.</span></h1>
            <p>
              Skip the waiting room. Connect with verified specialists via HD video, receive prescriptions instantly, and manage your entire health journey from one place.
            </p>
            <div className="hero-cta">
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started Free <ArrowRight size={18} />
              </Link>
              <Link to="/how-it-works" className="btn btn-ghost btn-lg">See how it works</Link>
            </div>
            <div className="hero-stats">
              {stats.map(s => (
                <div key={s.label} className="hero-stat">
                  <h3>{s.value}</h3>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-visual animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="hero-card-stack">
              <div className="glass-card main-card">
                <div className="doc-info">
                  <div className="doc-avatar">SJ</div>
                  <div>
                    <h4 style={{fontSize:'1.125rem'}}>Dr. Sarah Jenkins</h4>
                    <p style={{fontSize:'0.875rem', color:'var(--text-light)'}}>Cardiologist · 4.9 ★</p>
                  </div>
                </div>
                <div className="card-body">
                  <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Next available: <strong style={{color:'var(--dark)'}}>Today, 3:00 PM</strong></p>
                  <Link to="/register" className="btn btn-primary" style={{ width: '100%' }}>
                    <Video size={16} /> Book Consultation
                  </Link>
                </div>
              </div>
              <div className="float-badge float-badge-1">
                <ShieldCheck size={16} color="var(--success)" />
                <span>End-to-end encrypted</span>
              </div>
              <div className="float-badge float-badge-2">
                <Star size={16} color="var(--warning)" fill="var(--warning)" />
                <span>4.9 / 5 · 2.4k reviews</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SPECIALTIES MARQUEE */}
      <section className="specialties-strip">
        <div className="marquee-track" ref={marqueeRef}>
          {[...specialties, ...specialties].map((s, i) => (
            <Link to="/doctors" key={i} className="specialty-chip">{s}</Link>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <div className="container">
          <div className="section-header-center">
            <div className="hero-badge" style={{margin:'0 auto 1.5rem'}}>Features</div>
            <h2>Everything you need for better health</h2>
            <p>A comprehensive platform built for patients and healthcare providers alike.</p>
          </div>
          <div className="features-grid">
            {features.map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section">
        <div className="container">
          <div className="section-header-center">
            <h2>Up and running in 3 steps</h2>
          </div>
          <div className="how-steps">
            <div className="how-step">
              <div className="step-number">1</div>
              <h4>Create Account</h4>
              <p>Sign up as a patient in under 30 seconds.</p>
            </div>
            <div className="step-line" />
            <div className="how-step">
              <div className="step-number">2</div>
              <h4>Find a Doctor</h4>
              <p>Browse specialists and book your slot instantly.</p>
            </div>
            <div className="step-line" />
            <div className="how-step">
              <div className="step-number">3</div>
              <h4>Start Consultation</h4>
              <p>Join your video call and get your prescription.</p>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Start for free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header-center">
            <h2>Loved by thousands of patients</h2>
            <p>Real stories from real people who changed how they approach healthcare.</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map(t => (
              <div key={t.name} className="testimonial-card">
                <div className="stars">{'★'.repeat(t.rating)}</div>
                <p>"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{t.avatar}</div>
                  <div>
                    <h5>{t.name}</h5>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-blobs">
              <div className="cta-blob cta-blob-1" />
              <div className="cta-blob cta-blob-2" />
            </div>
            <h2>Ready to take control of your health?</h2>
            <p>Join MediConnect today. Your first consultation is just a click away.</p>
            <Link to="/register" className="btn btn-white btn-lg">
              Create your free account <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Landing;
