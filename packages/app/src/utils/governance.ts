export const getGovernanceProposals = (govProposalsData: any) => {
  if (!govProposalsData || !govProposalsData?.govProposals.edges) {
    return [];
  }
  return govProposalsData.govProposals.edges;
};

export const getInactiveGovernanceProposals = (govProposalList: any[]) => {
  return govProposalList.filter(
    (govProposal) => govProposal.proposal.state.status !== "0x0"
  );
};
