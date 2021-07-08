import { Contract } from "@ethersproject/contracts";
import useWalletProvider from "./useWalletProvider";
import { send } from "../utils/transactions";
import useTransaction from "./useTransaction";

// SFC_CLAIM_MAX_EPOCHS represents the max number of epochs
// available for withdraw per single request.
export const SFC_CLAIM_MAX_EPOCHS = 300;

export enum FANTOM_CONTRACTS {
  SFC = "sfc",
}
export enum SFC_CALL_METHODS {
  URI = "uri",
}
export enum SFC_SEND_METHODS {
  CLAIM_REWARDS = "claimRewards",
  RESTAKE_REWARDS = "restakeRewards",
}

const sfcContractCall: { [key in SFC_CALL_METHODS]: any } = {
  [SFC_CALL_METHODS.URI]: async (contract: Contract, id: string) => {
    return contract.uri(id);
  },
} as any;
const sfcContractSend: { [key in SFC_SEND_METHODS]: any } = {
  [SFC_SEND_METHODS.CLAIM_REWARDS]: async (
    contract: Contract,
    toStakerID: number
  ) => {
    return contract.claimRewards(toStakerID);
  },
  [SFC_SEND_METHODS.RESTAKE_REWARDS]: async (
    contract: Contract,
    toStakerID: number
  ) => {
    return contract.restakeRewards(toStakerID);
  },
};

const useFantomContract = () => {
  const { walletContext } = useWalletProvider();
  const { dispatchTx } = useTransaction();

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
    method: SFC_SEND_METHODS,
    args: any
  ) => {
    if (!contractIsLoaded(contract)) {
      return;
    }
    if (contract === FANTOM_CONTRACTS.SFC) {
      if (!sfcContractSend[method as SFC_SEND_METHODS]) {
        console.error(`[sfcContractSend] method: ${method} not found`);
      }

      // return sfcContractSend[method as SFC_SEND_METHODS](
      //   walletContext.activeWallet.contracts.get(contract),
      //   ...args
      // );

      return send(
        walletContext.activeWallet.provider,
        () =>
          sfcContractSend[method as SFC_SEND_METHODS](
            walletContext.activeWallet.contracts.get(contract),
            ...args
          ),
        dispatchTx
      );
    }
  };

  return {
    callSFCContractMethod: async (method: SFC_CALL_METHODS, args: any[]) =>
      callFantomContractMethod(FANTOM_CONTRACTS.SFC, method, args),
    txSFCContractMethod: async (method: SFC_SEND_METHODS, args: any[]) =>
      txFantomContractMethod(FANTOM_CONTRACTS.SFC, method, args),
  };
};

export default useFantomContract;
