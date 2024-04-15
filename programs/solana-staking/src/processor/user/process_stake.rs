use {
    crate::{constant::*, error::ContractError, state::*, utils::*},
    anchor_lang::prelude::*,
    anchor_spl::token::{Mint, Token, TokenAccount, Transfer},
};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct StakeIx {
    pub amount: u64,
    pub period: u64,
    pub reward: u64,
}

#[derive(Accounts)]
#[instruction(ix: StakeIx)]
pub struct StakeCtx<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: we read this key only
    pub deal_token_mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [DEAL_TAG, deal_token_mint.key().as_ref()],
        bump,
        constraint = deal.get_deal_status(clock.unix_timestamp as u64) == DealStatus::Live @ ContractError::InvalidDealStatus
    )]
    pub deal: Box<Account<'info, Deal>>,

    #[account(
        mut,
        token::mint = deal_token_mint,
        token::authority = deal,
        seeds = [ DEAL_TOKEN_VAULT_TAG, deal.key().as_ref()],
        bump,
    )]
    pub deal_token_vault: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = deal_token_mint,
        token::authority = authority,
    )]
    pub user_deal_token_vault: Box<Account<'info, TokenAccount>>,

    #[account(
        constraint = is_pubkey(&payment_token_mint.key(), PAYMENT_TOKEN_MINT) @ ContractError::InvalidPaymentTokenMint
    )]
    pub payment_token_mint: Account<'info, Mint>,

    #[account(
        mut,
        token::mint = payment_token_mint,
        token::authority = deal,
        seeds = [ DEAL_PAYMENT_VAULT_TAG, deal.key().as_ref()],
        bump,
    )]
    pub deal_payment_vault: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = payment_token_mint,
        token::authority = authority,
    )]
    pub user_payment_vault: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn handler(ctx: Context<PurchaseDealCtx>, ix: PurchaseDealIx) -> Result<()> {
    // TODO: calculate deal token price according to deal status and discounts by tier
    let tier = ctx.accounts.deal.get_tier(ctx.accounts.clock.unix_timestamp as u64, ix.nft_counts, ix.is_whitelisted_user)?;
    let price = ctx.accounts.deal.get_deal_token_price(tier)?;

    // deal_token_amount = (payment_token_amount / 10 ^ usdc_token_decimals) / (price / PRICE_DENOMINATOR) * 10 ^ deal_token_decimals
    let deal_token_amount = (ix.amount as u128)
        .safe_mul(
            (10 as u128)
                .safe_pow(ctx.accounts.deal.deal_token_decimals as u32)
                .unwrap(),
        )
        .unwrap()
        .safe_mul(PRICE_DENOMINATOR as u128)
        .unwrap()
        .safe_div(price as u128)
        .unwrap()
        .safe_div(
            (10 as u128)
                .safe_pow(ctx.accounts.deal.payment_token_decimals as u32)
                .unwrap(),
        )
        .unwrap() as u64;

    // check if  min_usdc <= amount <= max_usdc
    require!(ix.amount >= ctx.accounts.deal.min_usdc_buy, ContractError::LessThanMinUSDC);
    require!(ix.amount <= ctx.accounts.deal.max_usdc_buy, ContractError::MoreThanMaxUSDC);

    // transfer payment token(USDC) to the contract
    anchor_spl::token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_payment_vault.to_account_info(),
                to: ctx.accounts.deal_payment_vault.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        ),
        ix.amount,
    )?;

    // transfer deal token to the user's account
    let deal_token_mint_key = ctx.accounts.deal_token_mint.key();
    let signer_seeds = &[
        DEAL_TAG,
        deal_token_mint_key.as_ref(),
        &[ctx.accounts.deal.bump],
    ];
    let signer = &[&signer_seeds[..]];
    anchor_spl::token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.deal_token_vault.to_account_info(),
                to: ctx.accounts.user_deal_token_vault.to_account_info(),
                authority: ctx.accounts.deal.to_account_info(),
            },
            signer,
        ),
        deal_token_amount,
    )?;

    // update ticket account info
    ctx.accounts.ticket.purchase_payment_token_amount += ix.amount as u128;
    ctx.accounts.ticket.purchase_deal_token_amount += deal_token_amount as u128;
    ctx.accounts.ticket.updated_at = ctx.accounts.clock.unix_timestamp as u64;

    // update deal account info
    ctx.accounts.deal.purchase_payment_token_amount += ix.amount as u128;
    ctx.accounts.deal.purchase_deal_token_amount += deal_token_amount as u128;

    Ok(())
}
