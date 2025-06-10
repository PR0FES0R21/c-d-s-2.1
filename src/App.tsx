// ===========================================================================
// File: src/App.tsx (MODIFIKASI - Tambahkan RainbowKit providers)
// ===========================================================================
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

import { config } from './config/wagmi';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import MissionTerminal from './pages/MissionTerminal';
import { AuthProvider } from './contexts/AuthContext';

const queryClient = new QueryClient();

// Komponen untuk menangani logika parameter URL
const UrlReferralHandler: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const refCodeFromUrl = urlParams.get('ref');

    if (refCodeFromUrl) {
      console.log("Referral code from URL detected:", refCodeFromUrl);
      // Simpan ke localStorage agar bisa diakses saat connect wallet
      localStorage.setItem('pending_referral_code', refCodeFromUrl);
      
      // Opsional: Hapus parameter 'ref' dari URL agar tidak terlihat terus dan tidak dipakai ulang jika user refresh
      // Ini akan mengubah URL di address bar tanpa reload halaman.
      urlParams.delete('ref');
      navigate(`${location.pathname}?${urlParams.toString()}`, { replace: true });
    }
  }, [location, navigate]);

  return null;
};

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={darkTheme({
            accentColor: '#9600ef',
            accentColorForeground: 'white',
            borderRadius: 'medium',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
        >
          <AuthProvider>
            <Router>
              <UrlReferralHandler />
              <Toaster position="bottom-center" 
                toastOptions={{
                  style: {
                    background: '#1a1b26',
                    color: '#fff',
                    border: '1px solid rgba(147, 51, 234, 0.2)',
                  },
                  success: {
                    iconTheme: {
                      primary: '#00e5ff',
                      secondary: '#1a1b26',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ff4d4f',
                      secondary: '#1a1b26',
                    },
                  },
                }}
              />
              <Routes>
                <Route path="/" element={<DashboardLayout />}>
                  <Route index element={<Home />} />
                  <Route path="mission-terminal" element={<MissionTerminal />} />
                </Route>
              </Routes>
            </Router>
          </AuthProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;