import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, Truck, Package, ChevronRight, ShoppingBag } from 'lucide-react';

const UserDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [varieties, setVarieties] = useState([]);
    const { user } = useContext(AuthContext);

    const fetchData = async () => {
        try {
            const ordRes = await axios.get(`http://localhost:5000/api/orders/user/${user.id}`);
            const varRes = await axios.get(`http://localhost:5000/api/pizzas`);
            setOrders(ordRes.data);
            setVarieties(varRes.data);
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 8000);
        return () => clearInterval(interval);
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Order Received': return <Package size={20} />;
            case 'In the kitchen': return <Clock size={20} />;
            case 'Sent to delivery': return <Truck size={20} />;
            default: return <CheckCircle size={20} />;
        }
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <div>
                        <h1>Hello, <span className="highlight">{user.name}</span></h1>
                        <p>Welcome back to your pizza dashboard</p>
                    </div>
                    <Link to="/customize" className="btn-primary build-btn">
                        Build New Pizza <ChevronRight size={18} />
                    </Link>
                </header>

                {/* Varieties Section */}
                <section className="varieties-section">
                    <div className="section-title">
                        <h2>Available Varieties</h2>
                        <span className="order-count">{varieties.length} Options</span>
                    </div>
                    <div className="varieties-grid">
                        {varieties.map((pizza, index) => (
                            <motion.div 
                                key={pizza._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="pizza-card glass-card"
                            >
                                <div className="pizza-img-wrapper">
                                    <img src={pizza.image} alt={pizza.name} />
                                    <div className="pizza-badge">₹{pizza.price}</div>
                                </div>
                                <div className="pizza-info">
                                    <h3>{pizza.name}</h3>
                                    <p>{pizza.description}</p>
                                    <Link to="/customize" className="btn-secondary w-full order-btn">
                                        Select & Order
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <main className="orders-section">
                    <div className="section-title">
                        <h2>Order History</h2>
                        <span className="order-count">{orders.length} Orders</span>
                    </div>

                    <div className="orders-grid">
                        {orders.length > 0 ? orders.map((order, index) => (
                            <motion.div 
                                key={order._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="order-card glass-card"
                            >
                                <div className="card-top">
                                    <div className="order-meta">
                                        <span className="order-id">#{order._id.slice(-6).toUpperCase()}</span>
                                        <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className={`status-badge ${order.orderStatus.toLowerCase().replace(/\s/g, '-')}`}>
                                        {getStatusIcon(order.orderStatus)}
                                        <span>{order.orderStatus}</span>
                                    </div>
                                </div>

                                <div className="order-items-list">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="item-line">
                                            <span>{item.name}</span>
                                            <span className="dot-line"></span>
                                            <span>₹{item.price}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="card-bottom">
                                    <div className="total-label">Total Amount</div>
                                    <div className="total-value">₹{order.totalAmount}</div>
                                </div>
                                
                                {order.orderStatus !== 'Sent to delivery' && (
                                    <div className="tracking-line">
                                        <div className="progress-dot active"></div>
                                        <div className={`progress-bar ${order.orderStatus !== 'Order Received' ? 'active' : ''}`}></div>
                                        <div className={`progress-dot ${order.orderStatus !== 'Order Received' ? 'active' : ''}`}></div>
                                        <div className={`progress-bar ${order.orderStatus === 'Sent to delivery' ? 'active' : ''}`}></div>
                                        <div className={`progress-dot ${order.orderStatus === 'Sent to delivery' ? 'active' : ''}`}></div>
                                    </div>
                                )}
                            </motion.div>
                        )) : (
                            <div className="empty-state">
                                <div className="empty-icon"><ShoppingBag size={48} /></div>
                                <h3>No Orders Yet!</h3>
                                <p>Your order history will appear here once you place an order.</p>
                                <Link to="/customize" className="btn-secondary">Start Your First Order</Link>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .dashboard-page { min-height: 100vh; padding: 4rem 0; }
                .dashboard-container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
                .dashboard-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 4rem; }
                .dashboard-header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
                .dashboard-header p { color: var(--text-muted); }
                .build-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; }

                .varieties-section { margin-bottom: 5rem; }
                .section-title { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
                .order-count { background: rgba(255,255,255,0.1); padding: 0.2rem 0.8rem; border-radius: 2rem; font-size: 0.8rem; color: var(--text-muted); }

                .varieties-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem; }
                .pizza-card { padding: 0; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.3s; }
                .pizza-card:hover { transform: translateY(-5px); }
                .pizza-img-wrapper { position: relative; height: 200px; }
                .pizza-img-wrapper img { width: 100%; height: 100%; object-fit: cover; }
                .pizza-badge { position: absolute; bottom: 1rem; right: 1rem; background: var(--primary); color: black; padding: 0.25rem 0.75rem; border-radius: 2rem; font-weight: 700; font-size: 0.9rem; }
                .pizza-info { padding: 1.5rem; flex: 1; display: flex; flex-direction: column; }
                .pizza-info h3 { margin-bottom: 0.5rem; font-size: 1.25rem; }
                .pizza-info p { color: var(--text-muted); font-size: 0.9rem; line-height: 1.4; margin-bottom: 1.5rem; flex: 1; }
                .order-btn { text-align: center; font-size: 0.9rem; }

                .orders-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 2rem; }
                .order-card { padding: 2rem; display: flex; flex-direction: column; }
                .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
                .order-meta { display: flex; flex-direction: column; }
                .order-id { font-weight: 700; color: var(--primary); font-size: 1.1rem; }
                .order-date { font-size: 0.8rem; color: var(--text-muted); }

                .status-badge { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 2rem; font-size: 0.8rem; font-weight: 700; }
                .status-badge.order-received { background: rgba(245, 158, 11, 0.1); color: var(--primary); }
                .status-badge.in-the-kitchen { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                .status-badge.sent-to-delivery { background: rgba(16, 185, 129, 0.1); color: var(--secondary); }

                .order-items-list { flex: 1; margin-bottom: 2rem; }
                .item-line { display: flex; align-items: center; margin-bottom: 0.75rem; color: var(--text-muted); font-size: 0.9rem; }
                .dot-line { flex: 1; border-bottom: 1px dotted rgba(255,255,255,0.1); margin: 0 0.5rem; }

                .card-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 1.5rem; border-top: 1px solid var(--glass-border); }
                .total-label { color: var(--text-muted); font-size: 0.9rem; }
                .total-value { font-size: 1.5rem; font-weight: 800; }

                .tracking-line { display: flex; align-items: center; margin-top: 1.5rem; padding: 0 1rem; }
                .progress-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--glass-border); }
                .progress-dot.active { background: var(--primary); box-shadow: 0 0 10px var(--primary); }
                .progress-bar { flex: 1; height: 2px; background: var(--glass-border); }
                .progress-bar.active { background: var(--primary); }

                .empty-state { grid-column: 1 / -1; text-align: center; padding: 6rem 2rem; background: rgba(255,255,255,0.02); border-radius: 2rem; border: 2px dashed var(--glass-border); }
                .empty-icon { color: var(--text-muted); margin-bottom: 1.5rem; }
                .empty-state h3 { font-size: 1.5rem; margin-bottom: 0.5rem; }
                .empty-state p { color: var(--text-muted); margin-bottom: 2rem; }

                @media (max-width: 768px) {
                    .dashboard-header { flex-direction: column; align-items: flex-start; gap: 2rem; }
                    .orders-grid { grid-template-columns: 1fr; }
                    .varieties-grid { grid-template-columns: 1fr; }
                }
            `}} />
        </div>
    );
};

export default UserDashboard;
