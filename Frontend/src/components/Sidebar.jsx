import React from 'react';
import { LayoutDashboard, Wallet, TrendingUp, LogOut, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { API_URL } from '../config';

const Sidebar = ({ isOpen, toggleSidebar, logout, isMobile }) => {
    const location = useLocation();

    const menu = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={22} /> },
        { name: 'Folders', path: '/folders', icon: <Wallet size={22} /> },
        { name: 'Analytics', path: '/analytics', icon: <TrendingUp size={22} /> },
        { name: 'Profile', path: '/profile', icon: <User size={22} /> },
    ];

    return (
        <aside className="h-full bg-bg-secondary border-r border-border flex flex-col shadow-xl transition-all duration-300 relative overflow-hidden">
            {/* Header / Logo */}
            <div className="h-16 flex items-center justify-center border-b border-border relative shrink-0">
                <div className={`transition-all duration-300 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 hidden'}`}>
                    <h1 className="text-2xl font-bold text-blue-500 flex items-center gap-2">
                        FinFlow 
                    </h1>
                </div>
                
                {!isOpen && (
                    <span className="text-blue-600 font-bold text-2xl absolute transition-all duration-300">FF</span>
                )}

                {/* Toggle Button (Desktop Only) */}
                {!isMobile && (
                    <button 
                        onClick={toggleSidebar}
                        className="absolute -right-0.5 top-6 bg-bg-secondary border border-border rounded-full p-1 text-text-secondary hover:text-blue-500 shadow-sm z-50 cursor-pointer hover:shadow-md transition-all"
                    >
                        {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                    </button>
                )}
            </div>

            {/* Navigation - Added 'custom-scrollbar' and 'overflow-x-hidden' */}
            <nav className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {menu.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link 
                            key={item.path} 
                            to={item.path}
                            onClick={isMobile ? toggleSidebar : undefined} 
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all group relative
                                ${isActive 
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                                    : 'text-text-secondary hover:bg-bg-primary hover:text-text-primary'
                                }`}
                        >
                            <div className="min-w-[24px] flex justify-center">{item.icon}</div>
                            
                            {/* Text with fixed height to prevent layout jumps */}
                            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 origin-left
                                ${isOpen ? 'opacity-100 w-auto translate-x-0' : 'opacity-0 w-0 -translate-x-5'}
                            `}>
                                {item.name}
                            </span>

                            {/* Tooltip for collapsed state */}
                            {!isOpen && !isMobile && (
                                <div className="absolute left-14 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-xl pointer-events-none">
                                    {item.name}
                                    {/* Tiny arrow for the tooltip */}
                                    <div className="absolute top-1/2 -left-1 -mt-1 border-4 border-transparent border-r-slate-800"></div>
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Section */}
            <div className="p-3 border-t border-border shrink-0 bg-bg-secondary">
                <button 
                    onClick={logout} 
                    className={`flex items-center gap-3 w-full p-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all group ${!isOpen && 'justify-center'}`}
                >
                    <div className="min-w-[24px] flex justify-center group-hover:scale-110 transition-transform"><LogOut size={20} /></div>
                    <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 origin-left
                        ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}
                    `}>
                        Logout
                    </span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;