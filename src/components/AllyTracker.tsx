// ===========================================================================
// File: src/components/AllyTracker.tsx (MODIFIKASI UTAMA)
// Deskripsi: Menampilkan total allies dan daftar allies dari API, tampilan sesuai asli.
// ===========================================================================
import React, { useState, useEffect } from 'react';
import { Satellite, Radio, Link as LinkIcon, Loader2, AlertTriangle, ChevronLeft, ChevronRight, Users, SignalHigh } from 'lucide-react'; // Menambahkan Users
import ReferralModal from './ReferralModal';
import { useAuth } from '../contexts/AuthContext';
import { getMyAllies } from '../services/apiService';
import { AllyInfo, AlliesListResponse } from '../types/user';
import { format, differenceInDays } from 'date-fns';
import { formatToAlienTime, isNewRecruit } from '../utils/timeFormatters';

const AllyTracker: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [alliesData, setAlliesData] = useState<AlliesListResponse | null>(null);
  const [isLoadingAllies, setIsLoadingAllies] = useState<boolean>(false);
  const [errorAllies, setErrorAllies] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const alliesPerPage = 10; // Sesuaikan dengan desain awal jika perlu, atau biarkan bisa scroll

  const fetchAllies = async (page: number) => {
    if (!isAuthenticated || authLoading) return;

    setIsLoadingAllies(true);
    setErrorAllies(null);
    try {
      const data = await getMyAllies(page, alliesPerPage);
      setAlliesData(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || "Gagal memuat daftar sekutu.";
      setErrorAllies(errorMessage);
      console.error("Error fetching allies list:", err);
    } finally {
      setIsLoadingAllies(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchAllies(currentPage);
    } else if (!isAuthenticated && !authLoading) {
      setAlliesData(null); 
    }
  }, [isAuthenticated, authLoading, currentPage]);

  const totalRecruits = user?.alliesCount || 0; // Ambil dari user context untuk total

  const handleNextPage = () => {
    if (alliesData && currentPage < alliesData.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM, HH:mm"); // Format lebih singkat
    } catch (e) {
      return "Invalid Date";
    }
  };

  const isNewAlly = (joinedAt: string): boolean => {
    try {
      const joinDate = new Date(joinedAt);
      const today = new Date();
      return differenceInDays(today, joinDate) < 3; // Kurang dari 3 hari dianggap baru
    } catch (e) {
      return false;
    }
  };
  
  // Hitung jumlah ally baru dari data yang di-fetch
  const newAlliesCount = alliesData?.allies.filter(ally => isNewAlly(ally.joinedAt)).length || 0;

  return (
    <>
      <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900/80 border border-purple-500/20 backdrop-blur-sm p-5 h-full">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-green-400"></div>
        
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-orbitron font-bold text-white flex items-center gap-2">
            <Satellite size={18} className="text-cyan-400" />
            Ally Signal Log
          </h2>
          <div className="text-xs font-mono text-gray-400 flex items-center gap-2">
            <span>INCOMING TRANSMISSIONS</span>
            {/* Menampilkan jumlah ally baru dari data yang sudah di-fetch */}
            {isAuthenticated && !isLoadingAllies && newAlliesCount > 0 && (
              <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 animate-pulse">
                +{newAlliesCount} New
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-900/30">
            <div className="text-sm font-mono text-gray-400 mb-2">TOTAL RECRUITS</div>
            <div className="text-3xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-300 to-green-400">
              {authLoading ? <Loader2 size={28} className="animate-spin inline-block" /> : totalRecruits}
            </div>
          </div>

          <div className="space-y-2">
            {isLoadingAllies && (
              <div className="flex justify-center items-center min-h-[150px]"> {/* Tinggi minimal untuk loader */}
                <Loader2 size={24} className="text-cyan-400 animate-spin" />
              </div>
            )}
            {!isLoadingAllies && errorAllies && (
              <div className="flex flex-col justify-center items-center min-h-[150px] text-center">
                <AlertTriangle size={24} className="text-red-500 mb-2" />
                <p className="font-mono text-sm text-red-400">Error: {errorAllies}</p>
                <button 
                  onClick={() => fetchAllies(currentPage)} 
                  className="mt-2 text-xs px-3 py-1 bg-purple-500/20 rounded-md hover:bg-purple-500/30"
                >
                  Coba Lagi
                </button>
              </div>
            )}
            {!isLoadingAllies && !errorAllies && alliesData && alliesData.allies.length > 0 && (
              <div className="max-h-[200px] overflow-y-auto hide-scrollbar space-y-2">
                {alliesData.allies.map((ally) => (
                  <div 
                    key={ally.id}
                    className="bg-gray-800/30 rounded-lg p-3 border border-purple-900/30 flex items-center justify-between group hover:bg-gray-800/50 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                      <span className="font-mono text-gray-300">{ally.username}</span>
                      {isNewAlly(ally.joinedAt) && (
                        <span className="px-1.5 py-0.5 bg-green-500/20 text-[10px] font-mono text-green-400 rounded-full">
                          NEW
                        </span>
                      )}
                    </div>
                    {/* "View Signal" link dihilangkan karena tidak ada inviteLink per ally dari API */}
                    {/* Jika ingin menampilkan info lain seperti Rank atau Joined Date, bisa di sini */}
                     <div className="text-xs font-mono text-gray-500 text-right">
                        <div>Rank: {ally.rank}</div>
                        <div className="mt-0.5 text-cyan-300" title={`Earth time: ${new Date(ally.joinedAt).toLocaleString()}`}>
                          Joined: {formatToAlienTime(ally.joinedAt)}
                        </div>
                     </div>
                  </div>
                ))}
              </div>
            )}
            {!isLoadingAllies && !errorAllies && (!alliesData || alliesData.allies.length === 0) && isAuthenticated && (
               <div className="text-center py-8 text-gray-500 font-mono min-h-[150px] flex items-center justify-center">
                <div className="flex-grow flex flex-col justify-center items-center text-center text-gray-500 font-mono">
                  <SignalHigh size={40} className="mb-3 opacity-50" />
                  No signals received yet, Commander.
                </div>
              </div>
            )}
             {!isLoadingAllies && !isAuthenticated && !authLoading && (
               <div className="text-center py-8 text-gray-500 font-mono min-h-[150px] flex items-center justify-center">
                <div className="flex-grow flex flex-col justify-center items-center text-center text-gray-500 font-mono">
                  <SignalHigh size={40} className="mb-3 opacity-50" />
                  Connect wallet to view Ally Signals.
                </div>
              </div>
            )}
          </div>
          
          {/* Paginasi - hanya tampil jika ada data dan lebih dari 1 halaman */}
          {alliesData && alliesData.allies.length > 0 && alliesData.totalPages > 1 && (
            <div className="flex justify-center items-center mt-4 space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1 || isLoadingAllies}
                className="p-2 bg-gray-700/50 hover:bg-gray-600/70 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} className="text-gray-300" />
              </button>
              <span className="font-mono text-xs text-gray-400">
                Page {alliesData.page} of {alliesData.totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === alliesData.totalPages || isLoadingAllies}
                className="p-2 bg-gray-700/50 hover:bg-gray-600/70 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} className="text-gray-300" />
              </button>
            </div>
          )}

          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-lg font-orbitron text-sm text-white relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/40 via-cyan-500/40 to-green-500/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-center justify-center gap-2 mt-auto">
              <Radio size={16} className="text-cyan-400" />
              <span>Broadcast Invitation</span>
            </div>
            <div className="absolute inset-0 border border-purple-500/50 rounded-lg opacity-0 group-hover:opacity-100 scale-105 group-hover:scale-100 transition-all duration-500"></div>
          </button>
        </div>

        <div className="absolute bottom-0 right-0 w-full h-40 pointer-events-none opacity-10">
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-cyan-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500 rounded-full filter blur-3xl"></div>
        </div>
      </div>

      <ReferralModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default AllyTracker;