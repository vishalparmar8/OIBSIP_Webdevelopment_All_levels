import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="home-container">
            <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="hero-content"
            >
                <h1>Craft Your Perfect <span className="highlight">Pizza</span></h1>
                <p>Choose from our premium bases, fresh sauces, and artisan cheeses. Delivered hot to your doorstep. Experience the modern classic taste.</p>
                <div className="cta-group">
                    <Link to="/customize" className="btn-primary btn-lg">Start Building</Link>
                    <Link to="/dashboard" className="btn-secondary btn-lg">Order Now</Link>
                </div>
            </motion.div>
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="hero-image"
            >
                <div className="image-wrapper">
                    <img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=1000" alt="Premium Pizza" />
                    <div className="floating-badge">
                        <span>Best Choice</span>
                    </div>
                </div>
            </motion.div>
            <style dangerouslySetInnerHTML={{ __html: `
                .home-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    gap: 4rem;
                    align-items: center;
                    padding: 4rem 2rem;
                    min-height: calc(100vh - 80px);
                }
                .hero-content h1 { font-size: 4.5rem; line-height: 1.1; margin-bottom: 1.5rem; font-weight: 700; }
                .highlight { color: var(--primary); }
                .hero-content p { font-size: 1.25rem; color: var(--text-muted); margin-bottom: 2.5rem; max-width: 500px; }
                .cta-group { display: flex; gap: 1.5rem; }
                .btn-lg { padding: 1rem 2.5rem; font-size: 1.1rem; text-align: center; }
                .hero-image .image-wrapper { position: relative; }
                .hero-image img { width: 100%; border-radius: 2rem; box-shadow: 0 50px 100px -20px rgba(0,0,0,0.6); transform: rotate(2deg); }
                .floating-badge {
                    position: absolute;
                    top: -20px;
                    right: -20px;
                    background: var(--primary);
                    color: black;
                    padding: 1rem;
                    border-radius: 50%;
                    font-weight: 700;
                    box-shadow: 0 10px 20px rgba(245, 158, 11, 0.4);
                    animation: float 3s ease-in-out infinite;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @media (max-width: 968px) {
                    .home-container { grid-template-columns: 1fr; text-align: center; padding: 2rem; }
                    .hero-content { order: 2; }
                    .hero-content p { margin: 0 auto 2.5rem; }
                    .cta-group { justify-content: center; flex-direction: column; }
                    .hero-content h1 { font-size: 3rem; }
                    .hero-image img { transform: rotate(0); }
                }
            `}} />
        </div>
    );
};

export default Home;
