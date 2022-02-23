import React, { useContext, useState } from "react";
import Row from "../../components/Row";
import {
  Button,
  Container,
  ContentBox,
  OverlayButton,
  Typo2,
  Typo3,
} from "../../components";
import Column from "../../components/Column";
import { ThemeContext } from "styled-components";
import multichainImg from "../../assets/img/icons/multichain.svg";
import Spacer from "../../components/Spacer";
import SwapImg from "../../assets/img/symbols/Swap.svg";
import {
  chainToNetworkInfoMap,
  supportedChainsForBridge,
} from "../../utils/bridge";
import DropDownButton from "../../components/DropDownButton";

const ChainSelect: React.FC<any> = ({ selectChain, chains }) => {
  const { color } = useContext(ThemeContext);
  return (
    <ContentBox
      style={{
        width: "100%",
        boxSizing: "border-box",
        backgroundColor: color.primary.black(),
        borderRadius: "8px",
        padding: "1rem",
      }}
    >
      <Column style={{ gap: "1rem" }}>
        {chains.map((chainId: number) => {
          return (
            <OverlayButton
              key={`select-${chainId}`}
              onClick={() => {
                selectChain(chainId);
              }}
            >
              <Row style={{ gap: "1rem", alignItems: "center" }}>
                <img
                  style={{ height: "30px", width: "30px" }}
                  src={chainToNetworkInfoMap[chainId].image}
                />
                <Typo2 style={{ fontWeight: "bold" }}>
                  {chainToNetworkInfoMap[chainId].name}
                </Typo2>
              </Row>
            </OverlayButton>
          );
        })}
      </Column>
    </ContentBox>
  );
};

const ChainSelector: React.FC<any> = ({
  text,
  chains,
  selected,
  selectChain,
}) => {
  const { color } = useContext(ThemeContext);
  return (
    <Column style={{ width: "100%" }}>
      <Typo2 style={{ color: "#84888d" }}>{text}</Typo2>
      <Spacer size="xs" />
      <DropDownButton
        width="100%"
        DropDown={() => ChainSelect({ selectChain, chains })}
        dropdownTop={65}
      >
        {/*<OverlayButton style={{ padding: 0 }}>*/}
        <ContentBox
          style={{
            boxSizing: "border-box",
            width: "100%",
            backgroundColor: color.primary.black(),
            padding: "1rem",
          }}
        >
          <Row style={{ gap: "1rem", alignItems: "center" }}>
            <img
              style={{ height: "30px", width: "30px" }}
              src={chainToNetworkInfoMap[selected].image}
            />
            <Typo2 style={{ fontWeight: "bold" }}>
              {chainToNetworkInfoMap[selected].name}
            </Typo2>
          </Row>
        </ContentBox>
        {/*</OverlayButton>*/}
      </DropDownButton>
    </Column>
  );
};

const ChainSelection: React.FC<any> = ({ handleSwapInOut }) => {
  const [fromChain, setFromChain] = useState(250);
  const [toChain, setToChain] = useState(1);

  const handleSetFromChain = (chainId: number) => {
    if (chainId !== 250) {
      setToChain(250);
    }
    if (chainId === toChain) {
      setToChain(chainId === 250 ? 1 : 250);
    }
    setFromChain(chainId);
  };

  const handleSetToChain = (chainId: number) => {
    if (chainId !== 250) {
      setFromChain(250);
    }
    if (chainId === fromChain) {
      setFromChain(chainId === 250 ? 1 : 250);
    }
    setToChain(chainId);
  };

  const handleSwap = () => {
    const fromChainOld = fromChain;
    const toChainOld = toChain;

    setFromChain(toChainOld);
    setToChain(fromChainOld);
  };
  return (
    <Column>
      <ChainSelector
        text="From chain"
        selected={fromChain}
        selectChain={handleSetFromChain}
        chains={supportedChainsForBridge.filter(
          (chainId) => chainId !== fromChain
        )}
      />
      <Spacer size="lg" />
      <Row style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ height: "1px", width: "100%" }} />
        <OverlayButton style={{ padding: 0 }} onClick={handleSwap}>
          <Row
            style={{
              alignItems: "center",
              justifyContent: "center",
              height: "64px",
              width: "64px",
              border: "1px solid #67748B",
              borderRadius: "50%",
            }}
          >
            <img alt="swap" style={{ height: "20px" }} src={SwapImg} />
          </Row>
        </OverlayButton>
        <div style={{ height: "1px", width: "100%" }} />
      </Row>
      <Spacer size="lg" />
      <ChainSelector
        text="To chain"
        selected={toChain}
        selectChain={handleSetToChain}
        chains={supportedChainsForBridge.filter(
          (chainId) => chainId !== toChain
        )}
      />
      <Spacer />
    </Column>
  );
};

const Bridge: React.FC<any> = () => {
  const { color } = useContext(ThemeContext);

  const handleSwapChainSelection = () => {
    console.log("CHANGE CHAINS");
  };
  return (
    <Row style={{ width: "100%", justifyContent: "center" }}>
      <ContentBox style={{ width: "600px" }}>
        <Column style={{ width: "100%" }}>
          <Row style={{ justifyContent: "space-between" }}>
            <div
              style={{
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              Bridge
            </div>
            <div
              style={{
                borderRadius: "34px",
                backgroundColor: color.primary.black(),
              }}
            >
              <Row style={{ justifyContent: "space-between", gap: "1rem" }}>
                <Typo3
                  style={{ color: "#67748B", padding: ".5rem 0 .5rem 1rem" }}
                >
                  Powered by multichain
                </Typo3>
                <img src={multichainImg} />
              </Row>
            </div>
          </Row>
          <Spacer />
          <ChainSelection handleSwapInOut={handleSwapChainSelection} />
        </Column>
      </ContentBox>
    </Row>
  );
};

export default Bridge;
