import React, { useState } from 'react';

const AdminOverview = () => {
    return (
        <>
            <div className="grid-3" style={{ marginBottom: '2rem' }}>
                <div className="glass-container" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Students</h3>
                    <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>342</h2>
                    <p style={{ color: 'var(--success)', fontSize: '0.9rem', marginTop: '0.5rem' }}>+12 this month</p>
                </div>
                <div className="glass-container" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Room Occupancy</h3>
                    <h2 style={{ fontSize: '2.5rem', color: 'var(--text-main)' }}>84%</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>140 / 165 Rooms Full</p>
                </div>
                <div className="glass-container" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Unresolved Complaints</h3>
                    <h2 style={{ fontSize: '2.5rem', color: 'var(--warning)' }}>7</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>3 High Priority</p>
                </div>
            </div>
        </>
    );
};

export default AdminOverview;
