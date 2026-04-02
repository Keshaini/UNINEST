import React from 'react';

function HostelFilters({ budget, onBudgetChange, selectedFilters, onToggleFilter }) {
  const filterOptions = ['Boys Hostel', 'Girls Hostel', 'Near University', 'Meal Plan Included'];

  return (
    <aside className="w-64 flex-shrink-0">
      <h2 className="text-xl font-bold mb-6">Filter Hostels</h2>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="mb-8">
          <label className="text-sm font-bold block mb-4">Monthly rent budget</label>
          <input
            type="range"
            min="10000"
            max="120000"
            value={budget}
            onChange={(e) => onBudgetChange(Number(e.target.value))}
            className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between mt-2 text-sm font-medium">
            <span>LKR 10,000</span>
            <span>LKR {budget.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold border-t pt-4">Popular Filters</h3>
          {filterOptions.map((filter) => (
            <label key={filter} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(selectedFilters[filter])}
                onChange={() => onToggleFilter(filter)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">{filter}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default HostelFilters;
