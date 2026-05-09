import { createContext, useContext, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { useToast } from './ToastProvider';

const NotificationContext = createContext(null);
// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const socketRef = useRef(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;

    const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || `http://${window.location.hostname}:5000`;
    socketRef.current = io(SOCKET_URL, { withCredentials: true });

    // Register personal room
    socketRef.current.emit('register_user', user._id);

    // Listen for real-time notifications
    socketRef.current.on('new_appointment', (data) => {
      addToast(data.message, 'info');
    });

    socketRef.current.on('appointment_cancelled', (data) => {
      addToast(data.message, 'warning');
    });

    socketRef.current.on('new_prescription', (data) => {
      addToast(data.message, 'success');
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [isAuthenticated, user?._id, addToast]);

  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  );
};
