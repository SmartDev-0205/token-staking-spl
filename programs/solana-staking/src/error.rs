
use anchor_lang::prelude::*;

#[error_code]
pub enum ContractError {
    #[msg("Calculation Error.")]
    CalcError,
    
    #[msg("Invalid address.")]
    InvalidAddress,
    
    #[msg("Invalid authority.")]
    InvalidAuthority,

    #[msg("Invalid token.")]
    InvalidToken,

    #[msg("Invalid plan index.")]
    InvalidPlanIndex,

    #[msg("Plan Limit exceeded.")]
    PlanLimitExceed,

    #[msg("Invalid unstake.")]
    InvalidUnstake,
}
