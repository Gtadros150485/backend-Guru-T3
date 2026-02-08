import React from 'react';
import {BrowserRouter as Router, Routes, Route } from 'react-router';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import './styles/globals.scss'


const APP: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={<ProductsPage />} />
                <Route path="/products" element={<ProductsPage />} />
                {/* добавить здесь routes */}
            </Routes>
        </Router>
    );
};

export default APP;