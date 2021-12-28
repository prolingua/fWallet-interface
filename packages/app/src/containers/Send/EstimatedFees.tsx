import React, { useContext, useEffect, useState } from "react";
import useWalletProvider from "../../hooks/useWalletProvider";
import useFantomERC20 from "../../hooks/useFantomERC20";
import { ThemeContext } from "styled-components";
import { BigNumber } from "@ethersproject/bignumber";
import {
  toCurrencySymbol,
  toFormattedBalance,
  weiToMaxUnit,
} from "../../utils/conversion";
import Row from "../../components/Row";
import Column from "../../components/Column";
import { Typo2 } from "../../components";
import FormattedValue from "../../components/FormattedBalance";
import Spacer from "../../components/Spacer";

// TODO: based on method names
const EstimatedFees: React.FC<any> = ({
  currency,
  token,
  tokenPrice,
  gasPrice,
  loading,
}) => {
  const { walletContext } = useWalletProvider();
  const { estimateGas } = useFantomERC20();
  const { color } = useContext(ThemeContext);
  const [estimatedGas, setEstimatedGas] = useState(BigNumber.from(0));
  const estimatedGasInUnits = parseFloat(weiToMaxUnit(estimatedGas.toString()));
  const formattedEstimatedGas = toFormattedBalance(estimatedGasInUnits, 18);

  useEffect(() => {
    const isNative = token.symbol === "FTM";
    const mockAddress = "0x000000000000000000000000000000000000dead";
    const mockAmount = "1000000000";

    if (!tokenPrice || !gasPrice) {
      return;
    }

    if (isNative) {
      return walletContext.activeWallet.provider
        .estimateGas({
          to: mockAddress,
          data: "0xd0e30db0",
          value: mockAmount,
        })
        .then((result: any) =>
          setEstimatedGas(result.mul(BigNumber.from(gasPrice.gasPrice)))
        );
    }

    return estimateGas(token.address, "transfer", [
      mockAddress,
      mockAmount,
    ]).then((result) =>
      setEstimatedGas(result.mul(BigNumber.from(gasPrice.gasPrice)))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency, token, loading]);

  return (
    <Row style={{ justifyContent: "center" }}>
      <Column
        style={{
          width: "60%",
          backgroundColor: color.primary.black(),
          borderRadius: "8px",
          padding: "1rem",
        }}
      >
        <Row>
          <Typo2
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>Estimated Fees</div>
            <FormattedValue
              formattedValue={formattedEstimatedGas}
              tokenSymbol={"FTM"}
            />
          </Typo2>
        </Row>
        <Spacer size="xs" />
        <Row>
          <Typo2
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>Estimated Fees in {toCurrencySymbol(currency)}</div>
            <div>
              {toCurrencySymbol(currency)}{" "}
              {(estimatedGasInUnits * (tokenPrice?.price?.price || 0)).toFixed(
                5
              )}
            </div>
          </Typo2>
        </Row>
      </Column>
    </Row>
  );
};

export default EstimatedFees;
