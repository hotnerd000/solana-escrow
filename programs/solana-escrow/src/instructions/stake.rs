use anchor_lang::prelude::*;
use create::state::*;

#[derive(Accounts)]
pub struct StakePlayers<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        init_if_needed,
        player = player,
        space = PlayerState::LEN,
        seeds = [b"player_session", player.key().as_ref()],
        bump
    )]
    pub player_state: Account<'info, PlayerState>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<StakePlayer>) -> Result<()> {
    let player_state = &mut ctx.accounts.player_state;
    let clock = Clock::get()?;

    if !player_state.is_staked {
        player_state.player = ctx.accounts.player.key();
        player_state.last_stake_time = clock.unix_timestamp;
        player_state.is_staked = true;
        player_state.bump = ctx.bumps.player_state;
    }

    Ok(())
}