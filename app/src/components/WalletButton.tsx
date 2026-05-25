'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

export default function WalletButton() {
  const { select, wallets, publicKey, disconnect, connected, connecting } = useWallet();
  const { setVisible } = useWalletModal();
  const [mounted, setMounted] = useState(false);

  // Prevents hydration mismatch bugs in Next.js App Router
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-10 w-36 bg-gray-800 animate-pulse rounded-lg" />;

  // Helper to format wallet address to: Abc4...xyz7
  const formatAddress = (pubkey: string) => {
    return `${pubkey.slice(0, 4)}...${pubkey.slice(-4)}`;
  };

  const handleConnect = async () => {
    // Look specifically for the Phantom adapter
    const phantomWallet = wallets.find((w) => w.adapter.name === 'Phantom');
    
    if (phantomWallet) {
      // If found, select it to trigger immediate browser connection
      select(phantomWallet.adapter.name);
    } else {
      // If user doesn't have Phantom installed, open the standard selection modal
      setVisible(true);
    }
  };

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={disconnect}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md transition-all duration-200 ease-in-out text-sm border border-purple-500/20"
        >
          Disconnect ({formatAddress(publicKey.toBase58())})
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={connecting}
      className="px-5 py-2.5 bg-[#AB9FF2] hover:bg-[#9688EC] text-slate-950 font-bold rounded-lg shadow-lg hover:shadow-[#AB9FF2]/20 transition-all duration-200 ease-in-out text-sm flex items-center gap-2 disabled:opacity-50"
    >
      {connecting ? (
        <>
          <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          {/* Phantom Ghost SVG Icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5zm4 4h-2v-2h2v2zm0-4h-2V7h2v5z" />
          </svg>
          Connect Phantom
        </>
      )}
    </button>
  );
}
