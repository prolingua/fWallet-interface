import { formatHexToInt } from "./conversion";

export const getGovernanceProposals = (govProposalsData: any) => {
  if (!govProposalsData || !govProposalsData?.govProposals.edges) {
    return [];
  }
  return govProposalsData.govProposals.edges;
};

export const getInactiveGovernanceProposals = (govProposalList: any[]) => {
  return govProposalList.filter(
    (govProposal) =>
      new Date(formatHexToInt(govProposal.proposal.votingMustEnd) * 1000) <
      new Date(Date.now())
  );
};

export const getProposalStatus = (status: string) => {
  switch (parseInt(status, 16)) {
    case 0:
      return "In progress";
    case 1:
      return "Resolved";
    case 2:
      return "Failed";
    case 4:
      return "Canceled";
    case 8:
      return "Execution Expired";
  }

  return "-";
};

// Returns number of active delegations not used to vote for the proposal
export const votesLeftForProposal = (proposal: any) => {
  const voteKeys = Object.keys(proposal).filter(
    (key) => key.substr(0, 5) === "vote_"
  );

  return voteKeys.reduce(
    (accumulator, current) => {
      if (formatHexToInt(proposal[current].weight) > 0) {
        return [accumulator[0], accumulator[1] + 1];
      }
      return [accumulator[0] + 1, accumulator[1] + 1];
    },
    [0, 0]
  );
};

export const isProposalActive = (proposal: any) => {
  return (
    new Date(formatHexToInt(proposal.votingMustEnd) * 1000) >
      new Date(Date.now()) &&
    new Date(formatHexToInt(proposal.votingStarts) * 1000) <
      new Date(Date.now())
  );
};
