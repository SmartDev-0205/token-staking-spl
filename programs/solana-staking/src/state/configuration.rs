use {
    anchor_lang::prelude::*,
    anchor_spl::token::{Mint, Token, TokenAccount, Transfer},
};

#[repr(C)]
#[derive(Clone, AnchorSerialize, AnchorDeserialize, PartialEq, Debug, Copy)]

pub struct Plan {
    pub amount: u64,
    pub period: u64,
    pub reward: u64,
    pub limit: u8,
    pub parcitipants: u8,
}

#[account]
#[derive(Default)]
pub struct Configuration {
    pub bump: u8,
    pub authority: Pubkey, // admin's wallet
    pub plans: Vec<Plan>,
    pub reserved: [u128; 5],
}

#[account]
#[derive(Default)]
pub struct Stake {
    pub bump: u8,
    pub authority: Pubkey,
    pub amount: u64,
    pub period: u64,
    pub reward: u64,
    pub deal_token_min: Mint,
    pub reserved: [u128; 5],
}
