import React, { useEffect, useState } from 'react';
import './App.css';
import { Route, Routes, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-react';
import HomePage from './Routes/HomePage';
import Login from './Routes/Login';
import Register from './Routes/Register';
import ChatPage from './Routes/ChatPage';
import DevPage from './Routes/DevPage';
import { Notifications } from 'react-push-notification';
import { api, setAuthToken } from './Utils/api';
import { connectSocket, disconnectSocket } from './Utils/socket';
import { applyThemeFromSettings, getSettings } from './Utils/settings';

function App() {
  const { getToken } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    document.title = process.env.REACT_APP_APP_NAME;
    const settings = getSettings();
    applyThemeFromSettings(settings);
    document.body.classList.toggle('compact-mode', Boolean(settings.compactMode));
  }, []);

  useEffect(() => {
    let mounted = true;

    async function bootstrapAuth() {
      try {
        const clerkToken = await getToken();
        if (!clerkToken) return;

        const data = await api.clerkLogin(clerkToken);
        if (!mounted || !data?.token) return;

        setAuthToken(data.token);
        connectSocket(data.token);
        setCurrentUser(data.user);
      } catch (error) {
        console.error('Auth bootstrap failed', error);
      }
    }

    bootstrapAuth();

    return () => {
      mounted = false;
      disconnectSocket();
    };
  }, [getToken]);

  return (
    <div className="app">
      <Notifications />
      <SignedOut>
        <Routes>
          <Route path="*" element={<Navigate to={'/home'} />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
        </Routes>
      </SignedOut>
      <SignedIn>
        <Routes>
          <Route path="/" element={<Navigate to={'/chats'} />} />
          <Route path="/*" element={<ChatPage currentUser={currentUser} />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/dev" element={<DevPage />} />
        </Routes>
      </SignedIn>
    </div>
  );
}

export default App;
