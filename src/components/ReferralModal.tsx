// ===========================================================================
// File: src/components/ReferralModal.tsx (MODIFIKASI - Gunakan AuthContext)
// ===========================================================================
import React from 'react';
import { Copy, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReferralModal: React.FC<ReferralModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth(); // Ambil data user dari context

  const referralCode = user?.referralCode || "LOGIN_UNTUK_KODE"; // Fallback jika user belum ada
  const referralLink = user?.referralCode ? `${window.location.origin}/?ref=${user.referralCode}` : "Login untuk mendapatkan link referral";

  const copyToClipboard = () => {
    if (!user || !user.referralCode) {
      toast.error("Anda belum memiliki kode referral. Silakan login.");
      return;
    }
    navigator.clipboard.writeText(referralLink);
    toast.success('Link referral disalin ke clipboard!', {
      // Style toast bisa di-set global di App.tsx
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900/80 border border-purple-500/20 rounded-lg overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-green-400"></div>
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          <h3 className="text-xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-300 to-green-400 mb-4">
            Share Your Signal
          </h3>
          
          <p className="text-sm font-mono text-gray-400 mb-6">
            Expand the network. Share your unique quantum signature.
            {!user && " (Login untuk mendapatkan kode referral Anda)"}
          </p>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-900/30">
            <div className="text-xs font-mono text-gray-400 mb-2">YOUR REFERRAL LINK</div>
            <div className="flex items-center justify-between gap-3">
              <code className={`text-sm font-mono truncate ${user && user.referralCode ? 'text-cyan-400' : 'text-gray-600'}`}>
                {referralLink}
              </code>
              <button 
                onClick={copyToClipboard}
                disabled={!user || !user.referralCode}
                className="p-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 hover:text-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralModal;