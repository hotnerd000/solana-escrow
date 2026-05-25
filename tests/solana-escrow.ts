import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaEscrow } from "../target/types/solana_escrow";
import { assert } from "chai";

// 1. Directly import your freshly generated JSON IDL file
import idl from "../target/idl/solana_escrow.json"; 

describe("solana-escrow-gamefi-tests", () => {
  // 1. Configure the client to use the local test provider context
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // 2. Instantiate the program manually using the imported IDL object
  const program = new Program(idl as any, provider) as Program<SolanaEscrow>;

  it("Successfully initializes a Player Staking Session PDA", async () => {
    const playerWallet = provider.wallet;

    // 3. Programmatically derive the deterministic PDA matching your Rust seeds
    const [playerStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("player_session"), playerWallet.publicKey.toBuffer()],
      program.programId
    );

    try {
      // 4. Dispatch the 'stakePlayer' transaction instruction
      const txSignature = await program.methods
        .stakePlayer()
        .accounts({
          player: playerWallet.publicKey,
          playerState: playerStatePda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("   » Transaction broadcast confirmed! Signature:", txSignature);

      // 5. Fetch the newly created account data slot directly out of ledger state
      const accountData = await program.account.playerState.fetch(playerStatePda);

      // 6. Assertions to verify validity of the on-chain data state
      assert.equal(accountData.isStaked, true, "Player should be flagged as staked");
      assert.equal(
        accountData.player.toBase58(),
        playerWallet.publicKey.toBase58(),
        "The stored player key must match the signer's wallet public key"
      );
      assert.equal(accountData.accumulatedXp.toString(), "0", "Initial experience points must be zero");
      
    } catch (error) {
      console.error("Test failed with error:", error);
      throw error;
    }
  });
});
