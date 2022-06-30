import React, { useContext } from "react";
import { ThemeContext } from "styled-components";
import { hexToUnit, toFormattedBalance } from "../../utils/conversion";
import Row from "../Row";
import { DelegationNameInfo } from "../DelegationBalance/DelegationBalance";
import { Typo3 } from "../index";
import Spacer from "../Spacer";
import vShape from "../../assets/img/shapes/vShape.png";
import checkmarkImg from "../../assets/img/symbols/CheckMark.svg";

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
      <DelegationNameInfo
        delegationInfo={activeDelegation.delegationInfo.stakerInfo}
        imageSize={35}
      />
      <Row style={{ alignItems: "center" }}>
        {hasVoted && (
          <Row style={{ alignItems: "center" }}>
            <img alt="" src={checkmarkImg} />
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

export default DelegationSelectRow;
