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
    <div className="min-h-screen bg-[#0a0c10] font-sans text-slate-300 selection:bg-indigo-500/30">
      <HostelSearchHeader
        searchDraft={searchDraft}
        onSearchChange={handleSearchChange}
        onFindHostels={handleFindHostels}
      />

      <main className="max-w-7xl mx-auto py-10 px-6 flex flex-col lg:flex-row gap-10">
        <HostelFilters
          budget={budget}
          onBudgetChange={setBudget}
          selectedFilters={selectedFilters}
          onToggleFilter={handleToggleFilter}
        />

        <section className="flex-1 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
               Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Residencies</span>
            </h2>
            <Link
              to="/room-change-requests"
              className="group relative inline-flex items-center gap-2 bg-slate-900 border border-slate-700/50 hover:border-indigo-500/50 text-slate-300 hover:text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-xl overflow-hidden"
            >
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative flex items-center gap-2">🔄 Request Room Change</span>
            </Link>
          </div>

          <AvailabilityBanner availabilityPercent={availabilityPercent} />

          {isLoading && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-20 text-center backdrop-blur-md">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Synchronizing Database...</p>
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-rose-400 font-semibold shadow-[0_0_20px_rgba(239,68,68,0.1)]">
              ⚠️ {errorMessage}
            </div>
          )}

          <div className="space-y-6">
            {!isLoading && !errorMessage && filteredHostels.map((hostel) => (
              <HostelCard key={hostel.id} hostel={hostel} onBookNow={handleBookNow} />
            ))}

            {!isLoading && !errorMessage && filteredHostels.length === 0 && (
              <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-20 text-center">
                <p className="text-slate-600 font-bold uppercase tracking-widest text-sm">No matching residencies found.</p>
                <p className="text-slate-700 text-xs mt-2">Try adjusting your filters or budget constraints.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HostelManagementSystem;
