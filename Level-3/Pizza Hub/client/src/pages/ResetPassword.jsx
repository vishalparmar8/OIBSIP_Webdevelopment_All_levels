import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) return setError('Passwords do not match');
        try {
            await axios.post('http://localhost:5000/api/auth/reset-password', { token, password });
            setMessage('Password reset successful. Redirecting to login...');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Reset failed');
        }
    };

    return (
        <div className="auth-page">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="glass-card auth-card"
            >
                <div className="icon-circle"><Lock size={32} color="var(--primary)" /></div>
                <h2>Reset Password</h2>
                <p>Choose a strong password to secure your account.</p>
                
                {message && <div className="success-msg">{message}</div>}
                {error && <div className="error-msg">{error}</div>}
                
                {!message && (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>New Password</label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input 
                                type="password" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                required 
                                placeholder="••••••••"
                            />
                        </div>
                        <button type="submit" className="btn-primary w-full">Update Password</button>
                    </form>
                )}
            </motion.div>
            <style dangerouslySetInnerHTML={{ __html: `
                .icon-circle { width: 64px; height: 64px; background: rgba(245, 158, 11, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
                .success-msg { background: rgba(34, 197, 94, 0.1); color: var(--success); padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; font-size: 0.9rem; border: 1px solid rgba(34, 197, 94, 0.2); }
            `}} />
        </div>
    );
};

export default ResetPassword;
