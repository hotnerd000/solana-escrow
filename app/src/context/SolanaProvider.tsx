'use client';

import React, { FC, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Import default styling for modal screens if you ever need backup prompts
import '@solana/wallet-adapter-react-ui/styles.css';

export const SolanaProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  // Target the Devnet RPC endpoint cluster
  const endpoint = useMemo(() => clusterApiUrl('devnet'), []);
  
  // Register the specific hardware/software wallets you want to support
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
