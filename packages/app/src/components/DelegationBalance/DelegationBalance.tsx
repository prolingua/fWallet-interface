import React, { useContext } from "react";
import styled, { ThemeContext } from "styled-components";
import { hexToUnit, toFormattedBalance } from "../../utils/conversion";
import Row from "../Row";
import { mediaExact, Typo2, Typo3 } from "../index";
import Column from "../Column";
import delegationFallbackImg from "../../assets/img/delegationFallbackImg.png";
import { delegationDaysLockedLeft } from "../../utils/delegation";
import { Item } from "../Grid/Grid";

export const DelegationNameInfo: React.FC<any> = ({
  imageSize,
  fontSize,
  delegationInfo,
  daysLocked,
  flexColumn,
  id,
  dropNameAtMediaSize,
}) => {
  const { color } = useContext(ThemeContext);
  const content = (
    <>
      <StyledResponsiveImage
        size={imageSize}
        alt=""
        style={{
          borderRadius: "50%",
          marginRight: !flexColumn && ".6rem",
          marginBottom: flexColumn && ".2rem",
        }}
        src={delegationInfo?.logoUrl || delegationFallbackImg}
      />
      <Column style={{ alignItems: flexColumn ? "center" : "initial" }}>
        <Typo2
          style={{
            fontWeight: "bold",
            fontSize,
            whiteSpace: "nowrap",
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <Row>
            <Item>{id ? `${parseInt(id)}` : ""}</Item>
            {id && delegationInfo?.name && (
              <Item collapseLTE={dropNameAtMediaSize}>{"."}&nbsp;</Item>
            )}
            <Item collapseLTE={dropNameAtMediaSize}>
              {delegationInfo?.name || "Unnamed"}
            </Item>
          </Row>
        </Typo2>
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

// const StyledResponsiveInfo = styled(Typo2)`
//   ${(props) => mediaExact.xs(`width: ${props.size * 0.8}px`)};
//   ${(props) => mediaExact.sm(`width: ${props.size * 0.8}px`)};
//   ${(props) => mediaExact.md(`width: ${props.size}px`)};
//   ${(props) => mediaExact.lg(`width: ${props.size}px`)};
// `;

const StyledResponsiveImage = styled.img<{ size: number }>`
  ${(props) => mediaExact.xs(`width: ${props.size * 0.8}px`)};
  ${(props) => mediaExact.sm(`width: ${props.size * 0.8}px`)};
  ${(props) => mediaExact.md(`width: ${props.size}px`)};
  ${(props) => mediaExact.lg(`width: ${props.size}px`)};
`;

export const DelegationBalance: React.FC<any> = ({
  activeDelegation,
  imageSize = 32,
}) => {
  const { color } = useContext(ThemeContext);

  const formattedBalance = toFormattedBalance(
    hexToUnit(activeDelegation.delegation.amountDelegated)
  );
  const daysLocked = delegationDaysLockedLeft(activeDelegation.delegation);

  return (
    <Row style={{ justifyContent: "space-between" }}>
      <Row
        style={{
          maxWidth: "80%",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        <DelegationNameInfo
          imageSize={imageSize}
          delegationInfo={activeDelegation.delegationInfo.stakerInfo}
          daysLocked={daysLocked}
          id={activeDelegation.delegation.toStakerId}
        />
      </Row>
      <Row style={{ alignItems: "center" }}>
        <Typo2
          style={{
            textAlign: "end",
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
