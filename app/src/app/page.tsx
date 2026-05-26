'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import WalletButton from '../components/WalletButton';
import { useGameFiProgram } from '../hooks/useGameFiProgram';

export default function Home() {
  const { connected, publicKey } = useWallet();
  const { initializeSession, fetchPlayerState, playGameAction } = useGameFiProgram();
  
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  
  // Dynamic variables synced via real-time RPC polling
  const [playerXp, setPlayerXp] = useState<string>('0');
  const [lastStakeTime, setLastStakeTime] = useState<string>('Never');
  const [txSignature, setTxSignature] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetches live data records directly from your on-chain PDA account layout
  const refreshOnChainData = useCallback(async () => {
    if (!connected || !publicKey) return;
    try {
      const data = await fetchPlayerState();
      if (data) {
        setSessionActive(data.isStaked);
        setPlayerXp(data.accumulatedXp); 
        
        if (data.lastStakeTime > 0) {
          const date = new Date(data.lastStakeTime * 1000);
          setLastStakeTime(date.toLocaleTimeString());
        }
      } else {
        setSessionActive(false);
        setPlayerXp('0');
        setLastStakeTime('Never');
      }
    } catch (err) {
      console.error("Error reading account profile metrics:", err);
    }
  }, [connected, publicKey, fetchPlayerState]);

  // NEW: Background State Polling Automation Hook
  useEffect(() => {
    if (!mounted || !connected || !publicKey) return;

    // 1. Fire an immediate query check the exact second the wallet pairs up
    refreshOnChainData();

    // 2. Schedule a low-overhead background polling worker loop (Runs every 5 seconds)
    const pollingInterval = setInterval(() => {
      console.log("Polling Solana Devnet cluster for account state changes...");
      refreshOnChainData();
    }, 5000);

    // 3. Cleanup hook to instantly tear down the timer if a user disconnects or exits
    return () => clearInterval(pollingInterval);
  }, [mounted, connected, publicKey, refreshOnChainData]);

  const handleInitialize = async () => {
    if (!connected || !publicKey) return;
    setIsLoading(true);
    setTxSignature(null);

    try {
      const signature = await initializeSession();
      setTxSignature(signature);
      await refreshOnChainData();
    } catch (err) {
      console.error("Initialization call failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayGame = async () => {
    if (!connected || !publicKey) return;
    setIsLoading(true);
    setTxSignature(null);

    try {
      const signature = await playGameAction();
      setTxSignature(signature);
      await refreshOnChainData(); 
    } catch (err) {
      console.error("Play game call failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">🎮 Loading Engine...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-purple-500/30">
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

      <section className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center text-center gap-6 flex-grow justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-widest">
          ⚡ Devnet Sandbox Active
        </div>
        
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight max-w-2xl leading-none">
          Stake Player Sessions. <br />
          <span className="text-purple-400">Earn On-Chain Rewards.</span>
        </h2>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 w-full max-w-2xl">
          <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl backdrop-blur-sm flex flex-col gap-4 text-left hover:border-purple-500/20 transition-all">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Session Dashboard</h3>
            <div className="h-px bg-slate-800" />
            
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Player Account:</span>
              <span className="font-mono text-slate-300 truncate max-w-[150px]">
                {connected && publicKey ? publicKey.toBase58() : "Not Connected"}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Session Status:</span>
              <span className={`font-medium ${
                !connected ? 'text-amber-500' : sessionActive ? 'text-emerald-400 animate-pulse' : 'text-purple-400'
              }`}>
                {!connected ? 'Wallet Disconnected' : sessionActive ? '🎮 In-Game Staked' : 'Ready to Initialize'}
              </span>
            </div>

            {!sessionActive ? (
              <button 
                onClick={handleInitialize}
                disabled={!connected || isLoading} 
                className={`w-full mt-2 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  !connected 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20'
                }`}
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : 'Initialize Profile PDA'}
              </button>
            ) : (
              <button 
                onClick={handlePlayGame}
                disabled={isLoading} 
                className="w-full mt-2 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 shadow-lg shadow-emerald-500/10"
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> : '🎮 Play Game & Earn XP'}
              </button>
            )}
          </div>

          <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl backdrop-blur-sm flex flex-col gap-4 text-left hover:border-purple-500/20 transition-all">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Live Yield Stats</h3>
              {/* Optional UI telemetry pulse to signal active background fetching */}
              {connected && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
            </div>
            <div className="h-px bg-slate-800" />
            
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-500 uppercase font-semibold">Accumulated Experience</span>
              <span className="text-3xl font-black text-white font-mono tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                {playerXp} XP
              </span>
            </div>

            <div className="flex justify-between text-xs mt-auto pt-4 border-t border-slate-900 text-slate-500">
              <span>Last Sync: <span className="text-slate-300 font-mono">{lastStakeTime}</span></span>
              <span>Cluster: Devnet</span>
            </div>
          </div>
        </div>

        {txSignature && (
          <div className="mt-4 p-4 w-full max-w-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-mono break-all text-left">
            <p className="font-bold mb-1">✓ Transaction Confirmed On-Chain!</p>
            <a 
              href={`https://solana.com{txSignature}?cluster=devnet`} 
              target="_blank" 
              rel="noreferrer"
              className="underline hover:text-emerald-300 transition-colors"
            >
              View on Solana Explorer: {txSignature}
            </a>
          </div>
        )}
      </section>

      <footer className="border-t border-slate-900 bg-slate-950 text-center py-4 text-xs text-slate-600 font-mono">
        Solana Program Framework • Rust & Anchor Ecosystem
      </footer>
    </main>
  );
}
