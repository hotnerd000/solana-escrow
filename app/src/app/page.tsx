import React from 'react';
import WalletButton from '../components/WalletButton';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Header / Navigation */}
      <header className="border-b border-slate-900 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Simple GameFi Visual Asset Icon */}
            <span className="text-2xl">🎮</span>
            <h1 className="text-xl font-black tracking-wider bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              SOLANA ESCROW GAMEFI
            </h1>
          </div>
          
          {/* Injecting our newly built Phantom Connection Button */}
          <div>
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Main Feature / Game Dashboard Content Block */}
      <section className="max-w-4xl mx-auto px-6 py-20 flex flex-col items-center text-center gap-6 flex-grow justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-widest animate-pulse">
          ⚡ Devnet Sandbox Active
        </div>
        
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight max-w-2xl leading-none">
          Stake Player Sessions. <br />
          <span className="text-purple-400">Earn On-Chain Rewards.</span>
        </h2>
        
        <p className="text-slate-400 max-w-lg text-base sm:text-lg font-light leading-relaxed">
          Connect your Phantom wallet to initialize secure game sessions, manage escrow states, and distribute automated token yields.
        </p>

        {/* Placeholder UI Action Card to represent Game Logic */}
        <div className="mt-8 p-6 w-full max-w-md bg-slate-900/40 border border-slate-900 rounded-2xl backdrop-blur-sm flex flex-col gap-4 text-left">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Session Dashboard</h3>
          <div className="h-px bg-slate-800" />
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Player Profile Account:</span>
            <span className="font-mono text-slate-300">Not Initialized</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Current Session State:</span>
            <span className="text-amber-500 font-medium">Wallet Disconnected</span>
          </div>
          <button 
            disabled 
            className="w-full mt-2 py-2.5 bg-slate-800 text-slate-500 rounded-xl text-sm font-bold cursor-not-allowed transition-all"
          >
            Initialize Game Session
          </button>
        </div>
      </section>

      {/* Footer System Meta */}
      <footer className="border-t border-slate-900 bg-slate-950 text-center py-4 text-xs text-slate-600 font-mono">
        Solana Program Framework • Rust & Anchor Ecosystem
      </footer>
    </main>
  );
}
