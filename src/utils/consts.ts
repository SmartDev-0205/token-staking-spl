import * as anchor from '@project-serum/anchor';
import { Buffer } from 'buffer';
const endpoint =
    process.env.REACT_APP_SOLANA_RPC_HOST || "https://api.devnet.solana.com";
export const connection = new anchor.web3.Connection(endpoint, 'confirmed');
export const CONFIG_SEED = Buffer.from("CONFIG_TAG");
export const STAKE_SEED = Buffer.from("STAKE_TAG");
export const VAULT_SEED = Buffer.from("TOKEN_VAULT_TAG");
window.Buffer = window.Buffer || require("buffer").Buffer;

