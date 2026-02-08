import React from 'react';
import {BrowserRouter as Router, Routes, Route } from 'react-router';
import LoginPage from './pages/LoginPage';
import './styles/globals.scss'


const APP: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                {/* добавить здесь routes */}
            </Routes>
        </Router>
    );
};

export default APP;