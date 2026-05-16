import React, { useState, useEffect } from 'react';
import API from '../api';
import { 
    Package, 
    DollarSign, 
    AlertCircle, 
    ArrowUpRight,
    Plus,
    History
} from 'lucide-react';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';

const StatCard = ({ title, value, icon, color, subValue }) => (
    <div className="glass p-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between h-full">
        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 ${color}`}></div>
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-slate-50 border border-slate-100`}>
                {React.cloneElement(icon, { className: color.replace('bg-', 'text-') })}
            </div>
            <ArrowUpRight className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
        </div>
        <div>
            <h3 className="text-text-muted text-sm font-medium mb-1">{title}</h3>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-text-main">{value}</span>
                {subValue && <span className="text-xs text-text-muted">{subValue}</span>}
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const { data } = await API.get('/parts/analytics');
                setAnalytics(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-full text-text-muted">Loading Analytics...</div>;

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text-main mb-2">Inventory Overview</h1>
                    <p className="text-text-muted">Real-time tracking of your spare parts system</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-text-muted">Current Value</p>
                    <p className="text-2xl font-bold text-accent-cyan">${analytics?.totalValue?.toLocaleString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Spare Parts" 
                    value={analytics?.totalParts} 
                    icon={<Package size={24} />} 
                    color="bg-primary"
                    subValue="Items in catalog"
                />
                <StatCard 
                    title="Low Stock Items" 
                    value={analytics?.lowStockCount} 
                    icon={<AlertCircle size={24} />} 
                    color="bg-orange-500"
                    subValue="Action required"
                />
                <StatCard 
                    title="Out of Stock" 
                    value={analytics?.outOfStockCount} 
                    icon={<AlertCircle size={24} />} 
                    color="bg-red-500"
                    subValue="Critically low"
                />
                <StatCard 
                    title="Total Valuation" 
                    value={`$${analytics?.totalValue?.toLocaleString()}`} 
                    icon={<DollarSign size={24} />} 
                    color="bg-accent-green"
                    subValue="Inventory worth"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass p-8">
                    <h3 className="text-xl font-bold text-text-main mb-6">Recent Parts Quantity</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics?.recentlyAdded?.map(p => ({ name: p.names[0].substring(0, 10) + '...', value: p.quantity }))}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                                    cursor={{ fill: '#f1f5f9' }}
                                />
                                <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <History className="text-primary" size={20} />
                        <h3 className="text-xl font-bold text-text-main">Recently Added</h3>
                    </div>
                    <div className="flex flex-col gap-4">
                        {analytics?.recentlyAdded?.map((part) => (
                            <div key={part._id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                                <div>
                                    <p className="font-semibold text-text-main">{part.names[0]}</p>
                                    <p className="text-xs text-text-muted">{part.partId}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-accent-cyan">{part.quantity} Qty</p>
                                    <p className="text-[10px] text-text-muted">{new Date(part.dateAdded).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
