import { gql } from "apollo-boost";

// See more example queries on https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2
// export const GET_AGGREGATED_UNISWAP_DATA = gql`
//   {
//     uniswapFactories(first: 1) {
//       pairCount
//       totalVolumeUSD
//       totalLiquidityUSD
//     }
//   }
// `;

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
