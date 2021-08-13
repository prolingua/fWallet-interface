import React, { useContext } from "react";
import { ThemeContext } from "styled-components";
import {
  formatHexToBN,
  hexToUnit,
  toFormattedBalance,
} from "../../utils/conversion";
import Row from "../Row";
import { Typo1, Typo2, Typo3 } from "../index";
import Column from "../Column";
import delegationFallbackImg from "../../assets/img/delegationFallbackImg.png";
import { delegationDaysLockedLeft } from "../../utils/delegation";

export const DelegationNameInfo: React.FC<any> = ({
  imageSize,
  delegationInfo,
  daysLocked,
  flexColumn,
}) => {
  const { color } = useContext(ThemeContext);
  const content = (
    <>
      <img
        alt=""
        style={{
          borderRadius: "50%",
          width: imageSize,
          height: imageSize,
          marginRight: !flexColumn && ".6rem",
          marginBottom: flexColumn && ".2rem",
        }}
        src={delegationInfo?.logoURL || delegationFallbackImg}
      />
      <Column>
        <Typo1 style={{ fontWeight: "bold" }}>
          {delegationInfo?.name || "Unnamed"}
        </Typo1>
        {daysLocked > 0 && (
          <Typo3 style={{ color: color.greys.grey() }}>
            {daysLocked ? `Unlocks in ${daysLocked} days` : ""}
          </Typo3>
        )}
      </Column>
    </>
  );
  return (
    <>
      {flexColumn ? (
        <Column style={{ alignItems: "center" }}>{content}</Column>
      ) : (
        <Row style={{ alignItems: "center" }}>{content}</Row>
      )}
    </>
  );
};

export const DelegationBalance: React.FC<any> = ({
  activeDelegation,
  imageSize = " 32px",
}) => {
  const { color } = useContext(ThemeContext);

  const formattedBalance = toFormattedBalance(
    hexToUnit(activeDelegation.delegation.amountDelegated)
  );
  const daysLocked = delegationDaysLockedLeft(activeDelegation.delegation);

  return (
    <Row style={{ justifyContent: "space-between" }}>
      <DelegationNameInfo
        imageSize={imageSize}
        delegationInfo={activeDelegation.delegationInfo}
        daysLocked={daysLocked}
      />
      <Row style={{ alignItems: "center" }}>
        <Typo2
          style={{
            fontWeight: "bold",
            color: color.primary.semiWhite(),
          }}
        >
          {formattedBalance[0]} FTM
        </Typo2>
      </Row>
    </Row>
  );
};

export default DelegationBalance;
