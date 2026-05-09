const { bookAppointment, getPatientAppointments, updateAppointmentStatus } = require('../controllers/appointmentController');
const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');

jest.mock('../models/Appointment');
jest.mock('../models/DoctorProfile');

describe('Appointment Controller Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      io: { to: jest.fn().mockReturnThis(), emit: jest.fn() }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('bookAppointment', () => {
    it('should book an appointment successfully', async () => {
      req.body = {
        patientId: 'patientId',
        doctorProfileId: 'profileId',
        date: '2023-10-10',
        timeSlot: '10:00 AM'
      };

      DoctorProfile.findById.mockResolvedValue({
        _id: 'profileId',
        user: 'doctorId',
        consultationFee: 50
      });

      Appointment.create.mockResolvedValue({
        _id: 'appId',
        patient: 'patientId',
        doctor: 'doctorId',
        status: 'pending'
      });

      await bookAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ _id: 'appId' }));
    });

    it('should return 404 if doctor profile not found', async () => {
      req.body = { doctorProfileId: 'invalid' };
      DoctorProfile.findById.mockResolvedValue(null);

      await bookAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Doctor profile not found' });
    });
  });

  describe('updateAppointmentStatus', () => {
    it('should update status and emit notification on cancellation', async () => {
      req.params.id = 'appId';
      req.body = { status: 'cancelled' };

      const mockAppointment = {
        _id: 'appId',
        patient: { _id: 'patientId' },
        doctor: { name: 'Smith' },
        status: 'cancelled'
      };

      const mockPopulate = jest.fn().mockResolvedValue(mockAppointment);
      Appointment.findByIdAndUpdate.mockReturnValue({ populate: jest.fn().mockReturnValue({ populate: mockPopulate }) });

      await updateAppointmentStatus(req, res);

      expect(res.json).toHaveBeenCalledWith(mockAppointment);
      expect(req.io.to).toHaveBeenCalledWith('user_patientId');
      expect(req.io.emit).toHaveBeenCalledWith('appointment_cancelled', expect.any(Object));
    });
  });
});
