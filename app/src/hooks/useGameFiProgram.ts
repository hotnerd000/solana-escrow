'use client';

import { useMemo } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider } from '@coral-xyz/anchor'; 
import { PublicKey } from '@solana/web3.js'; 
import idlData from '../idl/gamefi_vault.json';

export const useGameFiProgram = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  // 1. Resolve your program's on-chain public key
  const programId = useMemo(() => new PublicKey(idlData.address), []);

  // 2. Build the typed Anchor program instance cleanly
  const program = useMemo(() => {
    if (!wallet) return null;
    
    const provider = new AnchorProvider(
      connection, 
      wallet, 
      AnchorProvider.defaultOptions()
    );
    
    return new Program(idlData as any, provider);
  }, [connection, wallet]);

  // 3. Helper to derive deterministic Player State PDA accounts
  const getPlayerStatePda = (playerPublicKey: PublicKey) => {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("player_session"), playerPublicKey.toBuffer()],
      programId
    );
    return pda;
  };

  // 4. Action: Send the transaction using Anchor's auto-generated camelCase method names
  const initializeSession = async (): Promise<string> => {
    if (!program || !wallet) throw new Error("Wallet or program context unavailable");

    const playerStatePda = getPlayerStatePda(wallet.publicKey);

    try {
      // NOTE: 'stake_player' becomes 'stakePlayer'
      // NOTE: 'player_state' becomes 'playerState'
      // NOTE: 'system_program' becomes 'systemProgram'
      const txSignature = await program.methods
        .stakePlayer() 
        .accounts({
          player: wallet.publicKey,
          playerState: playerStatePda, 
          systemProgram: new PublicKey("11111111111111111111111111111111"), 
        })
        .rpc();

      return txSignature;
    } catch (error) {
      console.error("On-chain call execution failed inside hook:", error);
      throw error;
    }
  };

  // 5. Action: Read account metrics out of your PlayerState PDA
  const fetchPlayerState = async () => {
    if (!program || !wallet) return null;
    
    const playerStatePda = getPlayerStatePda(wallet.publicKey);
    
    try {
      // Note: Account name types follow camelCase indexing behavior at runtime
      const accountData: any = await program.account["playerState"].fetch(playerStatePda);
      return {
        isStaked: accountData.isStaked,
        accumulatedXp: accountData.accumulatedXp.toString(),
        lastStakeTime: accountData.lastStakeTime.toNumber(),
      };
    } catch (error) {
      return null;
    }
  };

  return {
    program,
    programId,
    getPlayerStatePda,
    initializeSession,
    fetchPlayerState
  };
};
