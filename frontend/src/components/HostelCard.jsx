import React from 'react';
import { Wifi, Coffee, Car } from 'lucide-react';

function HostelCard({ hostel, onBookNow }) {
  return (
    <div className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex h-64">
      <img src={hostel.image} alt={hostel.name} className="w-72 object-cover" />

      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-blue-900 leading-tight w-2/3">{hostel.name}</h3>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="font-bold">Top Rated</span>
                <span className="bg-blue-900 text-white px-2 py-1 rounded-lg text-sm">{hostel.rating}</span>
              </div>
              <p className="text-xs text-gray-500">{hostel.reviews} Resident Reviews</p>
            </div>
          </div>

          <p className="text-blue-600 text-sm font-medium mt-1 underline cursor-pointer">{hostel.location} • Show on map</p>

          <div className="flex gap-4 mt-4 text-gray-500">
            <div className="flex items-center gap-1 text-xs">
              <Car size={14} /> {hostel.features[0]}
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Wifi size={14} /> {hostel.features[1]}
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Coffee size={14} /> {hostel.features[2]}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end border-t pt-4">
          <div>
            <p className="text-green-600 text-sm font-bold">Beds available: {hostel.bedsAvailable}</p>
            <p className="text-xs font-semibold text-blue-800 mt-1">Status: {hostel.status || 'Open'}</p>
            <p className="text-gray-400 text-xs italic">Instant booking confirmation</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">LKR {hostel.price.toLocaleString()} / month</p>
            <p className="text-xs text-gray-400">+LKR 1,500 management fee</p>
            <button
              onClick={() => onBookNow(hostel.id)}
              disabled={hostel.bedsAvailable === 0 || hostel.status === 'Full'}
              className="mt-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {hostel.bedsAvailable === 0 || hostel.status === 'Full' ? 'Unavailable' : 'Book Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HostelCard;
