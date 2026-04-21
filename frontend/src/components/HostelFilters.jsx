import React from 'react';
import { Filter } from 'lucide-react';

function HostelFilters({ budget, onBudgetChange, selectedFilters, onToggleFilter }) {
  const filterOptions = ['Boys Hostel', 'Girls Hostel', 'Near University', 'Meal Plan Included'];

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shadow-inner">
          <Filter className="text-indigo-400 w-5 h-5" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">Parametric <span className="text-indigo-500">Filters</span></h2>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8 shadow-2xl backdrop-blur-md">
        <div className="mb-10">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-6">Monthly Rent Budget</label>
          <div className="relative group">
            <input
              type="range"
              min="10000"
              max="120000"
              value={budget}
              onChange={(e) => onBudgetChange(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              LKR {budget.toLocaleString()}
            </div>
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <span className="p-1.5 bg-slate-950/50 rounded-lg border border-slate-800/50">Min: 10K</span>
            <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">Max: {budget >= 100000 ? '120K+' : (budget/1000).toFixed(0) + 'K'}</span>
          </div>
        </div>

        <div className="space-y-4 pt-10 border-t border-slate-800/50">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Property Metadata</h3>
          <div className="grid grid-cols-1 gap-4">
            {filterOptions.map((filter) => (
              <label 
                key={filter} 
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${
                  selectedFilters[filter] 
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-100' 
                    : 'bg-slate-950/30 border-slate-800/50 text-slate-500 hover:border-slate-700/80 hover:bg-slate-800/10'
                }`}
              >
                <span className="text-xs font-bold transition-colors">{filter}</span>
                <input
                  type="checkbox"
                  checked={Boolean(selectedFilters[filter])}
                  onChange={() => onToggleFilter(filter)}
                  className="hidden"
                />
                <div className={`w-2 h-2 rounded-full transition-shadow ${selectedFilters[filter] ? 'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]' : 'bg-slate-700'}`}></div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default HostelFilters;
