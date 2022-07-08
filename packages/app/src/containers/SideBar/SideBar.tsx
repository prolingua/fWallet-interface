import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useHistory, NavLink } from "react-router-dom";

import {
  mediaExact,
  mediaFrom,
  mediaTill,
  OverlayButton,
  Typo2,
} from "../../components";

import fWalletLogoImg from "../../assets/img/fWalletLogo_beta.svg";
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
import useFantomApi, { FantomApiMethods } from "../../hooks/useFantomApi";
import { delegatedToAddressesList } from "../../utils/delegation";
import useWalletProvider from "../../hooks/useWalletProvider";
import useFantomApiData from "../../hooks/useFantomApiData";
import { votesLeftForProposal } from "../../utils/governance";
import { Row, Item } from "../../components/Grid/Grid";
import CrossSymbol from "../../assets/img/symbols/Close.svg";
import MenuSymbol from "../../assets/img/symbols/Menu.svg";

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

const SideBarContent: React.FC<any> = ({ isMobile, toggleOpen }) => {
  const history = useHistory();
  const [currentPath, setCurrentPath] = useState(history.location.pathname);

  // Get governance actions open
  const { walletContext } = useWalletProvider();
  const { apiData } = useFantomApiData();
  const activeAddress = walletContext.activeWallet.address?.toLowerCase();
  const accountDelegations =
    apiData &&
    apiData[FantomApiMethods.getDelegationsForAccount].get(activeAddress);
  const delegations = apiData && apiData[FantomApiMethods.getDelegations];
  const governanceProposals =
    apiData && apiData[FantomApiMethods.getGovernanceProposals];
  const [voteActions, setVoteActions] = useState(0);

  const handlePathChange = (pathName: string) => {
    if (isMobile) {
      toggleOpen();
    }
    setCurrentPath(pathName);
  };

  useFantomApi(FantomApiMethods.getDelegations);
  useFantomApi(
    FantomApiMethods.getDelegationsForAccount,
    {
      address: activeAddress,
    },
    activeAddress
  );
  useFantomApi(
    FantomApiMethods.getGovernanceProposals,
    {
      count: 100,
      activeOnly: true,
      address: walletContext.activeWallet.address,
    },
    null,
    10000,
    [activeAddress, delegatedToAddressesList(accountDelegations, delegations)]
  );

  useEffect(() => {
    if (
      governanceProposals?.data?.govProposals?.edges?.length &&
      // TEMP FIX. Need to look at saving Past Proposals seperated from Active Proposals data
      governanceProposals.data.govProposals.edges.length < 20 &&
      accountDelegations &&
      delegations
    ) {
      const openProposals = governanceProposals.data.govProposals.edges.filter(
        (proposal: any) => {
          const [votesLeft] = votesLeftForProposal(proposal.proposal);
          return votesLeft > 0;
        }
      );
      setVoteActions(openProposals.length);
    }
  }, [governanceProposals, accountDelegations, delegations]);

  return (
    <>
      <Row style={{ alignItems: "center" }}>
        <Item>
          <img height="50" width="109" src={fWalletLogoImg} alt="fWallet" />
        </Item>
        <Item collapseGTE="md">
          <Row style={{ width: "100%", justifyContent: "end" }}>
            <OverlayButton onClick={() => toggleOpen()}>
              <Row
                style={{
                  height: "44px",
                  width: "44px",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#202f49",
                  borderRadius: "50%",
                  marginRight: "1rem",
                }}
              >
                <img alt="close" src={CrossSymbol} />
              </Row>
            </OverlayButton>
          </Row>
        </Item>
      </Row>
      <div style={{ marginTop: "4rem" }} />
      <SideBarLink
        img={homeSymbolImg}
        activeImg={homeActiveSymbolImg}
        name="Home"
        path="/home"
        currentPath={currentPath}
        setCurrentPath={handlePathChange}
      />
      <SideBarLink
        img={sendSymbolImg}
        activeImg={sendActiveSymbolImg}
        name="Send"
        path="/send"
        currentPath={currentPath}
        setCurrentPath={handlePathChange}
      />
      <SideBarLink
        img={stakingSymbolImg}
        activeImg={stakingActiveSymbolImg}
        name="Staking"
        path="/staking"
        currentPath={currentPath}
        setCurrentPath={handlePathChange}
      />
      <Row style={{ position: "relative" }}>
        <SideBarLink
          img={governanceSymbolImg}
          activeImg={governanceActiveSymbolImg}
          name="Governance"
          path="/governance"
          currentPath={currentPath}
          setCurrentPath={handlePathChange}
        />
        {voteActions > 0 && (
          <Row
            style={{
              width: "1.25rem",
              height: "1.25rem",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "red",
              borderRadius: "50%",
              fontSize: "14px",
              fontWeight: "bold",
              position: "absolute",
              left: "27px",
              top: "-2px",
            }}
          >
            {voteActions}
          </Row>
        )}
      </Row>
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
        setCurrentPath={handlePathChange}
      />
      <SideBarLink
        img={bridgeSymbolImg}
        activeImg={bridgeActiveSymbolImg}
        name="Bridge"
        path="/bridge"
        currentPath={currentPath}
        setCurrentPath={handlePathChange}
      />
    </>
  );
};

const SideBar: React.FC<any> = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <StyledSideBar>
        <SideBarContent />
      </StyledSideBar>
      <StyledOpenMobileMenuButton isOpen={isOpen}>
        <Row style={{ width: "100%", justifyContent: "end" }}>
          <OverlayButton onClick={() => toggleOpen()}>
            <Row
              style={{
                height: "50px",
                width: "50px",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#202f49",
                borderRadius: "50%",
                marginRight: "1rem",
              }}
            >
              <img alt="menu" src={MenuSymbol} />
            </Row>
          </OverlayButton>
        </Row>
      </StyledOpenMobileMenuButton>
      <StyledMobileSideBar isOpen={isOpen}>
        <SideBarContent isMobile toggleOpen={toggleOpen} />
      </StyledMobileSideBar>
    </>
  );
};

// const ResponsiveSideBar: React.FC<any> = () => {
//   const [isOpen, setIsOpen] = useState(false);
//
//   return (
//     <>
//       <SideBar />
//       <MobileSideBar />
//     </>
//   );
// };

const StyledSideBar = styled.div`
  background-color: ${(props) => props.theme.color.secondary.navy()};
  display: flex;
  flex-direction: column;
  min-width: 12rem;
  padding: 2rem 0 0 2rem;

  ${mediaTill["sm"](`display: none`)}
`;

const StyledOpenMobileMenuButton = styled(OverlayButton)<{ isOpen: boolean }>`
  height: 56px;
  position: absolute;
  box-sizing: border-box;

  ${mediaExact.xs(`padding: 2rem 0 0 1.5rem`)};
  ${mediaExact.sm(`padding: 2rem 0 0 2rem`)};

  ${mediaFrom["md"](`display: none`)}

  ${(props) => props.isOpen && `display: none`}
`;

const StyledMobileSideBar = styled.div<{ isOpen: boolean }>`
  background-color: ${(props) => props.theme.color.secondary.navy()};
  display: flex;
  position: absolute;
  z-index: 1000;
  flex-direction: column;
  height: 100vh;
  padding: 2rem 0 0 2rem;
  box-sizing: border-box;

  ${mediaExact["xs"](`width: 100vw;`)}
  ${mediaExact["sm"](`width: 300px`)}  
  ${mediaFrom["md"](`display: none`)}
  
  ${(props) => !props.isOpen && `display: none`}
`;

export default SideBar;
