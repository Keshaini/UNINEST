import React from 'react';
import { Wifi, Coffee, Car, MapPin, Star, ArrowUpRight, Zap, Clock } from 'lucide-react';

function HostelCard({ hostel, onBookNow }) {
  const isFull = hostel.bedsAvailable === 0 || hostel.status === 'Full';

  return (
    <div className="group bg-slate-900/40 border border-slate-800 hover:border-indigo-500/30 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-300 hover:scale-[1.01] flex flex-col md:flex-row h-auto md:h-72 backdrop-blur-md relative transform">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="md:w-80 h-48 md:h-full relative overflow-hidden flex-shrink-0 group-hover:scale-110 group-hover:opacity-100 opacity-90 transition-all duration-500">
        <img 
            src={hostel.image} 
            alt={hostel.name} 
            className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10]/80 to-transparent"></div>
        {isFull && (
           <div className="absolute inset-0 bg-rose-950/20 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-rose-500/90 text-white font-black uppercase text-[10px] tracking-widest px-4 py-2 rounded-full border border-rose-400 rotate-[-5deg] shadow-lg">No Vacancy</span>
           </div>
        )}
      </div>

      <div className="flex-1 p-6 flex flex-col justify-between relative z-10">
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className="max-w-[70%]">
                <h3 className="text-2xl font-black text-white leading-tight mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-indigo-400 transition-all cursor-default">{hostel.name}</h3>
                <div className="flex items-center gap-1.5 text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:text-indigo-300 cursor-pointer">
                    <MapPin size={12} className="stroke-[3px]" /> {hostel.location} • Map View
                </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-2xl shadow-inner group-hover:bg-indigo-500/20 transition-all">
                <Star size={14} className="text-indigo-400 fill-indigo-400" />
                <span className="text-white font-black text-sm">{hostel.rating}</span>
              </div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">{hostel.reviews} Reports</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <FeatureBadge icon={Car} text={hostel.features[0]} />
            <FeatureBadge icon={Wifi} text={hostel.features[1]} />
            <FeatureBadge icon={Coffee} text={hostel.features[2]} />
          </div>
        </div>

        <div className="flex justify-between items-end border-t border-slate-800/50 pt-5 mt-auto">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isFull ? 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'}`}></div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${isFull ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {isFull ? 'Fully Operational' : `${hostel.bedsAvailable} Beds Vacant`}
                </p>
            </div>
            <div className="flex gap-2 items-center text-[9px] font-bold text-slate-500 uppercase tracking-widest">
               <Clock size={10} /> Sync Status: Just Now
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex flex-col items-end gap-1 mb-2">
                <div className="text-2xl font-black text-white tracking-tight flex items-baseline gap-1 group-hover:text-indigo-400 transition-colors">
                    <span className="text-xs font-black text-slate-500">LKR</span>
                    {hostel.price.toLocaleString()}
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">/M</span>
                </div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">+ Management Fees</p>
            </div>
            
            <button
              onClick={() => onBookNow(hostel.id)}
              disabled={isFull}
              className={`group flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                isFull 
                  ? 'bg-slate-800 text-slate-600 border border-slate-700/50 cursor-not-allowed opacity-50' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 active:scale-95'
              }`}
            >
              <Zap size={14} className={isFull ? '' : 'fill-white'} />
              {isFull ? 'Awaiting Vacancy' : 'Reserve Unit'}
              <ArrowUpRight size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const FeatureBadge = ({ icon: Icon, text }) => (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/40 border border-slate-800/50 rounded-full hover:bg-slate-800/80 hover:border-slate-700 group/badge transition-all">
        <Icon size={12} className="text-slate-500 group-hover/badge:text-indigo-400 transition-colors" />
        <span className="text-[9px] font-black text-slate-500 group-hover/badge:text-slate-300 uppercase tracking-widest transition-colors">{text}</span>
    </div>
);

export default HostelCard;
