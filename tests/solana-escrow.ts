import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaEscrow } from "../target/types/solana_escrow";
import { assert } from "chai";
import idl from "../target/idl/solana_escrow.json";

describe("solana-escrow-gamefi-lifecycle-tests", () => {
  // Configure the client environment to use the local test provider context
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Instantiate the type-safe program interface explicitly mapping to your IDL
  const program = new Program(idl as any, provider) as Program<SolanaEscrow>;
  const playerWallet = provider.wallet;

  // Programmatically derive the deterministic Player Session PDA address
  const [playerStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("player_session"), playerWallet.publicKey.toBuffer()],
    program.programId
  );

  it("1. Successfully executes 'stake_player' (init & space constraints)", async () => {
    try {
      const tx = await program.methods
        .stakePlayer()
        .accounts({
          player: playerWallet.publicKey,
          player_state: playerStatePda,
          system_program: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("   » Stake Transaction Signature:", tx);

      // Fetch the newly allocated account state layout directly from the ledger
      const accountData = await program.account.playerState.fetch(playerStatePda);

      // Verify constraints applied by your Rust macros
      assert.equal(accountData.isStaked, true, "Player should be flagged as active");
      assert.equal(accountData.accumulatedXp.toString(), "0", "Initial experience points must be 0");
      assert.equal(accountData.player.toBase58(), playerWallet.publicKey.toBase58());
    } catch (error) {
      console.error("Stake Test Failed:", error);
      throw error;
    }
  });

  it("2. Successfully executes 'play_game' (mut constraints & data logic)", async () => {
    // Artificial pause to ensure the system clock increments past the initial stake timestamp
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const tx = await program.methods
        .playGame()
        .accounts({
          player: playerWallet.publicKey,
          player_state: playerStatePda,
        })
        .rpc();

      console.log("   » Play Game Transaction Signature:", tx);

      const accountData = await program.account.playerState.fetch(playerStatePda);

      // Parse the updated numerical XP balance
      const currentXp = Number(accountData.accumulatedXp.toString());
      console.log(`   » Current On-Chain XP Accumulation: ${currentXp} XP`);

      // Verify that data mutation actually completed on-chain
      assert.isAbove(currentXp, 0, "Accumulated experience points should have increased above 0");
    } catch (error) {
      console.error("Play Game Test Failed:", error);
      throw error;
    }
  });

  it("3. Successfully executes 'unstake_player' (close constraint & rent refund)", async () => {
    // Capture the player's wallet balance BEFORE closing the PDA account
    const balanceBeforeClose = await provider.connection.getBalance(playerWallet.publicKey);

    try {
      const tx = await program.methods
        .unstakePlayer()
        .accounts({
          player: playerWallet.publicKey,
          player_state: playerStatePda,
          system_program: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("   » Unstake Transaction Signature:", tx);

      // Capture the player's wallet balance AFTER closing the PDA account
      const balanceAfterClose = await provider.connection.getBalance(playerWallet.publicKey);

      // Assert Rule A: The account should now be completely deleted from the blockchain storage
      const closedAccountInfo = await provider.connection.getAccountInfo(playerStatePda);
      assert.isNull(closedAccountInfo, "The PlayerState PDA memory footprint should be null (deallocated)");

      // Assert Rule B: Verify rent lamports flowed back to the player wallet
      assert.isAbove(
        balanceAfterClose,
        balanceBeforeClose,
        "Wallet balance should increase because the account closure refunded locked rent SOL!"
      );
      
      console.log("   » Reclaimed rent allocation successfully!");
    } catch (error) {
      console.error("Unstake Test Failed:", error);
      throw error;
    }
  });
});
