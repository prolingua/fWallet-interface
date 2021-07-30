import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import useFantomApi, { FantomApiMethods } from "../../hooks/useFantomApi";
import useFantomApiData from "../../hooks/useFantomApiData";
import useWalletProvider from "../../hooks/useWalletProvider";
import Row, { ResponsiveRow } from "../../components/Row/Row";
import styled, { ThemeContext } from "styled-components";
import Column from "../../components/Column";
import { Button, ContentBox, Heading1, Typo1, Typo2 } from "../../components";
import {
  getGovernanceProposals,
  getInactiveGovernanceProposals,
  isProposalActive,
  votesLeftForProposal,
} from "../../utils/governance";
import Spacer from "../../components/Spacer";
import SliderWithMarks from "../../components/Slider";
import { formatHexToBN, formatHexToInt } from "../../utils/conversion";
import { BigNumber } from "@ethersproject/bignumber";
import { formatDate } from "../../utils/common";
import { delegatedToAddressesList } from "../../utils/delegations";

const CategorySwitch: React.FC<any> = ({
  categories,
  activeCategory,
  setActiveCategory,
}) => {
  return (
    <Row>
      {categories.map((category: string, index: number) => {
        return (
          <StyledCategorySelector
            key={`category-switch-${index}`}
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
  const history = useHistory();
  const { color } = useContext(ThemeContext);
  // const minVotes = formatHexToBN(proposal.proposal.minVotes);
  // const votedWeightRatio = proposal.proposal.votedWeightRatio;
  // const totalWeight = formatHexToBN(proposal.proposal.totalWeight);
  const currentVoted =
    proposal.proposal &&
    proposal.proposal.votedWeightRatio &&
    proposal.proposal.votedWeightRatio / 10;

  // const votesCast =
  //   votedWeightRatio === 0
  //     ? BigNumber.from(0)
  //     : totalWeight
  //         .mul(BigNumber.from(votedWeightRatio))
  //         .div(BigNumber.from(1000));
  //
  // const votesPercentageToMinimum = votesCast.div(minVotes).toNumber() * 100;
  const delegationsToVoteWith = votesLeftForProposal(proposal.proposal);
  const isActiveProposal = isProposalActive(proposal.proposal);

  return (
    <ContentBox style={{ width: "22rem" }}>
      <Column style={{ width: "100%" }}>
        <Heading1>{proposal.proposal.name}</Heading1>
        <Spacer size="lg" />
        <Typo1 style={{ color: color.greys.grey(), fontWeight: "bold" }}>
          Voting progress
        </Typo1>
        <Spacer />
        <StyledSliderWrapper value={currentVoted || 0}>
          <SliderWithMarks
            value={currentVoted || 0}
            max={100}
            steps={1}
            markPoints={[0, 33, 66, 100]}
            disabled
            tooltip
            color="#FFA319"
          />
        </StyledSliderWrapper>
        <Spacer size="xl" />
        <Spacer size="xl" />
        <Row style={{ justifyContent: "space-between" }}>
          <Typo2 style={{ color: color.greys.grey(), fontWeight: "bold" }}>
            Voting started
          </Typo2>
          <Typo1 style={{ color: "white" }}>
            {formatDate(
              new Date(formatHexToInt(proposal.proposal.votingStarts) * 1000),
              "d LLLL yyy"
            )}
          </Typo1>
        </Row>
        <Spacer size="sm" />
        <Row style={{ justifyContent: "space-between" }}>
          <Typo2 style={{ color: color.greys.grey(), fontWeight: "bold" }}>
            Voting will end
          </Typo2>
          <Typo1 style={{ color: "white" }}>
            {formatDate(
              new Date(formatHexToInt(proposal.proposal.votingMustEnd) * 1000),
              "d LLLL yyy"
            )}
          </Typo1>
        </Row>
        <Spacer size="xl" />
        <Button
          onClick={() =>
            history.push(`governance/proposal/${proposal.proposal.id}`)
          }
          variant="primary"
          style={{
            backgroundColor: !isActiveProposal && color.greys.darkGrey(),
          }}
        >
          {isActiveProposal
            ? `Vote now (${delegationsToVoteWith[0]} / ${delegationsToVoteWith[1]} votes left)`
            : "Details"}
        </Button>
      </Column>
    </ContentBox>
  );
};

const StyledSliderWrapper = styled.div<{ value: number }>`
  margin: 0 0.5rem;
  .rc-slider-disabled {
    background-color: transparent !important;
  }

  .rc-slider-handle {
    z-index: 10;
  }

  .rc-slider-handle::after {
    position: absolute;
    width: 2.6rem;
    text-align: center;
    top: 24px;
    left: -1.3rem;
    font-size: 16px;
    font-weight: bold;
    color: #ffa319;
    padding: 0.2rem 0.5rem;
    background-color: white;
    border-radius: 3px;
    content: "${(props) => `${props.value}%`}";
  }
`;

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
          return (
            <ProposalOverview key={proposal.proposal.id} proposal={proposal} />
          );
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
    [activeAddress, delegatedToAddressesList(accountDelegations, delegations)]
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
