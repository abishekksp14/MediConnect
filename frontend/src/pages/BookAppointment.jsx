import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDoctorById } from '../features/doctorSlice';
import { bookAppointment } from '../features/appointmentSlice';
import { Calendar, Clock, Video } from 'lucide-react';
import './BookAppointment.css'; // We'll style it similarly to Auth.css

const BookAppointment = () => {
  const { doctorId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { selectedDoctor, status } = useSelector((state) => state.doctors);
  const { user } = useSelector((state) => state.auth);
  
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');

  useEffect(() => {
    dispatch(fetchDoctorById(doctorId));
  }, [dispatch, doctorId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !timeSlot) return alert("Please select date and time");

    dispatch(bookAppointment({
      patientId: user._id,
      doctorProfileId: doctorId,
      date,
      timeSlot
    })).then((res) => {
      if (!res.error) {
        navigate('/dashboard');
      }
    });
  };

  if (status === 'loading') return <div className="container" style={{padding: '5rem'}}>Loading doctor details...</div>;
  if (!selectedDoctor) return <div className="container" style={{padding: '5rem'}}>Doctor not found.</div>;

  return (
    <div className="book-page">
      <div className="container">
        <div className="book-card animate-fade-in">
          <div className="book-header">
            <h2>Book Consultation</h2>
            <p>with {selectedDoctor.user?.name}</p>
            <span className="badge">{selectedDoctor.specialty}</span>
          </div>

          <div className="doctor-info">
            <p><strong>Experience:</strong> {selectedDoctor.experienceYears} years</p>
            <p><strong>Fee:</strong> ${selectedDoctor.consultationFee}</p>
            <p><strong>Bio:</strong> {selectedDoctor.bio}</p>
          </div>

          <form onSubmit={handleSubmit} className="book-form">
            <div className="form-group">
              <label><Calendar size={16} /> Select Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required 
                min={new Date().toISOString().split('T')[0]} // Can't book in the past
              />
            </div>
            
            <div className="form-group">
              <label><Clock size={16} /> Select Time Slot</label>
              <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} required>
                <option value="" disabled>Choose a time</option>
                <option value="09:00">09:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="13:00">01:00 PM</option>
                <option value="14:00">02:00 PM</option>
                <option value="15:00">03:00 PM</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary book-submit">
              <Video size={18} style={{marginRight: '8px'}} /> Confirm Booking
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
