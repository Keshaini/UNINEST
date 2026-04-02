import React from 'react';
import { Search, MapPin, User, Calendar } from 'lucide-react';

function HostelSearchHeader({ searchDraft, onSearchChange, onFindHostels }) {
  return (
    <header className="bg-white border-b p-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap gap-4 items-center justify-between">
        <div className="flex-1 min-w-[200px] border rounded-lg p-3 flex items-center gap-3">
          <MapPin className="text-blue-600" size={20} />
          <div>
            <p className="text-xs font-bold uppercase text-gray-400">Location</p>
            <input
              type="text"
              value={searchDraft.location}
              onChange={(e) => onSearchChange('location', e.target.value)}
              placeholder="Colombo, Kandy..."
              className="text-sm font-semibold w-full bg-transparent outline-none"
            />
          </div>
        </div>
        <div className="flex-1 min-w-[200px] border rounded-lg p-3 flex items-center gap-3">
          <User className="text-blue-600" size={20} />
          <div>
            <p className="text-xs font-bold uppercase text-gray-400">Rooms &amp; Residents</p>
            <input
              type="number"
              min="1"
              value={searchDraft.residents}
              onChange={(e) => onSearchChange('residents', e.target.value)}
              placeholder="Residents count"
              className="text-sm font-semibold w-full bg-transparent outline-none"
            />
          </div>
        </div>
        <div className="flex-1 min-w-[200px] border rounded-lg p-3 flex items-center gap-3">
          <Calendar className="text-blue-600" size={20} />
          <div>
            <p className="text-xs font-bold uppercase text-gray-400">Stay Period</p>
            <input
              type="text"
              value={searchDraft.stayPeriod}
              onChange={(e) => onSearchChange('stayPeriod', e.target.value)}
              placeholder="Apr - Aug"
              className="text-sm font-semibold w-full bg-transparent outline-none"
            />
          </div>
        </div>
        <button
          onClick={onFindHostels}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold transition-all flex items-center gap-2"
        >
          <Search size={18} />
          Find Hostels
        </button>
      </div>
    </header>
  );
}

export default HostelSearchHeader;
