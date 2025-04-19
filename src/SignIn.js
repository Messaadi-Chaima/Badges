import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import './SignIn.css';
import Image from './Image1.jpg';

function SignIn() {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      // Récupérer le token ID pour décoder
      const decoded = jwtDecode(tokenResponse.credential || tokenResponse.access_token);
      console.log('Utilisateur connecté :', decoded);

      sessionStorage.setItem('user', JSON.stringify({
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        sub: decoded.sub,
        given_name: decoded.given_name,
        family_name: decoded.family_name
      }));

      navigate('/Badge');
    },
    onError: () => {
      console.error('Erreur de connexion Google');
    },
    prompt: "select_account"
  });

  return (
    <div className="signin-container">
      <div className="signin-box">
        <img src={Image} alt="Logo" style={{ width: "40%", marginBottom: "20px" }} />
        <h1>Créateur de Badges</h1>
        <h2>Ehs Mohamed Abderrahmani cardio-vasculaire</h2>
        <p>Connectez-vous pour accéder à vos projets de badges personnalisés</p>
        
        <button className="google-custom-button" onClick={() => login()}>
          Se connecter avec Google
        </button>
      </div>
    </div>
  );
}

export default SignIn;
