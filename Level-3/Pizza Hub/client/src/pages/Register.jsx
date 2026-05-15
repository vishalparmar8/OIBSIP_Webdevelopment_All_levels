import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', formData);
            setMessage(res.data.message);
            setError('');
            
            // If auto-verified (no email config or email failed but auto-verified), redirect to login
            if (res.data.message.includes('auto-verified')) {
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.error || 'Registration failed. Please check if the server is running.');
            setMessage('');
        }
    };

    return (
        <div className="auth-page">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card auth-card"
            >
                <h2>Join <span className="highlight">PizzaHub</span></h2>
                <p>Create your account to start crafting pizzas</p>
                {message && <div className="success-msg">{message}</div>}
                {error && <div className="error-msg">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="John Doe" />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required placeholder="john@example.com" />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required placeholder="••••••••" />
                    </div>
                    <div className="form-group">
                        <label>Account Type</label>
                        <select 
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--glass-border)' }}
                            value={formData.role} 
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                        >
                            <option value="user">User (Customer)</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>
                    <button type="submit" className="btn-primary w-full">Create Account</button>
                </form>
                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Sign In</Link></p>
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
                    max-width: 450px;
                    text-align: center;
                }
                .auth-card h2 { margin-bottom: 0.5rem; font-size: 2rem; }
                .auth-card p { color: var(--text-muted); margin-bottom: 2rem; }
                .form-group { text-align: left; margin-bottom: 1.25rem; }
                .form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.85rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
                .success-msg { background: rgba(34, 197, 94, 0.1); color: var(--success); padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; font-size: 0.9rem; border: 1px solid rgba(34, 197, 94, 0.2); }
                .error-msg { background: rgba(239, 68, 68, 0.1); color: var(--error); padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; font-size: 0.9rem; border: 1px solid rgba(239, 68, 68, 0.2); }
                .w-full { width: 100%; margin-top: 1rem; }
                .auth-footer { margin-top: 2rem; font-size: 0.9rem; }
                .auth-footer p { color: var(--text-muted); }
                .auth-footer a { color: var(--primary); font-weight: 700; }
            `}} />
        </div>
    );
};

export default Register;
