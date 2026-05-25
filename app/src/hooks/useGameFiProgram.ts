'use client';

import { useMemo } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider} from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js'; 
// Import your compiled on-chain IDL file
import idlData from '../idl/solana_escrow.json';

export const useGameFiProgram = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  // 1. Memoize and extract the compiled Program ID directly from the IDL file metadata
  const programId = useMemo(() => new PublicKey(idlData.address), []);

  // 2. Build the Anchor Provider client runner
  const program = useMemo(() => {
    if (!wallet) return null;
    
    const provider = new AnchorProvider(
      connection, 
      wallet, 
      AnchorProvider.defaultOptions()
    );
    
    // Cast the JSON layout structure directly into an actionable Anchor Program instance
    return new Program(idlData as any, provider);
  }, [connection, wallet]);

  // 3. Helper utility to derive deterministic Player State PDA accounts on-chain
  const getPlayerStatePda = (playerPublicKey: PublicKey) => {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("player_session"), playerPublicKey.toBuffer()],
      programId
    );
    return pda;
  };

  // 4. Action: Dispatch 'stakePlayer' Instruction Transaction to the Solana Node
  const initializeSession = async (): Promise<string> => {
    if (!program || !wallet) throw new Error("Wallet not loaded");
    const playerStatePda = getPlayerStatePda(wallet.publicKey);

    return await program.methods
      .stake_player() // Updated to match IDL string: 'stake_player'
      .accounts({
        player: wallet.publicKey,
        player_state: playerStatePda, // Updated to match IDL string: 'player_state'
      })
      .rpc();
  };

  // 5. Action: Fetch and read live account structural data directly out of an active PDA
  const fetchPlayerState = async () => {
    if (!program || !wallet) return null;
    const playerStatePda = getPlayerStatePda(wallet.publicKey);
    
    try {
      // Explicit array index matching prevents any TypeScript compiler cache issues
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
