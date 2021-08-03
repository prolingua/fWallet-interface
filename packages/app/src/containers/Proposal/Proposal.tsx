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
import styled, { ThemeContext } from "styled-components";
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
  unitToWei,
} from "../../utils/conversion";
import vShape from "../../assets/img/shapes/vShape.png";
import SliderWithMarks from "../../components/Slider";
import { getProposalStatus, isProposalActive } from "../../utils/governance";
import { formatDate } from "../../utils/common";
import useTransaction from "../../hooks/useTransaction";
import useFantomContract, {
  GOV_TX_METHODS,
  SFC_TX_METHODS,
} from "../../hooks/useFantomContract";

const DelegationSelectRow: React.FC<any> = ({
  activeDelegation,
  proposal,
  isSelected,
}) => {
  const { color } = useContext(ThemeContext);
  const amountStaked =
    activeDelegation && hexToUnit(activeDelegation.delegation.amount);
  const formattedAmountStaked =
    amountStaked && toFormattedBalance(amountStaked);
  const delegationVoteKey = `vote_${parseInt(
    activeDelegation?.delegation.toStakerId
  )}`;
  const hasVoted =
    proposal &&
    activeDelegation &&
    proposal[delegationVoteKey].weight !== "0x0";

  return (
    <Row
      style={{
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <DelegationNameInfo delegationInfo={activeDelegation.delegationInfo} />
      <Row style={{ alignItems: "center" }}>
        {hasVoted && (
          <Row style={{ alignItems: "center" }}>
            <Typo3>Voted!</Typo3>
            <Spacer />
          </Row>
        )}
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
  proposal,
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
              <DelegationSelectRow
                activeDelegation={activeDelegation}
                proposal={proposal}
              />
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
  proposal,
}) => {
  return (
    <DropDownButton
      width="400px"
      DropDown={() =>
        DelegationSelect({
          activeDelegations,
          selectedDelegation,
          setSelectedDelegation,
          proposal,
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
            proposal={proposal}
            isSelected
          />
        )}
      </Button>
    </DropDownButton>
  );
};

const ProposalVote: React.FC<any> = ({
  selectedDelegation,
  proposalId,
  hasVoted,
  options,
  opinionScales,
  isOpen,
}) => {
  const [voteState, setVoteState] = useState([]);
  const { color } = useContext(ThemeContext);
  const { apiData } = useFantomApiData();

  const setVoteValue = (value: number, index: number) => {
    const newState = [...voteState];
    newState[index] = value;

    setVoteState(newState);
  };

  const { txGovContractMethod } = useFantomContract();
  const [txHash, setTxHash] = useState(null);
  const { transaction } = useTransaction();
  const tx = transaction[txHash];
  const isVotePending = tx && tx.status === "pending";
  const isVoteCompleted = tx && tx.status === "completed";

  const handleVote = async () => {
    try {
      const hash = await txGovContractMethod(GOV_TX_METHODS.vote, [
        selectedDelegation.delegationInfo.stakerAddress,
        parseInt(proposalId),
        voteState,
      ]);
      setTxHash(hash);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (options?.length && opinionScales?.length) {
      if (hasVoted?.length) {
        return setVoteState(hasVoted.map((vote: string) => parseInt(vote)));
      }
      return setVoteState(
        Array(options.length).fill(
          parseInt(opinionScales[Math.floor(opinionScales.length / 2)])
        )
      );
    }
  }, [options, opinionScales, hasVoted]);

  useEffect(() => {
    if (isVoteCompleted) {
      apiData[FantomApiMethods.getGovernanceProposal].refetch();
    }
  }, [transaction]);
  return (
    <ContentBox style={{ flex: 3 }}>
      <Column style={{ width: "100%", gap: "2rem" }}>
        {options &&
          options.map((option: any, index: number) => {
            return (
              <Column key={`option-vote-${option}`}>
                <Typo1
                  style={{ color: color.greys.grey(), fontWeight: "bold" }}
                >
                  {option}
                </Typo1>
                <Spacer />
                {opinionScales && (
                  <StyledSliderWrapper>
                    <SliderWithMarks
                      disabled={hasVoted?.length || !isOpen}
                      value={voteState[index]}
                      setValue={(value: number) => setVoteValue(value, index)}
                      max={parseInt(opinionScales[opinionScales.length - 1])}
                      markInPercentage={false}
                      markLabels={opinionScales.map((scale: string) =>
                        parseInt(scale)
                      )}
                      color={
                        hasVoted?.length || !isOpen
                          ? color.greys.grey(0.9)
                          : "white"
                      }
                      secondaryColor={color.greys.grey(0.5)}
                    />
                  </StyledSliderWrapper>
                )}
                <Spacer size="xxl" />
              </Column>
            );
          })}
        <Button
          style={{ marginTop: "auto" }}
          disabled={hasVoted?.length || !isOpen}
          variant="primary"
          onClick={handleVote}
        >
          {hasVoted?.length || isVoteCompleted
            ? "Already voted"
            : !isOpen
            ? "Voting ended"
            : isVotePending
            ? "Voting..."
            : "Vote"}
        </Button>
      </Column>
    </ContentBox>
  );
};

const StyledSliderWrapper = styled.div`
  .rc-slider-disabled {
    background-color: transparent !important;
  }
`;

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
            proposal={proposalResponse?.data?.govContract.proposal}
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
