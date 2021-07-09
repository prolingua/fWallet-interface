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
import ModalTitle from "../ModalTitle";
import ModalContent from "../ModalContent";

const TokenSelectModal: React.FC<any> = ({
  onDismiss,
  ftmBalance,
  assets = [],
  setTokenSelected,
}) => {
  const { color } = useContext(ThemeContext);
  const allAssets = [{ ...FANTOM_NATIVE, balanceOf: ftmBalance }, ...assets];

  return (
    <Modal style={{ padding: "20px 24px" }} onDismiss={onDismiss}>
      <ModalTitle text="Select token" />
      <Row
        style={{
          padding: "0 2rem",
          borderBottom: `1px solid ${color.greys.grey(".5")}`,
          boxSizing: "border-box",
          width: "95%",
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
      <ModalContent style={{ padding: "16px 0px" }}>
        <Column>
          <Row
            style={{
              justifyContent: "space-between",
              padding: "0 1rem .5rem 1rem",
            }}
          >
            <Typo3
              style={{
                textAlign: "left",
                width: "8rem",
                color: color.greys.grey(),
              }}
            >
              TOKEN NAME
            </Typo3>
            <Typo3
              style={{
                textAlign: "right",
                width: "8rem",
                color: color.greys.grey(),
              }}
            >
              BALANCE
            </Typo3>
          </Row>
          {allAssets.map((asset) => {
            return (
              <StyledOverlayButton
                key={"token-select-" + asset.address}
                onClick={() => {
                  setTokenSelected(asset);
                  onDismiss();
                }}
                style={{ padding: ".8rem" }}
              >
                <TokenBalance token={asset} imageSize="24px" />
              </StyledOverlayButton>
            );
          })}
        </Column>
      </ModalContent>
    </Modal>
  );
};

const StyledOverlayButton = styled(OverlayButton)`
  :hover {
    background-color: ${(props) => props.theme.color.primary.semiWhite(0.1)};
  }
`;

export default TokenSelectModal;
