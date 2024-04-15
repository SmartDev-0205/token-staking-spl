use anchor_lang::prelude::*;

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
    pub token_mint: Pubkey,
    pub plans: Vec<Plan>,
    pub total: u64,
    pub reserved: [u128; 5],
}
