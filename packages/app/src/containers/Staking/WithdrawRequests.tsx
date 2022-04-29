import React, { useContext } from "react";
import { ThemeContext } from "styled-components";
import { getAccountDelegations } from "../../utils/delegation";
import Row from "../../components/Row";
import { ContentBox, Heading1, Typo2 } from "../../components";
import Spacer from "../../components/Spacer";
import Column from "../../components/Column";
import WithdrawRequestRow from "../../components/WithdrawRequestRow";
import Loader from "../../components/Loader";

const WithdrawRequestsContent: React.FC<any> = ({ accountDelegationsData }) => {
  const { color } = useContext(ThemeContext);
  const accountDelegations = getAccountDelegations(accountDelegationsData);
  // TODO fix typecasting of AccountDelegation
  const withdrawRequests = accountDelegations.reduce((accumulator, current) => {
    if ((current as any).delegation.withdrawRequests?.length) {
      (current as any).delegation.withdrawRequests.forEach((wr: any) => {
        accumulator.push({
          toStakerId: (current as any).delegation.toStakerId,
          ...wr,
        });
      });
    }
    return accumulator;
  }, []);
  const activeWithdrawRequests = withdrawRequests.filter(
    (wr: any) => wr.withdrawTime === null
  );

  return (
    <div>
      {" "}
      <Row style={{ justifyContent: "space-between" }}>
        <Typo2
          style={{
            width: "3rem",
            fontWeight: "bold",
            color: color.greys.grey(),
          }}
        >
          ID
        </Typo2>
        <Typo2
          style={{
            width: "10rem",
            fontWeight: "bold",
            color: color.greys.grey(),
          }}
        >
          Amount
        </Typo2>
        <Typo2
          style={{
            flex: 2,
            fontWeight: "bold",
            color: color.greys.grey(),
            textAlign: "end",
          }}
        >
          Unlocking in
        </Typo2>
      </Row>
      <Spacer size="lg" />
      <Column style={{ gap: ".5rem" }}>
        {activeWithdrawRequests.length ? (
          activeWithdrawRequests
            .sort((a, b) => a.createdTime - b.createdTime)
            .map((wr) => {
              return (
                <WithdrawRequestRow
                  key={`wr-rq-row-${wr.withdrawRequestID}`}
                  withdrawRequest={wr}
                  size="sm"
                  withId
                />
              );
            })
        ) : (
          <Typo2 style={{ color: "#B7BECB" }}>
            No pending withdraw requests
          </Typo2>
        )}
      </Column>
    </div>
  );
};

const WithdrawRequests: React.FC<any> = ({
  loading,
  accountDelegations,
  delegations,
}) => {
  return (
    <ContentBox>
      <Column style={{ width: "100%" }}>
        <Heading1>Withdraw Requests</Heading1>
        <Spacer />
        {loading ? (
          <Loader />
        ) : (
          <WithdrawRequestsContent
            accountDelegationsData={accountDelegations.data}
            delegationsData={delegations.data}
          />
        )}
        <Spacer />
      </Column>
    </ContentBox>
  );
};

export default WithdrawRequests;
