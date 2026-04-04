import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageAllocations = () => {
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAllocations = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get('http://localhost:5000/api/allocations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllocations(res.data);
            setLoading(false);
        } catch (err) {
            console.warn('Failed to fetch allocations', err);
            setError('Could not load allocations.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllocations();
    }, []);

    const handleAction = async (id, action) => {
        try {
            const token = localStorage.getItem('adminToken');
            // actions: 'approve', 'reject', 'vacate'
            await axios.put(`http://localhost:5000/api/allocations/${id}/${action}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAllocations();
        } catch (err) {
            alert(err.response?.data?.msg || `Failed to ${action}`);
        }
    };

    return (
        <div className="glass-container animate-fade-in">
            <h2 style={{ marginBottom: '1.5rem' }}>Room Requests & Allocations</h2>

            {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '1rem' }}>Student Name</th>
                            <th style={{ padding: '1rem' }}>Reg No.</th>
                            <th style={{ padding: '1rem' }}>Room Type/No</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ padding: '1rem', textAlign: 'center' }}>Loading...</td></tr>
                        ) : allocations.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '1rem', textAlign: 'center' }}>No requests or allocations found</td></tr>
                        ) : allocations.map(alloc => (
                            <tr key={alloc._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{alloc.studentId?.firstName} {alloc.studentId?.lastName}</td>
                                <td style={{ padding: '1rem' }}>{alloc.studentId?.registrationNumber}</td>
                                <td style={{ padding: '1rem' }}>{alloc.roomId?.roomNumber} ({alloc.roomId?.type})</td>
                                <td style={{ padding: '1rem' }}>
                                    <span className={`badge ${alloc.status === 'Active' ? 'resolved' : alloc.status === 'Pending' ? 'warning' : 'danger'}`}>
                                        {alloc.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                    {alloc.status === 'Pending' && (
                                        <>
                                            <button onClick={() => handleAction(alloc._id, 'approve')} style={{ background: 'var(--success)', border: 'none', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>Approve</button>
                                            <button onClick={() => handleAction(alloc._id, 'reject')} style={{ background: 'var(--danger)', border: 'none', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
                                        </>
                                    )}
                                    {alloc.status === 'Active' && (
                                        <button onClick={() => handleAction(alloc._id, 'vacate')} style={{ background: 'var(--warning)', border: 'none', color: '#000', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>Mark Vacated</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageAllocations;
