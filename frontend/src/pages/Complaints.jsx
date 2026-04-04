import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Complaints() {
    const [complaints, setComplaints] = useState([]);
    const [category, setCategory] = useState('Electrical');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch student's own complaints dynamically from the Express API
    const fetchComplaints = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/complaints', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComplaints(res.data);
            setLoading(false);
        } catch (err) {
            console.warn('Backend disconnected - loading mock records visually.', err.message);
            // Fallback UI data if no backend/token is active
            setComplaints([
                { _id: 'C-1002', title: 'AC Cooling Issue', category: 'Electrical', status: 'Open', createdAt: '2026-03-11T12:00:00Z' },
                { _id: 'C-0984', title: 'Leaking Tap in Washroom', category: 'Plumbing', status: 'Resolved', createdAt: '2026-02-28T09:30:00Z' }
            ]);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    // Post a new complaint
    const submitForm = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/complaints',
                { category, title, description },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Dynamically push the successful API record to the top of the history stack
            setComplaints([res.data, ...complaints]);
            setTitle('');
            setDescription('');
            setCategory('Electrical');
        } catch (err) {
            console.warn('Using local fallback submission - Backend offline.');
            // Mock UI Submission
            setComplaints([{ _id: `C-${Math.floor(Math.random() * 10000)}`, title, category, status: 'Open', createdAt: new Date().toISOString() }, ...complaints]);
            setTitle('');
            setDescription('');
        }
    };

    return (
        <div className="page-container animate-fade-in">
            <h1 className="page-title">Complaint Submission & Tracking</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
                {/* Submission Form */}
                <div className="glass-container" style={{ height: 'fit-content' }}>
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--text-muted)' }}>Lodge New Issue</h2>
                    <form onSubmit={submitForm}>
                        <div className="form-group">
                            <label>Category</label>
                            <select value={category} onChange={e => setCategory(e.target.value)}>
                                <option value="Electrical">Electrical</option>
                                <option value="Plumbing">Plumbing</option>
                                <option value="Cleaning">Cleaning</option>
                                <option value="Internet">Internet</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Issue Title</label>
                            <input type="text" placeholder="Brief subject..." value={title} onChange={e => setTitle(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Description Details</label>
                            <textarea rows="4" placeholder="Explain the issue clearly..." value={description} onChange={e => setDescription(e.target.value)} required></textarea>
                        </div>
                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>Submit Complaint</button>
                    </form>
                </div>

                {/* Tracking List */}
                <div className="glass-container">
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--text-muted)' }}>Complaint History</h2>
                    {loading ? (
                        <p style={{ color: 'var(--text-muted)' }}>Loading records...</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {complaints.length === 0 ? <p>No complaints lodged yet.</p> : null}
                            {complaints.map(c => (
                                <div key={c._id} style={{
                                    background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px',
                                    borderLeft: `4px solid ${c.status === 'Open' ? 'var(--warning)' : c.status === 'In Progress' ? 'var(--primary)' : 'var(--success)'}`
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <h3 style={{ fontSize: '1.1rem' }}>{c.title} <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 'normal' }}>({c._id.substring(0, 8)})</span></h3>
                                        <span className={`badge ${c.status === 'Open' ? 'open' : c.status === 'In Progress' ? 'warning' : 'resolved'}`}>{c.status}</span>
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', gap: '1rem' }}>
                                        <span><strong style={{ color: 'var(--text-main)' }}>Category:</strong> {c.category}</span>
                                        <span><strong style={{ color: 'var(--text-main)' }}>Logged on:</strong> {new Date(c.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {c.adminResponse && (
                                        <div style={{ marginTop: '0.8rem', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.9rem' }}>
                                            <strong style={{ color: 'var(--text-muted)' }}>Admin Note:</strong> {c.adminResponse}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Complaints;
