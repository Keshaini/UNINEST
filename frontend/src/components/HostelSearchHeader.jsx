import React from 'react';
import { Search, MapPin, User, Calendar } from 'lucide-react';

function HostelSearchHeader({ searchDraft, onSearchChange, onFindHostels }) {
  return (
    <header className="bg-slate-900/50 border-b border-slate-800 p-8 backdrop-blur-xl sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-6 items-stretch xl:items-center justify-between">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
          {/* Location */}
          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 focus-within:border-indigo-500/50 transition-all group">
            <div className="p-2 bg-indigo-500/10 rounded-xl group-focus-within:bg-indigo-500/20">
              <MapPin className="text-indigo-400" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-0.5">Location</p>
              <input
                type="text"
                value={searchDraft.location}
                onChange={(e) => onSearchChange('location', e.target.value)}
                placeholder="Colombo, Kandy..."
                className="text-sm font-bold w-full bg-transparent outline-none text-white placeholder:text-slate-700"
              />
            </div>
          </div>

          {/* Residents */}
          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 focus-within:border-indigo-500/50 transition-all group">
            <div className="p-2 bg-indigo-500/10 rounded-xl group-focus-within:bg-indigo-500/20">
              <User className="text-indigo-400" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-0.5">Capacity</p>
              <input
                type="number"
                min="1"
                value={searchDraft.residents}
                onChange={(e) => onSearchChange('residents', e.target.value)}
                placeholder="Residents count"
                className="text-sm font-bold w-full bg-transparent outline-none text-white placeholder:text-slate-700"
              />
            </div>
          </div>

          {/* Stay Period */}
          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 focus-within:border-indigo-500/50 transition-all group">
            <div className="p-2 bg-indigo-500/10 rounded-xl group-focus-within:bg-indigo-500/20">
              <Calendar className="text-indigo-400" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-0.5">Stay Period</p>
              <input
                type="text"
                value={searchDraft.stayPeriod}
                onChange={(e) => onSearchChange('stayPeriod', e.target.value)}
                placeholder="Apr - Aug"
                className="text-sm font-bold w-full bg-transparent outline-none text-white placeholder:text-slate-700"
              />
            </div>
          </div>
        </div>

        <button
          onClick={onFindHostels}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 shrink-0"
        >
          <Search size={18} className="stroke-[3px]" />
          Scan Hostels
        </button>
      </div>
    </header>
  );
}

export default HostelSearchHeader;
