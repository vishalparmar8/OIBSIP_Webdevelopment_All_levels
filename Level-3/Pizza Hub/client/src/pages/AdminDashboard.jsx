import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Package, ClipboardList, Bell, TrendingUp, RefreshCcw } from 'lucide-react';

const AdminDashboard = () => {
    const [inventory, setInventory] = useState([]);
    const [orders, setOrders] = useState([]);
    const [view, setView] = useState('inventory'); // 'inventory' or 'orders'
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const invRes = await axios.get('http://localhost:5000/api/inventory');
            const ordRes = await axios.get('http://localhost:5000/api/orders');
            setInventory(invRes.data);
            setOrders(ordRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch data", err);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Polling every 10s
        return () => clearInterval(interval);
    }, []);

    const updateStock = async (id, newStock) => {
        try {
            await axios.put(`http://localhost:5000/api/inventory/${id}`, { stock: newStock });
            fetchData();
        } catch (err) {
            alert('Failed to update stock');
        }
    };

    const updateOrderStatus = async (id, status) => {
        try {
            await axios.put(`http://localhost:5000/api/orders/${id}/status`, { status });
            fetchData();
        } catch (err) {
            alert('Failed to update order status');
        }
    };

    const lowStockItems = inventory.filter(item => item.stock < item.threshold);

    if (loading) return <div className="loading">Initializing Dashboard...</div>;

    return (
        <div className="admin-page">
            <div className="admin-container">
                <header className="admin-header">
                    <div className="header-top">
                        <h1>Admin <span className="highlight">Dashboard</span></h1>
                        <button onClick={fetchData} className="refresh-btn"><RefreshCcw size={18} /> Refresh</button>
                    </div>
                    <div className="stats-grid">
                        <motion.div whileHover={{ y: -5 }} className="stat-card">
                            <div className="icon-box"><Package size={24} color="var(--primary)" /></div>
                            <div className="stat-info">
                                <h3>{inventory.length}</h3>
                                <p>Ingredients</p>
                            </div>
                        </motion.div>
                        <motion.div whileHover={{ y: -5 }} className="stat-card">
                            <div className="icon-box"><ClipboardList size={24} color="var(--secondary)" /></div>
                            <div className="stat-info">
                                <h3>{orders.length}</h3>
                                <p>Total Orders</p>
                            </div>
                        </motion.div>
                        <motion.div whileHover={{ y: -5 }} className={`stat-card ${lowStockItems.length > 0 ? 'alert' : ''}`}>
                            <div className="icon-box"><Bell size={24} color={lowStockItems.length > 0 ? "var(--error)" : "var(--text-muted)"} /></div>
                            <div className="stat-info">
                                <h3>{lowStockItems.length}</h3>
                                <p>Low Stock</p>
                            </div>
                        </motion.div>
                    </div>
                </header>

                <div className="view-switcher">
                    <button className={view === 'inventory' ? 'active' : ''} onClick={() => setView('inventory')}>Inventory Management</button>
                    <button className={view === 'orders' ? 'active' : ''} onClick={() => setView('orders')}>Order Tracking</button>
                </div>

                <motion.main 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card main-content"
                >
                    {view === 'inventory' ? (
                        <div className="inventory-view">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Item Name</th>
                                        <th>Category</th>
                                        <th>Stock Level</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventory.map(item => (
                                        <tr key={item._id}>
                                            <td><strong>{item.name}</strong></td>
                                            <td className="capitalize">{item.category}</td>
                                            <td>
                                                <div className="stock-bar-container">
                                                    <div className="stock-label">{item.stock} units</div>
                                                    <div className="stock-bar">
                                                        <div 
                                                            className={`stock-fill ${item.stock < item.threshold ? 'low' : ''}`} 
                                                            style={{ width: `${Math.min(item.stock, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${item.stock < item.threshold ? 'warning' : 'healthy'}`}>
                                                    {item.stock < item.threshold ? 'Low Stock' : 'Optimal'}
                                                </span>
                                            </td>
                                            <td>
                                                <button onClick={() => updateStock(item._id, item.stock + 20)} className="btn-small btn-secondary">Refill +20</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="orders-view">
                            <div className="orders-list">
                                {orders.length > 0 ? orders.map(order => (
                                    <div key={order._id} className="order-item-card">
                                        <div className="order-main">
                                            <div className="order-head">
                                                <h4>Order ID: <span className="id-text">#{order._id.slice(-6)}</span></h4>
                                                <span className="order-date">{new Date(order.createdAt).toLocaleString()}</span>
                                            </div>
                                            <div className="order-customer">
                                                <strong>{order.user?.name}</strong> • {order.user?.email}
                                            </div>
                                            <div className="order-items-row">
                                                {order.items.map((it, idx) => (
                                                    <span key={idx} className="item-pill">{it.name}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="order-meta">
                                            <div className="price-tag">₹{order.totalAmount}</div>
                                            <div className="status-control">
                                                <label>Status:</label>
                                                <select 
                                                    value={order.orderStatus} 
                                                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                    className="status-dropdown"
                                                >
                                                    <option value="Order Received">Order Received</option>
                                                    <option value="In the kitchen">In the kitchen</option>
                                                    <option value="Sent to delivery">Sent to delivery</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )) : <div className="no-data">No orders yet.</div>}
                            </div>
                        </div>
                    )}
                </motion.main>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .admin-page { min-height: 100vh; padding: 2rem 0; }
                .admin-container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
                .admin-header { margin-bottom: 3rem; }
                .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .header-top h1 { font-size: 2.5rem; }
                .refresh-btn { background: transparent; border: 1px solid var(--glass-border); color: var(--text-muted); padding: 0.5rem 1rem; border-radius: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
                .refresh-btn:hover { border-color: var(--primary); color: var(--primary); }
                .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
                .stat-card { background: var(--surface); padding: 1.5rem; border-radius: 1.25rem; display: flex; align-items: center; gap: 1.5rem; border: 1px solid var(--glass-border); }
                .stat-card.alert { border-color: var(--error); background: rgba(239, 68, 68, 0.05); }
                .icon-box { background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 1rem; }
                .stat-info h3 { font-size: 1.8rem; line-height: 1.2; }
                .stat-info p { color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; }
                
                .view-switcher { display: flex; gap: 1rem; margin-bottom: 2rem; }
                .view-switcher button { background: transparent; border: 1px solid var(--glass-border); color: var(--text-muted); padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 600; font-size: 0.9rem; }
                .view-switcher button.active { background: var(--primary); border-color: var(--primary); color: black; }
                
                .main-content { padding: 2rem; overflow-x: auto; }
                .admin-table { width: 100%; border-collapse: collapse; min-width: 800px; }
                .admin-table th { text-align: left; padding: 1rem; border-bottom: 2px solid var(--glass-border); color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase; }
                .admin-table td { padding: 1.25rem 1rem; border-bottom: 1px solid var(--glass-border); vertical-align: middle; }
                
                .stock-bar-container { width: 150px; }
                .stock-label { font-size: 0.8rem; margin-bottom: 0.4rem; }
                .stock-bar { height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; }
                .stock-fill { height: 100%; background: var(--secondary); border-radius: 3px; }
                .stock-fill.low { background: var(--error); }
                
                .status-badge { padding: 0.25rem 0.75rem; border-radius: 2rem; font-size: 0.75rem; font-weight: 700; }
                .status-badge.healthy { background: rgba(16, 185, 129, 0.1); color: var(--secondary); }
                .status-badge.warning { background: rgba(239, 68, 68, 0.1); color: var(--error); }
                
                .orders-list { display: flex; flex-direction: column; gap: 1.5rem; }
                .order-item-card { background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: 1.25rem; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
                .order-head { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
                .id-text { color: var(--primary); }
                .order-date { font-size: 0.8rem; color: var(--text-muted); }
                .order-customer { font-size: 0.95rem; margin-bottom: 1rem; }
                .order-items-row { display: flex; gap: 0.5rem; flex-wrap: wrap; }
                .item-pill { background: var(--surface); padding: 0.25rem 0.6rem; border-radius: 0.5rem; font-size: 0.75rem; }
                
                .order-meta { text-align: right; }
                .order-meta .price-tag { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; }
                .status-control { display: flex; flex-direction: column; gap: 0.5rem; text-align: left; }
                .status-dropdown { background: var(--surface); color: var(--text); padding: 0.6rem; border-radius: 0.6rem; border: 1px solid var(--glass-border); font-size: 0.9rem; }
                .status-dropdown:focus { border-color: var(--primary); }
                
                .capitalize { text-transform: capitalize; }
                .loading { height: 80vh; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; color: var(--primary); }
                .no-data { text-align: center; color: var(--text-muted); padding: 3rem; }
            `}} />
        </div>
    );
};

export default AdminDashboard;
