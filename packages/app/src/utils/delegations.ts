import { formatHexToInt } from "./conversion";

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
  totalStaked: number;
  totalPendingRewards: number;
  totalMintedSFTM: number;
}

export const getAccountDelegationSummary = (
  delegations: Delegations
): AccountDelegationSummary => {
  const initial = {
    totalStaked: 0,
    totalPendingRewards: 0,
    totalMintedSFTM: 0,
  };

  if (!delegations || !delegations.delegationsByAddress) {
    return;
  }
  if (!delegations.delegationsByAddress.edges.length) {
    return initial;
  }

  return delegations.delegationsByAddress.edges.reduce(
    (accumulated: any, current: any) => {
      const stake = formatHexToInt(current.delegation.amountDelegated);
      const reward = formatHexToInt(current.delegation.pendingRewards.amount);
      const minted = formatHexToInt(current.delegation.outstandingSFTM);

      return {
        totalStaked: accumulated.totalStaked + stake,
        totalPendingRewards: accumulated.totalPendingRewards + reward,
        totalMintedSFTM: accumulated.totalMintedSFTM + minted,
      };
    },
    initial
  );
};
