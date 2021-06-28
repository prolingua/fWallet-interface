import React, { useContext } from "react";
import Modal from "../Modal";

import { Heading2, OverlayButton, Typo1, Typo3 } from "../index";
import Row from "../Row";
import Spacer from "../Spacer";
import CrossSymbol from "../../assets/img/symbols/Cross.svg";
import { FANTOM_NATIVE } from "../../utils/common";
import Column from "../Column";
import styled, { ThemeContext } from "styled-components";
import TokenBalance from "../TokenBalance";

const TokenSelectModal: React.FC<any> = ({
  onDismiss,
  ftmBalance,
  assets = [],
  setTokenSelected,
}) => {
  const { color } = useContext(ThemeContext);
  const allAssets = [{ ...FANTOM_NATIVE, balanceOf: ftmBalance }, ...assets];

  return (
    <Modal padding={"0"}>
      <Column>
        <Row style={{ padding: "2rem 2rem 1rem 2rem" }}>
          <Heading2>Select token</Heading2>
          <Spacer size="lg" />
          <Spacer size="lg" />
          <Spacer size="lg" />
          <Spacer size="lg" />
          <Spacer size="lg" />
          <OverlayButton onClick={() => onDismiss()}>
            <img
              alt=""
              src={CrossSymbol}
              style={{ width: "1rem", height: "1rem" }}
            />
          </OverlayButton>
        </Row>
        <Row
          style={{
            padding: "0 2rem",
            borderBottom: `1px solid ${color.greys.grey(".5")}`,
            boxSizing: "border-box",
          }}
        >
          <Typo1
            style={{
              borderBottom: `2px solid ${color.primary.fantomBlue()}`,
              boxSizing: "border-box",
              fontWeight: "bold",
              color: color.greys.grey(".8"),
            }}
          >
            Your Tokens
          </Typo1>
        </Row>
        <Column
          style={{
            paddingBottom: "1.5rem",
            backgroundColor: color.secondary.navy(),
          }}
        >
          <Row
            style={{
              padding: "1.5rem 2rem 1rem 2rem",
              justifyContent: "space-between",
            }}
          >
            <Typo3>TOKEN NAME</Typo3>
            <Typo3>BALANCE</Typo3>
          </Row>
          {allAssets.map((asset) => {
            return (
              <StyledOverlayButton
                key={"token-select-" + asset.address}
                onClick={() => {
                  setTokenSelected(asset);
                  onDismiss();
                }}
                style={{ padding: ".8rem 2rem" }}
              >
                <TokenBalance token={asset} imageSize="24px" />
              </StyledOverlayButton>
            );
          })}
        </Column>
      </Column>
    </Modal>
  );
};

const StyledOverlayButton = styled(OverlayButton)`
  :hover {
    background-color: ${(props) => props.theme.color.primary.semiWhite(".1")};
  }
`;

export default TokenSelectModal;
