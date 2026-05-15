import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            login(res.data.user, res.data.token);
            navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.error || 'Login failed. Please check your credentials or server status.');
        }
    };

    return (
        <div className="auth-page">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card auth-card"
            >
                <h2>Welcome Back</h2>
                <p>Login to your account</p>
                {error && <div className="error-msg">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="john@example.com" />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
                    </div>
                    <button type="submit" className="btn-primary w-full">Sign In</button>
                </form>
                <div className="auth-footer">
                    <Link to="/forgot-password">Forgot Password?</Link>
                    <p>Don't have an account? <Link to="/register">Create one</Link></p>
                </div>
            </motion.div>
            <style dangerouslySetInnerHTML={{ __html: `
                .auth-page {
                    min-height: calc(100vh - 80px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                }
                .auth-card {
                    width: 100%;
                    max-width: 400px;
                    text-align: center;
                }
                .auth-card h2 { margin-bottom: 0.5rem; font-size: 2rem; }
                .auth-card p { color: var(--text-muted); margin-bottom: 2rem; }
                .form-group { text-align: left; margin-bottom: 1.5rem; }
                .form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight: 500; }
                .error-msg { background: rgba(239, 68, 68, 0.1); color: var(--error); padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1.5rem; font-size: 0.9rem; border: 1px solid rgba(239, 68, 68, 0.2); }
                .w-full { width: 100%; margin-top: 1rem; }
                .auth-footer { margin-top: 2rem; font-size: 0.9rem; }
                .auth-footer p { color: var(--text-muted); margin-top: 1rem; }
                .auth-footer a { color: var(--primary); font-weight: 600; text-decoration: none; }
                .auth-footer a:hover { text-decoration: underline; }
            `}} />
        </div>
    );
};

export default Login;
