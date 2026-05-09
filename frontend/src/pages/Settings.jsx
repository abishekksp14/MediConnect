import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Stethoscope, Save } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/ToastProvider';
import './Settings.css';

const Settings = () => {
  const { user } = useSelector(state => state.auth);
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({ name: user?.name || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [doctorForm, setDoctorForm] = useState({ specialty: '', bio: '', consultationFee: '', experienceYears: '' });

  useEffect(() => {
    if (user?.role === 'doctor') {
      api.get(`/doctors/${user._id}`).then(res => {
        const p = res.data.profile;
        if (p) setDoctorForm({
          specialty: p.specialty || '',
          bio: p.bio || '',
          consultationFee: p.consultationFee || '',
          experienceYears: p.experienceYears || '',
        });
      }).catch(() => {});
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/update-profile', { userId: user._id, name: profileForm.name });
      addToast('Profile updated successfully!', 'success');
    } catch {
      addToast('Failed to update profile.', 'error');
    } finally { setLoading(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return addToast('New passwords do not match.', 'error');
    }
    if (passwordForm.newPassword.length < 6) {
      return addToast('Password must be at least 6 characters.', 'error');
    }
    setLoading(true);
    try {
      await api.put('/auth/update-password', {
        userId: user._id,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      addToast('Password changed successfully!', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to change password.', 'error');
    } finally { setLoading(false); }
  };

  const handleDoctorSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/doctors/update-profile', doctorForm);
      addToast('Doctor profile updated!', 'success');
    } catch {
      addToast('Failed to update doctor profile.', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className="container">
          <h1>Account Settings</h1>
          <p>Manage your profile and preferences.</p>
        </div>
      </div>

      <div className="container settings-layout">
        <aside className="settings-sidebar">
          <button className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <User size={18} /> Profile
          </button>
          <button className={`settings-tab ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>
            <Lock size={18} /> Password
          </button>
          {user?.role === 'doctor' && (
            <button className={`settings-tab ${activeTab === 'doctor' ? 'active' : ''}`} onClick={() => setActiveTab('doctor')}>
              <Stethoscope size={18} /> Doctor Profile
            </button>
          )}
        </aside>

        <div className="settings-content">
          {activeTab === 'profile' && (
            <form className="settings-form" onSubmit={handleProfileSave}>
              <h2>Personal Information</h2>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={profileForm.name} onChange={e => setProfileForm({ name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={user?.email || ''} disabled className="disabled-input" />
                <span className="input-hint">Email cannot be changed.</span>
              </div>
              <div className="form-group">
                <label>Role</label>
                <input type="text" value={user?.role === 'doctor' ? 'Doctor' : 'Patient'} disabled className="disabled-input" />
              </div>
              <button type="submit" className="btn btn-primary save-btn" disabled={loading}>
                <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form className="settings-form" onSubmit={handlePasswordSave}>
              <h2>Change Password</h2>
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))} />
              </div>
              <button type="submit" className="btn btn-primary save-btn" disabled={loading}>
                <Save size={16} /> {loading ? 'Saving...' : 'Update Password'}
              </button>
            </form>
          )}

          {activeTab === 'doctor' && user?.role === 'doctor' && (
            <form className="settings-form" onSubmit={handleDoctorSave}>
              <h2>Doctor Profile</h2>
              <div className="form-group">
                <label>Specialty</label>
                <input type="text" value={doctorForm.specialty} onChange={e => setDoctorForm(p => ({ ...p, specialty: e.target.value }))} placeholder="e.g. Cardiology" />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea value={doctorForm.bio} onChange={e => setDoctorForm(p => ({ ...p, bio: e.target.value }))} rows={4} placeholder="Tell patients about your experience..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Consultation Fee ($)</label>
                  <input type="number" value={doctorForm.consultationFee} onChange={e => setDoctorForm(p => ({ ...p, consultationFee: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Years of Experience</label>
                  <input type="number" value={doctorForm.experienceYears} onChange={e => setDoctorForm(p => ({ ...p, experienceYears: e.target.value }))} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary save-btn" disabled={loading}>
                <Save size={16} /> {loading ? 'Saving...' : 'Save Doctor Profile'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
