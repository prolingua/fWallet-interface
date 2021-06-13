import React, { useEffect, useState } from "react";
import { Button, Typo2 } from "../index";
import useModal from "../../hooks/useModal";
import TokenSelectModal from "./TokenSelectModal";
import Row from "../Row";
import ftmIcon from "../../assets/img/tokens/FTM.svg";
import Spacer from "../Spacer";
import vShape from "../../assets/img/shapes/vShape.png";

const TokenSelectButton: React.FC<any> = ({
  currentToken,
  ftmBalance,
  assets,
  setTokenSelected,
}) => {
  const [onPresentSelectTokenModal, onDismissSelectTokenModal] = useModal(
    <TokenSelectModal
      ftmBalance={ftmBalance}
      assets={assets}
      setTokenSelected={setTokenSelected}
    />,
    "token-select-modal"
  );
  return (
    <Button
      style={{ flex: 2, padding: "10px" }}
      variant="secondary"
      onClick={() => onPresentSelectTokenModal()}
    >
      <Row style={{ alignItems: "center" }}>
        <img
          alt=""
          src={currentToken.symbol === "FTM" ? ftmIcon : currentToken.logoURL}
          style={{ height: "24px" }}
        />
        <Spacer size="sm" />
        <Typo2>{currentToken.symbol}</Typo2>
        <Spacer size="sm" />
        <Spacer size="xs" />
        <img alt="" src={vShape} />
      </Row>
    </Button>
  );
};

export default TokenSelectButton;
