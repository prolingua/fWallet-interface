import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "styled-components";
import { formatAddress, isSameAddress } from "../../utils/wallet";
import {
  formatHexToInt,
  hexToUnit,
  millisecondsToTimeUnit,
  toCurrencySymbol,
} from "../../utils/conversion";
import Row from "../Row";
import { LinkExt, OverlayButton, Typo1 } from "../index";
import Spacer from "../Spacer";
import config from "../../config/config";
import { StyledPair, StyledPairHeader, StyledPairValue } from "./styled";
import useFantomERC20 from "../../hooks/useFantomERC20";

const TransactionLine: React.FC<any> = ({
  address,
  transaction,
  tokenPrice,
  currency,
}) => {
  const { color } = useContext(ThemeContext);
  const { getDecimals } = useFantomERC20();
  const [expanded, setExpanded] = useState(false);
  const isSender = isSameAddress(address, transaction.from);
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState(null);
  const value = amount * tokenPrice;
  const timestamp = formatHexToInt(transaction.block.timestamp) * 1000;
  const now = Date.now();
  const transactionTimeAgo = millisecondsToTimeUnit(now - timestamp);
  const tokenTransactions = transaction.tokenTransactions;
  const [tokenDecimals, setTokenDecimals] = useState(null);

  // TODO improve for multiple tokens and for ERC721 & ERC1155 type
  // TODO refine transactions in total
  useEffect(() => {
    if (transaction.tokenTransactions.length) {
      if (
        tokenTransactions[0].tokenType === "ERC721" ||
        tokenTransactions[0].tokenType === "ERC1155"
      ) {
        setType(
          `${tokenTransactions[0].tokenType} ${
            tokenTransactions[0].tokenSymbol
          } [${parseInt(tokenTransactions[0].tokenId)}]`
        );
        return;
      }
      getDecimals(transaction.tokenTransactions[0].tokenAddress).then(
        (decimals) => {
          if (decimals && tokenTransactions[0].type !== "APPROVAL") {
            setTokenDecimals(decimals);
            setAmount(hexToUnit(transaction.value, decimals));
            return;
          }
          if (tokenTransactions[0].type === "APPROVAL") {
            setType(`Approve ${tokenTransactions[0].tokenSymbol} spend`);
            return;
          }
        }
      );
    }
    if (!transaction.tokenTransactions.length && transaction.value === "0x0") {
      setType(
        `Contract Interaction
           ${transaction?.to ? formatAddress(transaction.to) : ""}`
      );
      return;
    }
    if (!transaction.tokenTransactions.length && transaction.value) {
      setAmount(hexToUnit(transaction.value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaction.tokenTransactions]);

  const transactionBase = (
    <Row style={{ width: "100%", cursor: "pointer" }}>
      <Row style={{ flex: 3 }}>
        <Typo1 style={{ color: color.greys.grey() }}>
          {isSender ? "Sent" : "Received"}
        </Typo1>
        <Spacer size="xs" />
        <Typo1
          style={{
            color: color.primary.cyan(),
            fontWeight: "bold",
            textAlign: "start",
          }}
        >
          {type
            ? `${type}`
            : tokenTransactions.length
            ? tokenDecimals
              ? `${hexToUnit(tokenTransactions[0].amount, tokenDecimals)} ${
                  tokenTransactions[0].tokenSymbol
                }`
              : ""
            : `${amount.toFixed(2)} FTM`}
        </Typo1>
        {!tokenTransactions.length && !type && (
          <>
            <Spacer size="xs" />
            <Typo1 style={{ color: color.greys.darkGrey() }}>
              ({`${toCurrencySymbol(currency)}${value.toFixed(2)}`})
            </Typo1>
          </>
        )}
      </Row>
      <Typo1 style={{ color: color.greys.grey(), flex: 1, textAlign: "end" }}>
        {transactionTimeAgo} ago
      </Typo1>
    </Row>
  );

  return (
    <OverlayButton onClick={() => setExpanded(!expanded)}>
      {expanded ? (
        <div
          style={{
            backgroundColor: color.primary.black(),
            margin: "-1rem",
            padding: "1rem",
            borderRadius: "8px",
            border: `1px solid ${color.greys.mediumGray()}`,
            boxSizing: "border-box",
            cursor: "default",
          }}
        >
          {transactionBase}
          <Spacer />
          <Row>
            <StyledPair>
              <StyledPairHeader>Date</StyledPairHeader>
              <StyledPairValue
                style={{ color: color.primary.semiWhite(), fontSize: "14px" }}
              >
                {new Date(timestamp).toDateString()}
              </StyledPairValue>
            </StyledPair>
            <div style={{ flex: 1 }} />
            <StyledPair>
              <StyledPairHeader>{isSender ? "To" : "From"}</StyledPairHeader>
              <StyledPairValue
                style={{ color: color.primary.semiWhite(), fontSize: "14px" }}
              >
                <LinkExt
                  href={`${config.explorerUrl}address/${
                    isSender ? transaction.to : transaction.from
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {isSender ? transaction.to : transaction.from}
                </LinkExt>
              </StyledPairValue>
            </StyledPair>
          </Row>
          <Spacer />
          <Row>
            <StyledPair>
              <StyledPairHeader>Transaction ID</StyledPairHeader>
              <StyledPairValue
                style={{ color: color.primary.semiWhite(), fontSize: "14px" }}
              >
                <LinkExt
                  href={`${config.explorerUrl}${config.explorerTransactionPath}/${transaction.hash}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {transaction.hash}
                </LinkExt>
              </StyledPairValue>
            </StyledPair>
            <div style={{ flex: 1 }} />
            <div style={{ flex: 3 }} />
          </Row>
        </div>
      ) : (
        transactionBase
      )}
    </OverlayButton>
  );
};

export default TransactionLine;
