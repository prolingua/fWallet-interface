export default {
  providers: [
    {
      http: "https://xapi.testnet.fantom.network/api",
      // for subscriptions
      ws: "",
    },
  ],
  // JSON-RPC endpoint
  rpc: "https://xapi.testnet.fantom.network/lachesis",
  // used in links pointing to fantom explorer
  explorerUrl: "https://explorer.testnet.fantom.network/",
  // used in links pointing to validators
  explorerUrl2: "https://explorer.testnet.fantom.network/",
  // used in links pointing to fantom explorer's transaction detail
  explorerTransactionPath: "transactions",
  // chain id for testnet
  chainId: "0xfa2",
};
