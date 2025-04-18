import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Badge from "./Badge";
import SignIn from "./SignIn";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId="417816491383-t90ksfjigcpqk8fq12tjunnmq2kfjhha.apps.googleusercontent.com">
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
