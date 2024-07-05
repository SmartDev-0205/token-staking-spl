import { useState, useEffect, useMemo } from "react";
import FilledButton from "../components/buttons/FilledButton";
import { IDL, TStaking } from "../idl/staking_idl";
import { toast } from "react-toastify";
import * as anchor from "@project-serum/anchor";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import {
  CONFIG_SEED,
  STAKE_SEED,
  VAULT_SEED,
  connection,
} from "../utils/consts";

const CONTRACT_ID = "3rDe1g7KVdoohS2SW2e4yU97d3SPUmSWymDXt2g6novH";
const TOKEN_MINT = "3H7Fm1QHDkXjtSJsUG7pXU81JqhFMd6pUBJh8vknfVAx";
const CONTRACT_KEY = new anchor.web3.PublicKey(CONTRACT_ID);
const TOKEN_MINT_KEY = new anchor.web3.PublicKey(TOKEN_MINT);

const systemProgram = anchor.web3.SystemProgram.programId;
const tokenProgram = TOKEN_PROGRAM_ID;
const associatedTokenProgram = ASSOCIATED_TOKEN_PROGRAM_ID;
const rent = anchor.web3.SYSVAR_RENT_PUBKEY;
const clock = anchor.web3.SYSVAR_CLOCK_PUBKEY;

export default function Blank() {
  const initStakingOptions = [
    {
      id: 1,
      name: "ETF Enthusiast",
      stakeAmount: "500,000",
      rewardAmount: "539,583",
      totalStaked: 0,
      lock: 1,
      limit: 80,
      entity: 0,
      stakeFlag: false,
      stakeId: 0,
    },
    {
      id: 2,
      name: "ETF Enthusiast",
      stakeAmount: "1,108,333",
      rewardAmount: "539,583",
      totalStaked: 0,
      lock: 2,
      limit: 70,
      entity: 0,
      stakeFlag: false,
      stakeId: 0,
    },
    {
      id: 3,
      name: "Bull Market Bae",
      stakeAmount: "2,000,000",
      rewardAmount: "2,250,000",
      totalStaked: 0,
      lock: 2,
      limit: 60,
      entity: 0,
      stakeFlag: false,
      stakeId: 0,
    },
    {
      id: 4,
      name: "Bull Market Bae",
      stakeAmount: "3,000,000",
      rewardAmount: "3,525,000",
      totalStaked: 0,
      lock: 6,
      limit: 50,
      entity: 0,
      stakeFlag: false,
      stakeId: 0,
    },
    {
      id: 5,
      name: "Index Fund Influencer",
      stakeAmount: "4,000,000",
      rewardAmount: "4,750,000",
      totalStaked: 0,
      lock: 9,
      limit: 40,
      entity: 0,
      stakeFlag: false,
      stakeId: 0,
    },
    {
      id: 6,
      name: "Wall Street Wizard",
      stakeAmount: "5,000,000",
      rewardAmount: "6,000,000",
      totalStaked: 0,
      lock: 12,
      limit: 30,
      entity: 0,
      stakeFlag: false,
      stakeId: 0,
    },
  ];
  const [stakingOptions, setStakingOptions] = useState(initStakingOptions);
  const [render, rerender] = useState(false);

  const wallet = useAnchorWallet();
  console.log("wallet address -----------", wallet);

  const getProvider = () => {
    if (wallet)
      return new anchor.AnchorProvider(
        connection,
        wallet,
        anchor.AnchorProvider.defaultOptions()
      );
  };

  const pda = (
    seeds: (Buffer | Uint8Array)[],
    programId: anchor.web3.PublicKey
  ): anchor.web3.PublicKey => {
    const [pdaKey] = anchor.web3.PublicKey.findProgramAddressSync(
      seeds,
      programId
    );
    return pdaKey;
  };

  const getDepositStatus = (index: number) => {
    if (!wallet) return false;
    if (stakingOptions[index].stakeFlag) return false;
    return true;
  };

  const getWithdrawStatus = (index: number) => {
    if (!wallet) return false;
    if (stakingOptions[index].stakeFlag) return true;
    return false;
  };

  const getProgram = () => {
    if (!wallet) return;
    const provider = getProvider();
    const program = new anchor.Program(IDL as TStaking, CONTRACT_ID, provider);
    return program;
  };

  const handleStake = async (id: number) => {
    if (!wallet) {
      toast.warning("Please connecct wallet");
      return;
    }
    try {
      const program = getProgram();
      const configPDA = await pda([CONFIG_SEED], CONTRACT_KEY);
      const token_valutPDA = await pda(
        [VAULT_SEED, configPDA.toBuffer(), TOKEN_MINT_KEY.toBuffer()],
        CONTRACT_KEY
      );
      const timestamp = Date.now(); // Get the current UTC timestamp in milliseconds
      const stakeId = new anchor.BN(timestamp);
      const stake = pda(
        [
          STAKE_SEED,
          wallet.publicKey.toBuffer(),
          stakeId.toArrayLike(Buffer, "le", 8),
        ],
        CONTRACT_KEY
      );
      const userTokenVault = getAssociatedTokenAddressSync(
        TOKEN_MINT_KEY,
        wallet.publicKey
      );

      const txid = await program?.methods
        .stake({ stakeId, planIndex: id })
        .accounts({
          authority: wallet.publicKey,
          configuration: configPDA,
          stake,
          tokenMint: TOKEN_MINT_KEY,
          tokenVault: token_valutPDA,
          userTokenVault,
          tokenProgram,
          systemProgram,
          rent,
          clock,
        })
        .rpc({ skipPreflight: true });
      console.log(txid);
      rerender(!render);
      toast.success("Staking success");
    } catch (error) {
      toast.error("Staking failed");
    }
  };

  const handleUnStake = async (id: number) => {
    if (!wallet) {
      toast.warning("Please connecct wallet");
      return;
    }
    try {
      const program = getProgram();
      const configPDA = await pda([CONFIG_SEED], CONTRACT_KEY);
      const token_valutPDA = await pda(
        [VAULT_SEED, configPDA.toBuffer(), TOKEN_MINT_KEY.toBuffer()],
        CONTRACT_KEY
      );
      const stakeId = new anchor.BN(stakingOptions[id].stakeId);
      const stake = pda(
        [
          STAKE_SEED,
          wallet.publicKey.toBuffer(),
          stakeId.toArrayLike(Buffer, "le", 8),
        ],
        CONTRACT_KEY
      );
      const userTokenVault = getAssociatedTokenAddressSync(
        TOKEN_MINT_KEY,
        wallet.publicKey
      );

      const txid = await program?.methods
        .unstake({ stakeId, planIndex: 6 })
        .accounts({
          authority: wallet.publicKey,
          configuration: configPDA,
          stake,
          tokenMint: TOKEN_MINT_KEY,
          tokenVault: token_valutPDA,
          userTokenVault,
          tokenProgram,
          systemProgram,
          rent,
          clock,
        })
        .rpc({ skipPreflight: true });
      console.log(txid);
      rerender(!render);
      toast.success("UnStaking success");
    } catch (error) {
      toast.error("UnStaking failed");
    }
  };

  const getStake = async () => {
    if (!wallet) return;
    const program = getProgram();
    let result: any = await program?.account.stake.all([
      {
        memcmp: {
          offset: 8 + 1, // Discriminator.
          bytes: wallet.publicKey.toBase58(),
        },
      },
    ]);
    let tempOption = [...stakingOptions];
    tempOption.forEach((option) => {
      option.stakeFlag = false;
    });
    result.forEach((stake: any) => {
      const planIndex = stake["account"]["planIndex"];
      if (planIndex) tempOption[planIndex].stakeFlag = true;
      tempOption[planIndex].stakeId = parseInt(stake["account"]["stakeId"]);
    });
    setStakingOptions(tempOption);
    return result;
  };

  const getParticipates = async () => {
    if (!wallet) return;
    const program = getProgram();
    const result: any = await program?.account.configuration.all();
    const account = result[0].account;
    if (account) {
      const plans: [] = account.plans;
      let tempOption = [...stakingOptions];
      for (let index = 0; index < stakingOptions.length; index++) {
        tempOption[index].entity = plans[index]["parcitipants"];
      }
      setStakingOptions(tempOption);
    }
  };

  useEffect(() => {
    getStake();
    getParticipates();
  }, [wallet, render]);

  return (
    <section className="h-full flex flex-col pt-[50px] gap-5 sm:pt-0 sm:gap-5 w-full px-10 max-w-[1300px]">
      <div className="w-full">
        <p className="text-4xl my-1">Staking</p>
        <p className="text-lg my-1">Earn fees by providing liquidity</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 h-fit pt-6 pb-4 gap-10">
        {stakingOptions.map((stake, index) => (
          <div
            className="card-gradient text-[#405f9d] relative h-fit p-10 flex flex-col gap-[10px] w-[350px] sm:w-[550px] max-w-full rounded-lg border  shadow-sm border-[#251635]"
            key={index}
          >
            <div className="flex justify-center font-bold text-3xl mb-10">
              {stake.name}
            </div>
            <div className="flex justify-between">
              <span>Stake:</span>
              <span>{stake.stakeAmount} $PEPE</span>
            </div>

            <div className="flex justify-between">
              <span>You will get:</span>
              <span>{stake.rewardAmount} $PEPE</span>
            </div>

            <div className="flex justify-between">
              <span>Lock day:</span>
              <span>{stake.lock} Month</span>
            </div>

            <div className="flex justify-between">
              <span>Entity:</span>
              <span>
                {stake.entity}/{stake.limit}
              </span>
            </div>

            <div className="flex justify-between">
              <span>You Staked:</span>
              <span>{stake.stakeFlag ? stake.stakeAmount : 0} $PEPE</span>
            </div>

            <div className="flex justify-center gap-4">
              <FilledButton
                onClick={() => {
                  handleStake(index);
                }}
                disabled={!getDepositStatus(index)}
                className="w-full text-base  font-semibold button-color mt-[5px]"
              >
                Deposit
              </FilledButton>
              <FilledButton
                onClick={() => {
                  handleUnStake(index);
                }}
                className="w-full text-base  font-semibold button-color mt-[5px]"
                disabled={!getWithdrawStatus(index)}
              >
                Withdraw
              </FilledButton>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
