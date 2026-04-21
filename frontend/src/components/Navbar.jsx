 import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Users, 
    Building2, 
    CreditCard, 
    PieChart, 
    Wrench, 
    Home, 
    User as UserIcon,
    ShieldCheck
} from 'lucide-react';
import { toast } from 'react-toastify';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20' : 'text-slate-400 border-transparent';
  };

  const notifyPlaceholder = (component) => {
    toast.info(`Module ${component} is currently under synchronization by the development team.`);
  };

  return (
    <nav className="bg-[#0B1120] border-b border-slate-800/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section */}
          <div 
            className="flex items-center gap-4 cursor-pointer group" 
            onClick={() => navigate('/')}
          >
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-900/20 group-hover:scale-110 transition-transform duration-300">
               <ShieldCheck className="text-white" size={24} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black text-white tracking-tighter leading-none">UNINEST</h1>
              <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-1">Hostel Management</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            <NavButton 
                onClick={() => notifyPlaceholder('Student Directory')} 
                icon={Users} 
                label="Students" 
                disabled 
            />
            
            <NavButton 
                isActive={isActive('/hostels')} 
                onClick={() => navigate('/hostels')} 
                icon={Building2} 
                label="Rooms" 
            />

            <div className="w-px h-6 bg-slate-800 mx-2"></div>

            <NavButton 
                isActive={isActive('/invoices')} 
                onClick={() => navigate('/invoices')} 
                icon={CreditCard} 
                label="Invoices" 
            />
            
            <NavButton 
                isActive={isActive('/payment-history')} 
                onClick={() => navigate('/payment-history')} 
                icon={PieChart} 
                label="Payments" 
            />

            <div className="w-px h-6 bg-slate-800 mx-2"></div>

            <NavButton 
                onClick={() => notifyPlaceholder('Maintenance Console')} 
                icon={Wrench} 
                label="Complaints" 
                disabled 
            />
          </div>

          {/* Profile Section */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Access Level</p>
                <p className="text-xs font-black text-white mt-1 uppercase tracking-tighter">Student Portal</p>
            </div>
            <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center group hover:border-indigo-500/50 transition-all cursor-pointer">
              <UserIcon className="text-slate-500 group-hover:text-indigo-400" size={20} />
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}

// ====== SUBCOMPONENTS ======

const NavButton = ({ icon: Icon, label, onClick, isActive = '', disabled = false }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center gap-3 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
            disabled 
                ? 'opacity-30 cursor-not-allowed border-transparent grayscale' 
                : `${isActive} hover:bg-slate-900 border-slate-800/10 hover:border-slate-800`
        }`}
    >
        <Icon size={14} className={isActive ? 'text-indigo-500' : 'text-slate-500'} />
        {label}
    </button>
);

export default Navbar; 
