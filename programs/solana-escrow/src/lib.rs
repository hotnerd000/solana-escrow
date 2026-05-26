use anchor_lang::prelude::*;

pub mod error;
use crate::error::GameError;

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

    // NEW INSTRUCTION: Simulates gameplay, calculates elapsed time, and issues XP rewards
    pub fn play_game(ctx: Context<PlayGame>) -> Result<()> {
        let player_state = &mut ctx.accounts.player_state;
        let clock = Clock::get()?;

        // Ensure the player is actively staked before updating state
        require!(player_state.is_staked, GameError::PlayerNotStaked);

        // Calculate time elapsed since last activity
        let elapsed_seconds = clock.unix_timestamp.saturating_sub(player_state.last_stake_time);

        //Base rate: Earn 10 XP per second elapsed
        let base_xp_earned = (elapsed_seconds as u64).saturating_mul(10);

        // Apply a 1.5x multiplier for active game sessions
        let total_xp_earned = base_xp_earned.saturating_mul(15) / 10;

        // Update on-chain account state variables
        player_state.accumulated_xp = player_state.accumulated_xp.saturating_add(total_xp_earned);
        player_state.last_stake_time = clock.unix_timestamp;

        Ok(())
    }

    //Claims final rewards and closes the PDA account to reclaim SOL rent
    pub fn unstake_player(ctx: Context<UnstakePlayer>) -> Result<()> {
        let player_state = &mut ctx.accounts.player_state;
        let clock = Clock::get()?;

        require!(player_state.is_staked, GameError::PlayerNotStaked);

        // Calculate and add final pending reward yields up to the exact exit block timestamp 
        let elapsed_seconds = clock.unix_timestamp.saturating_sub(player_state.last_stake_time);
        let base_xp_earned = (elapsed_seconds as u64).saturating_mul(10);
        let total_xp_earned = base_xp_earned.saturating_mul(15) / 10;

        let final_xp = player_state.accumulated_xp.saturating_add(total_xp_earned);

        msg!("Player unstaked successfully! Final XP secured: {}", final_xp);

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

//validation struct for the new gameplay instruction
#[derive(Accounts)]
pub struct PlayGame<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        mut,
        seeds = [b"player_session", player.key().as_ref()],
        bump
    )]
    pub player_state: Account<'info, PlayerState>,
}

//validation struct for the new unstake instruction
#[derive(Accounts)]
pub struct UnstakePlayer<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        mut,
        seeds = [b"player_session", player.key().as_ref()],
        bump,
        close = player  // Anchor constraint: Safely destroys the account and refunds rent to the player
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
