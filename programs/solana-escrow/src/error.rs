use anchor_lang::prelude::*;

#[error_code]
pub enum GameError {
    #[msg("Player must initialize their staking session before playing.")]
    PlayerNotStaked,
    #[msg("Custom error message")]
    CustomError,
}
