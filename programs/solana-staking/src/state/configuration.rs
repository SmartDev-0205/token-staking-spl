use anchor_lang::prelude::*;
use crate::{ error::ContractError, constant::* };

#[repr(C)]
#[derive(Clone, AnchorSerialize, AnchorDeserialize, PartialEq, Debug, Copy)]

pub struct Plan {
    amount: u64,
    period: u64,
    reward: u64,
    limit: u8,
    parcitipants: u8
}

#[account]
#[derive(Default)]
pub struct Configuration {
    pub bump: u8,
    pub authority: Pubkey, // admin's wallet
    pub plans: Vec<Plan>,

    pub reserved: [u128; 5],
}