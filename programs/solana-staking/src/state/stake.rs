use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct Stake {
    pub bump: u8,
    pub authority: Pubkey, // user's wallet
    pub stake_id: u64,
    pub plan_index: u8,
    pub staked_at: u64,
    pub reserved: [u128; 1],
}