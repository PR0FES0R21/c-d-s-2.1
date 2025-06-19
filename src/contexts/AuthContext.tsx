// ===========================================================================
// File: src/contexts/AuthContext.tsx (UPDATED - Cookie-based Authentication)
// Deskripsi: React Context untuk manajemen state autentikasi dengan cookie-based auth.
// ===========================================================================
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { 
  getCurrentUser, 
  getChallengeMessage, 
  connectWallet, 
  logoutUser, 
  getTwitterOAuthUrl 
} from '../services/apiService';
import { UserPublic } from '../types/user';
import { AuthSuccessResponse } from '../types/auth';
import toast from 'react-hot-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserPublic | null;
  isLoading: boolean;
  isFetchingProfile: boolean;
  logout: () => void;
  fetchUserProfile: () => Promise<void>;
  initiateTwitterConnect: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PENDING_REFERRAL_CODE_KEY = 'pending_referral_code';

// Fungsi untuk membersihkan localStorage kecuali referral code
const clearAuthStorage = () => {
  const pendingReferralCode = localStorage.getItem(PENDING_REFERRAL_CODE_KEY);
  localStorage.clear();
  if (pendingReferralCode) {
    localStorage.setItem(PENDING_REFERRAL_CODE_KEY, pendingReferralCode);
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserPublic | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetchingProfile, setIsFetchingProfile] = useState<boolean>(false);
  const [hasTriedAutoAuth, setHasTriedAutoAuth] = useState<boolean>(false);

  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  const fetchUserProfile = async () => {
    setIsFetchingProfile(true);
    try {
      console.log("AuthContext: Fetching user profile...");
      const userData = await getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      console.info("AuthContext: User profile refreshed.");
    } catch (error: any) {
      console.error("AuthContext: Error fetching user profile:", error);
      if (error.response?.status === 401) {
        console.log("AuthContext: Authentication failed - clearing state");
        setUser(null);
        setIsAuthenticated(false);
        clearAuthStorage();
      }
    } finally {
      setIsFetchingProfile(false);
    }
  };

  // Auto authentication ketika wallet connect
  const performAutoAuth = async () => {
    if (!isConnected || !address || hasTriedAutoAuth || isAuthenticated) {
      return;
    }

    setHasTriedAutoAuth(true);
    setIsLoading(true);

    try {
      const walletAddress = address;

      console.log("Auto authentication: Requesting challenge...");
      const { messageToSign, nonce } = await getChallengeMessage(walletAddress);
      
      if (!messageToSign || !nonce) {
        console.error("Auto authentication: Failed to get challenge");
        setIsLoading(false);
        return;
      }

      console.log("Auto authentication: Requesting signature...");
      const signature = await signMessageAsync({
        message: messageToSign,
      });

      if (!signature) {
        console.error("Auto authentication: Failed to sign message");
        setIsLoading(false);
        return;
      }
      
      const pendingReferralCode = localStorage.getItem(PENDING_REFERRAL_CODE_KEY);

      console.log("Auto authentication: Verifying signature...");
      const connectPayload: any = {
        walletAddress,
        message: messageToSign,
        signature,
        nonce,
      };

      if (pendingReferralCode) {
        connectPayload.referral_code_input = pendingReferralCode;
        console.log("Auto authentication: Using referral code:", pendingReferralCode);
      }
      
      const response: AuthSuccessResponse = await connectWallet(connectPayload);

      if (response.message) {
        // Fetch user profile setelah berhasil connect
        await fetchUserProfile();
        toast.success(response.message);

        if (pendingReferralCode) {
          localStorage.removeItem(PENDING_REFERRAL_CODE_KEY);
          console.log("Auto authentication: Referral code used and removed.");
        }
      } else {
        console.error("Auto authentication: No success message from server");
      }

    } catch (error: any) {
      console.error("Auto authentication failed:", error);
      const errorMessage = error.response?.data?.detail || "Authentication failed";
      // Tidak menampilkan toast error untuk auto auth yang gagal
      console.log("Auto auth error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      // Coba fetch user profile untuk cek apakah sudah authenticated via cookie
      try {
        await fetchUserProfile();
      } catch (error) {
        // Jika gagal, user belum authenticated
        console.log("No valid authentication found");
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle wallet connection/disconnection
  useEffect(() => {
    if (!isConnected) {
      // Wallet disconnected - clear everything
      if (isAuthenticated || user) {
        console.log("Wallet disconnected - clearing auth state");
        setUser(null);
        setIsAuthenticated(false);
        setHasTriedAutoAuth(false);
        clearAuthStorage();
      }
    } else if (isConnected && !isAuthenticated && !hasTriedAutoAuth) {
      // Wallet connected but not authenticated - try auto auth
      performAutoAuth();
    }
  }, [isConnected, isAuthenticated, hasTriedAutoAuth, user]);

  const logout = async () => {
    setIsLoading(true);
    try {
      // Call logout endpoint to clear server-side cookie
      const response = await logoutUser();
      console.log("Logout successful:", response.message);
      toast.success(response.message || "You have been logged out");
    } catch (error: any) {
      console.error("Error during logout:", error);
      // Still proceed with client-side cleanup even if server logout fails
      const errorMessage = error.response?.data?.detail || "Logout failed, but clearing local session";
      toast.error(errorMessage);
    }
    
    // Clear client-side state
    setUser(null);
    setIsAuthenticated(false);
    setHasTriedAutoAuth(false);
    clearAuthStorage();
    
    // Disconnect wallet as well
    disconnect();
    
    setIsLoading(false);
  };

  const initiateTwitterConnect = async () => {
    if (!isAuthenticated) {
      toast.error("You must login first");
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
      isLoading, 
      isFetchingProfile, 
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