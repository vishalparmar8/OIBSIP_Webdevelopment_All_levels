import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-bg-light">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto flex justify-center">
                <div className="animate-fade max-w-7xl w-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
