import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { Trash2, Edit3, Plus, Settings, AlertCircle } from 'lucide-react';

const ManageRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({ roomNumber: '', type: 'Single', capacity: 1, pricePerMonth: 100 });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        onConfirm: () => {},
        title: '',
        message: '',
        type: 'danger'
    });

    const openConfirm = (title, message, onConfirm, type = 'danger') => {
        setConfirmModal({
            isOpen: true,
            title,
            message,
            onConfirm,
            type
        });
    };

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const res = await axios.get('http://localhost:5000/api/rooms', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRooms(res.data);
        } catch (err) {
            toast.error('Failed to load room data');
        } finally {
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
                toast.success('Room updated successfully');
                setIsEditing(false);
                setEditId(null);
            } else {
                await axios.post('http://localhost:5000/api/rooms', form, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('New room added to inventory');
            }
            setForm({ roomNumber: '', type: 'Single', capacity: 1, pricePerMonth: 100 });
            fetchRooms();
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Failed to save room details');
        }
    };

    const handleEdit = (room) => {
        setForm({ roomNumber: room.roomNumber, type: room.type, capacity: room.capacity, pricePerMonth: room.pricePerMonth || 100 });
        setIsEditing(true);
        setEditId(room._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        openConfirm(
            "Delete Room?",
            "Are you sure you want to permanently remove this room? This action cannot be undone if students are still assigned.",
            async () => {
                try {
                    const token = localStorage.getItem('adminToken');
                    await axios.delete(`http://localhost:5000/api/rooms/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    toast.success('Room deleted successfully');
                    fetchRooms();
                } catch (err) {
                    toast.error(err.response?.data?.msg || 'Failed to delete room');
                }
            }
        );
    };

    const handleStatusChange = async (id, status) => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.put(`http://localhost:5000/api/rooms/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.info(`Room status updated to ${status}`);
            fetchRooms();
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Failed to update status');
        }
    };

    return (
        <div className="animate-fade-in text-slate-200">
            <div className="flex justify-between items-center mb-8">
                <div>
                   <h2 className="text-3xl font-bold text-white tracking-tight">Room Inventory</h2>
                   <p className="text-slate-400 mt-1">Manage hostel rooms, pricing, and availability.</p>
                </div>
            </div>

            {/* Room Form */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-[32px] p-8 mb-10 shadow-2xl backdrop-blur-xl">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Room Number</label>
                        <input type="text" value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-slate-200 focus:border-indigo-500 outline-none transition-all font-medium" placeholder="E.g. A-101" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Room Type</label>
                        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-slate-200 focus:border-indigo-500 outline-none transition-all font-medium appearance-none cursor-pointer">
                            <option value="Single">Single</option>
                            <option value="Double">Double</option>
                            <option value="Triple">Triple</option>
                            <option value="Dormitory">Dormitory</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Total Capacity</label>
                        <input type="number" min="1" value={form.capacity} onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-slate-200 focus:border-indigo-500 outline-none transition-all font-medium" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Price (LKR/mo)</label>
                        <input type="number" min="0" value={form.pricePerMonth} onChange={e => setForm({ ...form, pricePerMonth: parseInt(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-slate-200 focus:border-indigo-500 outline-none transition-all font-medium" required />
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 active:scale-95">
                            {isEditing ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {isEditing ? 'Update' : 'Add'}
                        </button>
                        {isEditing && (
                            <button type="button" onClick={() => {setIsEditing(false); setForm({ roomNumber: '', type: 'Single', capacity: 1, pricePerMonth: 100 });}} className="p-3.5 border border-rose-500/30 text-rose-500 rounded-2xl hover:bg-rose-500/10 transition-colors">
                                <Plus className="w-5 h-5 rotate-45" />
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Rooms Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/50 border-b border-slate-800">
                                <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Room No.</th>
                                <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Type</th>
                                <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Capacity</th>
                                <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Students</th>
                                <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Price</th>
                                <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-20 text-center">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto"></div>
                                    </td>
                                </tr>
                            ) : rooms.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-20 text-center text-slate-500 font-medium italic">
                                        No rooms found in the system.
                                    </td>
                                </tr>
                            ) : rooms.map(room => (
                                <tr key={room._id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors group">
                                    <td className="p-6 font-bold text-white tracking-tight">{room.roomNumber}</td>
                                    <td className="p-6 text-slate-400 font-medium">{room.type}</td>
                                    <td className="p-6">
                                        <span className="bg-slate-800 px-3 py-1 rounded-lg text-slate-300 font-bold border border-slate-700">{room.capacity}</span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-2">
                                                {[...Array(Math.min(room.currentOccupancy, 3))].map((_, i) => (
                                                    <div key={i} className="w-7 h-7 rounded-full bg-indigo-500/20 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-indigo-400">S</div>
                                                ))}
                                            </div>
                                            <span className="text-xs font-medium text-slate-500">{room.currentOccupancy} assigned</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="relative inline-block w-40">
                                            <select
                                                value={room.status}
                                                onChange={e => handleStatusChange(room._id, e.target.value)}
                                                className={`w-full px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider appearance-none cursor-pointer outline-none border transition-all ${
                                                    room.status === 'Available' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                    room.status === 'Full' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                    'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                }`}
                                            >
                                                <option value="Available">Available</option>
                                                <option value="Full">Full</option>
                                                <option value="Maintenance">Maintenance</option>
                                            </select>
                                            <Settings className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 opacity-50 pointer-events-none" />
                                        </div>
                                    </td>
                                    <td className="p-6 font-bold text-indigo-400">LKR {room.pricePerMonth}</td>
                                    <td className="p-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(room)} className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-700 bg-slate-800/50 rounded-xl transition-all">
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(room._id)} className="p-2.5 text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 bg-slate-800/50 rounded-xl transition-all">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmationModal 
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
            />
        </div>
    );
};

export default ManageRooms;
