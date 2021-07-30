import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useFantomApi, { FantomApiMethods } from "../../hooks/useFantomApi";
import useFantomApiData from "../../hooks/useFantomApiData";
import useWalletProvider from "../../hooks/useWalletProvider";
import Column from "../../components/Column";
import Row from "../../components/Row";
import {
  Button,
  Container,
  ContentBox,
  Heading1,
  Heading2,
  Heading3,
  OverlayButton,
  Typo1,
  Typo2,
  Typo3,
} from "../../components";
import DropDownButton from "../../components/DropDownButton";
import { ThemeContext } from "styled-components";
import Spacer from "../../components/Spacer";
import {
  delegatedToAddressesList,
  enrichAccountDelegationsWithStakerInfo,
  getAccountDelegations,
  getDelegations,
} from "../../utils/delegations";
import { DelegationNameInfo } from "../../components/DelegationBalance/DelegationBalance";
import {
  formatHexToInt,
  hexToUnit,
  toFormattedBalance,
} from "../../utils/conversion";
import vShape from "../../assets/img/shapes/vShape.png";
import SliderWithMarks from "../../components/Slider";
import { getProposalStatus } from "../../utils/governance";
import { formatDate } from "../../utils/common";

const DelegationSelectRow: React.FC<any> = ({
  activeDelegation,
  isSelected,
}) => {
  const { color } = useContext(ThemeContext);
  const amountStaked =
    activeDelegation && hexToUnit(activeDelegation.delegation.amount);
  const formattedAmountStaked =
    amountStaked && toFormattedBalance(amountStaked);
  return (
    <Row
      style={{
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <DelegationNameInfo delegationInfo={activeDelegation.delegationInfo} />
      <Row>
        <Typo3
          style={{ color: color.greys.grey() }}
        >{`${formattedAmountStaked[0]} votes`}</Typo3>
        {isSelected && (
          <img
            alt=""
            src={vShape}
            style={{ alignSelf: "center", paddingLeft: ".5rem" }}
          />
        )}
      </Row>
    </Row>
  );
};
const DelegationSelect: React.FC<any> = ({
  activeDelegations,
  selectedDelegation,
  setSelectedDelegation,
  handleClose,
}) => {
  const unselectedDelegations = activeDelegations.filter(
    (activeDelegation: any) =>
      activeDelegation.delegation.toStakerId !==
      selectedDelegation.delegation.toStakerId
  );
  return (
    <Container padding="1rem">
      <Column style={{ gap: ".5rem" }}>
        {unselectedDelegations.map((activeDelegation: any, index: number) => {
          const isFirst = index === 0;
          return (
            <OverlayButton
              style={{
                borderTop: !isFirst && "2px solid #202F49",
                paddingTop: !isFirst && ".5rem",
              }}
              key={`delegation-select-${index}`}
              onClick={() => setSelectedDelegation(activeDelegation)}
            >
              <DelegationSelectRow activeDelegation={activeDelegation} />
            </OverlayButton>
          );
        })}
      </Column>
    </Container>
  );
};
const DelegationSelector: React.FC<any> = ({
  activeDelegations,
  selectedDelegation,
  setSelectedDelegation,
}) => {
  return (
    <DropDownButton
      width="400px"
      DropDown={() =>
        DelegationSelect({
          activeDelegations,
          selectedDelegation,
          setSelectedDelegation,
        })
      }
      dropdownWidth={400}
      dropdownTop={70}
    >
      <Button
        variant="secondary"
        style={{
          display: "flex",
          alignItems: "center",
          fontWeight: "bold",
          width: "25rem",
          height: "56px",
        }}
      >
        {!selectedDelegation ? (
          "No active delegations"
        ) : (
          <DelegationSelectRow
            activeDelegation={selectedDelegation}
            isSelected
          />
        )}
      </Button>
    </DropDownButton>
  );
};

const ProposalVote: React.FC<any> = ({ hasVoted, options, opinionScales }) => {
  const [voteState, setVoteState] = useState([]);
  const { color } = useContext(ThemeContext);

  const setVoteValue = (value: number, index: number) => {
    const newState = [...voteState];
    newState[index] = value;

    setVoteState(newState);
  };

  useEffect(() => {
    if (options?.length && opinionScales?.length) {
      setVoteState(
        Array(options.length).fill(
          parseInt(opinionScales[Math.floor(opinionScales.length / 2)])
        )
      );
    }
  }, [options, opinionScales]);
  return (
    <ContentBox style={{ flex: 3 }}>
      <Column style={{ width: "100%", gap: "2rem" }}>
        {options &&
          options.map((option: any, index: number) => {
            return (
              <Column>
                <Typo1
                  style={{ color: color.greys.grey(), fontWeight: "bold" }}
                >
                  {option}
                </Typo1>
                <Spacer />
                {opinionScales && (
                  <SliderWithMarks
                    value={voteState[index]}
                    setValue={(value: number) => setVoteValue(value, index)}
                    max={parseInt(opinionScales[opinionScales.length - 1])}
                    markInPercentage={false}
                    markLabels={opinionScales.map((scale: string) =>
                      parseInt(scale)
                    )}
                    color="white"
                    secondaryColor={color.greys.grey(0.5)}
                  />
                )}
                <Spacer size="xxl" />
              </Column>
            );
          })}
        <Button
          style={{ marginTop: "auto" }}
          disabled={hasVoted}
          variant="primary"
        >
          {hasVoted ? "Already voted" : "Vote"}
        </Button>
      </Column>
    </ContentBox>
  );
};

const ProposalResult: React.FC<any> = ({ proposal }) => {
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
                paddingBottom: "1rem",
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
                    style={{
                      justifyContent: "space-between",
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
            marginBottom: "1rem",
            textAlign: "center",
          }}
        >
          {getProposalStatus(proposal?.state.status)}
        </Heading2>
      </Column>
    </ContentBox>
  );
};
const ProposalOverview: React.FC<any> = ({ proposal, selectedDelegation }) => {
  const { color } = useContext(ThemeContext);
  const delegationVoteKey = `vote_${parseInt(
    selectedDelegation?.delegation.toStakerId
  )}`;
  const hasVoted =
    proposal &&
    selectedDelegation &&
    proposal[delegationVoteKey].weight !== "0x0";
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
          hasVoted={hasVoted}
          options={proposal?.options}
          opinionScales={proposal?.opinionScales}
        />
        <ProposalResult proposal={proposal} />
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

const Proposal: React.FC<any> = () => {
  const { color } = useContext(ThemeContext);
  const { id }: any = useParams();
  const { apiData } = useFantomApiData();
  const { walletContext } = useWalletProvider();
  const [selectedDelegation, setSelectedDelegation] = useState(null);
  const [activeDelegations, setActiveDelegations] = useState([]);

  const activeAddress = walletContext.activeWallet.address.toLowerCase();
  const delegationsResponse = apiData[FantomApiMethods.getDelegations];
  const accountDelegationsResponse = apiData[
    FantomApiMethods.getDelegationsForAccount
  ].get(activeAddress);
  const proposalResponse = apiData[FantomApiMethods.getGovernanceProposal];

  // TODO hardcoded address for governance contract
  useFantomApi(
    FantomApiMethods.getGovernanceProposal,
    {
      address: "0xaa3a160e91f63f1db959640e0a7b8911b6bd5b95",
      from: walletContext.activeWallet.address,
      id: id,
    },
    null,
    null,
    [
      activeAddress,
      delegatedToAddressesList(accountDelegationsResponse, delegationsResponse),
    ]
  );
  useFantomApi(
    FantomApiMethods.getDelegationsForAccount,
    {
      address: activeAddress,
    },
    activeAddress
  );
  useFantomApi(FantomApiMethods.getDelegations);

  useEffect(() => {
    if (accountDelegationsResponse?.data && delegationsResponse?.data) {
      const accountDelegations = getAccountDelegations(
        accountDelegationsResponse.data
      );
      const delegations = getDelegations(delegationsResponse.data);
      const enrichedDelegations = enrichAccountDelegationsWithStakerInfo(
        accountDelegations,
        delegations
      );
      setActiveDelegations(enrichedDelegations);
      setSelectedDelegation(enrichedDelegations[0] || null);
    }
  }, [accountDelegationsResponse, delegationsResponse]);

  return (
    <Column>
      <Row>
        <Column>
          <Typo1 style={{ color: color.greys.grey() }}>Select delegation</Typo1>
          <Spacer size="sm" />
          <DelegationSelector
            activeDelegations={activeDelegations}
            selectedDelegation={selectedDelegation}
            setSelectedDelegation={setSelectedDelegation}
          />
        </Column>
      </Row>
      <Spacer size="xl" />
      <ProposalOverview
        proposal={proposalResponse?.data?.govContract.proposal}
        selectedDelegation={selectedDelegation}
      />
    </Column>
  );
};

export default Proposal;
