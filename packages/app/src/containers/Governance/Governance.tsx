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
  getProposalStatus,
  isProposalActive,
  votesLeftForProposal,
} from "../../utils/governance";
import Spacer from "../../components/Spacer";
import SliderWithMarks from "../../components/Slider";
import { formatHexToInt } from "../../utils/conversion";
import { formatDate } from "../../utils/common";
import { delegatedToAddressesList } from "../../utils/delegation";
import CheckMarkImg from "../../assets/img/symbols/CheckMark.svg";
import CrossMarkImg from "../../assets/img/symbols/CrossMark.svg";
import StopMarkImg from "../../assets/img/symbols/StopMark.svg";

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

const ProposalBox: React.FC<any> = ({ proposal }) => {
  const history = useHistory();
  const { color } = useContext(ThemeContext);
  const currentVoted =
    proposal.proposal &&
    proposal.proposal.votedWeightRatio &&
    proposal.proposal.votedWeightRatio / 10;

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
        <SliderWithMarks
          value={currentVoted || 0}
          max={100}
          steps={1}
          markPoints={[0, 33, 66, 100]}
          disabled
          tooltip
          color="#FFA319"
          tooltipTextColor="#ffa319"
        />
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
        <Spacer size="sm" />
        <Row style={{ justifyContent: "space-between" }}>
          <Typo2 style={{ color: color.greys.grey(), fontWeight: "bold" }}>
            Votes
          </Typo2>
          <Typo1 style={{ color: "white" }}>
            {`${delegationsToVoteWith[0]} / ${delegationsToVoteWith[1]} votes left`}
          </Typo1>
        </Row>
        <Spacer size="xl" />
        <Button
          onClick={() =>
            history.push(`governance/proposal/${proposal.proposal.id}`)
          }
          variant="primary"
          style={{
            backgroundColor:
              !isActiveProposal ||
              (delegationsToVoteWith[0] === 0 && color.greys.darkGrey()),
          }}
        >
          {isActiveProposal && delegationsToVoteWith[0] > 0
            ? `Vote now`
            : `Details`}
        </Button>
      </Column>
    </ContentBox>
  );
};

const ProposalTable: React.FC<any> = ({ proposals }) => {
  const history = useHistory();
  const statusMark = (status: string) => {
    if (status === "Resolved") {
      return CheckMarkImg;
    }
    if (status === "Failed") {
      return CrossMarkImg;
    }
    return StopMarkImg;
  };
  return (
    <Column style={{ marginTop: "1rem", width: "100%" }}>
      <Row style={{ width: "100%", textAlign: "center" }}>
        <Typo1 style={{ flex: 4, textAlign: "start", fontWeight: "bold" }}>
          Name
        </Typo1>
        <Typo1 style={{ flex: 1, fontWeight: "bold" }}>Status</Typo1>
        <Typo1 style={{ flex: 2, fontWeight: "bold" }}>Winner</Typo1>
        <Typo1 style={{ flex: 2, fontWeight: "bold" }}>Total votes</Typo1>
        <Typo1 style={{ flex: 2, fontWeight: "bold" }}>Ending date</Typo1>
        <Typo1 style={{ flex: 2, textAlign: "end", fontWeight: "bold" }}>
          Voted
        </Typo1>
      </Row>
      <Spacer size="xs" />
      {proposals &&
        proposals.length &&
        proposals.map((proposal: any) => {
          const delegationsToVoteWith = votesLeftForProposal(proposal.proposal);
          return (
            <StyledProposalRow
              key={`proposal-row-${proposal.proposal.id}`}
              onClick={() =>
                history.push(`governance/proposal/${proposal.proposal.id}`)
              }
            >
              <Row
                style={{
                  width: "100%",
                  textAlign: "center",
                  alignItems: "center",
                }}
              >
                <Typo1 style={{ flex: 4, textAlign: "start" }}>
                  {proposal.proposal.name}
                </Typo1>
                <Typo1 style={{ flex: 1 }}>
                  <img
                    style={{ paddingTop: ".15rem" }}
                    src={statusMark(
                      getProposalStatus(proposal.proposal.state.status)
                    )}
                  />
                </Typo1>
                <Typo1 style={{ flex: 2 }}>
                  {getProposalStatus(proposal.proposal.state.status) ===
                  "Resolved"
                    ? proposal.proposal.options[
                        parseInt(proposal.proposal.state.winnerId)
                      ]
                    : "-"}
                </Typo1>
                <Typo1 style={{ flex: 2 }}>
                  {proposal.proposal.votedWeightRatio / 10}%
                </Typo1>
                <Typo1 style={{ flex: 2 }}>
                  {formatDate(
                    new Date(parseInt(proposal.proposal.votingMustEnd) * 1000),
                    "LLLL d, yyy"
                  )}
                </Typo1>
                <Typo1 style={{ flex: 2, textAlign: "end" }}>
                  {delegationsToVoteWith[1] === delegationsToVoteWith[0]
                    ? "-"
                    : `${
                        delegationsToVoteWith[1] - delegationsToVoteWith[0]
                      } / ${delegationsToVoteWith[1]}`}
                </Typo1>
              </Row>
            </StyledProposalRow>
          );
        })}
    </Column>
  );
};

const StyledProposalRow = styled(Row)`
  :hover {
    background-color: ${(props) => props.theme.color.primary.semiWhite(0.1)};
    cursor: pointer;
  }
  padding: 0.3rem 1rem;
  margin-left: -1rem;
  margin-right: -1rem;
`;

const GovernanceProposalsList: React.FC<any> = ({
  loading,
  governanceProposalsData,
  filterInactive,
}) => {
  const governanceProposals = getGovernanceProposals(governanceProposalsData);
  const filteredProposals =
    governanceProposals && filterInactive
      ? getInactiveGovernanceProposals(governanceProposals)
      : governanceProposals;

  return (
    <Row style={{ flexWrap: "wrap", gap: "1rem" }}>
      {loading ? (
        <div>Loading...</div>
      ) : filterInactive ? (
        <ProposalTable proposals={filteredProposals} />
      ) : filteredProposals && filteredProposals.length ? (
        filteredProposals.map((proposal: any) => {
          return <ProposalBox key={proposal.proposal.id} proposal={proposal} />;
        })
      ) : (
        <div> No proposals found! </div>
      )}
    </Row>
  );
};

const Governance: React.FC<any> = () => {
  const history = useHistory();
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
        <Button
          variant="primary"
          onClick={() => history.push(`governance/proposal/create`)}
        >
          Create new proposal
        </Button>
      </ResponsiveRow>
      <Spacer />
      <GovernanceProposalsList
        loading={!governanceProposals?.data}
        governanceProposalsData={governanceProposals?.data}
        filterInactive={activeCategory === "Past proposals"}
      />
    </Column>
  );
};

export default Governance;
