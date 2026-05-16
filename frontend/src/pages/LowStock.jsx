import React, { useState, useEffect } from 'react';
import API from '../api';
import { AlertTriangle, ArrowRight, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const LowStock = () => {
    const [lowStockParts, setLowStockParts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLowStock = async () => {
            try {
                const { data } = await API.get('/parts/analytics');
                setLowStockParts(data.lowStockItems);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLowStock();
    }, []);

    if (loading) return <div className="text-text-muted">Loading...</div>;

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4">
                <div className="bg-red-50 p-4 rounded-2xl">
                    <AlertTriangle className="text-red-600" size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-text-main mb-1">Low Stock Alerts</h1>
                    <p className="text-text-muted">Items where quantity is below or equal to threshold</p>
                </div>
            </div>

            {lowStockParts.length === 0 ? (
                <div className="glass p-20 flex flex-col items-center justify-center text-center">
                    <Package className="text-text-muted mb-4" size={64} />
                    <h3 className="text-2xl font-bold text-text-main mb-2">All Clear!</h3>
                    <p className="text-text-muted">Your inventory levels are currently healthy.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lowStockParts.map((part) => (
                        <div key={part._id} className="glass p-6 border-l-4 border-red-500 group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-xl font-bold text-text-main">{part.names[0]}</h4>
                                    <p className="text-xs text-text-muted font-mono">{part.partId}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-red-600 font-bold">{part.quantity} Left</p>
                                    <p className="text-[10px] text-text-muted">Threshold: {part.minStockThreshold}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-muted">Supplier:</span>
                                    <span className="text-text-main font-medium">{part.supplier}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-muted">Location:</span>
                                    <span className="text-text-main font-medium">{part.location}</span>
                                </div>
                            </div>

                            <Link 
                                to="/inventory" 
                                className="flex items-center gap-2 text-primary text-sm font-semibold hover:gap-3 transition-all"
                            >
                                Restock Item <ArrowRight size={16} />
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LowStock;
