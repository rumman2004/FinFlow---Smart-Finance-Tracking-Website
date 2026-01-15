import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthContext, { AuthProvider } from './context/AuthContext';
import ThemeContext, { ThemeProvider } from './context/ThemeContext';
import { SearchProvider } from './context/SearchContext';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Folders from './pages/Folders';
import FolderDetails from './pages/FolderDetails';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children }) => {
    const { token } = useContext(AuthContext);
    return token ? children : <Navigate to="/login" />;
};

const Layout = ({ children }) => {
    const { logout } = useContext(AuthContext);
    
    // Default to open on desktop, closed on mobile
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            // If switching to desktop, auto-open sidebar. If mobile, auto-close.
            if (!mobile) setIsSidebarOpen(true);
            if (mobile) setIsSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex min-h-screen bg-bg-primary transition-colors duration-300 relative">
            {/* Sidebar Container */}
            <div className={`fixed top-0 left-0 h-full z-40 transition-all duration-300 ease-in-out
                ${isSidebarOpen ? 'w-64' : 'w-20'} 
                ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
            `}>
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} logout={logout} isMobile={isMobile} />
            </div>

            {/* Mobile Overlay (Darkens background when sidebar is open) */}
            {isMobile && isSidebarOpen && (
                <div 
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
                />
            )}
            
            {/* Main Content Area */}
            {/* Logic: On Desktop, add margin-left equal to sidebar width. On Mobile, no margin (sidebar floats). */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 
                ${!isMobile ? (isSidebarOpen ? 'ml-64' : 'ml-20') : 'ml-0'}
            `}>
                <Navbar toggleSidebar={toggleSidebar} isMobile={isMobile} />
                <main className="p-4 md:p-8 flex-1 overflow-x-hidden w-full">
                    {children}
                </main>
            </div>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <SearchProvider>
                    <Router>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />

                            <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                            <Route path="/folders" element={<ProtectedRoute><Layout><Folders /></Layout></ProtectedRoute>} />
                            <Route path="/folders/:id" element={<ProtectedRoute><Layout><FolderDetails /></Layout></ProtectedRoute>} />
                            <Route path="/analytics" element={<ProtectedRoute><Layout><Analytics /></Layout></ProtectedRoute>} />
                            <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
                        </Routes>
                    </Router>
                </SearchProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;