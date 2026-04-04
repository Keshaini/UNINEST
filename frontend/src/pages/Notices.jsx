import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Notices() {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotices = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/notices', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filter notices if necessary (e.g. only 'All' or 'Students')
            const applicableNotices = res.data.filter(n => n.targetAudience === 'All' || n.targetAudience === 'Students');
            setNotices(applicableNotices);
            setLoading(false);
        } catch (err) {
            console.warn('Failed to fetch notices', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    return (
        <div className="page-container animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ marginBottom: 0 }}>Notice Board</h1>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {loading ? <p>Loading notices...</p> : notices.length === 0 ? <p>No notices at this time.</p> : notices.map(notice => (
                    <div key={notice._id} className="glass-container" style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                        {notice.priority === 'High' && (
                            <div style={{ background: 'var(--danger)', height: '4px', width: '100%', position: 'absolute', top: 0, left: 0 }} />
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>{notice.title}</h2>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    Posted on {new Date(notice.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <span className={`badge ${notice.priority === 'High' ? 'high' : notice.priority === 'Normal' ? 'warning' : 'resolved'}`}>
                                {notice.priority} Priority
                            </span>
                        </div>

                        <p style={{ lineHeight: '1.6', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                            {notice.content}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Notices;
