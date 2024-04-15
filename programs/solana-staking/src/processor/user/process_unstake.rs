use {
    crate::{constant::*, error::ContractError, state::*},
    anchor_lang::prelude::*,
    anchor_spl::token::{Mint, Token, TokenAccount, Transfer},
};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UnstakeIx {
    stake_id: u64,
    plan_index: u8,
}

#[derive(Accounts)]
#[instruction(ix: UnstakeIx)]
pub struct UnstakeCtx<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [CONFIG_TAG],
        bump,
    )]
    pub configuration: Box<Account<'info, Configuration>>,

    #[account(
        mut,
        seeds = [STAKE_TAG, authority.key().as_ref(), &ix.stake_id.to_le_bytes()],
        bump,
        close = authority
    )]
    pub stake: Box<Account<'info, Stake>>,

    #[account(
        constraint = token_mint.key() == configuration.token_mint @ ContractError::InvalidToken,
    )]
    /// CHECK: we read this key only
    pub token_mint: Account<'info, Mint>,

    #[account(
        mut,
      token::mint = token_mint,
      token::authority = configuration,
      seeds = [ TOKEN_VAULT_TAG, configuration.key().as_ref(), token_mint.key().as_ref()],
      bump
    )]
    pub token_vault: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = token_mint,
        token::authority = authority,
    )]
    pub user_token_vault: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn handler(ctx: Context<UnstakeCtx>, ix: UnstakeIx) -> Result<()> {
    let reward_amount = {
        let plan = &ctx.accounts.configuration.plans.get(ix.plan_index as usize)
            .ok_or(ContractError::InvalidPlanIndex)?;
        plan.reward
    };

    let lock_period = {
        let plan = &ctx.accounts.configuration.plans.get(ix.plan_index as usize)
            .ok_or(ContractError::InvalidPlanIndex)?;
        plan.period
    };

    let current_time = ctx.accounts.clock.unix_timestamp as u64;
    require!(lock_period + ctx.accounts.stake.staked_at > current_time, ContractError::InvalidUnstake);
    
    let signer_seeds = &[
        CONFIG_TAG,
        &[ctx.accounts.configuration.bump],
    ];
    let signer = &[&signer_seeds[..]];

    anchor_spl::token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_vault.to_account_info(),
                to: ctx.accounts.token_vault.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
            signer
        ),
        reward_amount,
    )?;

    ctx.accounts.configuration.plans[ix.plan_index as usize].parcitipants -= 1;
    ctx.accounts.configuration.total -= reward_amount;

    Ok(())
}
