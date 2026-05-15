import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const token = searchParams.get('token');

    useEffect(() => {
        const verify = async () => {
            try {
                await axios.get(`http://localhost:5000/api/auth/verify-email?token=${token}`);
                setStatus('success');
            } catch (err) {
                setStatus('error');
            }
        };
        if (token) verify();
        else setStatus('error');
    }, [token]);

    return (
        <div className="auth-page">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card auth-card">
                {status === 'verifying' && (
                    <div className="verifying">
                        <Loader2 className="spinner" size={48} color="var(--primary)" />
                        <h2>Verifying Email</h2>
                        <p>Please wait while we confirm your identity...</p>
                    </div>
                )}
                {status === 'success' && (
                    <div className="status-content">
                        <CheckCircle size={64} color="var(--success)" />
                        <h2>Email Verified!</h2>
                        <p>Your account is now active. You can start crafting pizzas.</p>
                        <Link to="/login" className="btn-primary w-full" style={{ display: 'block', marginTop: '2rem' }}>Sign In</Link>
                    </div>
                )}
                {status === 'error' && (
                    <div className="status-content">
                        <XCircle size={64} color="var(--error)" />
                        <h2>Verification Failed</h2>
                        <p>The verification link is invalid or has expired.</p>
                        <Link to="/register" className="btn-secondary w-full" style={{ display: 'block', marginTop: '2rem' }}>Back to Register</Link>
                    </div>
                )}
            </motion.div>
            <style dangerouslySetInnerHTML={{ __html: `
                .status-content { padding: 1rem 0; }
                .status-content h2 { margin: 1.5rem 0 0.5rem; font-size: 1.8rem; }
                .status-content p { color: var(--text-muted); }
                .spinner { animation: spin 2s linear infinite; margin-bottom: 1.5rem; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .verifying h2 { margin-top: 1rem; }
            `}} />
        </div>
    );
};

export default VerifyEmail;
