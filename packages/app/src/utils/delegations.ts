import { formatHexToBN } from "./conversion";
import { BigNumber } from "@ethersproject/bignumber";

export interface Delegations {
  stakers: Delegation[];
}

export interface Delegation {
  id: string;
  address: string;
  toStakerId?: string;
  createdTime?: string;
  downtime?: string;
  stakerInfo?: {
    name?: string;
    website?: string;
    contact?: string;
    logoUrl?: string;
  };
  delegatedLimit: string;
}

export interface AccountDelegations {
  delegationsByAddress: {
    totalCount: string;
    edges: AccountDelegation[];
  };
}

export interface AccountDelegation {
  amountDelegated: string;
  outstandingSFTM: string;
  pendingRewards: {
    amount: string;
  };
  isDelegationLocked: boolean;
  lockedUntil: string;
  toStakerId: string;
}

export interface AccountDelegationSummary {
  totalStaked: BigNumber;
  totalPendingRewards: BigNumber;
  totalMintedSFTM: BigNumber;
}

export const getDelegations = (delegations: Delegations): Delegation[] => {
  if (!delegations || !delegations.stakers) {
    return null;
  }

  return delegations.stakers;
};

export const getAccountDelegations = (
  delegations: AccountDelegations
): AccountDelegation[] => {
  if (!delegations || !delegations.delegationsByAddress) {
    return;
  }

  return delegations.delegationsByAddress.edges;
};

export const getAccountDelegationSummary = (
  delegations: AccountDelegations
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

export const daysLockedLeft = (delegation: AccountDelegation) => {
  const lockedUntil =
    delegation.isDelegationLocked &&
    formatHexToBN(delegation.lockedUntil).toString();
  return lockedUntil
    ? parseInt(
        (
          (parseInt(lockedUntil) * 1000 - Date.now()) /
          (1000 * 60 * 60 * 24)
        ).toString()
      )
    : 0;
};

export const nodeUptime = (delegation: Delegation) => {
  return (
    100 -
    parseInt(delegation.downtime) /
      (Date.now() - parseInt(delegation.createdTime))
  );
};
