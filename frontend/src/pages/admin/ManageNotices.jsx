import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageNotices = () => {
    const [notices, setNotices] = useState([]);
    const [form, setForm] = useState({ title: '', content: '', targetAudience: 'All', priority: 'Normal' });
    const [loading, setLoading] = useState(true);

    const fetchNotices = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get('http://localhost:5000/api/notices', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotices(res.data);
            setLoading(false);
        } catch (err) {
            console.warn('Failed to fetch notices', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('adminToken');
            await axios.post('http://localhost:5000/api/notices', form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setForm({ title: '', content: '', targetAudience: 'All', priority: 'Normal' });
            fetchNotices(); // refresh
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to post notice');
        }
    };

    return (
        <div className="glass-container animate-fade-in">
            <h2 style={{ marginBottom: '1.5rem' }}>Broadcast Notices</h2>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Notice Title</label>
                    <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Content</label>
                    <textarea rows="3" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-main)', resize: 'vertical'}}></textarea>
                </div>
                <div className="form-group">
                    <label>Target Audience</label>
                    <select value={form.targetAudience} onChange={e => setForm({ ...form, targetAudience: e.target.value })} style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: '#000'}}>
                        <option value="All">All Entities</option>
                        <option value="Students">Only Students</option>
                        <option value="Staff">Only Staff</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Priority</label>
                    <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: '#000'}}>
                        <option value="Low">Low</option>
                        <option value="Normal">Normal</option>
                        <option value="High">High (Alert)</option>
                    </select>
                </div>
                <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn-primary" style={{ minWidth: '150px' }}>Post Notice</button>
                </div>
            </form>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '1rem' }}>Title</th>
                            <th style={{ padding: '1rem' }}>Audience</th>
                            <th style={{ padding: '1rem' }}>Priority</th>
                            <th style={{ padding: '1rem' }}>Date Posted</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan="4" style={{ padding: '1rem', textAlign: 'center' }}>Loading...</td></tr> : notices.map(notice => (
                            <tr key={notice._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{notice.title}</td>
                                <td style={{ padding: '1rem' }}>{notice.targetAudience}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span className={`badge ${notice.priority === 'High' ? 'high' : 'open'}`}>{notice.priority}</span>
                                </td>
                                <td style={{ padding: '1rem' }}>{new Date(notice.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageNotices;
