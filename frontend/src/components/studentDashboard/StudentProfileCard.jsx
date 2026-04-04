import React from 'react';
import { User, Mail, Hash, BookOpen, Calendar } from 'lucide-react';

const StudentProfileCard = ({ profile }) => {
    if (!profile) return <div className="animate-pulse bg-slate-800/50 rounded-xl h-48 w-full"></div>;

    const { firstName, lastName, registrationNumber, course, batchYear } = profile;
    const email = profile.userId?.email || 'N/A';

    return (
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-xl p-6 shadow-xl relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><User className="text-indigo-400" /> Student Profile</h2>
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 z-10 relative">
                <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold uppercase shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-indigo-400/30 flex-shrink-0">
                    {firstName?.[0]}{lastName?.[0]}
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-2xl font-bold text-white">{firstName} {lastName}</h3>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-300">
                            <Mail className="w-4 h-4 text-indigo-400" /> <span className="truncate" title={email}>{email}</span>
                        </div>
                        <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-300">
                            <Hash className="w-4 h-4 text-indigo-400" /> {registrationNumber}
                        </div>
                        <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-300">
                            <BookOpen className="w-4 h-4 text-indigo-400" /> {course || 'N/A'}
                        </div>
                        <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-300">
                            <Calendar className="w-4 h-4 text-indigo-400" /> {batchYear || 'N/A'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default StudentProfileCard;
