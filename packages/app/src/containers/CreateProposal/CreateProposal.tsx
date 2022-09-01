import React, { useContext, useEffect, useState } from "react";
import InputTextBox from "../../components/InputText/InputTextBox";
import { Button, Heading3, OverlayButton, Typo2 } from "../../components";
import styled, { ThemeContext } from "styled-components";
import CrossSymbol from "../../assets/img/symbols/Cross.svg";
import SliderWithMarks from "../../components/Slider";
import Spacer from "../../components/Spacer";
import InputInteger from "../../components/InputInteger/InputInteger";
import InputError from "../../components/InputError";
import { unitToWei } from "../../utils/conversion";
import useFantomContract, {
  GOV_PROPOSAL_FACTORY_TX_METHODS,
} from "../../hooks/useFantomContract";
import useTransaction from "../../hooks/useTransaction";
import { formatBytes32String } from "@ethersproject/strings";
import { useHistory } from "react-router-dom";
import FadeInOut from "../../components/AnimationFade";
import backArrowSymbol from "../../assets/img/symbols/BackArrow.svg";
import ErrorBoundary from "../../components/ErrorBoundary";
import { Column, Row } from "../../components/Grid/Grid";
import { CategorySwitch } from "../Governance/Governance";
import openOrClose from "../../assets/img/shapes/vShape.png";
import { parseEther } from "@ethersproject/units";
import config from "../../config/config";
// @ts-ignore
import { addresses } from "@f-wallet/contracts";

const NetworkParametersDropdown: React.FC<any> = ({
  placeholder,
  list,
  current,
  setCurrent,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleSelect = (value: string) => {
    setCurrent(value);
    setIsOpen(false);
  };

  return (
    <div>
      <StyledDropdownWrapper>
        <StyledDropdownButton type="button" onClick={() => setIsOpen(!isOpen)}>
          <StyledDropdownTitle style={{ color: current ? "white" : "#757575" }}>
            {current || placeholder}
          </StyledDropdownTitle>
          {isOpen ? (
            <img src={openOrClose} style={{ transform: "rotate(180deg)" }} />
          ) : (
            <img src={openOrClose} style={{ transform: "rotate(0deg)" }} />
          )}
        </StyledDropdownButton>
        {isOpen && (
          <StyledDropdownList>
            {list.map((item: string) => (
              <StyledDropdownItem
                type="button"
                key={item}
                onClick={() => handleSelect(item)}
                style={{ fontWeight: current === item ? "bold" : "normal" }}
              >
                {item}
              </StyledDropdownItem>
            ))}
          </StyledDropdownList>
        )}
      </StyledDropdownWrapper>
    </div>
  );
};

const StyledDropdownWrapper = styled.div`
  position: relative;
  font-size: 1.6rem;
  user-select: none;
`;
const StyledDropdownButton = styled.button`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  position: relative;
  cursor: pointer;
  background: #202f49;
  border-radius: 8px;
  border: none;
  padding: 16px;
  outline: none;
  margin-bottom: 2px;
`;
const StyledDropdownTitle = styled.div`
  color: #ffffff;
  font-style: normal;
  font-weight: normal;
  font-size: 18px;
  line-height: 24px;
`;
const StyledDropdownList = styled.div`
  position: absolute;
  border-radius: 8px;
  z-index: 10;
  width: 100%;
  max-height: 215px;
  font-weight: 300;
  text-align: left;
  -webkit-overflow-scrolling: touch;
`;
const StyledDropdownItem = styled.button`
  background-color: #202f49;
  border: none;
  border-bottom: 2px solid #0a162e;
  padding: 16px;
  font-style: normal;
  font-weight: normal;
  font-size: 18px;
  line-height: 24px;
  color: #ffffff;
  display: inline-block;
  overflow: hidden;
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
`;

const CreateProposal: React.FC<any> = () => {
  const { color } = useContext(ThemeContext);
  const history = useHistory();
  const { txGovProposalFactoryContractMethod } = useFantomContract();
  const [proposalName, setProposalName] = useState("");
  const [networkParameter, setNetworkParameter] = useState("");
  const [proposalDescription, setProposalDescription] = useState("");
  const [numVotingOptions, setNumVotingOptions] = useState(1);
  const [votingOptions, setVotingOptions] = useState([]);
  const [minParticipation, setMinParticipation] = useState(66);
  const [minAgreement, setMinAgreement] = useState(66);
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
      const hash = await txGovProposalFactoryContractMethod(
        GOV_PROPOSAL_FACTORY_TX_METHODS.createPlainTextProposal,
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

  const handleCreateNetworkProposal = async () => {
    let minVoteAmount = unitToWei(minParticipation.toString(), 16);
    let minAgreeAmount = unitToWei(minAgreement.toString(), 16);
    console.log(addresses[parseInt(config.chainId)]["govProposalTemplate"]);
    try {
      const hash = await txGovProposalFactoryContractMethod(
        GOV_PROPOSAL_FACTORY_TX_METHODS.createNetworkProposal,
        [
          proposalName,
          proposalDescription,
          votingOptions.map((option) => formatBytes32String(option)),
          minVoteAmount,
          minAgreeAmount,
          startInHours * 3600,
          endMinimumInDays * 24 * 3600,
          endMaximumInDays * 24 * 3600,
          addresses[parseInt(config.chainId)]["govProposalTemplate"],
          networkParameter,
          votingOptions.map((option) => parseEther(option)),
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
      timeout = setTimeout(() => history.push("/governance"), 1000);
    }

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProposalCompleted]);

  const [proposalType, setProposalType] = useState("Plain");
  return (
    <ErrorBoundary name="[Governance][Create]">
      <FadeInOut>
        <OverlayButton
          style={{ zIndex: 1, alignSelf: "start" }}
          onClick={() => history.goBack()}
        >
          <img alt="" src={backArrowSymbol} />
        </OverlayButton>
        <Spacer />
        <Typo2 style={{ fontWeight: "bold", color: color.greys.grey() }}>
          Proposal type
        </Typo2>
        <Spacer size="xs" />
        <CategorySwitch
          categories={["Plain", "Network"]}
          setActiveCategory={setProposalType}
          activeCategory={proposalType}
        />
        <Row
          flipDirectionLTE="md"
          style={{ columnGap: "5rem", marginTop: "2rem" }}
        >
          <Column style={{ flex: 1 }}>
            <InputTextBox
              key="name-input"
              title="Name of the proposal"
              text={proposalName}
              setText={setProposalName}
              placeholder="Enter a name for your proposal"
              valueName="name"
            />
            {proposalType === "Network" && (
              <>
                <Typo2
                  style={{ fontWeight: "bold", color: color.greys.grey() }}
                >
                  Network parameter
                </Typo2>
                <Spacer size="xs" />
                <NetworkParametersDropdown
                  placeholder="Select Network Parameter Option"
                  list={[
                    "setMaxDelegation(uint256)",
                    "setMinSelfStake(uint256)",
                    "setValidatorCommission(uint256)",
                    "setContractCommission(uint256)",
                    "setUnlockedRewardRatio(uint256)",
                    "setMinLockupDuration(uint256)",
                    "setMaxLockupDuration(uint256)",
                    "setWithdrawalPeriodEpoch(uint256)",
                    "setWithdrawalPeriodTime(uint256)",
                  ]}
                  current={networkParameter}
                  setCurrent={setNetworkParameter}
                />
                <Spacer />
              </>
            )}
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
                min={66}
                max={90}
                steps={1}
                markPoints={[66, 90]}
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
                min={66}
                max={90}
                steps={1}
                markPoints={[66, 90]}
                markPointsAbsolute
                railColor="#202F49"
                tooltip
                tooltipColor={color.primary.fantomBlue()}
                tooltipTextColor="white"
              />
            </div>
            <Spacer size="xl" />
            <Spacer size="lg" />
            <Row
              style={{
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
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
              onClick={
                proposalType === "Plain"
                  ? handleCreatePlainTextProposal
                  : handleCreateNetworkProposal
              }
              disabled={
                !isValidProposal() || isProposalPending || isProposalCompleted
              }
              variant="primary"
            >
              {isProposalCompleted
                ? "Success!"
                : isProposalPending
                ? "Creating..."
                : `Create ${
                    proposalType === "Plain" ? "" : "Network"
                  } Proposal`}
            </Button>
            <Spacer size="xs" />
            <Typo2
              style={{
                fontWeight: "bold",
                color: color.greys.grey(),
                textAlign: "center",
              }}
            >
              {`Proposal fee: ${proposalType === "Plain" ? "1" : "1"} FTM`}
            </Typo2>
          </Column>
        </Row>
        <Spacer />
      </FadeInOut>
    </ErrorBoundary>
  );
};

export default CreateProposal;
