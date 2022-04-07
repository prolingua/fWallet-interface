import React from "react";
import { getAccountDelegationSummary } from "../../utils/delegation";
import { toFormattedBalance, weiToUnit } from "../../utils/conversion";
import Row from "../../components/Row";
import StatPair from "../../components/StatPair";
import { ContentBox, Heading1 } from "../../components";
import Column from "../../components/Column";
import Spacer from "../../components/Spacer";
import Loader from "../../components/Loader";

const StakingOverviewContent: React.FC<any> = ({ accountDelegationsData }) => {
  const totalDelegated = getAccountDelegationSummary(accountDelegationsData);
  const stakedFTM = toFormattedBalance(weiToUnit(totalDelegated.totalStaked));
  return (
    <Row>
      <StatPair
        title="Staked FTM"
        value1={stakedFTM[0]}
        value2={stakedFTM[1]}
        suffix="FTM"
        spacer="xs"
      />
    </Row>
  );
};
const StakingOverview: React.FC<any> = ({ loading, accountDelegations }) => {
  return (
    <ContentBox>
      <Column>
        <Heading1>Overview</Heading1>
        <Spacer />
        {loading ? (
          <Loader />
        ) : (
          <StakingOverviewContent
            accountDelegationsData={accountDelegations.data}
          />
        )}
      </Column>
    </ContentBox>
  );
};

export default StakingOverview;
