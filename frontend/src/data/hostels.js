const hostels = [
  {
    id: 1,
    name: 'Colombo City Student Hostel',
    location: 'Colombo',
    price: 28500,
    rating: 8.7,
    reviews: 312,
    image: '/api/placeholder/400/250',
    bedsAvailable: 14,
    status: 'Open',
    hostelType: 'Boys Hostel',
    nearUniversity: true,
    mealPlanIncluded: true,
    maxResidentsPerRoom: 3,
    stayPeriodLabel: 'Apr - Aug',
    features: ['Secure Parking', 'High-Speed Wi-Fi', 'Meal Plan']
  },
  {
    id: 2,
    name: 'Kandy Lakeview Hostel',
    location: 'Kandy',
    price: 24900,
    rating: 8.5,
    reviews: 228,
    image: '/api/placeholder/400/250',
    bedsAvailable: 9,
    status: 'Open',
    hostelType: 'Girls Hostel',
    nearUniversity: false,
    mealPlanIncluded: false,
    maxResidentsPerRoom: 2,
    stayPeriodLabel: 'May - Sep',
    features: ['24/7 Security', 'Free Wi-Fi', 'Laundry Service']
  }
];

export default hostels;
