import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('loading'); // loading, success, error

    useEffect(() => {
        const verify = async () => {
            try {
                await API.get(`/auth/verify/${token}`);
                setStatus('success');
            } catch (err) {
                setStatus('error');
            }
        };
        verify();
    }, [token]);

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="glass max-w-md w-full p-10 text-center">
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="text-primary animate-spin mb-4" size={48} />
                        <h1 className="text-2xl font-bold text-white">Verifying Email...</h1>
                    </div>
                )}
                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <CheckCircle className="text-accent-green mb-4" size={48} />
                        <h1 className="text-2xl font-bold text-white mb-4">Email Verified!</h1>
                        <p className="text-text-muted mb-8">Your account has been successfully verified. You can now sign in.</p>
                        <Link to="/login" className="btn btn-primary w-full justify-center">Go to Login</Link>
                    </div>
                )}
                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <XCircle className="text-accent-red mb-4" size={48} />
                        <h1 className="text-2xl font-bold text-white mb-4">Verification Failed</h1>
                        <p className="text-text-muted mb-8">The verification link is invalid or has expired.</p>
                        <Link to="/register" className="btn btn-outline w-full justify-center">Try Registering Again</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
