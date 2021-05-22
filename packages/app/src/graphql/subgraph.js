import { gql } from "apollo-boost";

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

export const ACCOUNT_BY_ADDRESS = gql`
  query AccountByAddress($address: Address!, $cursor: Cursor, $count: Int!) {
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
          toStakerId
          amountDelegated
          outstandingSFTM
          pendingRewards {
            amount
          }
        }
      }
    }
  }
`;
