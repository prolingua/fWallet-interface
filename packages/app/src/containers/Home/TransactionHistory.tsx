import React from "react";
import { ContentBox, Heading1, Typo1 } from "../../components";
import Column from "../../components/Column";
import Spacer from "../../components/Spacer";
import TransactionLine from "../../components/TransactionLine";
import { getAccountTransactions } from "../../utils/account";

const TransactionHistoryContent: React.FC<any> = ({
  transactions,
  address,
  tokenPrice,
  currency,
}) => {
  return (
    <>
      {transactions?.length ? (
        transactions.map((edge: any, index: number) => {
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
      ) : (
        <Typo1>No transactions found</Typo1>
      )}
    </>
  );
};

const TransactionHistory: React.FC<any> = ({
  loading,
  accountData,
  address,
  tokenPrice,
  currency,
}) => {
  const accountTransactions =
    !loading && getAccountTransactions(accountData.data);

  return (
    <ContentBox style={{ flex: 2 }}>
      <Column style={{ width: "100%" }}>
        <Heading1>History</Heading1>
        <Spacer size="lg" />
        {loading ? (
          <div>LOADING...</div>
        ) : (
          <TransactionHistoryContent
            transactions={accountTransactions}
            address={address}
            tokenPrice={tokenPrice}
            currency={currency}
          />
        )}
      </Column>
    </ContentBox>
  );
};

export default TransactionHistory;
