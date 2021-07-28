import React, { useContext, useEffect, useState } from "react";
import useFantomApi, { FantomApiMethods } from "../../hooks/useFantomApi";
import useFantomApiData from "../../hooks/useFantomApiData";
import useWalletProvider from "../../hooks/useWalletProvider";
import Row, { ResponsiveRow } from "../../components/Row/Row";
import styled, { ThemeContext } from "styled-components";
import Column from "../../components/Column";
import { Button, ContentBox, Heading2 } from "../../components";
import {
  getGovernanceProposals,
  getInactiveGovernanceProposals,
} from "../../utils/governance";
import Spacer from "../../components/Spacer";
import { GOVERNANCE_PROPOSAL } from "../../graphql/subgraph";

const CategorySwitch: React.FC<any> = ({
  categories,
  activeCategory,
  setActiveCategory,
}) => {
  return (
    <Row>
      {categories.map((category: string) => {
        return (
          <StyledCategorySelector
            onClick={() => setActiveCategory(category)}
            isActive={category === activeCategory}
          >
            {category}
          </StyledCategorySelector>
        );
      })}
    </Row>
  );
};

const StyledCategorySelector = styled.div<{ isActive: boolean }>`
  background-color: ${(props) =>
    props.isActive
      ? props.theme.color.primary.fantomBlue()
      : props.theme.color.secondary.navy()};
  font-size: 18px;
  padding: 0.8rem 0;
  width: 12rem;
  text-align: center;
  border-radius: 8px;
  cursor: ${(props) => (props.isActive ? "default" : "pointer")};
`;

const ProposalOverview: React.FC<any> = ({ proposal }) => {
  console.log(proposal);
  return (
    <ContentBox style={{ width: "19rem" }}>
      <Row>
        <Heading2>{proposal.proposal.name}</Heading2>
        {/*<SliderWithMarks value={}*/}
      </Row>
    </ContentBox>
  );
};

const GovernanceProposalsList: React.FC<any> = ({
  loading,
  governanceProposalsData,
  filterNotActive,
}) => {
  const governanceProposals = getGovernanceProposals(governanceProposalsData);
  const filteredProposals =
    governanceProposals && filterNotActive
      ? getInactiveGovernanceProposals(governanceProposals)
      : governanceProposals;

  return (
    <Row style={{ flexWrap: "wrap", gap: "1rem" }}>
      {loading ? (
        <div>Loading...</div>
      ) : filteredProposals && filteredProposals.length ? (
        filteredProposals.map((proposal: any) => {
          return <ProposalOverview proposal={proposal} />;
        })
      ) : (
        <div> No proposals found! </div>
      )}
    </Row>
  );
};

const Governance: React.FC<any> = () => {
  const { breakpoints } = useContext(ThemeContext);
  const { apiData } = useFantomApiData();
  const { walletContext } = useWalletProvider();
  const activeAddress = walletContext.activeWallet.address.toLowerCase();
  const [activeCategory, setActiveCategory] = useState("Current proposals");
  const [govProposalVars, setGovProposalVars] = useState({
    count: 100,
    activeOnly: true,
    address: activeAddress,
  } as any);
  const [pageInfo, setPageInfo] = useState(null);
  const governanceProposals =
    apiData && apiData[FantomApiMethods.getGovernanceProposals];

  const accountDelegations =
    apiData &&
    apiData[FantomApiMethods.getDelegationsForAccount].get(activeAddress);
  const delegations = apiData && apiData[FantomApiMethods.getDelegations];
  const delegatedToList =
    delegations?.data?.stakers &&
    accountDelegations?.data?.delegationsByAddress?.edges.map((edge: any) => [
      parseInt(edge.delegation.toStakerId),
      delegations.data.stakers.find(
        (delegationInfo: any) =>
          delegationInfo.id === edge.delegation.toStakerId
      ).stakerAddress,
    ]);

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
    govProposalVars,
    null,
    null,
    [activeAddress, delegatedToList]
  );

  useEffect(() => {
    // Set cursor for next retrieve
    if (governanceProposals?.data) {
      setPageInfo(governanceProposals.data.govProposals.pageInfo);
    }
  }, [governanceProposals]);

  useEffect(() => {
    if (activeCategory === "Current proposals") {
      setPageInfo(null);
      setGovProposalVars({
        count: 100,
        activeOnly: true,
        address: walletContext.activeWallet.address,
      });
    }
    if (activeCategory === "Past proposals") {
      setPageInfo(null);
      setGovProposalVars({
        count: 100,
        activeOnly: false,
        address: walletContext.activeWallet.address,
      });
    }
  }, [activeCategory]);

  return (
    <Column style={{ marginBottom: "1.5rem" }}>
      <ResponsiveRow
        style={{
          flex: 1,
          justifyContent: "space-between",
          alignItems: "center",
        }}
        breakpoint={breakpoints.ultra}
      >
        <CategorySwitch
          categories={["Current proposals", "Past proposals"]}
          setActiveCategory={setActiveCategory}
          activeCategory={activeCategory}
        />
        <Button variant="primary">Create new proposal</Button>
      </ResponsiveRow>
      <Spacer />
      <GovernanceProposalsList
        loading={!governanceProposals?.data}
        governanceProposalsData={governanceProposals?.data}
        filterNotActive={activeCategory === "Past proposals"}
      />
    </Column>
  );
};

export default Governance;
