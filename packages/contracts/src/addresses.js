/**
 * See all ids below
 * https://ethereum.stackexchange.com/questions/17051/how-to-select-a-network-id-or-is-there-a-list-of-network-ids
 */
export const GOERLI_ID = 5;
export const KOVAN_ID = 42;
export const MAINNET_ID = 1;
export const RINKEBY_ID = 4;
export const ROPSTEN_ID = 3;
export const MATIC_ID = 137;
export const FANTOM_MAIN_ID = 250;
export const FANTOM_TEST_ID = 4002;

const commonContracts = {
  factory: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
  router01: "0xf164fC0Ec4E93095b804a4795bBe1e041497b92a",
  router02: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
};
const commonFantomContracts = {
  sfc: "0xfc00face00000000000000000000000000000000",
};

export default {
  [FANTOM_MAIN_ID]: {
    pairs: {
      "DAI-WETH": "0x8F609d85ebC64316B0B2f9E53c11b4e48B7A06d2",
    },
    tokens: {
      DAI: "0x697Ed3E98aaeCFa3121F536251F9D500de159dBa",
      WETH: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
      SFTM: "",
    },
    ...commonContracts,
    ...commonFantomContracts,
    stakeTokenizer: "",
    gov: "",
  },
  [FANTOM_TEST_ID]: {
    tokens: {
      SFTM: "0x3b28f151899bd945ac1559a3540b5741c7d2bd55",
    },
    ...commonContracts,
    ...commonFantomContracts,
    stakeTokenizer: "0xea285cffa1defe82d34639d275d444785e05a128",
    gov: "0xaa3a160e91f63f1db959640e0a7b8911b6bd5b95",
  },
};
