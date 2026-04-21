import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, MoreVertical, ShieldAlert, UserX, UserCheck, Trash2, X, AlertTriangle, AlertCircle, CheckCircle, Clock, Edit } from 'lucide-react';

const ManageStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Warning Modal State
    const [warningModalOpen, setWarningModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [warningText, setWarningText] = useState('');

    // Edit Modal State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        firstName: '',
        lastName: '',
        contactNumber: '',
        course: '',
        batchYear: '',
        gender: ''
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get('http://localhost:5000/api/students', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filter out fully deleted from normal view if desired, or keep them. 
            // We'll keep them to show 'Deleted' badge.
            setStudents(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch students:', err);
            setLoading(false);
        }
    };

    const handleToggleStatus = async (studentId, currentStatus) => {
        if (currentStatus === 'Deleted') return; // Cannot toggle deleted
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        try {
            const token = localStorage.getItem('adminToken');
            await axios.put(`http://localhost:5000/api/students/${studentId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStudents(students.map(s => s._id === studentId ? { ...s, status: newStatus } : s));
        } catch (err) {
            console.error('Failed to change status:', err);
            alert('Error updating status');
        }
    };

    const handleDeleteStudent = async (studentId) => {
        if (!window.confirm('Are you sure you want to vacate this student account? It will be marked as vacated but not permanently deleted yet.')) return;
        try {
            const token = localStorage.getItem('adminToken');
            await axios.delete(`http://localhost:5000/api/students/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(students.map(s => s._id === studentId ? { ...s, status: 'Deleted' } : s));
        } catch (err) {
            console.error('Failed to delete student:', err);
            alert('Error vacating student');
        }
    };

    const handleRestoreStudent = async (studentId) => {
        if (!window.confirm('Are you sure you want to restore this student?')) return;
        try {
            const token = localStorage.getItem('adminToken');
            await axios.put(`http://localhost:5000/api/students/${studentId}/restore`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStudents(students.map(s => s._id === studentId ? { ...s, status: 'Active' } : s));
        } catch (err) {
            console.error('Failed to restore student:', err);
            alert('Error restoring student');
        }
    };

    const handlePermanentDelete = async (studentId) => {
        if (!window.confirm('WARNING: This will permanently delete the student and all related records (allocations, payments). This cannot be undone. Proceed?')) return;
        try {
            const token = localStorage.getItem('adminToken');
            await axios.delete(`http://localhost:5000/api/students/${studentId}/permanent`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(students.filter(s => s._id !== studentId));
        } catch (err) {
            console.error('Failed to delete student permanently:', err);
            alert('Error deleting student permanently');
        }
    };

    const openWarningModal = (student) => {
        setSelectedStudent(student);
        setWarningText(student.adminWarning || '');
        setWarningModalOpen(true);
    };

    const saveWarning = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.put(`http://localhost:5000/api/students/${selectedStudent._id}/warning`,
                { adminWarning: warningText },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStudents(students.map(s => s._id === selectedStudent._id ? { ...s, adminWarning: warningText, warningAcknowledged: false } : s));
            setWarningModalOpen(false);
        } catch (err) {
            console.error('Failed to save warning:', err);
            alert('Error updating warning');
        }
    };

    const clearWarning = async (studentId) => {
        if (!window.confirm('Are you sure you want to remove the warning from this student?')) return;
        try {
            const token = localStorage.getItem('adminToken');
            await axios.put(`http://localhost:5000/api/students/${studentId}/warning`,
                { adminWarning: '' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStudents(students.map(s => s._id === studentId ? { ...s, adminWarning: '', warningAcknowledged: false } : s));
        } catch (err) {
            console.error('Failed to clear warning:', err);
            alert('Error clearing warning');
        }
    };

    const openEditModal = (student) => {
        setSelectedStudent(student);
        setEditFormData({
            firstName: student.firstName || '',
            lastName: student.lastName || '',
            contactNumber: student.contactNumber || '',
            course: student.course || '',
            batchYear: student.batchYear || '',
            gender: student.gender || ''
        });
        setEditModalOpen(true);
    };

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const saveEdit = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.put(`http://localhost:5000/api/students/${selectedStudent._id}`,
                editFormData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStudents(students.map(s => s._id === selectedStudent._id ? { ...s, ...res.data } : s));
            setEditModalOpen(false);
        } catch (err) {
            console.error('Failed to save student details:', err);
            alert(err.response?.data?.msg || 'Error updating student details');
        }
    };


    const filteredStudents = students.filter(s =>
        s.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="animate-fade-in text-slate-200">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Student Directory</h1>
                    <p className="text-slate-400 text-sm font-medium">Manage all registered hostel students and accounts.</p>
                </div>

                <div className="flex w-full md:w-auto gap-3">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500/50 transition-all font-medium text-slate-200"
                        />
                    </div>
                    <button className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm">
                        <Filter className="w-4 h-4" /> Filters
                    </button>
                </div>
            </div>

            {/* Students Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent flex rounded-full animate-spin"></div>
                </div>
            ) : filteredStudents.length === 0 ? (
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 font-medium">
                    No students found matching your search.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStudents.map(student => (
                        <div key={student._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative group transition-all hover:border-indigo-500/30">

                            {/* Card Header: Avatar & Status */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 border-2 border-slate-700 shrink-0 flex justify-center items-center">
                                        {student.profilePic ? (
                                            <img src={student.profilePic} alt="pic" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-bold text-lg text-indigo-400">
                                                {student.firstName?.[0]}{student.lastName?.[0]}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-100 text-lg leading-tight truncate w-32 sm:w-40" title={`${student.firstName} ${student.lastName}`}>
                                            {student.firstName} {student.lastName}
                                        </h3>
                                        <p className="text-xs text-indigo-400 font-semibold tracking-wider uppercase mt-1">
                                            {student.registrationNumber}
                                        </p>
                                    </div>
                                </div>
                                {/* Status Badge */}
                                {student.status === 'Deleted' ? (
                                    <span className="px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-1"><UserX className="w-3 h-3" /> VACATED</span>
                                ) : student.status === 'Inactive' ? (
                                    <span className="px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> INACTIVE</span>
                                ) : (
                                    <span className="px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold rounded-full bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-1"><UserCheck className="w-3 h-3" /> ACTIVE</span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="space-y-2 mb-5">
                                <div className="flex justify-between text-sm border-b border-slate-800 pb-2">
                                    <span className="text-slate-500">Contact</span>
                                    <span className="text-slate-300 font-medium">{student.contactNumber || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-sm border-b border-slate-800 pb-2">
                                    <span className="text-slate-500">Course</span>
                                    <span className="text-slate-300 font-medium">{student.course} ({student.batchYear})</span>
                                </div>
                                {student.adminWarning && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex flex-col gap-2 items-start mt-2">
                                        <div className="flex gap-2 items-start w-full">
                                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                            <p className="text-xs text-red-200 line-clamp-2 flex-1" title={student.adminWarning}>
                                                <span className="font-bold text-red-400 block mb-0.5">Active Warning:</span>
                                                {student.adminWarning}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between w-full mt-1 border-t border-red-500/20 pt-2">
                                            {student.warningAcknowledged ? (
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-green-400 flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded-md"><CheckCircle className="w-3 h-3" /> Considered</span>
                                            ) : (
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400 flex items-center gap-1 bg-orange-500/10 px-2 py-0.5 rounded-md"><Clock className="w-3 h-3" /> Pending</span>
                                            )}
                                            <button onClick={() => clearWarning(student._id)} className="text-slate-500 hover:text-red-400 transition-colors p-1 bg-slate-800 hover:bg-red-500/10 rounded-md" title="Remove Warning">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Completion Bar */}
                            <div className="mb-5 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Profile Data</span>
                                    <span className={`text-xs font-bold ${student.profileCompletion === 100 ? 'text-green-400' :
                                            student.profileCompletion <= 10 ? 'text-red-400' : 'text-blue-400'
                                        }`}>
                                        {student.profileCompletion || 10}%
                                    </span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-1.5">
                                    <div
                                        className={`h-1.5 rounded-full transition-all duration-500 ${student.profileCompletion === 100 ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]' :
                                                student.profileCompletion <= 10 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' :
                                                    'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'
                                            }`}
                                        style={{ width: `${student.profileCompletion || 10}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {student.status === 'Deleted' ? (
                                <div className="grid grid-cols-2 gap-2 mt-auto text-center">
                                    <button
                                        onClick={() => handleRestoreStudent(student._id)}
                                        className="py-2 flex justify-center items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase rounded-xl transition-all border bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                                    >
                                        <UserCheck className="w-4 h-4" /> Restore
                                    </button>
                                    <button
                                        onClick={() => handlePermanentDelete(student._id)}
                                        className="py-2 flex justify-center items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase rounded-xl transition-all border bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/50"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete Perma
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2 mt-auto">
                                    <button
                                        onClick={() => openEditModal(student)}
                                        className="py-2 flex justify-center items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase rounded-xl transition-all border bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                                    >
                                        <Edit className="w-4 h-4" /> Edit
                                    </button>

                                    <button
                                        onClick={() => handleToggleStatus(student._id, student.status || 'Active')}
                                        className={`py-2 flex justify-center items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase rounded-xl transition-all border ${student.status === 'Inactive' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20' :
                                                'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                                            }`}
                                        title={student.status === 'Inactive' ? 'Mark Active' : 'Mark Inactive'}
                                    >
                                        {student.status === 'Inactive' ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                                        {student.status === 'Inactive' ? 'Enable' : 'Disable'}
                                    </button>

                                    <button
                                        onClick={() => openWarningModal(student)}
                                        className={`py-2 flex justify-center items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase rounded-xl transition-all border ${student.adminWarning ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                                            }`}
                                    >
                                        <ShieldAlert className="w-4 h-4" /> Warn
                                    </button>

                                    <button
                                        onClick={() => handleDeleteStudent(student._id)}
                                        className="py-2 flex justify-center items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase rounded-xl transition-all border bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/50"
                                    >
                                        <Trash2 className="w-4 h-4" /> Vacate
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Warning Modal Overlay */}
            {warningModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in text-left">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg shadow-[0_0_60px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col scale-in">
                        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-800/30">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <ShieldAlert className="text-orange-400 w-6 h-6" /> Require Student Action
                            </h3>
                            <button onClick={() => setWarningModalOpen(false)} className="text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 p-2 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4 bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex gap-3">
                                <AlertCircle className="w-5 h-5 text-orange-400 shrink-0" />
                                <p className="text-sm text-orange-200">
                                    This message will be permanently displayed as a red banner at the top of <strong>{selectedStudent?.firstName} {selectedStudent?.lastName}</strong>'s profile until you remove it.
                                </p>
                            </div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wide">
                                Warning Message
                            </label>
                            <textarea
                                value={warningText}
                                onChange={(e) => setWarningText(e.target.value)}
                                placeholder="E.g., Your hostel fee for this month is overdue over 30 days. Please pay immediately."
                                className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder:text-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none shadow-inner"
                            />
                        </div>
                        <div className="flex items-center gap-3 p-6 pt-2">
                            <button
                                onClick={() => {
                                    setWarningText('');
                                    saveWarning();
                                }}
                                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-all"
                            >
                                Clear Warning
                            </button>
                            <button
                                onClick={saveWarning}
                                className="flex-1 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-[0_4px_20px_rgba(79,70,229,0.3)] rounded-xl transition-all"
                            >
                                Publish Warning
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal Overlay */}
            {editModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in text-left overflow-y-auto">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-[0_0_60px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col scale-in my-8">
                        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-800/30">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Edit className="text-indigo-400 w-6 h-6" /> Edit Student Details
                            </h3>
                            <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 p-2 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">First Name</label>
                                <input type="text" name="firstName" value={editFormData.firstName} onChange={handleEditChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:border-indigo-500 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">Last Name</label>
                                <input type="text" name="lastName" value={editFormData.lastName} onChange={handleEditChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:border-indigo-500 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">Contact Number</label>
                                <input type="text" name="contactNumber" value={editFormData.contactNumber} onChange={handleEditChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:border-indigo-500 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">Gender</label>
                                <select name="gender" value={editFormData.gender} onChange={handleEditChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:border-indigo-500 outline-none transition-all">
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">Course</label>
                                <input type="text" name="course" value={editFormData.course} onChange={handleEditChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:border-indigo-500 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">Batch Year</label>
                                <input type="number" name="batchYear" value={editFormData.batchYear} onChange={handleEditChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:border-indigo-500 outline-none transition-all" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 p-6 border-t border-slate-800 bg-slate-800/10">
                            <button onClick={() => setEditModalOpen(false)} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-all">
                                Cancel
                            </button>
                            <button onClick={saveEdit} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-[0_4px_20px_rgba(79,70,229,0.3)] rounded-xl transition-all">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes scale-in {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .scale-in { animation: scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
            `}</style>
        </div>
    );
};

export default ManageStudents;
