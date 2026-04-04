import React, { useState, useEffect } from 'react';
import Sidebar from '../components/admin/Sidebar';
import Navbar from '../components/admin/Navbar';
import DashboardMain from './admin/DashboardMain';
import ManageRooms from './admin/ManageRooms';
import ManageStudents from './admin/ManageStudents';
import ManageAllocations from './admin/ManageAllocations';
import ManageComplaints from './admin/ManageComplaints';
import ManagePayments from './admin/ManagePayments';
import ManageNotices from './admin/ManageNotices';
import AdminProfile from './admin/AdminProfile';

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('Dashboard');

    useEffect(() => {
        const userStr = localStorage.getItem('adminUser') || localStorage.getItem('user');
        if (!userStr) {
            window.location.href = '/admin-login';
            return;
        }
        try {
            const user = JSON.parse(userStr);
            if (user.role.toLowerCase() !== 'admin') {
                window.location.href = '/student';
            }
        } catch (err) {
            window.location.href = '/admin-login';
        }
    }, []);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const renderContent = () => {
        switch (activeTab) {
            case 'Dashboard': return <DashboardMain />;
            case 'Students': return <ManageStudents />;
            case 'Rooms': return <ManageRooms />;
            case 'Payments': return <ManagePayments />;
            case 'Complaints': return <ManageComplaints />;
            case 'Allocations': return <ManageAllocations />;
            case 'Notices': return <ManageNotices />;
            case 'Profile': return <AdminProfile />;
            default: return <DashboardMain />;
        }
    };

    return (
        <div className="flex h-screen bg-[#0B1120] text-slate-200 font-sans overflow-hidden">
            {/* Left Fixed Sidebar */}
            <Sidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                isMobileMenuOpen={isMobileMenuOpen} 
                setIsMobileMenuOpen={setIsMobileMenuOpen} 
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Navbar */}
                <Navbar 
                    isMobileMenuOpen={isMobileMenuOpen} 
                    setIsMobileMenuOpen={setIsMobileMenuOpen} 
                    setActiveTab={setActiveTab}
                />

                {/* Page Content area, scrollable */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#0B1120] p-6 md:p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default AdminDashboard;
