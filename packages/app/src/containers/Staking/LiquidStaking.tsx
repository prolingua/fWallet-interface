import React, { useContext, useEffect, useState } from "react";
// @ts-ignore
import { addresses } from "@f-wallet/contracts";
import { ThemeContext } from "styled-components";
import {
  getAccountDelegations,
  getAccountDelegationSummary,
  getValidators,
  getValidatorsWithLockup,
} from "../../utils/delegation";
import {
  formatHexToBN,
  hexToUnit,
  toFormattedBalance,
  unitToWei,
  weiToUnit,
} from "../../utils/conversion";
import useFantomContract, {
  SFC_TX_METHODS,
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
  Heading2,
  Heading3,
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
import config from "../../config/config";
import useModal from "../../hooks/useModal";
import Column from "../../components/Column";
import { LockupFTMModal } from "./FluidRewards";
import useFantomApiData from "../../hooks/useFantomApiData";
import useWalletProvider from "../../hooks/useWalletProvider";
import { FantomApiMethods } from "../../hooks/useFantomApi";
import { getAccountAssets } from "../../utils/account";
import useSendTransaction from "../../hooks/useSendTransaction";

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
  const mintableSFTM = activeDelegation.delegation.isDelegationLocked
    ? weiToUnit(
        formatHexToBN(activeDelegation.delegation.lockedAmount).sub(
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
      <Row style={{ width: "15rem", alignItems: "center" }}>
        <DelegationNameInfo
          delegationInfo={activeDelegation.delegationInfo}
          imageSize="32px"
          id={activeDelegation.delegation.toStakerId}
        />
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

const ManageSFTMOverview: React.FC<any> = ({
  activeDelegations,
  accountDelegationsData,
  assetListData,
}) => {
  const { color } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState(null);
  const { getAllowance, approve } = useFantomERC20();
  const [allowance, setAllowance] = useState(BigNumber.from(0));
  const mintableDelegations = activeDelegations.filter(
    (activeDelegation: any) =>
      activeDelegation.delegation.lockedAmount >
      activeDelegation.delegation.outstandingSFTM
  );
  const repayableDelegations = activeDelegations.filter(
    (activeDelegation: any) =>
      activeDelegation.delegation.outstandingSFTM !== "0x0"
  );
  const accountDelegationSummary = getAccountDelegationSummary(
    accountDelegationsData
  );
  const assetList = getAccountAssets(assetListData);
  const sFTMBalance = assetList.find((asset) => asset.symbol === "SFTM")
    ?.balanceOf;
  const formattedSFTMBalance = sFTMBalance
    ? toFormattedBalance(hexToUnit(sFTMBalance))
    : ["0", ".0"];

  const {
    sendTx: handleApprove,
    isPending: isApproving,
  } = useSendTransaction(() =>
    approve(
      addresses[parseInt(config.chainId)].tokens.SFTM,
      addresses[parseInt(config.chainId)]["stakeTokenizer"]
    )
  );

  const formattedMintedSFTM = toFormattedBalance(
    weiToUnit(accountDelegationSummary.totalMintedSFTM)
  );
  const formattedMintableSFTM = toFormattedBalance(
    weiToUnit(accountDelegationSummary.totalAvailableSFTM)
  );

  useEffect(() => {
    if (mintableDelegations?.length) {
      return setActiveTab("Mint");
    }
    return setActiveTab("Repay");
  }, []);

  useEffect(() => {
    getAllowance(
      addresses[parseInt(config.chainId)].tokens.SFTM,
      addresses[parseInt(config.chainId)]["stakeTokenizer"]
    ).then((result) => {
      setAllowance(result);
    });
  }, [accountDelegationsData, isApproving]);

  return (
    <Column style={{ width: "80%" }}>
      <Spacer size="lg" />
      <Row style={{ justifyContent: "space-between" }}>
        <StatPair
          title="Minted sFTM"
          value1={formattedMintedSFTM[0]}
          value2={formattedMintedSFTM[1]}
          suffix="sFTM"
        />
        <StatPair
          title="Available sFTM"
          value1={formattedSFTMBalance[0]}
          value2={formattedSFTMBalance[1]}
          suffix="sFTM"
        />
        <StatPair
          title="Mintable sFTM"
          value1={formattedMintableSFTM[0]}
          value2={formattedMintableSFTM[1]}
          suffix="sFTM"
        />
      </Row>
      <Spacer size="xl" />
      <Row>
        <OverlayButton
          style={{ padding: 0, width: "12rem" }}
          onClick={() => setActiveTab("Mint")}
        >
          <Heading3
            style={{
              backgroundColor:
                activeTab === "Mint" ? "#172641" : color.primary.black(),
              opacity: activeTab !== "Mint" && ".5",
              padding: "1rem 2rem",
            }}
          >
            Mint sFTM
          </Heading3>
        </OverlayButton>
        <OverlayButton
          style={{ padding: 0, width: "12rem" }}
          onClick={() => setActiveTab("Repay")}
        >
          <Heading3
            style={{
              backgroundColor:
                activeTab === "Repay" ? "#172641" : color.primary.black(),
              opacity: activeTab !== "Repay" && ".5",
              padding: "1rem 2rem",
            }}
          >
            Repay sFTM
          </Heading3>
        </OverlayButton>
      </Row>
      <ModalContent style={{ width: "unset", borderTopLeftRadius: "0" }}>
        <Row style={{ textAlign: "left" }}>
          <Typo3
            style={{
              width: "15rem",
              color: color.greys.grey(),
            }}
          >
            Validator
          </Typo3>
          <Typo3 style={{ width: "10rem", color: color.greys.grey() }}>
            {activeTab === "Mint" ? "Available sFTM to mint" : "Minted sFTM"}
          </Typo3>
          <div style={{ width: "5rem" }} />
        </Row>
        <Spacer size="sm" />
        {activeTab === "Mint" &&
          (mintableDelegations?.length ? (
            mintableDelegations.map((activeDelegation: any, index: number) => {
              const isLastRow = mintableDelegations.length === index + 1;
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
            })
          ) : (
            <Heading3 style={{ padding: "2rem" }}>
              No eligible delegations
            </Heading3>
          ))}
        {activeTab === "Repay" &&
          (repayableDelegations?.length ? (
            repayableDelegations.map(
              (activeDelegationWithLoan: any, index: number) => {
                const isLastRow = repayableDelegations.length === index + 1;
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
                        BigNumber.from(accountDelegationSummary.totalMintedSFTM)
                      )}
                    />
                  </div>
                );
              }
            )
          ) : (
            <Heading3 style={{ padding: "2rem" }}>No borrow positions</Heading3>
          ))}
      </ModalContent>
    </Column>
  );
};

export const ManageSFTMModal: React.FC<any> = ({ onDismiss }) => {
  const [step, setStep] = useState(null);
  const { apiData } = useFantomApiData();
  const { walletContext } = useWalletProvider();

  const activeAddress = walletContext.activeWallet.address
    ? walletContext.activeWallet.address.toLowerCase()
    : null;
  const delegationsResponse = apiData[FantomApiMethods.getDelegations];
  const accountDelegationsResponse = apiData[
    FantomApiMethods.getDelegationsForAccount
  ].get(activeAddress);
  const assetsListResponse = apiData[
    FantomApiMethods.getAssetsListForAccount
  ].get(activeAddress);

  const accountDelegations = getAccountDelegations(
    accountDelegationsResponse.data
  );
  const delegations = getValidators(delegationsResponse.data);
  const validatorsWithActiveLockup =
    delegations && getValidatorsWithLockup(delegationsResponse.data);

  const activeDelegations = !(delegations && accountDelegations)
    ? []
    : accountDelegations.map((accountDelegation: any) => ({
        ...accountDelegation,
        delegationInfo: delegations.find((delegation: any) => {
          return delegation.id === accountDelegation.delegation.toStakerId;
        }),
      }));
  const lockedDelegations = activeDelegations.filter((delegation) => {
    return delegation.delegation.lockedAmount !== "0x0";
  });
  const borrowedDelegations = activeDelegations.filter((delegation) => {
    return delegation.delegation.outstandingSFTM !== "0x0";
  });

  const [onPresentLockupFTMModal] = useModal(
    <LockupFTMModal
      validatorsWithLockup={validatorsWithActiveLockup}
      accountDelegations={accountDelegations}
    />,
    "lockup-ftm-modal"
  );

  useEffect(() => {
    if (borrowedDelegations?.length || lockedDelegations?.length) {
      return setStep("Overview");
    }
    return setStep("Lock");
  }, [lockedDelegations, borrowedDelegations]);

  return (
    <Modal style={{ width: "50rem", minHeight: "80vh" }} onDismiss={onDismiss}>
      <ModalTitle text="Liquid staking" />
      {step === "Lock" && (
        <ModalContent style={{ height: "100%" }}>
          <Column>
            <Spacer size="xl" />
            <Spacer size="xl" />
            <Typo2 style={{ alignSelf: "flex-start" }}>
              You can only mint sFTM if you lock your FTM delegation.
            </Typo2>
            <Spacer size="xl" />
            <Button
              onClick={() => {
                onDismiss();
                onPresentLockupFTMModal();
              }}
              variant="primary"
            >
              {" "}
              Lock your delegation{" "}
            </Button>
          </Column>
        </ModalContent>
      )}
      {step === "Overview" && (
        <ManageSFTMOverview
          activeDelegations={activeDelegations}
          accountDelegationsData={accountDelegationsResponse.data}
          assetListData={assetsListResponse.data}
        />
      )}
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

  const {
    sendTx: handleRepaySFTM,
    isPending: isRepaying,
    isCompleted: isRepaid,
  } = useSendTransaction(() =>
    txStakeTokenizerContractMethod(STAKE_TOKENIZER_TX_METHODS.redeemSFTM, [
      activeDelegation.delegation.toStakerId,
      mintedSFTMinWei,
    ])
  );

  return (
    <Row style={{ textAlign: "left", height: "3rem", padding: ".5rem 0" }}>
      <Row style={{ width: "15rem", alignItems: "center" }}>
        <DelegationNameInfo
          delegationInfo={activeDelegation.delegationInfo}
          imageSize="32px"
          id={activeDelegation.delegation.toStakerId}
        />
      </Row>
      <Row style={{ width: "10rem", alignItems: "center" }}>
        <Typo1 style={{ fontWeight: "bold" }}>
          {isRepaid
            ? "0.00"
            : `${formattedMintedSFTM[0]}${formattedMintedSFTM[1]}`}{" "}
          sFTM
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

const LiquidStaking: React.FC<any> = ({ loading, accountDelegations }) => {
  const [onPresentMintSFTMModal] = useModal(
    <ManageSFTMModal />,
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
            Manage sFTM
          </Button>
        </Column>
      </Column>
    </ContentBox>
  );
};

export default LiquidStaking;
