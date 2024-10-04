import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getMint, getAccount, Mint, Account, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { SolanaStaking } from "../target/types/solana_staking";
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';

import {
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  createMint,
  transfer,
  mintTo
} from "@solana/spl-token"
import { bytes } from "@project-serum/anchor/dist/cjs/utils";

const configSeed = Buffer.from("CONFIG_TAG");
const stakeSeed = Buffer.from("STAKE_TAG");
const valutSeed = Buffer.from("TOKEN_VAULT_TAG");
const stakeid = 245385;

console.log("-----------------", new anchor.BN(245385).toArrayLike(Buffer, 'le', 8))
// console.log("-------------",stakeid.to)
const systemProgram = anchor.web3.SystemProgram.programId;
const tokenProgram = TOKEN_PROGRAM_ID;
const associatedTokenProgram = ASSOCIATED_TOKEN_PROGRAM_ID
const rent = anchor.web3.SYSVAR_RENT_PUBKEY;
const clock = anchor.web3.SYSVAR_CLOCK_PUBKEY;


const pepeTokenMint = new anchor.web3.PublicKey("9Gz7Gy3PwPuV1kmKUd617vdEed6eSg8zxfPsGGF1kjT4");

export const pda = (
  seeds: (Buffer | Uint8Array)[],
  programId: anchor.web3.PublicKey
): anchor.web3.PublicKey => {
  const [pdaKey] = anchor.web3.PublicKey.findProgramAddressSync(
    seeds,
    programId
  );
  return pdaKey;
}

describe("solana-staking", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  let connection = provider.connection;
  const program = anchor.workspace.SolanaStaking as Program<SolanaStaking>;

  it("Is initialized!", async () => {

    const configPDA = await pda([configSeed], program.programId);
    const token_valutPDA = await pda([valutSeed, configPDA.toBuffer(), pepeTokenMint.toBuffer()], program.programId);
    const stakeId = new anchor.BN(1713334646);
    const stake = pda([stakeSeed, provider.wallet.publicKey.toBuffer(), stakeId.toArrayLike(Buffer, 'le', 8)], program.programId);
    const userTokenVault = getAssociatedTokenAddressSync(pepeTokenMint, provider.wallet.publicKey);

    console.log("program id", program.programId)
    console.log("wallet id", provider.wallet.publicKey)
    console.log("user token id", userTokenVault.toString())

    await program.methods.initialize().accounts({
      authority: provider.wallet.publicKey,
      configuration: configPDA,
      tokenMint: pepeTokenMint,
      tokenVault: token_valutPDA,
      tokenProgram,
      systemProgram,
      rent,
      clock
    }).rpc({ skipPreflight: true });

    // console.log("initialize was finished.");


    // const txid = await program.methods.addPlan({
    //   amount: new anchor.BN(500000000000000),
    //   period: new anchor.BN(30 * 24 * 3600),
    //   reward: new anchor.BN(539583000000000),
    //   limit: 80 // Assuming limit is correctly typed as u8
    // }).accounts({
    //   authority: provider.wallet.publicKey,
    //   configuration: configPDA,
    //   systemProgram,
    //   rent,
    //   clock
    // }).rpc({ skipPreflight: true });

    // await program.methods.addPlan({
    //   amount: new anchor.BN(1000000000000000),
    //   period: new anchor.BN(60 * 24 * 3600),
    //   reward: new anchor.BN(1108333000000000),
    //   limit: 70 // Assuming limit is correctly typed as u8
    // }).accounts({
    //   authority: provider.wallet.publicKey,
    //   configuration: configPDA,
    //   systemProgram,
    //   rent,
    //   clock
    // }).rpc({ skipPreflight: true });


    // await program.methods.addPlan({
    //   amount: new anchor.BN(2000000000000000),
    //   period: new anchor.BN(60 * 24 * 3600),
    //   reward: new anchor.BN(2250000000000000),
    //   limit: 60 // Assuming limit is correctly typed as u8
    // }).accounts({
    //   authority: provider.wallet.publicKey,
    //   configuration: configPDA,
    //   systemProgram,
    //   rent,
    //   clock
    // }).rpc({ skipPreflight: true });


    // await program.methods.addPlan({
    //   amount: new anchor.BN(3000000000000000),
    //   period: new anchor.BN(180 * 24 * 3600),
    //   reward: new anchor.BN(3525000000000000),
    //   limit: 50 // Assuming limit is correctly typed as u8
    // }).accounts({
    //   authority: provider.wallet.publicKey,
    //   configuration: configPDA,
    //   systemProgram,
    //   rent,
    //   clock
    // }).rpc({ skipPreflight: true });


    await program.methods.addPlan({
      amount: new anchor.BN(4000000000000000),
      period: new anchor.BN(270 * 24 * 3600),
      reward: new anchor.BN(4750000000000000),
      limit: 40 // Assuming limit is correctly typed as u8
    }).accounts({
      authority: provider.wallet.publicKey,
      configuration: configPDA,
      systemProgram,
      rent,
      clock
    }).rpc({ skipPreflight: true });


    await program.methods.addPlan({
      amount: new anchor.BN(5000000000000000),
      period: new anchor.BN(360 * 24 * 3600),
      reward: new anchor.BN(6000000000000000),
      limit: 30 // Assuming limit is correctly typed as u8
    }).accounts({
      authority: provider.wallet.publicKey,
      configuration: configPDA,
      systemProgram,
      rent,
      clock
    }).rpc({ skipPreflight: true });


    // const txid = await program.methods.stake({ stakeId, planIndex: 0 }).accounts({
    //   authority: provider.wallet.publicKey,
    //   configuration: configPDA,
    //   stake,
    //   tokenMint: pepeTokenMint,
    //   tokenVault: token_valutPDA,
    //   userTokenVault,
    //   tokenProgram,
    //   systemProgram,
    //   rent,
    //   clock
    // }).rpc({ skipPreflight: true });

    // console.log(txid);
  });
});