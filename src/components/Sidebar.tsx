import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Gift, 
  Wallet, 
  Image, 
  Database, 
  Users, 
  ShoppingBag,
  Menu,
  X,
  Zap
} from 'lucide-react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, path, active = false, disabled = false, onClick }) => {
  return (
    <div 
      onClick={!disabled && onClick ? onClick : undefined}
      className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer group
        ${active 
          ? 'bg-purple-900/30 text-purple-300 border border-purple-500/50' 
          : 'hover:bg-purple-900/20 text-gray-400 border border-transparent'}
        ${disabled ? 'opacity-50 hover:bg-transparent cursor-not-allowed' : ''}
      `}
    >
      <div className={`${active ? 'text-cyan-400' : 'text-gray-500'} transition-colors duration-300`}>
        {icon}
      </div>
      <span className="font-medium tracking-wide text-sm">
        {label}
      </span>
      {disabled && (
        <span className="absolute right-3 text-[10px] font-orbitron text-gray-500 px-2 py-0.5 rounded-full border border-gray-700/50 bg-gray-800/50 animate-pulse">
          COMING SOON
        </span>
      )}
      {active && (
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-purple-500 to-cyan-400 rounded-l-lg"></div>
      )}
      <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-10 
        ${active ? 'bg-cyan-400' : 'bg-purple-500'} transition-opacity duration-300`}></div>
    </div>
  );
};

const Sidebar: React.FC<{ isOpen: boolean; toggle: () => void }> = ({ isOpen, toggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {/* Mobile menu toggle */}
      <button 
        onClick={toggle}
        className="fixed top-4 left-4 z-50 p-2 rounded-full bg-gray-900/80 border border-purple-500/30 text-cyan-400 md:hidden"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          onClick={toggle}
        ></div>
      )}

      {/* Sidebar content */}
      <aside 
        className={`fixed md:sticky top-0 left-0 h-screen z-40 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
          w-64 flex flex-col md:h-screen border-r border-purple-900/30 bg-gray-900/90 backdrop-blur-md`}
      >
        <div className="p-4 flex items-center justify-center border-b border-purple-900/30">
          <div className="flex items-center gap-2 px-2 py-3">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-cyan-400 rounded-full animate-pulse-slow opacity-60"></div>
              <div className="absolute inset-0.5 bg-gray-900 rounded-full z-10"></div>
              <span className="relative z-20 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-cyan-300">$</span>
            </div>
            <h1 className="text-2xl font-orbitron font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-300 to-green-400">
              CIGAR
            </h1>
          </div>
        </div>

        <div className="p-4 flex-1 space-y-2 overflow-y-auto hide-scrollbar">
          <NavItem 
            icon={<Home size={18} />} 
            label="Home" 
            active={location.pathname === '/'} 
            onClick={() => navigate('/')}
          />
          <NavItem 
            icon={<Zap size={18} />} 
            label="Mission Terminal" 
            active={location.pathname === '/mission-terminal'} 
            onClick={() => navigate('/mission-terminal')}
          />
          <NavItem icon={<Gift size={18} />} label="Airdrop" disabled />
          <NavItem icon={<Wallet size={18} />} label="Stake Token" disabled />
          <NavItem icon={<Image size={18} />} label="Stake NFT" disabled />
          <NavItem icon={<Database size={18} />} label="LP Vault" disabled />
          <NavItem icon={<Users size={18} />} label="DAO Council" disabled />
          <NavItem icon={<ShoppingBag size={18} />} label="Marketplace" disabled />
        </div>

        <div className="p-4 border-t border-purple-900/30">
          <div className="text-xs text-gray-500 font-mono">
            <div className="flex justify-between">
              <span>SYSTEM v0.1.3</span>
              <span>NODE #42069</span>
            </div>
            <div className="mt-1 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>CONNECTED</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;