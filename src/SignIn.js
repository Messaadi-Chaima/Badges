import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import './SignIn.css';
import Image from './Image1.jpg';

function SignIn() {
  const navigate = useNavigate();

  const handleSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    console.log('Utilisateur connecté :', decoded);
    
    // Stocker les informations de l'utilisateur dans sessionStorage
    sessionStorage.setItem('user', JSON.stringify({
      name: decoded.name,
      email: decoded.email,
      picture: decoded.picture,
      sub: decoded.sub
    }));
    
    // Rediriger vers la page Badge
    navigate('/Badge');
  };

  const handleError = () => {
    console.error('Erreur de connexion Google');
  };

  return (
    <div className="signin-container">
      <div className="signin-box">
        <img src={Image} alt="Logo" width="20%" />
        <h2>Connexion</h2>
        <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
      </div>
    </div>
  );
}

export default SignIn;