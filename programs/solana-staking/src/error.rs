
use anchor_lang::prelude::*;

#[error_code]
pub enum ContractError {
    #[msg("Calculation Error.")]
    CalcError,
    
    #[msg("Invalid address.")]
    InvalidAddress,
    
    #[msg("Invalid authority.")]
    InvalidAuthority,

    #[msg("Deal is not live.")]
    InvalidDealStatus,

    #[msg("Invalid NFT.")]
    InvalidNft,

    #[msg("Invalid payment token mint.")]
    InvalidPaymentTokenMint,

    #[msg("Invalid Status.")]
    InvalidStatus,

    #[msg("Invalid TRTLS mint.")]
    InvalidTrtlsMint,

    #[msg("Invalid whitelister address.")]
    InvalidWhitelisterAddress,

    #[msg("usdc amount is less than min.")]
    LessThanMinUSDC,

    #[msg("MathOverflow.")]
    MathOverflow,

    #[msg("usdc amount is more than max.")]
    MoreThanMaxUSDC,

    #[msg("Not allowed.")]
    NotAllowed,

    #[msg("not enough amount.")]
    NotEnough,
    
    #[msg("Not enough NFTs.")]
    NotEnoughNFTs,

    #[msg("Whitelist user overflow.")]
    WhitelistUserOverflow,

    #[msg("Whitelist user already exist.")]
    WhitelistUserAlreadyExist,

    #[msg("Pool Balance is 0.")]
    ZeroPoolBalance,
}
