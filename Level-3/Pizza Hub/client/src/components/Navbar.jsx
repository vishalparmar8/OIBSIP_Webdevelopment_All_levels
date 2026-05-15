import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Pizza, LogOut, User, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <motion.nav 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="navbar"
        >
            <div className="container">
                <Link to="/" className="logo">
                    <Pizza size={32} color="var(--primary)" />
                    <span>PizzaHub</span>
                </Link>
                <div className="nav-links">
                    {user ? (
                        <>
                            {user.role === 'user' ? (
                                <>
                                    <Link to="/dashboard">Dashboard</Link>
                                    <Link to="/customize" className="btn-primary">Build Pizza</Link>
                                </>
                            ) : (
                                <Link to="/admin">Admin Panel</Link>
                            )}
                            <button onClick={handleLogout} className="btn-logout" title="Logout">
                                <LogOut size={20} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/register" className="btn-primary">Register</Link>
                        </>
                    )}
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                .navbar {
                    padding: 1rem 2rem;
                    background: var(--glass);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid var(--glass-border);
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                }
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .logo {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--primary);
                }
                .nav-links {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }
                .nav-links a {
                    font-weight: 500;
                    transition: color 0.3s;
                }
                .nav-links a:hover {
                    color: var(--primary);
                }
                .btn-logout {
                    background: transparent;
                    color: var(--text-muted);
                    padding: 0.5rem;
                    border: none;
                    display: flex;
                    align-items: center;
                }
                .btn-logout:hover {
                    color: var(--error);
                    transform: scale(1.1);
                }
            `}} />
        </motion.nav>
    );
};

export default Navbar;
