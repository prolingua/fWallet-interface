import React, { useContext, useEffect, useState } from "react";
// @ts-ignore
import { addresses } from "@f-wallet/contracts";
import { ThemeContext } from "styled-components";
import {
  getAccountDelegations,
  getAccountDelegationSummary,
  getDelegations,
} from "../../utils/delegations";
import {
  formatHexToBN,
  hexToUnit,
  toFormattedBalance,
  unitToWei,
  weiToUnit,
} from "../../utils/conversion";
import useFantomContract, {
  STAKE_TOKENIZER_TX_METHODS,
} from "../../hooks/useFantomContract";
import StatPair from "../../components/StatPair";
import useTransaction from "../../hooks/useTransaction";
import Row from "../../components/Row";
import { DelegationNameInfo } from "../../components/DelegationBalance/DelegationBalance";
import {
  Button,
  ContentBox,
  Heading1,
  OverlayButton,
  Typo1,
  Typo2,
  Typo3,
} from "../../components";
import Modal from "../../components/Modal";
import ModalTitle from "../../components/ModalTitle";
import ModalContent from "../../components/ModalContent";
import Spacer from "../../components/Spacer";
import useFantomERC20 from "../../hooks/useFantomERC20";
import { BigNumber } from "@ethersproject/bignumber";
import config from "../../config/config.test";
import useModal from "../../hooks/useModal";
import Column from "../../components/Column";

const LiquidStakingContent: React.FC<any> = ({ accountDelegationsData }) => {
  const totalDelegated = getAccountDelegationSummary(accountDelegationsData);
  const mintedSFTM = toFormattedBalance(
    weiToUnit(totalDelegated.totalMintedSFTM)
  );
  return (
    <StatPair
      title="Minted sFTM"
      value1={mintedSFTM[0]}
      value2={mintedSFTM[1]}
      suffix="FTM"
      spacer="xs"
      titleColor="#19E1FF"
    />
  );
};

const MintSFTMRow: React.FC<any> = ({ activeDelegation }) => {
  const { color } = useContext(ThemeContext);
  const { txStakeTokenizerContractMethod } = useFantomContract();
  const lockedFTM = activeDelegation.delegation.isDelegationLocked
    ? hexToUnit(activeDelegation.delegation.lockedAmount)
    : 0;
  const formattedLockedFTM = toFormattedBalance(lockedFTM);
  const mintableSFTM = activeDelegation.delegation.isDelegationLocked
    ? weiToUnit(
        formatHexToBN(activeDelegation.delegation.amount).sub(
          formatHexToBN(activeDelegation.delegation.outstandingSFTM)
        )
      )
    : 0;
  const formattedMintableSFTM = toFormattedBalance(mintableSFTM);

  const [txHash, setTxHash] = useState(null);
  const { transaction } = useTransaction();
  const tx = transaction[txHash];
  const isMinting = tx && tx.status === "pending";
  const minted = tx && tx.status === "completed";

  const handleMintSFTM = async () => {
    try {
      const hash = await txStakeTokenizerContractMethod(
        STAKE_TOKENIZER_TX_METHODS.mintSFTM,
        [activeDelegation.delegation.toStakerId]
      );
      setTxHash(hash);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Row style={{ textAlign: "left", height: "3rem", padding: ".5rem 0" }}>
      <Row style={{ width: "18rem", alignItems: "center" }}>
        <DelegationNameInfo
          delegationInfo={activeDelegation.delegationInfo}
          imageSize="32px"
        />
      </Row>
      <Row style={{ width: "12rem", alignItems: "center" }}>
        <Typo1 style={{ fontWeight: "bold" }}>
          {`${formattedLockedFTM[0]}${formattedLockedFTM[1]}`} FTM
        </Typo1>
      </Row>
      <Row style={{ width: "10rem", alignItems: "center" }}>
        <Typo1 style={{ fontWeight: "bold" }}>
          {minted
            ? "0.00"
            : `${formattedMintableSFTM[0]}${formattedMintableSFTM[1]}`}{" "}
          FTM
        </Typo1>
      </Row>
      <Row
        style={{
          marginLeft: "auto",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <OverlayButton
          disabled={minted || isMinting || mintableSFTM < 0.01}
          onClick={() => handleMintSFTM()}
        >
          <Typo1
            style={{
              fontWeight: "bold",
              color:
                minted || mintableSFTM < 0.01
                  ? color.primary.cyan(0.5)
                  : color.primary.cyan(),
            }}
          >
            {minted ? "Minted" : isMinting ? "Minting..." : "Mint sFTM"}
          </Typo1>
        </OverlayButton>
      </Row>
    </Row>
  );
};

const MintSFTMModal: React.FC<any> = ({
  onDismiss,
  accountDelegationsData,
  delegationsData,
}) => {
  const { color } = useContext(ThemeContext);
  const accountDelegations = getAccountDelegations(accountDelegationsData);
  const delegations = getDelegations(delegationsData);
  const activeDelegations = !(delegations && accountDelegations)
    ? []
    : accountDelegations.map((accountDelegation: any) => ({
        ...accountDelegation,
        delegationInfo: delegations.find((delegation: any) => {
          return delegation.id === accountDelegation.delegation.toStakerId;
        }),
      }));

  return (
    <Modal onDismiss={onDismiss}>
      <ModalTitle text="Mint sFTM" />
      <ModalContent>
        <Row style={{ textAlign: "left" }}>
          <Typo3
            style={{
              width: "18rem",
              color: color.greys.grey(),
            }}
          >
            Validator
          </Typo3>
          <Typo3 style={{ width: "12rem", color: color.greys.grey() }}>
            Locked FTM
          </Typo3>
          <Typo3 style={{ width: "10rem", color: color.greys.grey() }}>
            Mintable sFTM
          </Typo3>
          <div style={{ width: "5rem" }} />
        </Row>
        <Spacer size="sm" />
        {activeDelegations.map((activeDelegation, index) => {
          const isLastRow = activeDelegation.length === index + 1;
          return (
            <div
              key={`mint-sftm-row-${activeDelegation.delegation.toStakerId}`}
              style={{
                borderBottom: !isLastRow && "2px solid #202F49",
              }}
            >
              <MintSFTMRow activeDelegation={activeDelegation} />
            </div>
          );
        })}
        <Spacer size="sm" />
      </ModalContent>
    </Modal>
  );
};

const RepaySFTMRow: React.FC<any> = ({
  activeDelegation,
  hasAllowance,
  isApproving,
  approveSpending,
}) => {
  const { color } = useContext(ThemeContext);
  const { txStakeTokenizerContractMethod } = useFantomContract();

  const mintedSFTMinWei = formatHexToBN(
    activeDelegation.delegation.outstandingSFTM
  );
  const mintedSFTM = weiToUnit(mintedSFTMinWei);
  const formattedMintedSFTM = toFormattedBalance(mintedSFTM);

  const [txHash, setTxHash] = useState(null);
  const { transaction } = useTransaction();
  const tx = transaction[txHash];
  const isRepaid = tx && tx.status === "completed";
  const isRepaying = tx && tx.status === "pending";

  const handleRepaySFTM = async () => {
    try {
      const hash = await txStakeTokenizerContractMethod(
        STAKE_TOKENIZER_TX_METHODS.redeemSFTM,
        [activeDelegation.delegation.toStakerId, mintedSFTMinWei]
      );
      setTxHash(hash);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Row style={{ textAlign: "left", height: "3rem", padding: ".5rem 0" }}>
      <Row style={{ width: "18rem", alignItems: "center" }}>
        <DelegationNameInfo
          delegationInfo={activeDelegation.delegationInfo}
          imageSize="32px"
        />
      </Row>
      <Row style={{ width: "10rem", alignItems: "center" }}>
        <Typo1 style={{ fontWeight: "bold" }}>
          {isRepaid
            ? "0.00"
            : `${formattedMintedSFTM[0]}${formattedMintedSFTM[1]}`}{" "}
          FTM
        </Typo1>
      </Row>
      <Row
        style={{
          marginLeft: "auto",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        {hasAllowance ? (
          <OverlayButton
            disabled={isRepaid || isRepaying || mintedSFTM < 0.01}
            onClick={() => handleRepaySFTM()}
          >
            <Typo1
              style={{
                fontWeight: "bold",
                color:
                  isRepaid || mintedSFTM < 0.01
                    ? color.primary.cyan(0.5)
                    : color.primary.cyan(),
              }}
            >
              {isRepaid ? "Repaid" : isRepaying ? "Repaying..." : "Repay sFTM"}
            </Typo1>
          </OverlayButton>
        ) : (
          <OverlayButton
            disabled={isApproving}
            onClick={() => approveSpending()}
          >
            <Typo1
              style={{
                fontWeight: "bold",
                color: isApproving
                  ? color.primary.cyan(0.5)
                  : color.primary.cyan(),
              }}
            >
              {isApproving ? "Approving..." : "Approve"}
            </Typo1>
          </OverlayButton>
        )}
      </Row>
    </Row>
  );
};

const RepaySFTMModal: React.FC<any> = ({
  onDismiss,
  accountDelegationsData,
  delegationsData,
}) => {
  const { color } = useContext(ThemeContext);
  const { getAllowance, approve } = useFantomERC20();
  const [allowance, setAllowance] = useState(BigNumber.from(0));
  const [isApproving, setIsApproving] = useState(false);
  const accountDelegations = getAccountDelegations(accountDelegationsData);
  const delegations = getDelegations(delegationsData);
  const activeDelegations = !(delegations && accountDelegations)
    ? []
    : accountDelegations.map((accountDelegation: any) => ({
        ...accountDelegation,
        delegationInfo: delegations.find((delegation: any) => {
          return delegation.id === accountDelegation.delegation.toStakerId;
        }),
      }));
  const totalDelegated = getAccountDelegationSummary(accountDelegationsData);
  const mintedSFTM = weiToUnit(totalDelegated.totalMintedSFTM);

  const handleApprove = async () => {
    setIsApproving(true);
    await approve(
      addresses[parseInt(config.chainId)].tokens.SFTM,
      addresses[parseInt(config.chainId)]["stakeTokenizer"]
    );
    setIsApproving(false);
  };

  useEffect(() => {
    getAllowance(
      addresses[parseInt(config.chainId)].tokens.SFTM,
      addresses[parseInt(config.chainId)]["stakeTokenizer"]
    ).then((result) => {
      setAllowance(result);
    });
  }, [accountDelegationsData, isApproving]);

  return (
    <Modal onDismiss={onDismiss}>
      <ModalTitle text="Repay sFTM" />
      <ModalContent>
        <Row style={{ textAlign: "left" }}>
          <Typo3
            style={{
              width: "18rem",
              color: color.greys.grey(),
            }}
          >
            Validator
          </Typo3>
          <Typo3 style={{ width: "12rem", color: color.greys.grey() }}>
            Minted sFTM
          </Typo3>
          <div style={{ width: "5rem" }} />
        </Row>
        <Spacer size="sm" />
        {activeDelegations
          .filter(
            (activeDelegation) =>
              parseInt(activeDelegation.delegation.outstandingSFTM) > 0
          )
          .map((activeDelegationWithLoan, index) => {
            const isLastRow = activeDelegationWithLoan.length === index + 1;
            return (
              <div
                key={`mint-sftm-row-${activeDelegationWithLoan.delegation.toStakerId}`}
                style={{
                  borderBottom: !isLastRow && "2px solid #202F49",
                }}
              >
                <RepaySFTMRow
                  activeDelegation={activeDelegationWithLoan}
                  approveSpending={handleApprove}
                  isApproving={isApproving}
                  hasAllowance={allowance.gt(
                    BigNumber.from(unitToWei(mintedSFTM.toString()))
                  )}
                />
              </div>
            );
          })}
        <Spacer size="sm" />
      </ModalContent>
    </Modal>
  );
};

const LiquidStaking: React.FC<any> = ({
  loading,
  accountDelegations,
  delegations,
}) => {
  const [onPresentMintSFTMModal] = useModal(
    <MintSFTMModal
      accountDelegationsData={accountDelegations?.data}
      delegationsData={delegations?.data}
    />,
    "mint-sFTM-modal"
  );
  const [onPresentRepaySFTMModal] = useModal(
    <RepaySFTMModal
      accountDelegationsData={accountDelegations?.data}
      delegationsData={delegations?.data}
    />,
    "mint-sFTM-modal"
  );
  return (
    <ContentBox style={{ flex: 1 }}>
      <Column>
        <Heading1>Liquid Staking</Heading1>
        <Spacer />
        <Typo2 style={{ color: "#B7BECB" }}>
          Mint sFTM and use it as collateral in Fantom Finance.
        </Typo2>
        <Spacer />
        <Column style={{ marginTop: "auto", width: "100%" }}>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <LiquidStakingContent
              accountDelegationsData={accountDelegations.data}
            />
          )}
          <Spacer />
          <Button onClick={() => onPresentMintSFTMModal()} variant="primary">
            Mint sFTM
          </Button>
          <Spacer size="sm" />
          <Button
            onClick={() => onPresentRepaySFTMModal()}
            style={{ backgroundColor: "#202F49" }}
            variant="primary"
          >
            Repay sFTM
          </Button>
        </Column>
      </Column>
    </ContentBox>
  );
};

export default LiquidStaking;
