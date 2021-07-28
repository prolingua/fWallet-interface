import { gql } from "@apollo/client";

export const GET_TOKEN_PRICE = gql`
  query Price($to: String!) {
    price(to: $to) {
      price
    }
  }
`;

export const GET_GAS_PRICE = gql`
  query GasPrice {
    gasPrice
  }
`;

export const GET_ACCOUNT_BALANCE = gql`
  query AccountByAddress($address: Address!) {
    account(address: $address) {
      address
      balance
    }
  }
`;

export const GET_ACCOUNT_TRANSACTION_HISTORY = gql`
  query AccountHistoryByAddress(
    $address: Address!
    $cursor: Cursor
    $count: Int!
  ) {
    account(address: $address) {
      address
      balance
      txCount
      txList(cursor: $cursor, count: $count) {
        pageInfo {
          first
          last
          hasNext
          hasPrevious
        }
        totalCount
        edges {
          cursor
          transaction {
            hash
            from
            to
            value
            gasUsed
            status
            block {
              number
              timestamp
            }
          }
        }
      }
    }
  }
`;

export const FMINT_ACCOUNT_BY_ADDRESS = gql`
  query FMintAccountByAddress($address: Address!) {
    fMintAccount(owner: $address) {
      collateralValue
      debtValue
      collateral {
        balance
        value
        token {
          name
          symbol
          address
          decimals
          logoUrl
        }
      }
    }
  }
`;

export const DELEGATIONS_BY_ADDRESS = gql`
  query DelegationsByAddress($address: Address!) {
    delegationsByAddress(address: $address) {
      totalCount
      edges {
        delegation {
          address
          toStakerId
          amountDelegated
          outstandingSFTM
          createdTime
          amount
          withdrawRequests {
            withdrawRequestID
            amount
            createdTime
            withdrawTime
          }
          claimedReward
          pendingRewards {
            amount
          }
          isDelegationLocked
          lockedAmount
          lockedFromEpoch
          lockedUntil
          tokenizerAllowedToWithdraw
        }
      }
    }
  }
`;

export const GET_DELEGATIONS = gql`
  query Stakers {
    stakers {
      id
      stakerAddress
      totalStake
      stake
      totalDelegatedLimit
      delegatedLimit
      createdTime
      downtime
      stakerInfo {
        name
        website
        contact
        logoUrl
      }
      delegations {
        totalCount
      }
    }
  }
`;

export const ERC20_TOKEN_LIST = gql`
  query ERC20TokenList {
    erc20TokenList {
      address
      name
      symbol
      decimals
      totalSupply
      logoURL
    }
  }
`;

export const ERC20_TOKEN_LIST_AND_BALANCE = gql`
  query ERC20TokenList($owner: Address!) {
    erc20TokenList {
      address
      name
      symbol
      decimals
      totalSupply
      logoURL
      balanceOf(owner: $owner)
    }
  }
`;

export const ERC20_ASSETS = gql`
  query ERC20Assets($owner: Address!) {
    erc20Assets(owner: $owner) {
      address
      name
      symbol
      decimals
      totalSupply
      logoURL
      balanceOf(owner: $owner)
    }
  }
`;

// export const DELEGATION_BY_ADDRESS = gql`
//   query DelegationsByAddress(
//     $address: Address!
//     $cursor: Cursor
//     $count: Int!
//   ) {
//     delegationsByAddress(address: $address, cursor: $cursor, count: $count) {
//       pageInfo {
//         first
//         last
//         hasNext
//         hasPrevious
//       }
//       totalCount
//       edges {
//         cursor
//         delegation {
//           toStakerId
//           createdEpoch
//           createdTime
//           deactivatedEpoch
//           deactivatedTime
//           amount
//           isDelegationLocked
//           lockedFromEpoch
//           lockedUntil
//           pendingRewards {
//             amount
//           }
//         }
//       }
//     }
//   }
// `;

export const GOVERNANCE_CONTRACTS = gql`
  query GovernanceContracts {
    govContracts {
      name
      address
      totalProposals
    }
  }
`;

export const GOVERNANCE_PROPOSALS = gql`
  query GovernanceProposals(
    $cursor: Cursor
    $count: Int!
    $activeOnly: Boolean!
    $address: Address!
    $delegatedTo: Address
  ) {
    govProposals(cursor: $cursor, count: $count, activeOnly: $activeOnly) {
      totalCount
      pageInfo {
        first
        last
        hasNext
        hasPrevious
      }
      edges {
        proposal {
          id
          name
          description
          contract
          governanceId
          options
          state {
            isResolved
            status
            winnerId
          }
          minVotes
          minAgreement
          votingStarts
          votingMayEnd
          votingMustEnd
          votedWeightRatio
          vote: vote(from: $address, delegatedTo: $delegatedTo) {
            from
            delegatedTo
            weight
            choices
          }
        }
        cursor
      }
    }
  }
`;

export const GOVERNANCE_PROPOSAL = (address = null, delegatedToList = []) => {
  console.log("GOO!");
  const generateVotesFragment = (address, delegatedTo) => {
    const votes = delegatedTo.map(
      (
        delegate
      ) => `vote_${delegate[0]}: vote(from: "${address}", delegatedTo: "${delegate[1]}") {
            from
            delegatedTo
            weight
            choices
          }`
    );
    return votes.join(" ");
  };
  const votes =
    address && delegatedToList?.length
      ? generateVotesFragment(address, delegatedToList)
      : ``;
  const template =
    `
    query GovernanceProposals(
    $cursor: Cursor
    $count: Int!
    $activeOnly: Boolean!
  ) {
    govProposals(cursor: $cursor, count: $count, activeOnly: $activeOnly) {
      totalCount
      pageInfo {
        first
        last
        hasNext
        hasPrevious
      }
  edges {
        proposal {
          id
          name
          description
          contract
          governanceId
          options
          state {
            isResolved
            status
            winnerId
          }
          minVotes
          minAgreement
          votingStarts
          votingMayEnd
          votingMustEnd
          votedWeightRatio
          ` +
    votes +
    `      
        }
        cursor
      }
    }
  }
`;
  return gql`
    ${template}
  `;
};
