import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "styled-components";
import { isSameAddress } from "../../utils/wallet";
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
  const amount = hexToUnit(transaction.value);
  const value = amount * tokenPrice;
  const timestamp = formatHexToInt(transaction.block.timestamp) * 1000;
  const now = Date.now();
  const transactionTimeAgo = millisecondsToTimeUnit(now - timestamp);
  const tokenTransactions = transaction.tokenTransactions;
  const [tokenDecimals, setTokenDecimals] = useState(null);

  // TODO improve for multiple tokens and for ERC721 & ERC1155 type
  useEffect(() => {
    if (transaction.tokenTransactions.length) {
      getDecimals(transaction.tokenTransactions[0].tokenAddress).then(
        (decimals) => {
          if (decimals) {
            setTokenDecimals(decimals);
          }
        }
      );
    }
  }, [transaction.tokenTransactions]);

  const transactionBase = (
    <Row style={{ width: "100%", cursor: "pointer" }}>
      <Row style={{ flex: 3 }}>
        <Typo1 style={{ color: color.greys.grey() }}>
          {isSender ? "Sent" : "Received"}
        </Typo1>
        <Spacer size="xs" />
        <Typo1 style={{ color: color.primary.cyan(), fontWeight: "bold" }}>
          {tokenTransactions.length
            ? tokenDecimals
              ? `${hexToUnit(tokenTransactions[0].amount, tokenDecimals)} ${
                  tokenTransactions[0].tokenSymbol
                }`
              : ""
            : `${amount.toFixed(2)} FTM`}
        </Typo1>
        {!tokenTransactions.length && (
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
                {isSender ? transaction.to : transaction.from}
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
