use anchor_lang::prelude::*;

declare_id!("H3cmPZAUreUhda26mHpBg7TxXs7WzVB2BMERCmig3FSW");

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

    pub fn add_plan(ctx: Context<AddPlanCtx>, ix: AddPlanIx) -> Result<()> {
        process_add_plan::handler(ctx, ix)
    }

    pub fn stake(ctx: Context<StakeCtx>, ix: StakeIx) -> Result<()> {
        process_stake::handler(ctx, ix)
    }

    pub fn unstake(ctx: Context<UnstakeCtx>, ix: UnstakeIx) -> Result<()> {
        process_unstake::handler(ctx, ix)
    }

    pub fn deposit(ctx: Context<DepositCtx>, ix: DepositIx) -> Result<()> {
        process_deposit::handler(ctx, ix)
    }
}

#[derive(Accounts)]
pub struct Initialize {}
