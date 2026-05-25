use anchor_lang::prelude::*;

declare_id!("w7517rMHPhwuxQeRMDr7rHFfCCRy5CAi32HYA4xaNkK");

#[program]
pub mod solana_escrow {
    use super::*;

    // This exposes the exact camelCase 'stakePlayer' method to your IDL
    pub fn stake_player(ctx: Context<StakePlayer>) -> Result<()> {
        let player_state = &mut ctx.accounts.player_state;
        let clock = Clock::get()?;

        player_state.player = ctx.accounts.player.key();
        player_state.last_stake_time = clock.unix_timestamp;
        player_state.accumulated_xp = 0;
        player_state.is_staked = true;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct StakePlayer<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        init,
        payer = player,
        space = 8 + 32 + 8 + 8 + 1, // Discriminator + Pubkey + i64 + u64 + bool
        seeds = [b"player_session", player.key().as_ref()],
        bump
    )]
    pub player_state: Account<'info, PlayerState>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct PlayerState {
    pub player: Pubkey,        // 32 bytes
    pub last_stake_time: i64,  // 8 bytes
    pub accumulated_xp: u64,   // 8 bytes
    pub is_staked: bool,       // 1 byte
}
