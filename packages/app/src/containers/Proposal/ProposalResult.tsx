import React, { useContext } from "react";
import { ThemeContext } from "styled-components";
import { ContentBox, Heading2, Typo1, Typo2 } from "../../components";
import Column from "../../components/Column";
import Row from "../../components/Row";
import Spacer from "../../components/Spacer";
import { formatHexToInt, hexToUnit } from "../../utils/conversion";
import { getProposalStatus } from "../../utils/governance";

const ProposalResult: React.FC<any> = ({ proposal, isOpen }) => {
  const { color } = useContext(ThemeContext);
  const minVotes = proposal && hexToUnit(proposal.minVotes, 16);
  const minAgreement = proposal && hexToUnit(proposal.minAgreement, 16);
  const currentVoted =
    proposal && proposal.votedWeightRatio && proposal.votedWeightRatio / 10;
  const options = proposal && proposal.options;
  const optionStates =
    proposal &&
    proposal.optionStates.map((option: any, index: number) => {
      return {
        option: options[index],
        agreement: hexToUnit(option.agreement),
        agreementRatio: hexToUnit(option.agreementRatio, 16),
        optionId: formatHexToInt(option.optionId),
        votes: hexToUnit(option.votes),
      };
    });

  return (
    <ContentBox style={{ flex: 3 }}>
      <Column style={{ width: "100%" }}>
        <Row style={{ justifyContent: "space-between" }}>
          <Heading2>Total Votes</Heading2>
          <Row style={{ alignItems: "center", gap: ".5rem" }}>
            <Heading2>{currentVoted}%</Heading2>
            <Typo1 style={{ color: color.greys.grey(), fontWeight: "bold" }}>
              (min. {minVotes}%)
            </Typo1>
          </Row>
        </Row>
        <Spacer />
        <ContentBox padding="1rem" style={{ backgroundColor: "#172641" }}>
          <Column style={{ width: "100%" }}>
            <Row
              style={{
                justifyContent: "space-between",
                borderBottom: "2px solid #202F49",
              }}
            >
              <Typo2 style={{ color: color.greys.grey(), fontWeight: "bold" }}>
                Option
              </Typo2>
              <Typo2 style={{ color: color.greys.grey(), fontWeight: "bold" }}>
                Agreement (min. {minAgreement}%)
              </Typo2>
            </Row>
            <Spacer />
            {optionStates &&
              optionStates.map((optionState: any) => {
                return (
                  <Row
                    key={`option-result-${optionState.optionId}`}
                    style={{
                      justifyContent: "space-between",
                      paddingTop: "1rem",
                    }}
                  >
                    <Typo2 style={{ fontWeight: "bold" }}>
                      {optionState.option}
                    </Typo2>
                    <Typo2 style={{ fontWeight: "bold" }}>
                      {optionState.agreementRatio.toFixed(1)}%
                    </Typo2>
                  </Row>
                );
              })}
          </Column>
        </ContentBox>
        <Spacer size="xl" />
        <Heading2
          style={{
            marginTop: "auto",
            marginBottom: ".6rem",
            textAlign: "center",
          }}
        >
          {isOpen ? getProposalStatus(proposal?.state.status) : "Voting closed"}
        </Heading2>
      </Column>
    </ContentBox>
  );
};

export default ProposalResult;
