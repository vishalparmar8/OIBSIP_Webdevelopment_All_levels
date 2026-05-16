import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { Mail, Layers, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            await API.post('/auth/forgot-password', { email });
            setMessage('If an account exists with this email, you will receive a reset link shortly.');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
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
                    <p className="text-text-muted mt-2 text-center">Enter your email to receive a recovery link</p>
                </div>

                {message && <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-xl mb-6 text-sm text-center">{message}</div>}
                {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-6 text-sm text-center">{error}</div>}

                {!message && (
                    <form onSubmit={handleSubmit} className="w-full flex flex-col">
                        <div className="input-group">
                            <label>Email Address</label>
                            <div className="relative flex items-center">
                                <Mail className="absolute left-4 text-text-muted" size={18} />
                                <input 
                                    type="email" 
                                    className="input-field pl-12 w-full" 
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button disabled={loading} className="btn btn-primary w-full justify-center py-4 text-lg mt-4 flex justify-center text-center">
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}

                <div className="mt-8 flex justify-center">
                    <Link to="/login" className="text-text-muted hover:text-text-main flex items-center gap-2 text-sm transition-all">
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
