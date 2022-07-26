import React, { useContext, useEffect, useState } from "react";
import styled, { ThemeContext } from "styled-components";
import useFantomApiData from "../../hooks/useFantomApiData";
import useFantomContract, {
  GOV_TX_METHODS,
} from "../../hooks/useFantomContract";
import useTransaction from "../../hooks/useTransaction";
import { FantomApiMethods } from "../../hooks/useFantomApi";
import { Button, ContentBox, Typo1 } from "../../components";
import Column from "../../components/Column";
import Spacer from "../../components/Spacer";
import SliderWithMarks from "../../components/Slider";

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
  const { txGovContractMethod } = useFantomContract();
  const { transaction } = useTransaction();
  const [voteTxHash, setVoteTxHash] = useState(null);
  const [cancelVoteTxHash, setCancelVoteTxHash] = useState(null);
  const voteTx = transaction[voteTxHash];
  const cancelVoteTx = transaction[cancelVoteTxHash];
  const isVotePending = voteTx && voteTx.status === "pending";
  const isVoteCompleted = voteTx && voteTx.status === "completed";
  const isCancelVotePending = cancelVoteTx && cancelVoteTx.status === "pending";
  const isCancelVoteCompleted =
    cancelVoteTx && cancelVoteTx.status === "completed";

  // const isUnchangedVote = () => {
  //   if (hasVoted?.length === voteState.length) {
  //     let isEqual = true;
  //     const result = hasVoted.forEach((vote: string, index: number) => {
  //       if (parseInt(vote) === voteState[index]) {
  //         return;
  //       }
  //       isEqual = false;
  //     });
  //
  //     return isEqual;
  //   }
  //   return true;
  // };

  const setVoteValue = (value: number, index: number) => {
    const newState = [...voteState];
    newState[index] = value;

    setVoteState(newState);
  };

  const handleVote = async () => {
    try {
      const hash = await txGovContractMethod(GOV_TX_METHODS.vote, [
        selectedDelegation.delegationInfo.stakerAddress,
        parseInt(proposalId),
        voteState,
      ]);
      setVoteTxHash(hash);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelVote = async () => {
    try {
      const hash = await txGovContractMethod(GOV_TX_METHODS.cancelVote, [
        selectedDelegation.delegationInfo.stakerAddress,
        parseInt(proposalId),
      ]);
      setCancelVoteTxHash(hash);
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
    if (isVoteCompleted || isCancelVoteCompleted) {
      apiData[FantomApiMethods.getGovernanceProposal].refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVoteCompleted, isCancelVoteCompleted]);

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
                    <Spacer size="xs" />
                    <SliderWithMarks
                      disabled={
                        !isOpen ||
                        hasVoted?.length ||
                        isVotePending ||
                        !selectedDelegation
                      }
                      value={voteState[index]}
                      setValue={(value: number) => setVoteValue(value, index)}
                      max={parseInt(opinionScales[opinionScales.length - 1])}
                      markInPercentage={false}
                      markLabels={opinionScales.map(
                        (scale: string, index: number) => `${index * 25}%`
                      )}
                      color={
                        !isOpen || hasVoted?.length
                          ? color.greys.grey(0.9)
                          : "white"
                      }
                      secondaryColor={color.greys.grey(0.5)}
                    />
                  </StyledSliderWrapper>
                )}
                <Spacer size="xl" />
              </Column>
            );
          })}
        {hasVoted?.length && isOpen ? (
          <Button
            style={{ marginTop: "auto" }}
            disabled={!hasVoted?.length || isCancelVotePending}
            variant="primary"
            onClick={handleCancelVote}
          >
            {isCancelVotePending ? "Cancelling..." : "Cancel vote"}
          </Button>
        ) : (
          <Button
            style={{ marginTop: "auto" }}
            disabled={!isOpen || isVotePending || !selectedDelegation}
            variant="primary"
            onClick={handleVote}
          >
            {!isOpen ? "Voting ended" : isVotePending ? "Voting..." : "Vote"}
          </Button>
        )}
      </Column>
    </ContentBox>
  );
};

const StyledSliderWrapper = styled.div`
  .rc-slider-disabled {
    background-color: transparent !important;
  }
`;

export default ProposalVote;
