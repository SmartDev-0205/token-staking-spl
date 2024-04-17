use {
    crate::{constant::*, error::ContractError, state::*},
    anchor_lang::prelude::*,
    anchor_spl::token::{Mint, Token, TokenAccount, Transfer},
};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct DepositIx {
    amount: u64,
    plan_index: u8,
}

#[derive(Accounts)]
#[instruction(ix: DepositIx)]
pub struct DepositCtx<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
      mut,
      seeds = [CONFIG_TAG],
      bump,
  )]
    pub configuration: Box<Account<'info, Configuration>>,

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

pub fn handler(ctx: Context<DepositCtx>, ix: DepositIx) -> Result<()> {
    anchor_spl::token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_vault.to_account_info(),
                to: ctx.accounts.token_vault.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        ),
        ix.amount,
    )?;

    ctx.accounts.configuration.total += ix.amount;

    Ok(())
}
