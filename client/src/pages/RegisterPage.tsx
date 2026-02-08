import React from 'react';
import RegisterForm from '../components/registerForm';

const RegisterPage: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;
