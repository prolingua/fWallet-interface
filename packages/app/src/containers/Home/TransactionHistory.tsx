import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  ContentBox,
  Heading1,
  OverlayButton,
  Typo1,
} from "../../components";
import Column from "../../components/Column";
import Spacer from "../../components/Spacer";
import TransactionLine from "../../components/TransactionLine";
import { getAccountTransactions } from "../../utils/account";
import Loader from "../../components/Loader";
import ErrorBoundary from "../../components/ErrorBoundary";
import Row from "../../components/Row";
import { CSVLink } from "react-csv";
import exportCSVImg from "../../assets/img/symbols/ExportCSV.svg";

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
  setCount,
  csvData,
}) => {
  const csvRef = useRef(null);
  const accountTransactions =
    !loading && getAccountTransactions(accountData.data);
  const [loadExport, setLoadExport] = useState(false);

  useEffect(() => {
    if (csvData?.length && loadExport) {
      csvRef.current.link.click();
      setLoadExport(false);
    }
  }, [csvData, loadExport]);

  return (
    <ContentBox style={{ flex: 2 }}>
      <Column style={{ width: "100%" }}>
        <Row style={{ justifyContent: "space-between" }}>
          <Heading1>History</Heading1>
          {accountTransactions.length > 0 && (
            <OverlayButton
              onClick={() => {
                setCount(100);
                setLoadExport(true);
              }}
            >
              {loadExport ? "exporting..." : <img src={exportCSVImg} />}
            </OverlayButton>
          )}
          <CSVLink
            ref={csvRef}
            data={csvData || []}
            filename={`fWallet-export-txHistory-${address}-${(
              Date.now() / 1000
            ).toFixed(0)}.csv`}
            style={{ display: "none" }}
          />
        </Row>
        <Spacer size="lg" />
        <ErrorBoundary name="[Home][History]">
          {loading ? (
            <Loader />
          ) : (
            <TransactionHistoryContent
              transactions={accountTransactions}
              address={address}
              tokenPrice={tokenPrice}
              currency={currency}
            />
          )}
        </ErrorBoundary>
      </Column>
    </ContentBox>
  );
};

export default TransactionHistory;
