"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import WalletButton from "../components/WalletButton";
import { useGameFiProgram } from "../hooks/useGameFiProgram";

interface FloatingText {
  id: number;
  x: number;
  y: number;
}

export default function Home() {
  const { connected, publicKey } = useWallet();
  const { initializeSession, fetchPlayerState, playGameAction } = useGameFiProgram();
  
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  
  // Blockchain Synchronized Metrics
  const [playerXp, setPlayerXp] = useState("0");
  const [lastStakeTime, setLastStakeTime] = useState("Never");
  const [txSignature, setTxSignature] = useState(null);

  // Frontend UI Clicker States
  const [pendingXp, setPendingXp] = useState(0);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const containerRef = useRef(null);

  const initBtnDisabled = "w-full py-3 rounded-xl text-sm font-bold bg-slate-800 text-slate-500 cursor-not-allowed";
  const initBtnActive = "w-full py-3 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20";
  
  const saveBtnDisabled = "w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-500 cursor-not-allowed shadow-md";
  const saveBtnActive = "w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold shadow-emerald-500/10 hover:brightness-110 shadow-md";
  
  useEffect(() => {
    setMounted(true);
  }, []);

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
        setPlayerXp("0");
        setLastStakeTime("Never");
      }
    } catch (err) {
      console.error("Error reading account profile metrics:", err);
    }
  }, [connected, publicKey, fetchPlayerState]);

  useEffect(() => {
    if (mounted && connected) {
      refreshOnChainData();
    }
  }, [mounted, connected, refreshOnChainData]);

  useEffect(() => {
    if (!mounted || !connected || !publicKey) return;
    const pollingInterval = setInterval(() => {
      refreshOnChainData();
    }, 8000);
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
      console.error("Initialization failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoinClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading) return;
    setPendingXp((prev) => prev + 15);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newText = { id: Date.now(), x, y };

      setFloatingTexts((prev) => [...prev, newText]);
      setTimeout(() => {
        setFloatingTexts((prev) => prev.filter((t) => t.id !== newText.id));
      }, 800);
    }
  };

  const handleSyncBlockchain = async () => {
    if (!connected || !publicKey || pendingXp === 0) return;
    setIsLoading(true);
    setTxSignature(null);
    try {
      const signature = await playGameAction();
      setTxSignature(signature);
      setPendingXp(0);
      await refreshOnChainData();
    } catch (err) {
      console.error("Play game call failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return React.createElement(
      "div",
      {
        className:
          "min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center",
      },
      "🎮 Loading Engine..."
    );
  }

  const explorerUrl = txSignature
    ? "solana.com" + txSignature + "?cluster=devnet"
    : "";

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

      <section className="max-w-5xl mx-auto px-6 py-8 flex flex-col items-center text-center gap-6 flex-grow justify-center w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-widest">
          ⚡ Devnet Sandbox Active
        </div>

        {!sessionActive ? (
          <div className="max-w-md w-full p-8 bg-slate-900/40 border border-slate-900 rounded-3xl backdrop-blur-sm flex flex-col items-center gap-6">
            <div className="text-5xl">🔒</div>
            <h2 className="text-2xl font-black">Game Session Locked</h2>
            <p className="text-sm text-slate-400">
              Connect your Phantom wallet and initialize an explicit Program Derived Address (PDA) storage profile layout account to unlock gameplay interactions.
            </p>
            <button 
              onClick={handleInitialize}
              disabled={!connected || isLoading} 
              className={!connected ? initBtnDisabled : initBtnActive}
            >
              {isLoading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" /> : 'Initialize Profile PDA'}
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3 w-full max-w-4xl items-stretch">
            <div 
              ref={containerRef}
              className="md:col-span-2 relative p-8 bg-slate-900/30 border border-slate-900 rounded-3xl backdrop-blur-sm flex flex-col items-center justify-center min-h-[340px] overflow-hidden group hover:border-purple-500/10 transition-colors"
            >
              {floatingTexts.map((text) => (
                <span
                  key={text.id}
                  style={{ left: text.x, top: text.y }}
                  className="absolute pointer-events-none font-mono text-emerald-400 font-black text-xl animate-ping select-none z-40"
                >
                  +15 XP
                </span>
              ))}

              <div className="absolute top-4 left-4 flex flex-col text-left">
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Unsaved Clicker Progress</span>
                <span className="text-2xl font-black font-mono text-emerald-400 animate-pulse">{pendingXp} XP</span>
              </div>

              <button
                onClick={handleCoinClick}
                disabled={isLoading}
                className="w-40 h-40 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-6xl shadow-2xl shadow-purple-500/20 active:scale-95 hover:scale-105 transition-transform duration-70 relative cursor-pointer outline-none select-none border-4 border-purple-400/20"
              >
                💎
              </button>
              
              <span className="text-xs text-slate-500 mt-6 font-medium animate-pulse">
                Click the Core Gem to harvest pending game actions
              </span>
            </div>

            <div className="p-6 bg-slate-900/50 border border-slate-900 rounded-3xl backdrop-blur-sm flex flex-col justify-between text-left">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Live On-Chain Stats</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <div className="h-px bg-slate-800" />
                
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-slate-500 font-medium">Verified Total Ledger Score</span>
                  <span className="text-3xl font-black font-mono text-white tracking-tight">{playerXp} XP</span>
                </div>

                <div className="flex flex-col gap-1 text-xs text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-900/60 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Last Sync:</span>
                    <span>{lastStakeTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Multiplier:</span>
                    <span className="text-purple-400">1.5x Boost</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-6">
                <button 
                  onClick={handleSyncBlockchain}
                  disabled={pendingXp === 0 || isLoading} 
                  className={pendingXp === 0 ? saveBtnDisabled : saveBtnActive}
                >
                  {
                  isLoading ? <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin mx-auto" /> : 'Save Score to Solana'
                  }
                </button>
              </div>
            </div>
          </div>
        )},
        {txSignature ? (
          <div className="mt-4 p-4 w-full max-w-4xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-mono break-all text-left">
            <p className="font-bold mb-1">✓ Block Transaction Settlement Confirmed On-Chain!</p>
            <a href={explorerUrl} target="_blank" rel="noreferrer" className="underline hover:text-emerald-300 transition-colors">View on Solana Explorer: {txSignature}</a>
          </div>
        ) : null}
      </section>
      <footer className="border-t border-slate-900 bg-slate-950 text-center py-4 text-xs text-slate-600 font-mono">
        Solana Program Framework • Rust & Anchor Ecosystem
      </footer>
    </main>        
  );
}
