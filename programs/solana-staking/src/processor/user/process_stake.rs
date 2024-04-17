use {
    crate::{constant::*, error::ContractError, state::*},
    anchor_lang::prelude::*,
    anchor_spl::token::{Mint, Token, TokenAccount, Transfer},
};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct StakeIx {
    stake_id: u64,
    plan_index: u8,
}

#[derive(Accounts)]
#[instruction(ix: StakeIx)]
pub struct StakeCtx<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [CONFIG_TAG],
        bump,
    )]
    pub configuration: Box<Account<'info, Configuration>>,

    #[account(
        init,
        payer = authority,
        space = std::mem::size_of::<Stake>() + 8,
        seeds = [STAKE_TAG, authority.key().as_ref(), &ix.stake_id.to_le_bytes()],
        bump,
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

pub fn handler(ctx: Context<StakeCtx>, ix: StakeIx) -> Result<()> {
    let plan_amount = {
        let plan = &ctx.accounts.configuration.plans.get(ix.plan_index as usize)
            .ok_or(ContractError::InvalidPlanIndex)?;
        msg!("limit {}", plan.limit);
        msg!("parcitipants {}", plan.parcitipants);
        require!(plan.parcitipants != plan.limit, ContractError::PlanLimitExceed);
        plan.amount
    };

    anchor_spl::token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_vault.to_account_info(),
                to: ctx.accounts.token_vault.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        ),
        plan_amount,
    )?;

    let configuration = &mut ctx.accounts.configuration;
    configuration.plans[ix.plan_index as usize].parcitipants += 1;
    configuration.total += plan_amount;

    ctx.accounts.stake.bump = ctx.bumps.stake;
    ctx.accounts.stake.authority = ctx.accounts.authority.key();
    ctx.accounts.stake.stake_id = ix.stake_id;
    ctx.accounts.stake.plan_index = ix.plan_index;
    ctx.accounts.stake.staked_at = ctx.accounts.clock.unix_timestamp as u64;

    Ok(())
}
