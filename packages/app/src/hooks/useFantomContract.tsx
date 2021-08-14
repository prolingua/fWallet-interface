import { Contract } from "@ethersproject/contracts";
import useWalletProvider from "./useWalletProvider";
import { send } from "../utils/transactions";
import useTransaction from "./useTransaction";
import { unitToWei } from "../utils/conversion";

export enum FANTOM_CONTRACTS {
  SFC = "sfc",
  STAKE_TOKENIZER = "stakeTokenizer",
  GOV = "gov",
  GOV_PROPOSAL_PLAINTEXT = "govProposalPlaintext",
}
export enum SFC_CALL_METHODS {
  URI = "uri",
}
export enum SFC_TX_METHODS {
  CLAIM_REWARDS = "claimRewards",
  RESTAKE_REWARDS = "restakeRewards",
  DELEGATE = "delegate",
  UNDELEGATE = "undelegate",
  WITHDRAW = "withdraw",
  LOCK_STAKE = "lockStake",
  RELOCK_STAKE = "relockStake",
  UNLOCK_STAKE = "unlockStake",
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
  [SFC_TX_METHODS.UNDELEGATE]: async (
    contract: Contract,
    toStakerID: number,
    wrId: string,
    amount: number
  ) => {
    return contract.undelegate(toStakerID, wrId, amount);
  },
  [SFC_TX_METHODS.WITHDRAW]: async (
    contract: Contract,
    toStakerID: number,
    wrId: string
  ) => {
    return contract.withdraw(toStakerID, wrId);
  },
  [SFC_TX_METHODS.LOCK_STAKE]: async (
    contract: Contract,
    toStakerId: number,
    lockupDurationInSeconds: number,
    amount: number
  ) => {
    return contract.lockStake(toStakerId, lockupDurationInSeconds, amount);
  },
  [SFC_TX_METHODS.RELOCK_STAKE]: async (
    contract: Contract,
    toStakerId: number,
    lockupDurationInSeconds: number,
    amount: number
  ) => {
    return contract.relockStake(toStakerId, lockupDurationInSeconds, amount);
  },
  [SFC_TX_METHODS.UNLOCK_STAKE]: async (
    contract: Contract,
    toStakerId: number,
    amount: number
  ) => {
    return contract.unlockStake(toStakerId, amount);
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

export enum GOV_TX_METHODS {
  vote = "vote",
  cancelVote = "cancelVote",
}

const govTx: { [key in GOV_TX_METHODS]: any } = {
  [GOV_TX_METHODS.vote]: async (
    contract: Contract,
    delegatedToAddress: string,
    proposalId: number,
    choices: number[]
  ) => {
    return contract.vote(delegatedToAddress, proposalId, choices);
  },
  [GOV_TX_METHODS.cancelVote]: async (
    contract: Contract,
    delegatedToAddress: string,
    proposalId: number
  ) => {
    return contract.cancelVote(delegatedToAddress, proposalId);
  },
};

export enum GOV_PROPOSAL_PLAINTEXT_TX_METHODS {
  create = "create",
}

const govProposalPlaintextTx: {
  [key in GOV_PROPOSAL_PLAINTEXT_TX_METHODS]: any;
} = {
  [GOV_PROPOSAL_PLAINTEXT_TX_METHODS.create]: async (
    contract: Contract,
    proposalName: string,
    proposalDescription: string,
    options: string[],
    minVoteAmount: number,
    minAgreementAmount: number,
    startTime: number,
    minEndTime: number,
    maxEndTime: number
  ) => {
    return contract.create(
      proposalName,
      proposalDescription,
      options,
      minVoteAmount,
      minAgreementAmount,
      startTime,
      minEndTime,
      maxEndTime,
      { value: unitToWei("100") }
    );
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
    method:
      | SFC_TX_METHODS
      | STAKE_TOKENIZER_TX_METHODS
      | GOV_TX_METHODS
      | GOV_PROPOSAL_PLAINTEXT_TX_METHODS,
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

    if (contract === FANTOM_CONTRACTS.GOV) {
      if (!govTx[method as GOV_TX_METHODS]) {
        console.error(`[stakeTokenizerContractTx] method: ${method} not found`);
      }

      return sendTx(() =>
        govTx[method as GOV_TX_METHODS](
          walletContext.activeWallet.contracts.get(contract),
          ...args
        )
      );
    }

    if (contract === FANTOM_CONTRACTS.GOV_PROPOSAL_PLAINTEXT) {
      if (
        !govProposalPlaintextTx[method as GOV_PROPOSAL_PLAINTEXT_TX_METHODS]
      ) {
        console.error(
          `[govProposalPlaintextContractTx] method: ${method} not found`
        );
      }

      return sendTx(() =>
        govProposalPlaintextTx[method as GOV_PROPOSAL_PLAINTEXT_TX_METHODS](
          walletContext.activeWallet.contracts.get(contract),
          ...args
        )
      );
    }
  };

  return {
    callSFCContractMethod: async (method: SFC_CALL_METHODS, args: any[]) =>
      callFantomContractMethod(FANTOM_CONTRACTS.SFC, method, args),
    txSFCContractMethod: async (method: SFC_TX_METHODS, args: any[]) =>
      txFantomContractMethod(FANTOM_CONTRACTS.SFC, method, args),
    txStakeTokenizerContractMethod: async (
      method: STAKE_TOKENIZER_TX_METHODS,
      args: any[]
    ) => txFantomContractMethod(FANTOM_CONTRACTS.STAKE_TOKENIZER, method, args),
    txGovContractMethod: async (method: GOV_TX_METHODS, args: any[]) =>
      txFantomContractMethod(FANTOM_CONTRACTS.GOV, method, args),
    txGovProposalPlaintextContractMethod: async (
      method: GOV_PROPOSAL_PLAINTEXT_TX_METHODS,
      args: any[]
    ) =>
      txFantomContractMethod(
        FANTOM_CONTRACTS.GOV_PROPOSAL_PLAINTEXT,
        method,
        args
      ),
  };
};

export default useFantomContract;
