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

export const DelegationBalance: React.FC<any> = ({
  activeDelegation,
  imageSize = " 32px",
}) => {
  const { color } = useContext(ThemeContext);

  const formattedBalance = toFormattedBalance(
    hexToUnit(activeDelegation.delegation.amountDelegated)
  );
  const lockedUntil =
    activeDelegation.delegation.isDelegationLocked &&
    formatHexToBN(activeDelegation.delegation.lockedUntil).toString();
  const daysLocked = lockedUntil
    ? parseInt(
        (
          (parseInt(lockedUntil) * 1000 - Date.now()) /
          (1000 * 60 * 60 * 24)
        ).toString()
      )
    : null;
  return (
    <Row style={{ justifyContent: "space-between" }}>
      <Row style={{ alignItems: "center" }}>
        <img
          alt=""
          style={{
            borderRadius: "50%",
            width: imageSize,
            height: imageSize,
            marginRight: ".6rem",
          }}
          src={activeDelegation.delegationInfo.logoURL || delegationFallbackImg}
        />
        <Column>
          <Typo1 style={{ fontWeight: "bold" }}>
            {activeDelegation.delegationInfo.name || "Unnamed"}
          </Typo1>
          {lockedUntil && (
            <Typo3 style={{ color: color.greys.grey() }}>
              {daysLocked ? `Unlocks in ${daysLocked} days` : ""}
            </Typo3>
          )}
        </Column>
      </Row>
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
