import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Menu, Home, Users, Search, DollarSign, AlertCircle, Bell, LogOut, X, User } from 'lucide-react';
import logo from './assets/logo.png';

// Import Pages
import HomePage from './pages/Home';
import Login from './pages/Login';
import StudentSignup from './pages/StudentSignup';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import RoomBooking from './pages/RoomBooking';
import Complaints from './pages/Complaints';
import Payments from './pages/Payments';
import Notices from './pages/Notices';
import StudentProfile from './pages/StudentProfile';

const ProtectedRoute = ({ children, allowedRole }) => {
    const userStr = allowedRole === 'Admin' ? localStorage.getItem('adminUser') : localStorage.getItem('user');
    if (!userStr) {
        return <Navigate to={allowedRole === 'Admin' ? "/admin-login" : "/"} />;
    }
    
    try {
        const user = JSON.parse(userStr);
        if (allowedRole && user.role !== allowedRole) {
            return <Navigate to={user.role === 'Admin' ? "/admin" : "/student"} />;
        }
    } catch {
        return <Navigate to="/" />;
    }
    
    return children;
};

const handleLogout = (navigate) => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    // We let the link to "/" handle the navigation organically, but it's good practice
};

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    
    // Hide sidebar on auth pages and admin pages
    const isHidden = ['/', '/login', '/signup', '/admin-login', '/admin-register'].includes(location.pathname) || location.pathname.startsWith('/admin');
    
    if (isHidden) return null;

    return (
        <>
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="flex flex-col items-center justify-center pt-8 pb-6 border-b border-slate-800/50 px-6 group cursor-pointer relative bg-slate-900/50">
                    <button className="mobile-nav-toggle absolute right-4 top-4" onClick={() => setIsOpen(false)} style={{ display: isOpen ? 'block' : 'none', position: 'absolute', padding: 0 }}>
                        <X size={24} className="text-slate-400" />
                    </button>
                    <img src={logo} alt="HostelPro Logo" className="h-16 w-auto max-w-full object-contain mb-3 drop-shadow-[0_4px_12px_rgba(99,102,241,0.3)] transition-transform duration-300 group-hover:scale-105 mx-auto" />
                    <h2 className="text-xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent tracking-wide text-center">
                        HostelPro
                    </h2>
                    <p className="text-xs text-slate-400 font-medium tracking-wide mt-1 text-center">Management System</p>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0 1rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', padding: '1rem', marginTop: '1rem' }}>Menu</p>

                    <Link to="/student/dashboard" onClick={() => setIsOpen(false)} className={`nav-link ${location.pathname === '/student/dashboard' ? 'active' : ''}`} style={navStyle(location.pathname === '/student/dashboard')}>
                        <Home size={20} /> Student Dashboard
                    </Link>
                    <Link to="/student/profile" onClick={() => setIsOpen(false)} className={`nav-link ${location.pathname === '/student/profile' ? 'active' : ''}`} style={navStyle(location.pathname === '/student/profile')}>
                        <User size={20} /> Student Profile
                    </Link>
                    <Link to="/rooms" onClick={() => setIsOpen(false)} className={`nav-link ${location.pathname === '/rooms' ? 'active' : ''}`} style={navStyle(location.pathname === '/rooms')}>
                        <Search size={20} /> Room Bookings
                    </Link>
                    <Link to="/payments" onClick={() => setIsOpen(false)} className={`nav-link ${location.pathname === '/payments' ? 'active' : ''}`} style={navStyle(location.pathname === '/payments')}>
                        <DollarSign size={20} /> Transactions
                    </Link>
                    <Link to="/complaints" onClick={() => setIsOpen(false)} className={`nav-link ${location.pathname === '/complaints' ? 'active' : ''}`} style={navStyle(location.pathname === '/complaints')}>
                        <AlertCircle size={20} /> Complaints Center
                    </Link>
                    <Link to="/notices" onClick={() => setIsOpen(false)} className={`nav-link ${location.pathname === '/notices' ? 'active' : ''}`} style={navStyle(location.pathname === '/notices')}>
                        <Bell size={20} /> Notice Board
                    </Link>
                </div>

                <div style={{ padding: '2rem 1rem' }}>
                    <Link to="/" onClick={() => { setIsOpen(false); handleLogout(); }} style={{ ...navStyle(false), color: 'var(--danger)' }}>
                        <LogOut size={20} /> Logout
                    </Link>
                </div>
            </div>

            {/* Mobile background overlay */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
                />
            )}
        </>
    );
};

const navStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.8rem 1rem',
    color: isActive ? 'white' : 'var(--text-muted)',
    background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: isActive ? '600' : '400',
    borderLeft: isActive ? '4px solid var(--primary)' : '4px solid transparent',
    transition: 'all 0.2s'
});

const LayoutWatcher = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    
    const isHidden = ['/', '/login', '/signup', '/admin-login', '/admin-register'].includes(location.pathname) || location.pathname.startsWith('/admin');

    return (
        <div className={isHidden ? "" : "app-layout"}>
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {isHidden ? (
                children
            ) : (
                <div className="main-content">
                    <button
                        className="mobile-nav-toggle"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>
                    {children}
                </div>
            )}
        </div>
    );
};

function App() {
    return (
        <Router>
            <LayoutWatcher>
                <Routes>
                    {/* Public Auth Routes */}
                    <Route path="/" element={<div style={{ width: '100vw' }}><HomePage /></div>} />
                    <Route path="/login" element={<div style={{ width: '100vw' }}><Login /></div>} />
                    <Route path="/signup" element={<div style={{ width: '100vw' }}><StudentSignup /></div>} />
                    <Route path="/admin-login" element={<div style={{ width: '100vw' }}><AdminLogin /></div>} />
                    <Route path="/admin-register" element={<div style={{ width: '100vw' }}><AdminRegister /></div>} />

                    {/* Protected Admin Routes */}
                    <Route path="/admin" element={
                        <ProtectedRoute allowedRole="Admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Protected Student Routes */}
                    <Route path="/student/dashboard" element={
                        <ProtectedRoute allowedRole="Student">
                            <StudentDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/student/profile" element={
                        <ProtectedRoute allowedRole="Student">
                            <StudentProfile />
                        </ProtectedRoute>
                    } />
                    <Route path="/rooms" element={
                        <ProtectedRoute allowedRole="Student">
                            <RoomBooking />
                        </ProtectedRoute>
                    } />
                    <Route path="/payments" element={
                        <ProtectedRoute allowedRole="Student">
                            <Payments />
                        </ProtectedRoute>
                    } />
                    <Route path="/complaints" element={
                        <ProtectedRoute allowedRole="Student">
                            <Complaints />
                        </ProtectedRoute>
                    } />
                    <Route path="/notices" element={
                        <ProtectedRoute allowedRole="Student">
                            <Notices />
                        </ProtectedRoute>
                    } />
                </Routes>
            </LayoutWatcher>
        </Router>
    );
}

export default App;
