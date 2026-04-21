import React, { useState, useEffect } from 'react';
import { getComplaints, updateComplaint } from '../../services/complaintsService';

const ManageComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all complaints via service
    const fetchAllComplaints = async () => {
        try {
            setLoading(true);
            const response = await getComplaints();
            setComplaints(response.data || response);
            setError(null);
        } catch (err) {
            console.error('Error fetching complaints:', err.message);
            setError(err.message);
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllComplaints();
    }, []);

    // Update complaint status
    const updateStatus = async (id, newStatus) => {
        try {
            // Optimistic UI update
            const previousState = [...complaints];
            setComplaints(complaints.map(c => c._id === id ? { ...c, status: newStatus } : c));

            const payload = { status: newStatus };
            if (newStatus === 'resolved') {
                payload.supportNotes = 'The maintenance team successfully resolved this request.';
            }

            await updateComplaint(id, payload);
        } catch (err) {
            console.error('Update failed:', err);
            setError('Failed to update complaint status');
            // Revert UI on error
            setComplaints(previousState);
        }
    };

    return (
        <div className="glass-container animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ marginBottom: 0 }}>Student Complaints Matrix</h2>
                <span style={{ color: 'var(--text-muted)' }}>Tracking Operations</span>
            </div>

            {error && (
                <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#fee', borderRadius: '0.5rem', color: '#c33', borderLeft: '4px solid #c33' }}>
                    {error}
                </div>
            )}

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '1rem' }}>Ref ID</th>
                            <th style={{ padding: '1rem' }}>Student Name</th>
                            <th style={{ padding: '1rem' }}>Room</th>
                            <th style={{ padding: '1rem' }}>Category</th>
                            <th style={{ padding: '1rem' }}>Title</th>
                            <th style={{ padding: '1rem' }}>Priority</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Date</th>
                            <th style={{ padding: '1rem' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="9" style={{ padding: '1rem', textAlign: 'center' }}>Loading...</td></tr>
                        ) : complaints.length === 0 ? (
                            <tr><td colSpan="9" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No complaints found</td></tr>
                        ) : complaints.map(c => (
                            <tr key={c._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{c._id?.substring(0, 8).toUpperCase()}</td>
                                <td style={{ padding: '1rem' }}>{c.studentName || 'N/A'}</td>
                                <td style={{ padding: '1rem' }}>{c.roomNumber || 'N/A'}</td>
                                <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{c.category || 'N/A'}</td>
                                <td style={{ padding: '1rem' }}>{c.title || 'N/A'}</td>
                                <td style={{ padding: '1rem', textTransform: 'capitalize' }} className={`priority-${c.priority}`}>{c.priority || 'N/A'}</td>
                                <td style={{ padding: '1rem' }}>
                                    <select 
                                        value={c.status} 
                                        onChange={(e) => updateStatus(c._id, e.target.value)}
                                        style={{
                                            padding: '0.5rem',
                                            borderRadius: '0.25rem',
                                            border: '1px solid var(--glass-border)',
                                            backgroundColor: 'transparent',
                                            color: 'inherit',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </td>
                                <td style={{ padding: '1rem' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                                <td style={{ padding: '1rem' }}>
                                    <button style={{
                                        padding: '0.5rem 1rem',
                                        backgroundColor: 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.25rem',
                                        cursor: 'pointer'
                                    }}>View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageComplaints;
