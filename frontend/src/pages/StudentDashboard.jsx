import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StudentSummaryCards from '../components/studentDashboard/StudentSummaryCards';
import StudentPaymentsTable from '../components/studentDashboard/StudentPaymentsTable';
import StudentComplaints from '../components/studentDashboard/StudentComplaints';
import StudentRoomCard from '../components/studentDashboard/StudentRoomCard';
import StudentNotices from '../components/studentDashboard/StudentNotices';
import StudentNavbar from '../components/studentDashboard/StudentNavbar';

function StudentDashboard() {
    const [profile, setProfile] = useState(null);
    const [roomData, setRoomData] = useState(null);
    const [payments, setPayments] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                // Fetch in parallel for ultimate speed
                const [profileRes, roomRes, payRes, compRes, noticeRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/students/profile', config).catch(() => ({data: null})),
                    axios.get('http://localhost:5000/api/students/room', config).catch(() => ({data: null})),
                    axios.get('http://localhost:5000/api/students/payments', config).catch(() => ({data: []})),
                    axios.get('http://localhost:5000/api/students/complaints', config).catch(() => ({data: []})),
                    axios.get('http://localhost:5000/api/notices', config).catch(() => ({data: []}))
                ]);

                setProfile(profileRes.data);
                setRoomData(roomRes.data);
                setPayments(payRes.data);
                setComplaints(compRes.data);
                setNotices(noticeRes.data);
                setLoading(false);
            } catch (error) {
                console.error("Dashboard fetch error:", error);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-950 font-sans w-full relative">
            <StudentNavbar profile={profile} />
            
            <div className="p-4 sm:p-8 animate-fade-in custom-scrollbar overflow-y-auto w-full">
                <div className="max-w-7xl mx-auto w-full">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-100 mb-8 pb-3 border-b border-slate-800">
                        Dashboard Overview
                    </h1>

                    <StudentSummaryCards roomData={roomData} payments={payments} complaints={complaints} />
                    
                    {/* Main Content Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div className="lg:col-span-1">
                            <StudentPaymentsTable payments={payments} />
                        </div>
                        <div className="lg:col-span-1">
                            <StudentComplaints complaints={complaints} />
                        </div>
                    </div>

                    {/* Lower Content Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="lg:col-span-1">
                            <StudentRoomCard roomData={roomData} />
                        </div>
                        <div className="lg:col-span-1">
                            <StudentNotices notices={notices} />
                        </div>
                    </div>
                </div>
            </div>
            <style jsx="true">{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(15, 23, 42, 0.3); 
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(99, 102, 241, 0.4); 
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
}

export default StudentDashboard;
