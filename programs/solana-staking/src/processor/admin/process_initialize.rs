use {
    crate::{constant::*, state::*},
    anchor_lang::prelude::*,
    anchor_spl::token::{Mint, Token, TokenAccount},
};

#[derive(Accounts)]
#[instruction()]
pub struct InitializeCtx<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
      init,
      seeds = [CONFIG_TAG],
      bump,
      payer = authority,
      space = std::mem::size_of::<Configuration>() + 8 + 10 * std::mem::size_of::<Plan>()
    )]
    pub configuration: Box<Account<'info, Configuration>>,

    #[account()]
    /// CHECK: we read this key only
    pub token_mint: Account<'info, Mint>,

    #[account(
      init,
      token::mint = token_mint,
      token::authority = configuration,
      seeds = [ TOKEN_VAULT_TAG, configuration.key().as_ref(), token_mint.key().as_ref()],
      bump,
      payer = authority,
    )]
    pub token_vault: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn handler(ctx: Context<InitializeCtx>) -> Result<()> {
    let configuration = &mut ctx.accounts.configuration;

    // TODO: check given values and save it
    configuration.bump = ctx.bumps.configuration;
    configuration.authority = ctx.accounts.authority.key();
    configuration.token_mint = ctx.accounts.token_mint.key();
    configuration.plans = Vec::new();
    Ok(())
}
