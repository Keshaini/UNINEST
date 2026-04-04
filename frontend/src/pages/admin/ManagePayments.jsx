import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManagePayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPayments = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get('http://localhost:5000/api/payments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPayments(res.data);
            setLoading(false);
        } catch (err) {
            console.warn('Failed to fetch payments', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const markAsPaid = async (id) => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.put(`http://localhost:5000/api/payments/${id}`, { status: 'Paid' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPayments();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    return (
        <div className="glass-container animate-fade-in">
            <h2 style={{ marginBottom: '1.5rem' }}>Hostel Payments & Ledger</h2>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '1rem' }}>TXN ID</th>
                            <th style={{ padding: '1rem' }}>Student</th>
                            <th style={{ padding: '1rem' }}>Amount</th>
                            <th style={{ padding: '1rem' }}>Type</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan="6" style={{ padding: '1rem', textAlign: 'center' }}>Loading...</td></tr> : payments.map(payment => (
                            <tr key={payment._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{payment.transactionId || payment._id.substring(0,6).toUpperCase()}</td>
                                <td style={{ padding: '1rem' }}>{payment.studentId?.firstName} {payment.studentId?.lastName}</td>
                                <td style={{ padding: '1rem' }}>${payment.amount}</td>
                                <td style={{ padding: '1rem' }}>{payment.feeType}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span className={`badge ${payment.status === 'Paid' ? 'paid' : 'pending'}`}>{payment.status}</span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {payment.status === 'Pending' && (
                                        <button onClick={() => markAsPaid(payment._id)} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                                            Mark Paid
                                        </button>
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

export default ManagePayments;
