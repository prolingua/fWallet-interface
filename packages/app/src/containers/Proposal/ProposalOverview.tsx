import React, { useContext } from "react";
import { ThemeContext } from "styled-components";
import Row from "../../components/Row";
import Column from "../../components/Column";
import { ContentBox, Heading1, Typo1 } from "../../components";
import Spacer from "../../components/Spacer";
import ProposalResult from "./ProposalResult";
import ProposalVote from "./ProposalVote";
import { formatDate } from "../../utils/common";
import { formatHexToInt } from "../../utils/conversion";
import { getProposalStatus, isProposalActive } from "../../utils/governance";

const ProposalOverview: React.FC<any> = ({ proposal, selectedDelegation }) => {
  const { color } = useContext(ThemeContext);
  const delegationVoteKey = `vote_${parseInt(
    selectedDelegation?.delegation.toStakerId
  )}`;
  const hasVoted =
    proposal && selectedDelegation && proposal[delegationVoteKey].choices;
  const proposalStatus = proposal && getProposalStatus(proposal.state.status);
  const isActive = proposal && isProposalActive(proposal);
  const isOpen = proposalStatus === "In progress" && isActive;

  return (
    <>
      <Row>
        <Column>
          <Heading1>{proposal?.name}</Heading1>
          <Spacer size="sm" />
          <Typo1 style={{ color: color.greys.grey() }}>
            {proposal?.description}
          </Typo1>
          <Spacer />
        </Column>
      </Row>
      <Spacer />
      <Row style={{ width: "100%", gap: "1rem" }}>
        <ProposalVote
          selectedDelegation={selectedDelegation}
          hasVoted={hasVoted}
          options={proposal?.options}
          opinionScales={proposal?.opinionScales}
          proposalId={proposal?.id}
          isOpen={isOpen}
        />
        <ProposalResult proposal={proposal} isOpen={isOpen} />
        <ContentBox style={{ flex: 2 }}>
          {proposal && (
            <Column>
              <div>
                <Typo1
                  style={{ fontWeight: "bold", color: color.greys.grey() }}
                >
                  Voting Starts
                </Typo1>
                <Spacer size="xs" />
                <Typo1 style={{ fontWeight: "bold" }}>
                  {formatDate(
                    new Date(formatHexToInt(proposal?.votingStarts) * 1000)
                  )}
                </Typo1>
              </div>
              <Spacer size="lg" />
              <div>
                <Typo1
                  style={{ fontWeight: "bold", color: color.greys.grey() }}
                >
                  Voting May End
                </Typo1>
                <Spacer size="xs" />
                <Typo1 style={{ fontWeight: "bold" }}>
                  {formatDate(
                    new Date(formatHexToInt(proposal?.votingMayEnd) * 1000)
                  )}
                </Typo1>
              </div>
              <Spacer size="lg" />
              <div>
                <Typo1
                  style={{ fontWeight: "bold", color: color.greys.grey() }}
                >
                  Voting Must End
                </Typo1>
                <Spacer size="xs" />
                <Typo1 style={{ fontWeight: "bold" }}>
                  {formatDate(
                    new Date(formatHexToInt(proposal?.votingMustEnd) * 1000)
                  )}
                </Typo1>
              </div>
            </Column>
          )}
        </ContentBox>
      </Row>
    </>
  );
};

export default ProposalOverview;
