import React, { useState } from "react";
import styled from "styled-components";
import { useHistory, NavLink } from "react-router-dom";

import { Typo2 } from "../../components";

import fWalletLogoImg from "../../assets/img/fWalletLogo.svg";
import homeSymbolImg from "../../assets/img/symbols/Home.svg";
import homeActiveSymbolImg from "../../assets/img/symbols/Home_active.svg";
import sendSymbolImg from "../../assets/img/symbols/Send.svg";
import sendActiveSymbolImg from "../../assets/img/symbols/Send_active.svg";
import stakingSymbolImg from "../../assets/img/symbols/Staking.svg";
import stakingActiveSymbolImg from "../../assets/img/symbols/Staking_active.svg";
import defiSymbolImg from "../../assets/img/symbols/DeFi.svg";
import defiActiveSymbolImg from "../../assets/img/symbols/DeFi_active.svg";
import governanceSymbolImg from "../../assets/img/symbols/Governance.svg";
import governanceActiveSymbolImg from "../../assets/img/symbols/Governance_active.svg";
import bridgeSymbolImg from "../../assets/img/symbols/Bridge.svg";
import bridgeActiveSymbolImg from "../../assets/img/symbols/Bridge_active.svg";

const SideBarLink: React.FC<any> = ({
  img,
  activeImg,
  name,
  path,
  currentPath,
  setCurrentPath,
}) => {
  const isActive = path === currentPath;

  return (
    <StyledNavLink to={path} onClick={() => setCurrentPath(path)}>
      <StyledLinkContainer>
        <img
          style={{ height: "35px", width: "35px" }}
          src={isActive ? activeImg : img}
          alt="name"
        />
        <StyledLinkName active={isActive}>{name}</StyledLinkName>
      </StyledLinkContainer>
    </StyledNavLink>
  );
};

interface StyledLinkNameProps {
  active: boolean;
}
const StyledNavLink = styled(NavLink)`
  text-decoration: none;
  padding-bottom: 2rem;
`;
const StyledLinkContainer = styled.div`
  display: flex;
`;
const StyledLinkName = styled(Typo2)<StyledLinkNameProps>`
  color: ${(props) =>
    props.active
      ? props.theme.color.primary.cyan()
      : props.theme.fontColor.secondary};
  font-weight: bold;
  display: flex;
  align-items: center;
  padding-left: 1.5rem;
`;

const SideBar: React.FC<any> = () => {
  const history = useHistory();
  const [currentPath, setCurrentPath] = useState(history.location.pathname);

  return (
    <StyledSideBar>
      <img height="50" width="109" src={fWalletLogoImg} alt="fWallet" />
      <div style={{ marginTop: "4rem" }} />
      <SideBarLink
        img={homeSymbolImg}
        activeImg={homeActiveSymbolImg}
        name="Home"
        path="/home"
        currentPath={currentPath}
        setCurrentPath={setCurrentPath}
      />
      <SideBarLink
        img={sendSymbolImg}
        activeImg={sendActiveSymbolImg}
        name="Send"
        path="/send"
        currentPath={currentPath}
        setCurrentPath={setCurrentPath}
      />
      <SideBarLink
        img={stakingSymbolImg}
        activeImg={stakingActiveSymbolImg}
        name="Staking"
        path="/staking"
        currentPath={currentPath}
        setCurrentPath={setCurrentPath}
      />
      <SideBarLink
        img={governanceSymbolImg}
        activeImg={governanceActiveSymbolImg}
        name="Governance"
        path="/governance"
        currentPath={currentPath}
        setCurrentPath={setCurrentPath}
      />
      {/*<SideBarLink*/}
      {/*  img={defiSymbolImg}*/}
      {/*  activeImg={defiActiveSymbolImg}*/}
      {/*  name="Test"*/}
      {/*  path="/test"*/}
      {/*  currentPath={currentPath}*/}
      {/*  setCurrentPath={setCurrentPath}*/}
      {/*/>*/}
      <SideBarLink
        img={defiSymbolImg}
        activeImg={defiActiveSymbolImg}
        name="Swap"
        path="/swap"
        currentPath={currentPath}
        setCurrentPath={setCurrentPath}
      />
      <SideBarLink
        img={bridgeSymbolImg}
        activeImg={bridgeActiveSymbolImg}
        name="Bridge"
        path="/bridge"
        currentPath={currentPath}
        setCurrentPath={setCurrentPath}
      />
    </StyledSideBar>
  );
};

const StyledSideBar = styled.div`
  background-color: ${(props) => props.theme.color.secondary.navy()};
  display: flex;
  flex-direction: column;
  min-width: 12rem;
  padding: 2rem 0 0 2rem;
`;

export default SideBar;
