import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Badge from "./Badge";
import SignIn from "./SignIn";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId="417816491383-i014i3jlhr2eiasno2mmbi2ei5shct8j.apps.googleusercontent.com"
    redirectUri="https://messaadi-chaima.github.io/Badges/oauth2callback"
    >
      <div className="containder">
        <BrowserRouter basename="/Badges">
          <Routes>
            <Route path="/" element={<SignIn />} />
            <Route path="/Badge" element={<Badge />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer />
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
