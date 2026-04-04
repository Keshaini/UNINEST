import API from './api';

const DEFAULT_IMAGE = '/api/placeholder/400/250';

export function mapRoomToHostel(room) {
  return {
    id: room._id,
    roomNumber: room.roomNumber,
    name: room.name || room.type || `Hostel ${room.roomNumber || ''}`.trim(),
    location: room.location || 'Sri Lanka',
    price: Number(room.price) || 0,
    rating: Number(room.rating) || 8,
    reviews: Number(room.reviews) || 0,
    image: room.image || DEFAULT_IMAGE,
    bedsAvailable: Number(room.bedsAvailable) || 0,
    status: room.status || 'Open',
    hostelType: room.hostelType || room.type || 'Mixed Hostel',
    nearUniversity: Boolean(room.nearUniversity),
    mealPlanIncluded: Boolean(room.mealPlanIncluded),
    maxResidentsPerRoom: Number(room.maxResidentsPerRoom) || 1,
    stayPeriodLabel: room.stayPeriodLabel || 'Any',
    features: Array.isArray(room.features) ? room.features : []
  };
}

export function mapHostelToRoomPayload(hostel) {
  return {
    roomNumber: hostel.roomNumber || hostel.id,
    name: hostel.name,
    location: hostel.location,
    price: Number(hostel.price),
    status: hostel.status,
    hostelType: hostel.hostelType,
    type: hostel.hostelType,
    bedsAvailable: Number(hostel.bedsAvailable),
    nearUniversity: Boolean(hostel.nearUniversity),
    mealPlanIncluded: Boolean(hostel.mealPlanIncluded),
    maxResidentsPerRoom: Number(hostel.maxResidentsPerRoom),
    stayPeriodLabel: hostel.stayPeriodLabel || 'Any',
    features: Array.isArray(hostel.features) ? hostel.features : [],
    image: hostel.image || DEFAULT_IMAGE,
    rating: Number(hostel.rating) || 8,
    reviews: Number(hostel.reviews) || 0
  };
}

export async function fetchHostels() {
  const response = await API.get('/rooms');
  return response.data.map(mapRoomToHostel);
}

export async function fetchHostelById(id) {
  const response = await API.get(`/rooms/${id}`);
  return mapRoomToHostel(response.data);
}

export async function createHostel(hostelInput) {
  const payload = mapHostelToRoomPayload(hostelInput);
  const response = await API.post('/rooms', payload);
  return mapRoomToHostel(response.data);
}

export async function updateHostel(id, hostelInput) {
  const payload = mapHostelToRoomPayload(hostelInput);
  const response = await API.put(`/rooms/${id}`, payload);
  return mapRoomToHostel(response.data);
}

export async function deleteHostel(id) {
  await API.delete(`/rooms/${id}`);
}

export async function createBooking(bookingInput) {
  const response = await API.post('/bookings', bookingInput);
  return response.data;
}

export async function fetchRoomChangeRequests() {
  const response = await API.get('/transfers');
  return response.data;
}

export async function createRoomChangeRequest(payload) {
  const response = await API.post('/transfers', payload);
  return response.data;
}

export async function updateRoomChangeRequest(id, payload) {
  const response = await API.put(`/transfers/${id}`, payload);
  return response.data;
}

export async function deleteRoomChangeRequest(id) {
  await API.delete(`/transfers/${id}`);
}
