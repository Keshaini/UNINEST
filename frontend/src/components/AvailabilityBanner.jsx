import React from 'react';

function AvailabilityBanner({ availabilityPercent }) {
  return (
    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6 flex justify-between items-center">
      <p className="text-blue-800 text-sm">
        Based on current occupancy, <strong>{availabilityPercent}% of hostels</strong> have beds available.
      </p>
      <button className="text-blue-800 text-xl font-bold">&times;</button>
    </div>
  );
}

export default AvailabilityBanner;
