import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, Layers } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await API.post('/auth/login', formData);
            login(data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
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
                    <h1 className="text-3xl font-bold brand text-text-main text-center">Welcome Back</h1>
                    <p className="text-text-muted mt-2 text-center">Manage your inventory with precision</p>
                </div>

                {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-6 text-sm text-center w-full">{error}</div>}

                <form onSubmit={handleSubmit} className="w-full flex flex-col">
                    <div className="input-group">
                        <label>Email Address</label>
                        <div className="relative flex items-center">
                            <Mail className="absolute left-4 text-text-muted" size={18} />
                            <input 
                                type="email" 
                                className="input-field pl-12 w-full" 
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <div className="relative flex items-center">
                            <Lock className="absolute left-4 text-text-muted" size={18} />
                            <input 
                                type="password" 
                                className="input-field pl-12 w-full" 
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end mb-8 w-full">
                        <Link to="/forgot-password" size="sm" className="text-sm text-primary hover:underline">Forgot password?</Link>
                    </div>

                    <button disabled={loading} className="btn btn-primary w-full py-4 text-lg text-center flex justify-center">
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-text-muted mt-8 text-sm w-full">
                    Don't have an account? <Link to="/register" className="text-primary font-semibold hover:underline">Register now</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
