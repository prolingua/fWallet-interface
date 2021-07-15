import { Contract } from "@ethersproject/contracts";
import useWalletProvider from "./useWalletProvider";
import { send } from "../utils/transactions";
import useTransaction from "./useTransaction";
import { useState } from "react";

// SFC_CLAIM_MAX_EPOCHS represents the max number of epochs
// available for withdraw per single request.
export const SFC_CLAIM_MAX_EPOCHS = 300;

export enum FANTOM_CONTRACTS {
  SFC = "sfc",
  STAKE_TOKENIZER = "stakeTokenizer",
}
export enum SFC_CALL_METHODS {
  URI = "uri",
}
export enum SFC_TX_METHODS {
  CLAIM_REWARDS = "claimRewards",
  RESTAKE_REWARDS = "restakeRewards",
  DELEGATE = "delegate",
}

const sfcContractCall: { [key in SFC_CALL_METHODS]: any } = {
  [SFC_CALL_METHODS.URI]: async (contract: Contract, id: string) => {
    return contract.uri(id);
  },
} as any;
const sfcContractTx: { [key in SFC_TX_METHODS]: any } = {
  [SFC_TX_METHODS.CLAIM_REWARDS]: async (
    contract: Contract,
    toStakerID: number
  ) => {
    return contract.claimRewards(toStakerID);
  },
  [SFC_TX_METHODS.RESTAKE_REWARDS]: async (
    contract: Contract,
    toStakerID: number
  ) => {
    return contract.restakeRewards(toStakerID);
  },
  [SFC_TX_METHODS.DELEGATE]: async (
    contract: Contract,
    toStakedID: number,
    amount: number
  ) => {
    return contract.delegate(toStakedID, { value: amount });
  },
};

export enum STAKE_TOKENIZER_TX_METHODS {
  mintSFTM = "mintSFTM",
  redeemSFTM = "redeemSFTM",
}

const stakeTokenizerTx: { [key in STAKE_TOKENIZER_TX_METHODS]: any } = {
  [STAKE_TOKENIZER_TX_METHODS.mintSFTM]: async (
    contract: Contract,
    toStakerID: number
  ) => {
    return contract.mintSFTM(toStakerID);
  },
  [STAKE_TOKENIZER_TX_METHODS.redeemSFTM]: async (
    contract: Contract,
    toStakerID: number,
    amount: number
  ) => {
    return contract.redeemSFTM(toStakerID, amount);
  },
};

const useFantomContract = () => {
  const { walletContext } = useWalletProvider();
  const { dispatchTx } = useTransaction();
  const [isPending, setIsPending] = useState(null);

  const contractIsLoaded = (contract: any) => {
    if (
      !walletContext.activeWallet.contracts ||
      !walletContext.activeWallet.contracts.has(contract)
    ) {
      console.error(
        `[useContractCall] Missing contracts or contract not (yet) loaded`
      );
      return false;
    }
    return true;
  };

  const callFantomContractMethod = async (
    contract: FANTOM_CONTRACTS,
    method: SFC_CALL_METHODS,
    args: any
  ) => {
    if (!contractIsLoaded(contract)) {
      return;
    }
    if (contract === FANTOM_CONTRACTS.SFC) {
      if (!sfcContractCall[method as SFC_CALL_METHODS]) {
        console.error(`[sfcContractCall] method: ${method} not found`);
      }

      return sfcContractCall[method as SFC_CALL_METHODS](
        walletContext.activeWallet.contracts.get(contract),
        ...args
      );
    }
  };

  const txFantomContractMethod = async (
    contract: FANTOM_CONTRACTS,
    method: SFC_TX_METHODS | STAKE_TOKENIZER_TX_METHODS,
    args: any
  ) => {
    if (!contractIsLoaded(contract)) {
      return;
    }

    const sendTx = (callback: any) => {
      try {
        return send(walletContext.activeWallet.provider, callback, dispatchTx);
      } catch (err) {
        throw err;
      }
    };

    if (contract === FANTOM_CONTRACTS.SFC) {
      if (!sfcContractTx[method as SFC_TX_METHODS]) {
        console.error(`[sfcContractTx] method: ${method} not found`);
      }

      return sendTx(() =>
        sfcContractTx[method as SFC_TX_METHODS](
          walletContext.activeWallet.contracts.get(contract),
          ...args
        )
      );
    }

    if (contract === FANTOM_CONTRACTS.STAKE_TOKENIZER) {
      if (!stakeTokenizerTx[method as STAKE_TOKENIZER_TX_METHODS]) {
        console.error(`[stakeTokenizerContractTx] method: ${method} not found`);
      }

      return sendTx(() =>
        stakeTokenizerTx[method as STAKE_TOKENIZER_TX_METHODS](
          walletContext.activeWallet.contracts.get(contract),
          ...args
        )
      );
    }
  };

  return {
    isPending,
    callSFCContractMethod: async (method: SFC_CALL_METHODS, args: any[]) =>
      callFantomContractMethod(FANTOM_CONTRACTS.SFC, method, args),
    txSFCContractMethod: async (method: SFC_TX_METHODS, args: any[]) =>
      txFantomContractMethod(FANTOM_CONTRACTS.SFC, method, args),
    txStakeTokenizerContractMethod: async (
      method: STAKE_TOKENIZER_TX_METHODS,
      args: any[]
    ) => txFantomContractMethod(FANTOM_CONTRACTS.STAKE_TOKENIZER, method, args),
  };
};

export default useFantomContract;
