import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import { Lock, Layers } from 'lucide-react';

const ResetPassword = () => {
    const { token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) return setError('Passwords do not match');
        
        setLoading(true);
        try {
            await API.put(`/auth/reset-password/${token}`, { password });
            alert('Password reset successful! Please login.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Reset failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-bg-light p-4">
            <div className="glass max-w-md w-full p-10 relative overflow-hidden flex flex-col mx-auto">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent-cyan"></div>
                
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-primary/10 p-4 rounded-2xl mb-4 text-primary">
                        <Layers size={32} />
                    </div>
                    <h1 className="text-3xl font-bold brand text-text-main text-center">Reset Password</h1>
                    <p className="text-text-muted mt-2 text-center">Enter your new password below</p>
                </div>

                {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-6 text-sm text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="w-full flex flex-col">
                    <div className="input-group">
                        <label>New Password</label>
                        <div className="relative flex items-center">
                            <Lock className="absolute left-4 text-text-muted" size={18} />
                            <input 
                                type="password" 
                                className="input-field pl-12 w-full" 
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Confirm Password</label>
                        <div className="relative flex items-center">
                            <Lock className="absolute left-4 text-text-muted" size={18} />
                            <input 
                                type="password" 
                                className="input-field pl-12 w-full" 
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button disabled={loading} className="btn btn-primary w-full justify-center py-4 text-lg mt-4 flex justify-center text-center">
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
