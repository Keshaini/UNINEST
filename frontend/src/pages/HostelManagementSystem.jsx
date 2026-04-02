import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import HostelSearchHeader from '../components/HostelSearchHeader';
import HostelFilters from '../components/HostelFilters';
import AvailabilityBanner from '../components/AvailabilityBanner';
import HostelCard from '../components/HostelCard';
import { fetchHostels } from '../services/hostelApi';

const HostelManagementSystem = () => {
  const navigate = useNavigate();
  const [budget, setBudget] = useState(45000);
  const [hostels, setHostels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchDraft, setSearchDraft] = useState({
    location: '',
    residents: '',
    stayPeriod: ''
  });
  const [appliedSearch, setAppliedSearch] = useState({
    location: '',
    residents: '',
    stayPeriod: ''
  });
  const [selectedFilters, setSelectedFilters] = useState({
    'Boys Hostel': false,
    'Girls Hostel': false,
    'Near University': false,
    'Meal Plan Included': false
  });

  useEffect(() => {
    const loadHostels = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const response = await fetchHostels();
        setHostels(response);
      } catch (error) {
        setErrorMessage(error?.response?.data?.error || 'Failed to load hostels from backend.');
      } finally {
        setIsLoading(false);
      }
    };

    loadHostels();
  }, []);

  const availableHostelCount = useMemo(
    () => hostels.filter((hostel) => hostel.bedsAvailable > 0).length,
    [hostels]
  );
  const availabilityPercent = hostels.length > 0 ? Math.round((availableHostelCount / hostels.length) * 100) : 0;

  const handleSearchChange = (field, value) => {
    setSearchDraft((current) => ({ ...current, [field]: value }));
  };

  const handleFindHostels = () => {
    setAppliedSearch({ ...searchDraft });
  };

  const handleToggleFilter = (filterName) => {
    setSelectedFilters((current) => ({
      ...current,
      [filterName]: !current[filterName]
    }));
  };

  const handleBookNow = (hostelId) => {
    navigate(`/booking/${hostelId}`);
  };

  const filteredHostels = hostels.filter((hostel) => {
    const matchesBudget = hostel.price <= budget;

    const normalizedLocation = appliedSearch.location.trim().toLowerCase();
    const matchesLocation =
      normalizedLocation.length === 0 ||
      hostel.location.toLowerCase().includes(normalizedLocation) ||
      hostel.name.toLowerCase().includes(normalizedLocation);

    const residentCount = Number(appliedSearch.residents);
    const matchesResidents =
      !appliedSearch.residents ||
      Number.isNaN(residentCount) ||
      hostel.maxResidentsPerRoom >= residentCount;

    const normalizedStayPeriod = appliedSearch.stayPeriod.trim().toLowerCase();
    const matchesStayPeriod =
      normalizedStayPeriod.length === 0 ||
      hostel.stayPeriodLabel.toLowerCase().includes(normalizedStayPeriod);

    const boysFilter = !selectedFilters['Boys Hostel'] || hostel.hostelType === 'Boys Hostel';
    const girlsFilter = !selectedFilters['Girls Hostel'] || hostel.hostelType === 'Girls Hostel';
    const nearUniversityFilter = !selectedFilters['Near University'] || hostel.nearUniversity;
    const mealPlanFilter = !selectedFilters['Meal Plan Included'] || hostel.mealPlanIncluded;

    return (
      matchesBudget &&
      matchesLocation &&
      matchesResidents &&
      matchesStayPeriod &&
      boysFilter &&
      girlsFilter &&
      nearUniversityFilter &&
      mealPlanFilter
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-700">
      <HostelSearchHeader
        searchDraft={searchDraft}
        onSearchChange={handleSearchChange}
        onFindHostels={handleFindHostels}
      />

      <main className="max-w-7xl mx-auto py-8 px-4 flex gap-8">
        <HostelFilters
          budget={budget}
          onBudgetChange={setBudget}
          selectedFilters={selectedFilters}
          onToggleFilter={handleToggleFilter}
        />

        <section className="flex-1">
          <AvailabilityBanner availabilityPercent={availabilityPercent} />

          <div className="mb-6">
            <Link
              to="/admin/room-change-requests"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              🔄 Request Room Change
            </Link>
          </div>

          {isLoading && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 mb-6">
              Loading hostels from backend...
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 mb-6">
              {errorMessage}
            </div>
          )}

          <div className="space-y-6">
            {!isLoading && !errorMessage && filteredHostels.map((hostel) => (
              <HostelCard key={hostel.id} hostel={hostel} onBookNow={handleBookNow} />
            ))}

            {!isLoading && !errorMessage && filteredHostels.length === 0 && (
              <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500">
                No hostels match your current search and filter settings.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HostelManagementSystem;
