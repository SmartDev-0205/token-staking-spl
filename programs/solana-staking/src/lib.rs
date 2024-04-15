use anchor_lang::prelude::*;

declare_id!("TRTLS627e35iGPu8ZLnroJiUcp5XRapnGAugj8huvsZ");

/// constant
pub mod constant;
/// error
pub mod error;
/// processor
pub mod processor;
/// states
pub mod state;

use crate::processor::*;

#[program]
pub mod solana_staking {
    use super::*;

    pub fn initialize(ctx: Context<InitializeCtx>) -> Result<()> {
        process_initialize::handler(ctx)
    }
}

#[derive(Accounts)]
pub struct Initialize {}
