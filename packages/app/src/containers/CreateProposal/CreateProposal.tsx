import React, { useContext, useEffect, useState } from "react";
import Row from "../../components/Row";
import Column from "../../components/Column";
import InputTextBox from "../../components/InputText/InputTextBox";
import { Button, Heading3, OverlayButton, Typo2 } from "../../components";
import { ThemeContext } from "styled-components";
import CrossSymbol from "../../assets/img/symbols/Cross.svg";
import SliderWithMarks from "../../components/Slider";
import Spacer from "../../components/Spacer";
import InputInteger from "../../components/InputInteger/InputInteger";
import InputError from "../../components/InputError";
import { unitToWei } from "../../utils/conversion";
import useFantomContract, {
  GOV_PROPOSAL_PLAINTEXT_TX_METHODS,
} from "../../hooks/useFantomContract";
import useTransaction from "../../hooks/useTransaction";
import { formatBytes32String } from "@ethersproject/strings";
import { useHistory } from "react-router-dom";
import FadeInOut from "../../components/AnimationFade";
import backArrowSymbol from "../../assets/img/symbols/BackArrow.svg";

const CreateProposal: React.FC<any> = () => {
  const { color } = useContext(ThemeContext);
  const history = useHistory();
  const { txGovProposalPlaintextContractMethod } = useFantomContract();
  const [proposalName, setProposalName] = useState("");
  const [proposalDescription, setProposalDescription] = useState("");
  const [numVotingOptions, setNumVotingOptions] = useState(1);
  const [votingOptions, setVotingOptions] = useState([]);
  const [minParticipation, setMinParticipation] = useState(55);
  const [minAgreement, setMinAgreement] = useState(55);
  const [startInHours, setStartInHours] = useState(1);
  const [endMinimumInDays, setEndMinimumInDays] = useState(7);
  const [endMaximumInDays, setEndMaximumInDays] = useState(7);
  const [proposalTimeErrors, setProposalTimeErrors] = useState([
    null,
    null,
    null,
    null,
  ]);

  const handleSetVotingOption = (value: string, index: number) => {
    const updatedVotingOptions = votingOptions;
    updatedVotingOptions[index] = value;
    setVotingOptions([...updatedVotingOptions]);
  };

  const handleRemoveVotingOption = (index: number) => {
    setNumVotingOptions(numVotingOptions - 1);
    const updatedVotingOptions = votingOptions;
    updatedVotingOptions.splice(index, 1);

    setVotingOptions([...updatedVotingOptions]);
  };

  const handleProposalTimeErrors = (error: string, index: number) => {
    const updatedErrors = proposalTimeErrors;
    updatedErrors[index] = error;
    setProposalTimeErrors([...updatedErrors]);
  };

  const { transaction } = useTransaction();
  const [txHash, setTxHash] = useState(null);
  const tx = transaction[txHash];
  const isProposalPending = tx && tx.status === "pending";
  const isProposalCompleted = tx && tx.status === "completed";

  const handleCreatePlainTextProposal = async () => {
    let minVoteAmount = unitToWei(minParticipation.toString(), 16);
    let minAgreeAmount = unitToWei(minAgreement.toString(), 16);

    try {
      const hash = await txGovProposalPlaintextContractMethod(
        GOV_PROPOSAL_PLAINTEXT_TX_METHODS.create,
        [
          proposalName,
          proposalDescription,
          votingOptions.map((option) => formatBytes32String(option)),
          minVoteAmount,
          minAgreeAmount,
          startInHours * 3600,
          endMinimumInDays * 24 * 3600,
          endMaximumInDays * 24 * 3600,
        ]
      );
      setTxHash(hash);
    } catch (err) {
      console.error(err);
    }
  };

  const isValidProposal = () => {
    if (!proposalName) return false;
    if (!proposalDescription) return false;
    if (votingOptions.length !== numVotingOptions) return false;
    if (votingOptions.find((option) => option === "" || option === null))
      return false;
    if (proposalTimeErrors.find((error) => error !== null)) return false;

    return true;
  };

  useEffect(() => {
    if (
      parseInt(endMinimumInDays.toString(), 10) >
      parseInt(endMaximumInDays.toString(), 10)
    ) {
      return handleProposalTimeErrors(
        "[Ending in maximum] must be equal or greater than [Ending in minimum]",
        3
      );
    }
    return handleProposalTimeErrors(null, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endMinimumInDays, endMaximumInDays]);

  useEffect(() => {
    let timeout: any;
    if (isProposalCompleted) {
      timeout = setTimeout(() => history.push("governance"), 1000);
    }

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProposalCompleted]);

  return (
    <FadeInOut>
      <OverlayButton
        style={{ zIndex: 1, alignSelf: "start" }}
        onClick={() => history.goBack()}
      >
        <img alt="" src={backArrowSymbol} />
      </OverlayButton>
      <Row style={{ columnGap: "5rem", marginTop: "2rem" }}>
        <Column style={{ flex: 1 }}>
          <InputTextBox
            key="name-input"
            title="Name of the proposal"
            text={proposalName}
            setText={setProposalName}
            placeholder="Enter a name for your proposal"
            valueName="name"
          />
          <Spacer size="sm" />
          <InputTextBox
            title="Description"
            text={proposalDescription}
            setText={setProposalDescription}
            placeholder="Enter a description for your proposal"
            valueName="description"
            textArea
          />
          <Spacer size="sm" />
          {Array(numVotingOptions)
            .fill("Option")
            .map((option, index) => {
              return (
                <div
                  key={`option-input-${index}`}
                  style={{ position: "relative" }}
                >
                  <InputTextBox
                    title={index === 0 ? "Voting options" : null}
                    text={votingOptions[index] || ""}
                    setText={(value: string) =>
                      handleSetVotingOption(value, index)
                    }
                    maxLength={31}
                    placeholder="Input an option"
                  />
                  {index !== 0 && (
                    <OverlayButton
                      onClick={() => handleRemoveVotingOption(index)}
                      style={{
                        position: "absolute",
                        top: "2rem",
                        right: ".8rem",
                      }}
                    >
                      <img alt="" src={CrossSymbol} />
                    </OverlayButton>
                  )}
                </div>
              );
            })}
          <Spacer size="sm" />
          <OverlayButton
            onClick={() => setNumVotingOptions(numVotingOptions + 1)}
            style={{ textAlign: "unset" }}
          >
            <Heading3 style={{ color: color.primary.fantomBlue() }}>
              Add one more option
            </Heading3>
          </OverlayButton>
        </Column>
        <Column style={{ flex: 1 }}>
          <div>
            <Typo2 style={{ fontWeight: "bold", color: color.greys.grey() }}>
              Minimum participation
            </Typo2>
            <Spacer size="sm" />
            <SliderWithMarks
              value={minParticipation}
              setValue={setMinParticipation}
              min={55}
              max={90}
              steps={1}
              markPoints={[55, 90]}
              markPointsAbsolute
              railColor="#202F49"
              tooltip
              tooltipColor={color.primary.fantomBlue()}
              tooltipTextColor="white"
            />
          </div>
          <Spacer size="xl" />
          <Spacer size="lg" />
          <div>
            <Typo2 style={{ fontWeight: "bold", color: color.greys.grey() }}>
              Minimum agreement
            </Typo2>
            <Spacer size="sm" />
            <SliderWithMarks
              value={minAgreement}
              setValue={setMinAgreement}
              min={55}
              max={90}
              steps={1}
              markPoints={[55, 90]}
              markPointsAbsolute
              railColor="#202F49"
              tooltip
              tooltipColor={color.primary.fantomBlue()}
              tooltipTextColor="white"
            />
          </div>
          <Spacer size="xl" />
          <Spacer size="lg" />
          <Row style={{ justifyContent: "space-between" }}>
            <InputInteger
              title="Starts in"
              min={1}
              max={720}
              value={startInHours}
              setValue={setStartInHours}
              setError={(error: string) => handleProposalTimeErrors(error, 0)}
              valueName="hours"
            />
            <InputInteger
              title="Ending in mimimum"
              min={7}
              max={180}
              value={endMinimumInDays}
              setValue={setEndMinimumInDays}
              setError={(error: string) => handleProposalTimeErrors(error, 1)}
              valueName="days"
            />
            <InputInteger
              title="Ending in maximum"
              min={7}
              max={180}
              value={endMaximumInDays}
              setValue={setEndMaximumInDays}
              setError={(error: string) => handleProposalTimeErrors(error, 2)}
              valueName="days"
            />
          </Row>
          <Spacer />
          {proposalTimeErrors.map((error: string, index: number) => {
            if (error) {
              return (
                <InputError
                  key={`input-error-${index}`}
                  fontSize="18px"
                  error={error}
                />
              );
            }
            return <></>;
          })}
          <Spacer size="xl" />
          <Button
            onClick={handleCreatePlainTextProposal}
            disabled={
              !isValidProposal() || isProposalPending || isProposalCompleted
            }
            variant="primary"
          >
            {isProposalCompleted
              ? "Success!"
              : isProposalPending
              ? "Creating..."
              : "Create Proposal"}
          </Button>
          <Spacer size="xs" />
          <Typo2
            style={{
              fontWeight: "bold",
              color: color.greys.grey(),
              textAlign: "center",
            }}
          >
            Proposal fee: 100 FTM
          </Typo2>
        </Column>
      </Row>
    </FadeInOut>
  );
};

export default CreateProposal;
