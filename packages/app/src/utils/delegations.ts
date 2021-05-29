import { formatHexToBN, formatHexToInt } from "./conversion";
import { BigNumber } from "@ethersproject/bignumber";

export interface Delegations {
  delegationsByAddress: {
    totalCount: string;
    edges: Delegation[];
  };
}

export interface Delegation {
  amountDelegated: string;
  outstandingSFTM: string;
  pendingRewards: {
    amount: string;
  };
}

export interface AccountDelegationSummary {
  totalStaked: BigNumber;
  totalPendingRewards: BigNumber;
  totalMintedSFTM: BigNumber;
}

export const getAccountDelegationSummary = (
  delegations: Delegations
): AccountDelegationSummary => {
  const initial = {
    totalStaked: BigNumber.from(0),
    totalPendingRewards: BigNumber.from(0),
    totalMintedSFTM: BigNumber.from(0),
  };

  if (!delegations || !delegations.delegationsByAddress) {
    return;
  }
  if (!delegations.delegationsByAddress.edges.length) {
    return initial;
  }

  return delegations.delegationsByAddress.edges.reduce(
    (accumulated: any, current: any) => {
      const stake = formatHexToBN(current.delegation.amountDelegated);
      const reward = formatHexToBN(current.delegation.pendingRewards.amount);
      const minted = formatHexToBN(current.delegation.outstandingSFTM);

      return {
        totalStaked: stake.add(accumulated.totalStaked),
        totalPendingRewards: reward.add(accumulated.totalPendingRewards),
        totalMintedSFTM: minted.add(accumulated.totalMintedSFTM),
      };
    },
    initial
  );
};
