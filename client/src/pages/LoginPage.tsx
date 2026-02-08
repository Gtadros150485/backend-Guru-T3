import React from 'react';
import LoginForm from '../components/LoginForm/LoginForm';
import {LoginFormData} from '..types'
import type {LoginFormProps} from "../types";



const LoginPage: React.FC = () => {
    const handleLoginSubmit = async (formData: LoginFormData)=>{
        console.log('Login form submitted:', formData)
        //Логика для логина

    }

    return (
    <main className = "login-page" role = "main">
        <div className="page-container">
            <LoginForm
                onSubmit={handleLoginSubmit}
                isLoading={false}
            /> </div>
        </main>

);
};

export default LoginPage;


