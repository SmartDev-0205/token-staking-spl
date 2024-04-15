use {
    crate::{constant::*, error::ContractError, state::*},
    anchor_lang::prelude::*,
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
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn handler(ctx: Context<InitializeCtx>) -> Result<()> {
    let configuration = &mut ctx.accounts.configuration;

    // TODO: check given values and save it
    configuration.bump = *ctx.bumps.get("configuration").unwrap();
    configuration.authority = ctx.accounts.authority.key();
    configuration.plans = Vec::new();
    Ok(())
}
