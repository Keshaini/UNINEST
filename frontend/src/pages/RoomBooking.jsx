import React, { useState, useEffect } from 'react';
import axios from 'axios';

function RoomBooking() {
    const [rooms, setRooms] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [roomsRes, allocsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/rooms', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/allocations', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            
            setRooms(roomsRes.data);
            setAllocations(allocsRes.data); // Students only get their own allocations back
            setLoading(false);
        } catch (err) {
            console.warn('Failed to fetch rooms', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRequest = async (roomId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/allocations/request', { roomId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Room requested successfully');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to request room');
        }
    };

    // Find if the student has any active or pending allocation
    const hasActiveOrPending = allocations.some(a => a.status === 'Active' || a.status === 'Pending');
    const myCurrentAlloc = allocations.find(a => a.status === 'Active' || a.status === 'Pending');

    return (
        <div className="page-container animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ marginBottom: 0 }}>Room Booking & Explore</h1>
            </div>

            {myCurrentAlloc && (
                <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '8px', border: '1px solid var(--primary)', marginBottom: '2rem' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Your Current Room Status: <span style={{ color: myCurrentAlloc.status === 'Active' ? 'var(--success)' : 'var(--warning)' }}>{myCurrentAlloc.status}</span></h3>
                    <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)' }}>Room: {myCurrentAlloc.roomId?.roomNumber}</p>
                </div>
            )}

            <div className="grid-3">
                {loading ? <p>Loading rooms...</p> : rooms.map(room => (
                    <div key={room._id} className="glass-container" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{room.roomNumber}</h2>
                                <span style={{ color: 'var(--text-muted)' }}>{room.type} Room</span>
                            </div>
                            <span className={`badge ${room.status === 'Available' ? 'resolved' : room.status === 'Full' ? 'high' : 'open'}`}>
                                {room.status}
                            </span>
                        </div>

                        <div style={{ margin: '1rem 0', padding: '1rem 0', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Occupancy</span>
                                <span>{room.currentOccupancy} / {room.capacity}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => handleRequest(room._id)}
                            className="btn-primary"
                            style={{ 
                                marginTop: 'auto', 
                                opacity: (room.status === 'Available' && !hasActiveOrPending) ? 1 : 0.5, 
                                cursor: (room.status === 'Available' && !hasActiveOrPending) ? 'pointer' : 'not-allowed' 
                            }}
                            disabled={room.status !== 'Available' || hasActiveOrPending}
                        >
                            {hasActiveOrPending ? 'Already Requested' : room.status === 'Available' ? 'Request Room' : 'Unavailable'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RoomBooking;
