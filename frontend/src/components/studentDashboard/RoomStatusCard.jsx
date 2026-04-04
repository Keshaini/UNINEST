import React from 'react';
import { Home, MapPin, Tag, CheckCircle } from 'lucide-react';
import BookingStatusBadge from './BookingStatusBadge';

const RoomStatusCard = ({ roomData }) => {
    if (!roomData) return <div className="animate-pulse bg-slate-800/50 rounded-xl h-48 w-full"></div>;

    return (
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-xl p-6 shadow-xl relative overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
            
            <div className="flex justify-between items-start mb-4 z-10 relative">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Home className="text-emerald-400" /> Room Status</h2>
                <BookingStatusBadge status={roomData.status || (roomData.assigned ? 'Active' : 'Pending')} />
            </div>

            <div className="z-10 relative flex-1 flex flex-col justify-center">
                {roomData.assigned && roomData.status !== 'Rejected' ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                <span className="text-emerald-400 font-bold text-xl">{roomData.roomId?.roomNumber || 'N/A'}</span>
                            </div>
                            <div>
                                <p className="text-white font-bold leading-tight">Room Assigned</p>
                                <p className="text-emerald-400 text-sm flex items-center gap-1 font-medium mt-0.5"><CheckCircle className="w-3.5 h-3.5"/> Allocated</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                            <div className="bg-slate-800/50 p-3 rounded-xl flex flex-col gap-1 border border-slate-700/50">
                                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400"/> Block</span>
                                <span className="text-white font-medium">{roomData.roomId?.block || 'Main'}</span>
                            </div>
                            <div className="bg-slate-800/50 p-3 rounded-xl flex flex-col gap-1 border border-slate-700/50">
                                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-slate-400"/> Capacity</span>
                                <span className="text-white font-medium">{roomData.roomId?.capacity || 1}-Seater</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                        <p className="text-slate-400 mb-5 text-sm font-medium">Currently, you don't have an active room assignment.</p>
                        <button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98]">
                            Request Room
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
export default RoomStatusCard;
