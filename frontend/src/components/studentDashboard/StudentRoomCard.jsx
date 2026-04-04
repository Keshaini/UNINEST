import React from 'react';
import { Home } from 'lucide-react';

const StudentRoomCard = ({ roomData }) => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg h-full flex flex-col p-6">
            <h2 className="text-xl font-semibold text-slate-100 mb-6 flex items-center gap-2">
                <Home className="w-5 h-5 text-indigo-400" /> Room Details
            </h2>

            {roomData?.assigned && roomData?.status !== 'Rejected' ? (
                <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                        <span className="text-slate-400 font-medium">Room Number</span>
                        <span className="text-slate-100 font-semibold">{roomData.roomId?.roomNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                        <span className="text-slate-400 font-medium">Block</span>
                        <span className="text-slate-100 font-semibold">{roomData.roomId?.block || 'Main'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                        <span className="text-slate-400 font-medium">Bed No.</span>
                        <span className="text-slate-100 font-semibold">{roomData.bedNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                        <span className="text-slate-400 font-medium">Capacity</span>
                        <span className="text-slate-100 font-semibold">{roomData.roomId?.capacity || 1} Bed(s)</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-slate-400 font-medium">Status</span>
                        <span className="text-green-400 font-semibold bg-green-500/10 px-2 py-0.5 rounded-md text-xs border border-green-500/20">Allocated</span>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                    <p className="text-slate-400 mb-2 font-medium">No Room Assigned</p>
                    <p className="text-slate-500 text-xs mb-4">Please request a room allocation.</p>
                    <button className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer shadow-sm">
                        Request Room
                    </button>
                </div>
            )}
        </div>
    );
};
export default StudentRoomCard;
