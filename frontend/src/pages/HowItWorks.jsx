import { Link } from 'react-router-dom';
import { Search, Video, FileText, CheckCircle } from 'lucide-react';
import './HowItWorks.css';

const HowItWorks = () => {
  return (
    <div className="how-it-works-page">
      <div className="hiw-header">
        <div className="container">
          <h1>How MediConnect Works</h1>
          <p>Your journey to better health in three simple steps.</p>
        </div>
      </div>

      <div className="container hiw-content">
        <div className="steps-container">
          
          <div className="step-card animate-fade-in" style={{animationDelay: '0.1s'}}>
            <div className="step-number">1</div>
            <div className="step-icon bg-primary-light">
              <Search size={32} color="var(--primary)" />
            </div>
            <div className="step-text">
              <h2>Find Your Specialist</h2>
              <p>Browse our extensive directory of verified healthcare professionals. Filter by specialty, read reviews, and check real-time availability to find the perfect doctor for your needs.</p>
              <ul className="step-features">
                <li><CheckCircle size={16} color="var(--secondary)"/> Verified credentials</li>
                <li><CheckCircle size={16} color="var(--secondary)"/> Patient reviews & ratings</li>
                <li><CheckCircle size={16} color="var(--secondary)"/> Advanced specialty filters</li>
              </ul>
            </div>
          </div>

          <div className="step-card animate-fade-in" style={{animationDelay: '0.3s'}}>
            <div className="step-number">2</div>
            <div className="step-icon" style={{backgroundColor: '#ecfdf5'}}>
              <Video size={32} color="var(--secondary)" />
            </div>
            <div className="step-text">
              <h2>Consult via Secure Video</h2>
              <p>Connect with your doctor face-to-face from anywhere using our high-definition, HIPAA-compliant WebRTC video platform. No downloads required—just click and connect.</p>
              <ul className="step-features">
                <li><CheckCircle size={16} color="var(--secondary)"/> HD Video & Crystal clear audio</li>
                <li><CheckCircle size={16} color="var(--secondary)"/> End-to-end encryption</li>
                <li><CheckCircle size={16} color="var(--secondary)"/> In-call text chat</li>
              </ul>
            </div>
          </div>

          <div className="step-card animate-fade-in" style={{animationDelay: '0.5s'}}>
            <div className="step-number">3</div>
            <div className="step-icon" style={{backgroundColor: '#e0f2fe'}}>
              <FileText size={32} color="#0ea5e9" />
            </div>
            <div className="step-text">
              <h2>Get Your Prescription</h2>
              <p>If medication is needed, your doctor will instantly issue a digitally signed, secure PDF prescription. You can download it immediately or have it routed to a pharmacy.</p>
              <ul className="step-features">
                <li><CheckCircle size={16} color="var(--secondary)"/> Legally valid digital signatures</li>
                <li><CheckCircle size={16} color="var(--secondary)"/> Instant PDF downloads</li>
                <li><CheckCircle size={16} color="var(--secondary)"/> Secure Cloudinary storage</li>
              </ul>
            </div>
          </div>

        </div>

        <div className="hiw-cta text-center animate-fade-in" style={{animationDelay: '0.7s'}}>
          <h2>Ready to experience modern healthcare?</h2>
          <p>Join thousands of patients taking control of their health.</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
            <Link to="/doctors" className="btn btn-secondary btn-lg">Browse Doctors First</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
