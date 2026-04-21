import React from 'react';
import { Info, X } from 'lucide-react';

function AvailabilityBanner({ availabilityPercent }) {
  return (
    <div className="group relative bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md p-6 rounded-[2rem] flex justify-between items-center shadow-2xl overflow-hidden animate-pulse-slow">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex items-center gap-4 relative z-10">
        <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
           <Info className="text-indigo-400 w-5 h-5 animate-bounce-slow" />
        </div>
        <p className="text-indigo-100 text-sm font-semibold tracking-wide">
          Intelligence Alert: <strong className="text-indigo-400">{availabilityPercent}% Market Saturation</strong> — Beds currently available.
        </p>
      </div>
      
      <button className="p-2 text-slate-500 hover:text-white transition-colors relative z-10">
        <X size={18} />
      </button>
      
      <style jsx="true">{`
        @keyframes pulse-slow {
           0%, 100% { opacity: 0.95; }
           50% { opacity: 1; border-color: rgba(99, 102, 241, 0.4); }
        }
        @keyframes bounce-slow {
           0%, 100% { transform: scale(1); }
           50% { transform: scale(1.1); }
        }
        .animate-pulse-slow {
           animation: pulse-slow 4s infinite ease-in-out;
        }
        .animate-bounce-slow {
           animation: bounce-slow 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default AvailabilityBanner;
