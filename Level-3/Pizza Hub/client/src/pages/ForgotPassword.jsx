import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setMessage(res.data.message);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong');
            setMessage('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="glass-card auth-card"
            >
                <div className="icon-circle"><Mail size={32} color="var(--primary)" /></div>
                <h2>Forgot Password?</h2>
                <p>Don't worry, it happens. Enter your email and we'll send you instructions to reset your password.</p>
                
                {message && <div className="success-msg">{message}</div>}
                {error && <div className="error-msg">{error}</div>}
                
                {!message && (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                                placeholder="name@example.com"
                            />
                        </div>
                        <button type="submit" className="btn-primary w-full" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}
                
                <div className="auth-footer">
                    <Link to="/login" className="back-link">Return to Login</Link>
                </div>
            </motion.div>
            <style dangerouslySetInnerHTML={{ __html: `
                .icon-circle { width: 64px; height: 64px; background: rgba(245, 158, 11, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
                .auth-card h2 { margin-bottom: 0.75rem; }
                .auth-card p { font-size: 0.95rem; margin-bottom: 2rem; line-height: 1.6; }
                .back-link { font-weight: 600; color: var(--text-muted); text-decoration: none; transition: color 0.3s; }
                .back-link:hover { color: var(--primary); }
                .success-msg { background: rgba(34, 197, 94, 0.1); color: var(--success); padding: 1.25rem; border-radius: 0.75rem; border: 1px solid rgba(34, 197, 94, 0.2); line-height: 1.5; }
            `}} />
        </div>
    );
};

export default ForgotPassword;
