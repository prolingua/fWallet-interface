import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ThemeContext } from "styled-components";
import useFantomApi, { FantomApiMethods } from "../../hooks/useFantomApi";
import useFantomApiData from "../../hooks/useFantomApiData";
import useWalletProvider from "../../hooks/useWalletProvider";
import {
  delegatedToAddressesList,
  enrichAccountDelegationsWithStakerInfo,
  getAccountDelegations,
  getDelegations,
} from "../../utils/delegations";
import { Typo1 } from "../../components";
import Column from "../../components/Column";
import Row from "../../components/Row";
import Spacer from "../../components/Spacer";
import DelegationSelector from "../../components/DelegationSelector";
import ProposalOverview from "./ProposalOverview";

const Proposal: React.FC<any> = () => {
  const { color } = useContext(ThemeContext);
  const { id }: any = useParams();
  const { apiData } = useFantomApiData();
  const { walletContext } = useWalletProvider();
  const [selectedDelegation, setSelectedDelegation] = useState(null);
  const [activeDelegations, setActiveDelegations] = useState([]);

  const activeAddress = walletContext.activeWallet.address.toLowerCase();
  const delegationsResponse = apiData[FantomApiMethods.getDelegations];
  const accountDelegationsResponse = apiData[
    FantomApiMethods.getDelegationsForAccount
  ].get(activeAddress);
  const proposalResponse = apiData[FantomApiMethods.getGovernanceProposal];

  // TODO hardcoded address for governance contract
  useFantomApi(
    FantomApiMethods.getGovernanceProposal,
    {
      address: "0xaa3a160e91f63f1db959640e0a7b8911b6bd5b95",
      from: walletContext.activeWallet.address,
      id: id,
    },
    null,
    null,
    [
      activeAddress,
      delegatedToAddressesList(accountDelegationsResponse, delegationsResponse),
    ]
  );
  useFantomApi(
    FantomApiMethods.getDelegationsForAccount,
    {
      address: activeAddress,
    },
    activeAddress
  );
  useFantomApi(FantomApiMethods.getDelegations);

  useEffect(() => {
    if (accountDelegationsResponse?.data && delegationsResponse?.data) {
      const accountDelegations = getAccountDelegations(
        accountDelegationsResponse.data
      );
      const delegations = getDelegations(delegationsResponse.data);
      const enrichedDelegations = enrichAccountDelegationsWithStakerInfo(
        accountDelegations,
        delegations
      );
      setActiveDelegations(enrichedDelegations);
      setSelectedDelegation(enrichedDelegations[0] || null);
    }
  }, [accountDelegationsResponse, delegationsResponse]);

  return (
    <Column>
      <Row>
        <Column>
          <Typo1 style={{ color: color.greys.grey() }}>Select delegation</Typo1>
          <Spacer size="sm" />
          <DelegationSelector
            activeDelegations={activeDelegations}
            selectedDelegation={selectedDelegation}
            setSelectedDelegation={setSelectedDelegation}
            proposal={proposalResponse?.data?.govContract.proposal}
          />
        </Column>
      </Row>
      <Spacer size="xl" />
      <ProposalOverview
        proposal={proposalResponse?.data?.govContract.proposal}
        selectedDelegation={selectedDelegation}
      />
    </Column>
  );
};

export default Proposal;
