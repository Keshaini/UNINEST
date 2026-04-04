import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({ roomNumber: '', type: 'Single', capacity: 1, pricePerMonth: 100 });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const fetchRooms = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get('http://localhost:5000/api/rooms', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRooms(res.data);
            setLoading(false);
        } catch (err) {
            console.warn('Failed to fetch rooms', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('adminToken');
            if (isEditing) {
                await axios.put(`http://localhost:5000/api/rooms/${editId}`, form, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setIsEditing(false);
                setEditId(null);
            } else {
                await axios.post('http://localhost:5000/api/rooms', form, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setForm({ roomNumber: '', type: 'Single', capacity: 1, pricePerMonth: 100 });
            fetchRooms();
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to save room');
        }
    };

    const handleEdit = (room) => {
        setForm({ roomNumber: room.roomNumber, type: room.type, capacity: room.capacity, pricePerMonth: room.pricePerMonth || 100 });
        setIsEditing(true);
        setEditId(room._id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this room?")) return;
        try {
            const token = localStorage.getItem('adminToken');
            await axios.delete(`http://localhost:5000/api/rooms/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRooms();
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to delete room');
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.put(`http://localhost:5000/api/rooms/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRooms();
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to update status');
        }
    };

    return (
        <div className="glass-container animate-fade-in">
            <h2 style={{ marginBottom: '1.5rem' }}>Manage Rooms</h2>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end', marginBottom: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Room No.</label>
                    <input type="text" value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })} style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-main)'}} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Type</label>
                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: '#000'}}>
                        <option value="Single">Single</option>
                        <option value="Double">Double</option>
                        <option value="Triple">Triple</option>
                        <option value="Dormitory">Dormitory</option>
                    </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Capacity</label>
                    <input type="number" min="1" value={form.capacity} onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) })} style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-main)'}} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Price ($/mo)</label>
                    <input type="number" min="0" value={form.pricePerMonth} onChange={e => setForm({ ...form, pricePerMonth: parseInt(e.target.value) })} style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-main)'}} required />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '0.75rem', height: '100%' }}>
                    {isEditing ? 'Update Room' : 'Add Room'}
                </button>
                {isEditing && (
                    <button type="button" onClick={() => {setIsEditing(false); setForm({ roomNumber: '', type: 'Single', capacity: 1, pricePerMonth: 100 });}} className="btn-secondary" style={{ padding: '0.75rem', height: '100%', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '8px' }}>Cancel</button>
                )}
            </form>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '1rem' }}>Room No.</th>
                            <th style={{ padding: '1rem' }}>Type</th>
                            <th style={{ padding: '1rem' }}>Capacity</th>
                            <th style={{ padding: '1rem' }}>Occupancy</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Price</th>
                            <th style={{ padding: '1rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan="7" style={{ padding: '1rem', textAlign: 'center' }}>Loading...</td></tr> : rooms.map(room => (
                            <tr key={room._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{room.roomNumber}</td>
                                <td style={{ padding: '1rem' }}>{room.type}</td>
                                <td style={{ padding: '1rem' }}>{room.capacity}</td>
                                <td style={{ padding: '1rem' }}>{room.currentOccupancy}</td>
                                <td style={{ padding: '1rem' }}>
                                    <select
                                        value={room.status}
                                        onChange={e => handleStatusChange(room._id, e.target.value)}
                                        style={{
                                            padding: '0.4rem', borderRadius: '4px', background: 'rgba(0,0,0,0.5)',
                                            color: 'white', border: '1px solid var(--glass-border)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="Available">Available</option>
                                        <option value="Full">Full</option>
                                        <option value="Maintenance">Maintenance</option>
                                    </select>
                                </td>
                                <td style={{ padding: '1rem' }}>${room.pricePerMonth}</td>
                                <td style={{ padding: '1rem' }}>
                                    <button onClick={() => handleEdit(room)} style={{ marginRight: '0.5rem', background: 'transparent', color: 'var(--warning)', border: 'none', cursor: 'pointer' }}>Edit</button>
                                    <button onClick={() => handleDelete(room._id)} style={{ background: 'transparent', color: 'var(--danger)', border: 'none', cursor: 'pointer' }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageRooms;
