'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import WalletButton from '../components/WalletButton';

export default function Home() {
  const { connected, publicKey } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);

  // Prevents Next.js Server/Client hydration layout flashes
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">🎮 Loading Engine...</div>;
  }

  // Simulating local UI gameplay toggle before linking to RPC node later
  const handleFakeAction = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSessionActive(prev => !prev);
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-purple-500/30">
      {/* Top Header / Navigation Bar */}
      <header className="border-b border-slate-900 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-bounce">🎮</span>
            <h1 className="text-xl font-black tracking-wider bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              SOLANA ESCROW GAMEFI
            </h1>
          </div>
          <div>
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Hero / Game Dashboard Content Area */}
      <section className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center text-center gap-6 flex-grow justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-widest">
          ⚡ Devnet Sandbox Active
        </div>
        
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight max-w-2xl leading-none">
          Stake Player Sessions. <br />
          <span className="text-purple-400">Earn On-Chain Rewards.</span>
        </h2>
        
        <p className="text-slate-400 max-w-lg text-base sm:text-lg font-light leading-relaxed">
          Connect your Phantom wallet to initialize secure game sessions, manage escrow states, and distribute automated token yields.
        </p>

        {/* Dashboard Interactive Card Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 w-full max-w-2xl">
          
          {/* Main Controls Card */}
          <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl backdrop-blur-sm flex flex-col gap-4 text-left transition-all duration-300 hover:border-purple-500/20">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Session Dashboard</h3>
            <div className="h-px bg-slate-800" />
            
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Player Account:</span>
              <span className="font-mono text-slate-300 truncate max-w-[150px]">
                {connected && publicKey ? publicKey.toBase58() : "Not Initialized"}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Session Status:</span>
              <span className={`font-medium ${
                !connected ? 'text-amber-500' : sessionActive ? 'text-emerald-400 animate-pulse' : 'text-purple-400'
              }`}>
                {!connected ? 'Wallet Disconnected' : sessionActive ? '🎮 Session Active' : 'Ready to Stake'}
              </span>
            </div>

            <button 
              onClick={handleFakeAction}
              disabled={!connected || isLoading} 
              className={`w-full mt-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                !connected 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : sessionActive 
                    ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : !connected ? (
                'Connect Wallet to Play'
              ) : sessionActive ? (
                'End Game Session'
              ) : (
                'Initialize Game Session'
              )}
            </button>
          </div>

          {/* Real-time Earnings / Stats Card */}
          <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl backdrop-blur-sm flex flex-col gap-4 text-left transition-all duration-300 hover:border-purple-500/20">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Live Yield Stats</h3>
            <div className="h-px bg-slate-800" />
            
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-500 uppercase font-semibold">Accumulated Experience</span>
              <span className="text-3xl font-black text-white font-mono tracking-tight">
                {sessionActive ? '42,950 XP' : '0 XP'}
              </span>
            </div>

            <div className="flex justify-between text-xs mt-auto pt-4 border-t border-slate-900 text-slate-500">
              <span>Multiplier: {sessionActive ? '1.5x Boost' : '1.0x Base'}</span>
              <span>Network Fee: ~0.00203 SOL</span>
            </div>
          </div>

        </div>
      </section>

      {/* Footer System Branding */}
      <footer className="border-t border-slate-900 bg-slate-950 text-center py-4 text-xs text-slate-600 font-mono">
        Solana Program Framework • Rust & Anchor Ecosystem
      </footer>
    </main>
  );
}
