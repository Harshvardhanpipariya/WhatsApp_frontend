import { Routes, Route } from 'react-router-dom'
import SetupProfile from './pages/SetupProfile'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Otp from './pages/Otp'
import Chat from './pages/Chat'
import Welcome from './pages/Welcome'
import { useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { connectSocket, disconnectSocket } from './service/socket';
function App() {

  const { user, token } = useAuth();

    useEffect(() => {
      if (user && token) {
        // Connect socket with user ID
        connectSocket(user._id);
      }
  
      return () => {
        disconnectSocket();
      };
    }, [user, token]);

  return (
    
    <Routes>

    <Route path='/' element={<Welcome/>} />

      <Route path="/login" element={<Login />} />

      <Route
        path="/signup"
        element={<Signup />}
      />

      <Route
        path="/otp"
        element={<Otp />}
      />

      <Route
        path="/chat"
        element={<Chat />}
      />



<Route
  path="/setup"
  element={<SetupProfile />}
/>
    </Routes>
  )
}

export default App