import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import HomePage from './Routes/HomePage';
import Login from './Routes/Login';
import Register from './Routes/Register';
import ChatPage from './Routes/ChatPage';
import DevPage from './Routes/DevPage';
import { Notifications } from 'react-push-notification';


function App() {
  const { user } = useUser();

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const [currentUser, setCurrentUser] = useState(null);

  const RegisterUser = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.primaryEmailAddress.emailAddress,
          name: user.username,
          imgUrl: user.imageUrl
        })
      });


      if (!response.ok) {
        console.log('Something went wrong try to reload site');
        return
      }

      const data = await response.json();
      if (data) {
        setCurrentUser(data);
        return data;
      }
    } catch (err) {
      console.error(err.message);
    }
  }


  useEffect(() => {
    document.title = process.env.REACT_APP_APP_NAME
  }, [])


  useEffect(() => {
    if (user) {
      RegisterUser();
    }
  }, [user])

  return (
    <div className="app">
      <Notifications />
      <SignedOut>
        <Routes>
          <Route path='*' element={<Navigate to={'/home'} />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
        </Routes>
      </SignedOut>
      <SignedIn>
        <Routes>
          <Route path='/' element={<Navigate to={'/chats'} />} />
          <Route path="/*" element={<ChatPage currentUser={currentUser} />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/dev" element={<DevPage />} />
        </Routes>
      </SignedIn>
    </div >
  );
}

export default App;
