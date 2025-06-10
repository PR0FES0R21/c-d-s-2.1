import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import WalletButton from '../components/WalletButton';
import NewsBar from '../components/NewsBar';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-gray-900 to-black"></div>
        <div className="absolute inset-0 opacity-30" style={{ 
          backgroundImage: 'url("https://images.pexels.com/photos/998641/pexels-photo-998641.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750")', 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'soft-light'
        }}></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        {/* Ambient lights */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-green-600/10 rounded-full filter blur-3xl"></div>
      </div>

      <Sidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="relative flex-1 flex flex-col overflow-hidden">
        <header className="relative z-10 px-3 sm:px-6 py-4 bg-gray-900/50 backdrop-blur-md border-b border-purple-900/30">
          <div className="flex justify-end">
            <WalletButton />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto hide-scrollbar">
          <Outlet />
        </main>

        <NewsBar />
      </div>
    </div>
  );
};

export default DashboardLayout;