/**
 * See all ids below
 * https://ethereum.stackexchange.com/questions/17051/how-to-select-a-network-id-or-is-there-a-list-of-network-ids
 */
export const FANTOM_MAIN_ID = 250;
export const FANTOM_TEST_ID = 4002;

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
    ...commonFantomContracts,
    stakeTokenizer: "",
    gov: "",
    govProposal: "0x7403b7d2d0645f576ef5f702736390ad9fb6f6b0",
    govProposalPlaintext: "0xc9f5aa2c93ae9e89a77dc60e7e3cfff1234e4287",
  },
  [FANTOM_TEST_ID]: {
    tokens: {
      SFTM: "0x3b28f151899bd945ac1559a3540b5741c7d2bd55",
    },
    ...commonFantomContracts,
    stakeTokenizer: "0xea285cffa1defe82d34639d275d444785e05a128",
    gov: "0xaa3a160e91f63f1db959640e0a7b8911b6bd5b95",
    govProposal: "0xf843e0625e4975e7e654b2f1b374818ba2b4ffbf",
    govProposalPlaintext: "0xb4673f085ae472c2974febfed3a41bb73aeb172e",
  },
};
