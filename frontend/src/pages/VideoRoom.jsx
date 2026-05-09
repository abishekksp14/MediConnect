import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Send, MessageSquare, X, FileText, Plus } from 'lucide-react';
import { fetchAppointmentById } from '../features/appointmentSlice';
import { createPrescription } from '../features/prescriptionSlice';
import { useToast } from '../components/ToastProvider';
import './VideoRoom.css';

const configuration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

const VideoRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { addToast } = useToast();

  const [appointment, setAppointment] = useState(null);
  const [showRxModal, setShowRxModal] = useState(false);
  const [rxForm, setRxForm] = useState({ 
    diagnosis: '', 
    advice: '', 
    medicines: [{ name: '', dosage: '', frequency: '', duration: '' }] 
  });

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const [hasConnected, setHasConnected] = useState(false);

  // Fetch appointment data on load
  useEffect(() => {
    dispatch(fetchAppointmentById(roomId))
      .unwrap()
      .then(data => setAppointment(data))
      .catch(err => console.error("Failed to fetch appointment:", err));
  }, [dispatch, roomId]);

  useEffect(() => {
    let mounted = true;
    
    // 1. Initialize Socket dynamically for network testing
    const SOCKET_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
    });

    // 2. Initialize Media & WebRTC
    const startCall = async () => {
      try {
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } catch (mediaErr) {
          console.error("Camera/Mic not found or denied:", mediaErr);
          // Fallback to empty stream if no devices found so WebRTC doesn't break
          stream = new MediaStream();
        }
        
        if (!mounted) {
           stream.getTracks().forEach(track => track.stop());
           return;
        }

        localStreamRef.current = stream;
        if (localVideoRef.current && stream.getVideoTracks().length > 0) {
           localVideoRef.current.srcObject = stream;
        } else {
           setIsVideoOff(true); // Default to off if no camera
        }

        // Initialize Peer Connection
        peerConnectionRef.current = new RTCPeerConnection(configuration);

        // Add local tracks to peer connection
        stream.getTracks().forEach(track => {
          peerConnectionRef.current.addTrack(track, stream);
        });

        // Handle remote tracks
        peerConnectionRef.current.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setHasConnected(true);
          }
        };

        // Watch connection state
        peerConnectionRef.current.oniceconnectionstatechange = () => {
           if (peerConnectionRef.current.iceConnectionState === 'connected') {
               setHasConnected(true);
           } else if (peerConnectionRef.current.iceConnectionState === 'disconnected' || peerConnectionRef.current.iceConnectionState === 'failed') {
               setHasConnected(false);
           }
        };

        // Handle ICE candidates to send to peer
        peerConnectionRef.current.onicecandidate = (event) => {
          if (event.candidate) {
            socketRef.current.emit('ice-candidate', { roomId, candidate: event.candidate });
          }
        };

        // --- Socket Listeners for WebRTC ---
        const pendingCandidates = [];

        // When a new user joins, WE are the caller. We create the offer.
        socketRef.current.on('user_joined', async () => {
          try {
            console.log("User joined, creating offer...");
            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);
            socketRef.current.emit('offer', { roomId, sdp: offer });
          } catch (error) {
            console.error("Error creating offer:", error);
          }
        });

        // When we receive an offer, we set it and create an answer
        socketRef.current.on('offer', async (data) => {
          try {
            console.log("Received offer, setting remote description...");
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
            
            // Add any pending candidates
            while (pendingCandidates.length > 0) {
              const candidate = pendingCandidates.shift();
              await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            }

            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);
            socketRef.current.emit('answer', { roomId, sdp: answer });
          } catch (error) {
            console.error("Error handling offer:", error);
          }
        });

        // When we receive an answer, we set it as remote desc
        socketRef.current.on('answer', async (data) => {
          try {
            console.log("Received answer, setting remote description...");
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
            
            // Add any pending candidates
            while (pendingCandidates.length > 0) {
              const candidate = pendingCandidates.shift();
              await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
          } catch (error) {
            console.error("Error handling answer:", error);
          }
        });

        // When we receive ICE candidates, add them or queue them
        socketRef.current.on('ice-candidate', async (data) => {
          try {
            if (data.candidate) {
              if (peerConnectionRef.current.remoteDescription && peerConnectionRef.current.remoteDescription.type) {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
              } else {
                console.log("Remote description not set, queuing ICE candidate");
                pendingCandidates.push(data.candidate);
              }
            }
          } catch (error) {
            console.error("Error adding ice candidate:", error);
          }
        });

        // --- Chat Listeners ---
        socketRef.current.on('chat_message', (msgData) => {
          setMessages(prev => [...prev, msgData]);
        });

        // Join the Socket Room AFTER listeners are registered
        socketRef.current.emit('join_room', roomId);

      } catch (err) {
        console.error("Critical error in startCall:", err);
      }
    };

    startCall();

    // Cleanup on unmount
    return () => {
      mounted = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId]);

  // Controls Handlers
  const toggleMute = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  };

  const endCall = () => {
    // Explicitly shut down all media and connections immediately
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    navigate('/dashboard');
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const msgData = {
        roomId,
        senderId: user?._id,
        senderName: user?.name,
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      socketRef.current.emit('chat_message', msgData);
      setNewMessage('');
    }
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
        appointmentId: roomId,
        patientId: appointment.patient._id,
        doctorId: user._id,
        diagnosis: rxForm.diagnosis,
        medicines: rxForm.medicines.filter(m => m.name),
        advice: rxForm.advice,
      })).unwrap();
      addToast('Prescription issued successfully!', 'success');
      setShowRxModal(false);
      setRxForm({ diagnosis: '', advice: '', medicines: [{ name: '', dosage: '', frequency: '', duration: '' }] });
    } catch {
      addToast('Failed to issue prescription.', 'error');
    }
  };

  return (
    <div className="video-room">
      <div className={`video-container ${isChatOpen ? 'chat-open' : ''}`}>
        {/* Remote Video (Main) */}
        <div className="remote-video-wrapper">
          <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
          {!hasConnected && <div className="waiting-text text-muted">Waiting for other participant to join...</div>}
        </div>

        {/* Local Video (PiP) */}
        <div className="local-video-wrapper">
          <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />
          {isVideoOff && <div className="video-off-overlay"><VideoOff size={32} color="white" /></div>}
        </div>

        {/* Controls Bar */}
        <div className="controls-bar animate-slide-up">
          <button className={`control-btn ${isMuted ? 'danger' : ''}`} onClick={toggleMute}>
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          
          <button className={`control-btn ${isVideoOff ? 'danger' : ''}`} onClick={toggleVideo}>
            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
          </button>

          <button className="control-btn end-call" onClick={endCall}>
            <PhoneOff size={24} color="white" />
          </button>

          {user?.role === 'doctor' && (
            <button className={`control-btn ${showRxModal ? 'active' : ''}`} onClick={() => setShowRxModal(true)} title="Write Prescription">
              <FileText size={24} />
            </button>
          )}

          <button className={`control-btn ${isChatOpen ? 'active' : ''}`} onClick={() => setIsChatOpen(!isChatOpen)}>
            <MessageSquare size={24} />
          </button>
        </div>
      </div>

      {/* Prescription Modal */}
      {showRxModal && appointment && (
        <div className="rx-modal-overlay">
          <div className="rx-modal animate-slide-up">
            <div className="rx-modal-header">
              <h3>Write Prescription</h3>
              <button onClick={() => setShowRxModal(false)}><X size={20} /></button>
            </div>
            <p className="rx-patient-info">Patient: <strong>{appointment.patient?.name}</strong></p>
            <form onSubmit={handleSubmitRx}>
              <div className="form-group">
                <label>Diagnosis *</label>
                <input 
                  value={rxForm.diagnosis} 
                  onChange={e => setRxForm(p => ({...p, diagnosis: e.target.value}))} 
                  placeholder="e.g. Acute bronchitis" 
                  required 
                />
              </div>
              <div className="form-group">
                <div className="d-flex justify-between align-items-center mb-sm">
                  <label>Medicines</label>
                  <button type="button" onClick={handleAddMedicine} className="btn btn-secondary btn-sm d-flex align-items-center gap-xs">
                    <Plus size={14}/> Add
                  </button>
                </div>
                {rxForm.medicines.map((med, i) => (
                  <div key={i} className="medicine-input-row">
                    <input placeholder="Name" value={med.name} onChange={e => handleMedicineChange(i,'name',e.target.value)} />
                    <input placeholder="Dosage" value={med.dosage} onChange={e => handleMedicineChange(i,'dosage',e.target.value)} />
                    <input placeholder="Frequency" value={med.frequency} onChange={e => handleMedicineChange(i,'frequency',e.target.value)} />
                    <input placeholder="Duration" value={med.duration} onChange={e => handleMedicineChange(i,'duration',e.target.value)} />
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label>Advice / Notes</label>
                <textarea 
                  value={rxForm.advice} 
                  onChange={e => setRxForm(p => ({...p, advice: e.target.value}))} 
                  rows={3} 
                  placeholder="e.g. Rest well, drink fluids..." 
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowRxModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary d-flex align-items-center gap-sm">
                  <FileText size={18} /> Issue Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat Sidebar */}
      <div className={`chat-sidebar ${isChatOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <h3>Consultation Chat</h3>
          <button className="close-btn" onClick={() => setIsChatOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-bubble ${msg.senderId === user?._id ? 'sent' : 'received'}`}>
              <span className="msg-sender">{msg.senderName}</span>
              <p>{msg.text}</p>
              <span className="msg-time">{msg.time}</span>
            </div>
          ))}
        </div>

        <form className="chat-input-area" onSubmit={sendMessage}>
          <input 
            type="text" 
            placeholder="Type a message..." 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
            <Send size={18} color="white" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default VideoRoom;
