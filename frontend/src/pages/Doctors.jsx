import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchDoctors } from '../features/doctorSlice';
import { Search, Star, Video, Filter } from 'lucide-react';
import './Doctors.css';

const specialties = ['All', 'Cardiology', 'Dermatology', 'Pediatrics', 'Neurology', 'General Practice', 'Orthopedics'];

const Doctors = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: doctors, status, error } = useSelector((state) => state.doctors);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [maxPrice, setMaxPrice] = useState(200);
  const [minRating, setMinRating] = useState(0);


  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchDoctors());
    }
  }, [status, dispatch]);

  const filteredDoctors = doctors.filter(doc => {
    const name = doc.user?.name || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;
    const matchesPrice = doc.consultationFee <= maxPrice;
    const matchesRating = (doc.averageRating || 0) >= minRating;
    return matchesSearch && matchesSpecialty && matchesPrice && matchesRating;
  });


  return (
    <div className="doctors-page">
      <div className="doctors-header">
        <div className="container">
          <h1>Find Your Specialist</h1>
          <p>Book video consultations with top-rated medical professionals.</p>
          
          <div className="search-bar">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Search by doctor name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-primary">Search</button>
          </div>
        </div>
      </div>

      <div className="container doctors-content">
        <div className="filters-sidebar">
          <div className="filter-group">
            <h3><Filter size={18} /> Specialties</h3>
            <ul className="specialty-list">
              {specialties.map(spec => (
                <li 
                  key={spec} 
                  className={selectedSpecialty === spec ? 'active' : ''}
                  onClick={() => setSelectedSpecialty(spec)}
                >
                  {spec}
                </li>
              ))}
            </ul>
          </div>

          <div className="filter-group">
            <h3>Max Price: ${maxPrice}</h3>
            <input 
              type="range" 
              min="0" 
              max="300" 
              step="10" 
              value={maxPrice} 
              onChange={(e) => setMaxPrice(Number(e.target.value))} 
              className="price-range"
            />
          </div>

          <div className="filter-group">
            <h3>Min Rating: {minRating}+</h3>
            <div className="rating-filters">
              {[0, 3, 4, 4.5].map(rating => (
                <button 
                  key={rating}
                  className={`filter-chip ${minRating === rating ? 'active' : ''}`}
                  onClick={() => setMinRating(rating)}
                >
                  {rating === 0 ? 'Any' : `${rating}+`}
                </button>
              ))}
            </div>
          </div>
        </div>


        <div className="doctors-grid">
          {status === 'loading' && <div>Loading doctors...</div>}
          {status === 'failed' && <div className="error">{error}</div>}
          
          {status === 'succeeded' && filteredDoctors.length > 0 ? (
            filteredDoctors.map(doc => {
              const name = doc.user?.name || 'Unknown Doctor';
              // Simple fallback for avatars/ratings until we build those out in the backend fully
              const gradient = `linear-gradient(135deg, #0066ff, #10b981)`;
              const rating = 4.8;
              const reviews = 120;
              const available = true;

              return (
                <div key={doc._id} className="doctor-card animate-fade-in">
                  <div className="doctor-card-header">
                    <div className="doctor-avatar-box">
                      <div className="doctor-avatar" style={{ background: gradient, color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'1.5rem' }}>
                        {name.charAt(0)}
                      </div>
                      <div className="status-indicator"></div>
                    </div>
                  </div>
                  <div className="doctor-card-body">
                    <h3>{name}</h3>
                    <span className="specialty-tag">{doc.specialty}</span>
                    <div className="rating-box">
                      <Star size={16} fill="#fbbf24" color="#fbbf24" />
                      <span>{rating}</span>
                      <span className="reviews">({reviews} reviews)</span>
                    </div>
                    <p style={{fontSize: '0.9375rem', marginTop: '1rem', color: 'var(--text-muted)', fontWeight: 600}}>
                      Fee: ${doc.consultationFee}
                    </p>
                  </div>
                  <div className="doctor-card-footer">
                    <button 
                      className="btn btn-primary book-btn" 
                      onClick={() => navigate(`/book/${doc._id}`)}
                    >
                      <Video size={16} /> 
                      Book Consultation
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            status === 'succeeded' && (
              <div className="no-results">
                <h3>No doctors found</h3>
                <p>Try adjusting your search or filters.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
