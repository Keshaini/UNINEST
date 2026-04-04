import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Payments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPayments = async () => {
        try {
            const token = localStorage.getItem('token');
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

    // Simulated new payment for demo purposes
    const createNewInvoice = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/payments', {
                amount: Math.floor(Math.random() * 200) + 50,
                feeType: 'Hostel Fee',
                paymentMonth: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
                status: 'Pending',
                transactionId: 'TXN-' + Math.floor(Math.random() * 10000)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPayments();
        } catch (err) {
            alert('Could not create invoice');
        }
    };

    return (
        <div className="page-container animate-fade-in">
            <h1 className="page-title">Payment History & Dues</h1>

            <div className="glass-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>Your Transactions</h2>
                    <button className="btn-primary" onClick={createNewInvoice} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>+ Create Mock Invoice</button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '1rem' }}>Transaction ID</th>
                                <th style={{ padding: '1rem' }}>Type & Month</th>
                                <th style={{ padding: '1rem' }}>Amount</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan="4" style={{ padding: '1rem', textAlign: 'center' }}>Loading...</td></tr> : payments.length === 0 ? <tr><td colSpan="4" style={{ padding: '1rem', textAlign: 'center' }}>No transactions found.</td></tr> : payments.map(payment => (
                                <tr key={payment._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: '600' }}>{payment.transactionId || payment._id.substring(0,6).toUpperCase()}</span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: '500' }}>{payment.feeType}</span>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{payment.paymentMonth}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>${payment.amount}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className={`badge ${payment.status === 'Paid' ? 'paid' : 'pending'}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Payments;
