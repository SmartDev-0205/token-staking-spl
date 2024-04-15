use {
  crate::{constant::*, error::ContractError, state::*},
  anchor_lang::prelude::*,
};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct AddPlanIx {
  pub amount: u64,
  pub period: u64,
  pub reward: u64,
  pub limit: u8,
}

#[derive(Accounts)]
#[instruction(ix: AddPlanIx)]
pub struct AddPlanCtx<'info> {
  #[account(mut,
  )]
  pub authority: Signer<'info>,

  #[account(
    mut,
    seeds = [CONFIG_TAG],
    bump,
  )]
  pub configuration: Box<Account<'info, Configuration>>,

  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
  pub clock: Sysvar<'info, Clock>,
}

pub fn handler(ctx: Context<AddPlanCtx>, ix: AddPlanIx) -> Result<()> {
  let configuration = &mut ctx.accounts.configuration;
  
  configuration.plans.push(Plan {
    amount: ix.amount,
    period: ix.period,
    reward: ix.reward,
    limit: ix.limit,
    parcitipants: 0,
  });

  Ok(())
}
