import React, { useContext } from 'react';
import { Sun, Moon, Search, UserCircle, Menu } from 'lucide-react';
import ThemeContext from '../context/ThemeContext';
import AuthContext from '../context/AuthContext';
import SearchContext from '../context/SearchContext';
import { API_URL } from '../config';
import { Link } from 'react-router-dom';

const Navbar = ({ toggleSidebar, isMobile }) => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { user } = useContext(AuthContext);
    const { searchTerm, setSearchTerm } = useContext(SearchContext);

    return (
        <header className="h-16 bg-bg-secondary border-b border-border flex items-center justify-between px-4 md:px-8 sticky top-0 z-20 transition-colors duration-300">
            <div className="flex items-center gap-4 flex-1">
                {/* Mobile Menu Button */}
                {isMobile && (
                    <button onClick={toggleSidebar} className="text-text-secondary hover:text-text-primary p-1">
                        <Menu size={24} />
                    </button>
                )}

                {/* Search Bar */}
                <div className="flex items-center gap-2 bg-bg-primary px-4 py-2 rounded-xl border border-border w-full max-w-[180px] md:max-w-md transition-colors duration-300">
                    <Search size={18} className="text-text-secondary" />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="bg-transparent border-none outline-none text-text-primary text-sm w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 md:gap-6">
                <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-bg-primary text-text-secondary transition-colors"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                
                <Link to="/profile" className="flex items-center gap-3 pl-4 border-l border-border cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-text-primary">{user?.name || 'User'}</p>
                        <p className="text-xs text-text-secondary">View Profile</p>
                    </div>
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 text-sm md:text-base">
                        {user?.name?.charAt(0).toUpperCase() || <UserCircle />}
                    </div>
                </Link>
            </div>
        </header>
    );
};

export default Navbar;  