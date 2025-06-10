// ===========================================================================
// File: src/context/AuthContext.tsx (MODIFIKASI - Gunakan Wagmi hooks)
// Deskripsi: React Context untuk manajemen state autentikasi dan data pengguna dengan RainbowKit/Wagmi.
// ===========================================================================
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import apiClient, { getTwitterOAuthUrl } from '../services/apiService';
import { UserPublic } from '../types/user';
import toast from 'react-hot-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserPublic | null;
  token: string | null;
  isLoading: boolean;
  isFetchingProfile: boolean;
  connectWallet: () => Promise<void>;
  logout: () => void;
  fetchUserProfile: () => Promise<void>;
  initiateTwitterConnect: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PENDING_REFERRAL_CODE_KEY = 'pending_referral_code';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserPublic | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetchingProfile, setIsFetchingProfile] = useState<boolean>(false);

  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  const fetchUserProfile = async (currentToken?: string) => {
    const tokenToUse = currentToken || token;
    if (!tokenToUse) {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('cigar_ds_user');
      localStorage.removeItem('cigar_ds_token');
      delete apiClient.defaults.headers.common['Authorization'];
      return;
    }

    setIsFetchingProfile(true);
    if (!apiClient.defaults.headers.common['Authorization'] && tokenToUse) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${tokenToUse}`;
    }

    try {
      console.log("AuthContext: Fetching user profile...");
      const response = await apiClient.get<UserPublic>('/users/me');
      const updatedUserData = response.data;
      setUser(updatedUserData);
      setIsAuthenticated(true);
      localStorage.setItem('cigar_ds_user', JSON.stringify(updatedUserData));
      console.info("AuthContext: User profile refreshed and stored.");
    } catch (error: any) {
      console.error("AuthContext: Error fetching user profile:", error);
      if (error.response?.status === 401) {
        toast.error("Sesi Anda tidak valid atau telah berakhir. Silakan login kembali.");
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('cigar_ds_token');
        localStorage.removeItem('cigar_ds_user');
        delete apiClient.defaults.headers.common['Authorization'];
      }
    } finally {
      setIsFetchingProfile(false);
    }
  };
  
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      const storedToken = localStorage.getItem('cigar_ds_token');
      const storedUserJson = localStorage.getItem('cigar_ds_user');

      if (storedToken) {
        setToken(storedToken);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        if (storedUserJson) {
            try {
                const parsedUser: UserPublic = JSON.parse(storedUserJson);
                setUser(parsedUser);
                setIsAuthenticated(true); 
            } catch (e) { console.error("Failed to parse cached user", e); }
        }
        await fetchUserProfile(storedToken);
      } else {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        delete apiClient.defaults.headers.common['Authorization'];
      }
      setIsLoading(false);
    };

    initializeAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle wallet disconnection
  useEffect(() => {
    if (!isConnected && isAuthenticated) {
      // Wallet was disconnected, but user is still authenticated
      // You might want to keep the session or logout automatically
      console.log("Wallet disconnected but user still authenticated");
    }
  }, [isConnected, isAuthenticated]);

  const connectWallet = async () => {
    if (!isConnected || !address) {
      toast.error("Silakan hubungkan dompet Anda terlebih dahulu menggunakan tombol Connect Wallet.");
      return;
    }

    setIsLoading(true);
    setIsFetchingProfile(false);

    try {
      const walletAddress = address;

      toast.loading("Meminta challenge dari server...", { id: "auth-process" });
      const challengeResponse = await apiClient.get(`/auth/challenge`, { params: { walletAddress } });
      const { messageToSign, nonce } = challengeResponse.data;
      
      if (!messageToSign || !nonce) {
        toast.error("Gagal mendapatkan challenge message dari server.", { id: "auth-process" });
        setIsLoading(false);
        return;
      }

      toast.loading("Silakan tandatangani pesan di dompet Anda...", { id: "auth-process" });
      
      const signature = await signMessageAsync({
        message: messageToSign,
      });

      if (!signature) {
        toast.error("Gagal menandatangani pesan.", { id: "auth-process" });
        setIsLoading(false);
        return;
      }
      
      const pendingReferralCode = localStorage.getItem(PENDING_REFERRAL_CODE_KEY);

      toast.loading("Memverifikasi signature...", { id: "auth-process" });
      const connectPayload: any = {
        walletAddress,
        message: messageToSign,
        signature,
        nonce,
      };

      if (pendingReferralCode) {
        connectPayload.referral_code_input = pendingReferralCode;
        console.log("Mengirim dengan kode referral:", pendingReferralCode);
      }
      
      const connectResponse = await apiClient.post('/auth/connect', connectPayload);

      const { access_token, user: userData } = connectResponse.data;

      if (access_token && userData) {
        setToken(access_token);
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('cigar_ds_token', access_token);
        localStorage.setItem('cigar_ds_user', JSON.stringify(userData));
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        toast.success(`Selamat datang, ${userData.username}!`, { id: "auth-process" });

        if (pendingReferralCode) {
          localStorage.removeItem(PENDING_REFERRAL_CODE_KEY);
          console.log("Kode referral yang tertunda telah digunakan dan dihapus.");
        }
      } else {
        toast.error("Login gagal. Data tidak lengkap dari server.", { id: "auth-process" });
      }

    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      const errorMessage = error.response?.data?.detail || error.message || "Terjadi kesalahan saat menghubungkan dompet.";
      let displayErrorMessage = errorMessage;
      if (Array.isArray(errorMessage)) {
        displayErrorMessage = errorMessage.map((err: any) => `${err.loc?.join('->') || 'error'}: ${err.msg}`).join('; ');
      }
      toast.error(displayErrorMessage, { id: "auth-process" });
    } finally {
      setIsLoading(false);
      toast.dismiss("auth-process");
    }
  };

  const logout = () => {
    setIsLoading(true);
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('cigar_ds_token');
    localStorage.removeItem('cigar_ds_user');
    delete apiClient.defaults.headers.common['Authorization'];
    
    // Disconnect wallet as well
    disconnect();
    
    toast.success("Anda telah logout.");
    setIsLoading(false);
  };

  const initiateTwitterConnect = async () => {
    if (!isAuthenticated || !token) {
      toast.error("Anda harus login terlebih dahulu untuk menghubungkan akun X.");
      return;
    }
    setIsLoading(true); 
    const toastId = "twitter-connect-initiate";
    toast.loading("Mempersiapkan koneksi ke X...", { id: toastId });
    try {
      const response = await getTwitterOAuthUrl();
      const { redirect_url } = response;

      if (redirect_url) {
        toast.success("Mengarahkan ke halaman otorisasi X...", { id: toastId });
        window.location.href = redirect_url;
      } else {
        toast.error("Gagal mendapatkan URL otorisasi X dari server.", { id: toastId });
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("Error initiating Twitter connect:", error);
      const errorMessage = error.response?.data?.detail || error.message || "Gagal memulai koneksi X.";
      let displayErrorMessage = errorMessage;
      if (Array.isArray(errorMessage)) {
        displayErrorMessage = errorMessage.map((err: any) => `${err.loc?.join('->') || 'error'}: ${err.msg}`).join('; ');
      }
      toast.error(displayErrorMessage, { id: toastId });
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      token, 
      isLoading, 
      isFetchingProfile, 
      connectWallet, 
      logout, 
      fetchUserProfile, 
      initiateTwitterConnect 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};