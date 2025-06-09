// ===========================================================================
// File: src/components/WalletButton.tsx (MODIFIKASI - Gunakan RainbowKit)
// Deskripsi: Mengintegrasikan WalletButton dengan RainbowKit dan AuthContext.
// ===========================================================================
import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { LogOut, Loader2, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const WalletButton: React.FC = () => {
  const { isAuthenticated, user, isLoading, connectWallet, logout } = useAuth();
  const { isConnected } = useAccount();

  if (isLoading) {
    return (
      <button
        className="relative overflow-hidden group flex items-center justify-center px-5 py-2.5 bg-gray-800/80 border border-purple-500/30 rounded-lg cursor-wait"
        disabled
      >
        <Loader2 size={18} className="text-cyan-400 animate-spin mr-2" />
        <span className="font-orbitron tracking-wide text-sm text-white">
          Memproses...
        </span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          // Note: If your app doesn't use authentication, you
          // can remove all 'authenticationStatus' checks
          const ready = mounted && authenticationStatus !== 'loading';
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus ||
              authenticationStatus === 'authenticated');

          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                'style': {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <button 
                      onClick={openConnectModal} 
                      type="button"
                      className="relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-cyan-500 to-green-500 opacity-70 rounded-lg blur-md group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative flex items-center gap-2 px-5 py-2.5 bg-gray-900/90 border border-purple-500/30 rounded-lg z-10 transition-all duration-300">
                        <span className="font-orbitron tracking-wide text-sm text-white">
                          Connect Wallet
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-cyan-900/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <button 
                      onClick={openChainModal} 
                      type="button"
                      className="px-4 py-2 bg-red-600/80 hover:bg-red-500/90 border border-red-500/30 rounded-lg font-orbitron text-sm text-white transition-colors"
                    >
                      Wrong network
                    </button>
                  );
                }

                // Wallet is connected but not authenticated with our backend
                if (connected && !isAuthenticated) {
                  return (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={openAccountModal}
                        className="px-4 py-2 bg-gray-800/80 border border-cyan-500/30 rounded-lg font-orbitron text-sm text-white hover:bg-gray-700/80 transition-colors"
                      >
                        {account.displayName}
                        {account.displayBalance
                          ? ` (${account.displayBalance})`
                          : ''}
                      </button>
                      <button
                        onClick={connectWallet}
                        className="relative overflow-hidden group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-lg font-orbitron text-sm text-white hover:from-purple-500/30 hover:to-cyan-500/30 transition-all duration-300"
                      >
                        <Zap size={16} className="text-cyan-400" />
                        <span>Sign In</span>
                      </button>
                    </div>
                  );
                }

                // Fully authenticated
                if (isAuthenticated && user) {
                  return (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={openAccountModal}
                          className="px-4 py-2 bg-gray-800/80 border border-cyan-500/30 rounded-lg font-orbitron text-sm text-white hover:bg-gray-700/80 transition-colors"
                        >
                          {account.displayName}
                        </button>
                        <div className="px-3 py-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-lg">
                          <span className="font-orbitron text-sm text-white truncate max-w-[100px] sm:max-w-[150px]" title={user.username}>
                            {user.username}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={logout}
                        className="relative overflow-hidden group p-2.5 bg-red-700/80 hover:bg-red-600/90 border border-red-500/30 rounded-lg transition-colors duration-300"
                        title="Logout"
                      >
                        <LogOut size={18} className="text-white" />
                      </button>
                    </div>
                  );
                }

                return null;
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
};

export default WalletButton;