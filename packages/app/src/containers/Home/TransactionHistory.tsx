import React from "react";
import { ContentBox, Heading1 } from "../../components";
import Column from "../../components/Column";
import Spacer from "../../components/Spacer";
import TransactionLine from "../../components/TransactionLine";

const TransactionHistory: React.FC<any> = ({
  loading,
  history,
  address,
  tokenPrice,
  currency,
}) => {
  const edges = history?.data?.account?.txList?.edges;

  return (
    <ContentBox style={{ flex: 1 }}>
      <Column style={{ width: "100%" }}>
        <Heading1>History</Heading1>
        <Spacer size="lg" />
        <>
          {loading ? (
            <div>LOADING...</div>
          ) : (
            edges &&
            edges.map((edge: any, index: number) => {
              return (
                <Column key={edge.transaction.hash}>
                  <TransactionLine
                    key={edge.transaction.hash}
                    address={address}
                    transaction={edge.transaction}
                    tokenPrice={tokenPrice}
                    currency={currency}
                  />
                  <Spacer key={edge.transaction.hash + index} size="lg" />
                </Column>
              );
            })
          )}
        </>
      </Column>
    </ContentBox>
  );
};

export default TransactionHistory;
