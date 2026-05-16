import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    Package, 
    AlertTriangle, 
    FileText, 
    LogOut, 
    Settings,
    Layers
} from 'lucide-react';

const Sidebar = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
        { name: 'Inventory', icon: <Package size={20} />, path: '/inventory' },
        { name: 'Low Stock', icon: <AlertTriangle size={20} />, path: '/low-stock' },
        { name: 'Reports', icon: <FileText size={20} />, path: '/reports' },
    ];

    return (
        <div className="glass h-[calc(100vh-2rem)] w-64 m-4 flex flex-col p-6 sticky top-4">
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="bg-primary p-2 rounded-xl">
                    <Layers className="text-white" size={24} />
                </div>
                <h2 className="text-xl font-bold brand bg-gradient-to-r from-primary to-accent-cyan bg-clip-text text-transparent">
                    SPARE-PART
                </h2>
            </div>

            <nav className="flex-1 flex flex-col gap-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => 
                            `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                                isActive 
                                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                : 'text-text-muted hover:bg-slate-100 hover:text-primary'
                            }`
                        }
                    >
                        {item.icon}
                        <span className="font-medium">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <button 
                onClick={handleLogout}
                className="mt-auto flex items-center gap-4 px-4 py-3 rounded-xl text-accent-red hover:bg-red-500/10 transition-all"
            >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
            </button>
        </div>
    );
};

export default Sidebar;
