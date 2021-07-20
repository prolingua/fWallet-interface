import { formatHexToBN } from "./conversion";
import { BigNumber } from "@ethersproject/bignumber";
import { MaxUint256 } from "@ethersproject/constants";

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
  withdrawRequest: any[];
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

export const delegationDaysLockedLeft = (delegation: AccountDelegation) => {
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

export const withdrawDaysLockedLeft = (createdTime: number, daysLocked = 7) => {
  const lockedTime = daysLocked * 24 * 60 * 60 * 1000;
  return parseInt(
    (
      (createdTime * 1000 + lockedTime - Date.now()) /
      (1000 * 60 * 60 * 24)
    ).toString()
  );
};

export const nodeUptime = (delegation: Delegation) => {
  return (
    100 -
    parseInt(delegation.downtime) /
      (Date.now() - parseInt(delegation.createdTime))
  );
};

export const generateWithdrawalRequestId = () => {
  const hexString = Array(16)
    .fill(0)
    .map(() => Math.round(Math.random() * 0xf).toString(16))
    .join("");

  const randomBigInt = BigInt(`0x${hexString}`);
  return BigNumber.from(randomBigInt);
};
