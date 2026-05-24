use anchor_lang::prelude::*;

#[account]
pub struct GameState {
    pub admin: Pubkey, //32 bytes
    pub reward_mint: Pubkey, //32 bytes
    pub reward_bump: u8, // 1 byte
}

#[account]
pub struct PlayerState {
    pub player: Pubkey, //32 bytes
    pub last_stake_time: i64, // 8 bytes
    pub accumulated_xp: i64, // 8 bytes
    pub is_staked: bool, // 1 byte
    pub bump: u8, // 1 byte
}

impl GameState {
    pub const LEN: usize = 8 + 32 + 32 + 1;
}

impl PlayerState {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 1 + 1;
}