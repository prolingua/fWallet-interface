import React, { Fragment, useContext } from "react";
import styled, { ThemeContext } from "styled-components";
import Linkify from "react-linkify";
import { ContentBox, Heading1, Typo1 } from "../../components";
import Spacer from "../../components/Spacer";
import ProposalResult from "./ProposalResult";
import ProposalVote from "./ProposalVote";
import { formatDate } from "../../utils/common";
import { formatHexToInt } from "../../utils/conversion";
import { getProposalStatus, isProposalActive } from "../../utils/governance";
import { Column, Row } from "../../components/Grid/Grid";

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
            <Linkify
              componentDecorator={(decoratedHref, decoratedText, key) => (
                <a
                  style={{ color: "ffffffd6" }}
                  target="blank"
                  href={decoratedHref}
                  key={key}
                >
                  {decoratedText}
                </a>
              )}
            >
              {proposal?.description}
            </Linkify>
          </Typo1>
          <Spacer />
        </Column>
      </Row>
      <Spacer />
      <Row flipDirectionLTE="md" style={{ width: "100%", gap: "1rem" }}>
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
        <Spacer />
      </Row>
    </>
  );
};

const StyledLinkify = styled(Linkify)`
  a {
    color: white !important;
  }
`;

export default ProposalOverview;
