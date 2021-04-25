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
