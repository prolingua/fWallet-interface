import React, { useContext, useState } from "react";

import { Button } from "../../components";
import { send } from "../../utils/transactions";
import { Contract } from "@ethersproject/contracts";
import { Provider, Web3Provider } from "@ethersproject/providers";
import useWalletProvider from "../../hooks/useWalletProvider";
import useTransaction from "../../hooks/useTransaction";
import { ThemeContext } from "styled-components";
import { useHistory } from "react-router-dom";
import { parseEther } from "@ethersproject/units";
import { Signer } from "@ethersproject/abstract-signer";
import useFantomApi, { FantomApiMethods } from "../../hooks/useFantomApi";
import useFantomApiData from "../../hooks/useFantomApiData";
// import { useQuery } from "@apollo/client";
// import { FETCH_TOKEN_PRICE } from "../../graphql/subgraph";

const getNativeBalance = async (provider: Provider, account: string) => {
  const balance = await provider.getBalance(account);
  return balance.toString();
};

const sendTransaction = async (signer: Signer, to: string, value: string) => {
  return signer.sendTransaction({
    to: to,
    value: parseEther(value),
  });
};

const callContract = async (
  contracts: Map<string, Contract>,
  account: string
) => {
  const ppdexContract = contracts.get("PPDEX");
  const balance = await ppdexContract.balanceOf(account);
  return balance.toString();
};

const sendContract = async (
  contracts: Map<string, Contract>,
  dispatch: any,
  provider: Web3Provider
) => {
  const ppdexContract = contracts.get("PPDEX");
  return send(provider, () => ppdexContract.stakePpblz(100), dispatch);
};

const Test: React.FC<any> = () => {
  const { walletContext } = useWalletProvider();
  const { transaction, dispatchTx } = useTransaction();
  const { apiData } = useFantomApiData();
  const { color } = useContext(ThemeContext);
  const history = useHistory();
  // const {
  //   loading: GET_GAS_PRICE_loading,
  //   error: GET_GAS_PRICE_error,
  //   data: GET_GAS_PRICE_data,
  // } = useQuery(FETCH_GAS_PRICE);
  // const {
  //   loading: GET_TOKEN_PRICE_loading,
  //   error: GET_TOKEN_PRICE_error,
  //   data: GET_TOKEN_PRICE_data,
  //   refetch: DO_REFETCH,
  // } = useQuery(FETCH_TOKEN_PRICE, { variables: { to: "USD" } });

  const [loading, setLoading] = useState([]);
  const [notConnectedNativeBalance, setNotConnectedNativeBalance] = useState(
    null
  );
  const [nativeBalance, setNativeBalance] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);

  useFantomApi(FantomApiMethods.getGasPrice, null);

  useFantomApi(FantomApiMethods.getTokenPrice, { to: "USD" });
  // useEffect(() => {
  //   console.log({
  //     GET_GAS_PRICE_loading,
  //     GET_GAS_PRICE_error,
  //     GET_GAS_PRICE_data,
  //   });
  // }, [GET_GAS_PRICE_loading, GET_GAS_PRICE_error, GET_GAS_PRICE_data]);

  // useEffect(() => {
  //   console.log({
  //     GET_TOKEN_PRICE_loading,
  //     GET_TOKEN_PRICE_error,
  //     GET_TOKEN_PRICE_data,
  //   });
  // }, [GET_TOKEN_PRICE_loading, GET_TOKEN_PRICE_error, GET_TOKEN_PRICE_data]);

  return (
    <div
      style={{
        backgroundColor: color.secondary.navy(),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "4rem",
      }}
    >
      <div
        style={{
          height: "2rem",
          paddingBottom: "2rem",
          fontSize: "40px",
          fontWeight: "bold",
        }}
      >
        {history.location.pathname}
      </div>
      <Button
        variant="primary"
        onClick={() => {
          // console.log(DO_REFETCH);
          // DO_REFETCH();
          apiData[FantomApiMethods.getGasPrice].refetch();
        }}
      >
        REFETCH
      </Button>
      <Button
        variant="primary"
        disabled={!walletContext.activeWallet.provider}
        onClick={() =>
          getNativeBalance(
            walletContext.activeWallet.provider,
            "0x93FF1ff42f534BbEE207fa380d967C760d27076A"
          ).then((result) => setNotConnectedNativeBalance(result))
        }
      >
        Get Native Balance Without being connected
      </Button>
      <div>Your native balance: {notConnectedNativeBalance || "No data"}</div>
      <div style={{ height: "2rem" }} />
      <Button
        variant="primary"
        disabled={!walletContext.activeWallet.provider}
        onClick={() =>
          getNativeBalance(
            walletContext.activeWallet.provider,
            walletContext.activeWallet.address
          ).then((result) => setNativeBalance(result))
        }
      >
        Get Native Balance
      </Button>
      <div>Your native balance: {nativeBalance || "No data"}</div>
      <div style={{ height: "2rem" }} />
      <Button
        variant="primary"
        disabled={!walletContext.activeWallet.provider}
        onClick={() =>
          callContract(
            walletContext.activeWallet.contracts,
            walletContext.activeWallet.address
          ).then((result) => setTokenBalance(result))
        }
      >
        Get Token Balance
      </Button>
      <div>Your token balance: {tokenBalance || "No data"}</div>
      <div style={{ height: "2rem" }} />
      <Button
        variant="primary"
        disabled={!walletContext.activeWallet.provider}
        onClick={() => {
          setLoading([...loading, "test"]);
          sendTransaction(
            walletContext.activeWallet.signer,
            "0xDbA4392F0fC03B4FFF1b42861ad733FcfA812da7",
            "0.1"
          ).finally(() =>
            setLoading(loading.filter((item) => item === "test"))
          );
        }}
      >
        {loading.find((item) => item === "test")
          ? "Sending..."
          : "Send Native Transaction (0.1 FTM)"}
      </Button>
      <div style={{ height: "2rem" }} />
      <Button
        variant="primary"
        disabled={!walletContext.activeWallet.provider}
        onClick={() => {
          setLoading([...loading, "test"]);
          sendContract(
            walletContext.activeWallet.contracts,
            dispatchTx,
            walletContext.activeWallet.provider
          ).finally(() =>
            setLoading(loading.filter((item) => item === "test"))
          );
        }}
      >
        {loading.find((item) => item === "test")
          ? "Sending..."
          : "Send Contract Transaction"}
      </Button>
      <div style={{ height: "2rem" }} />
      <div>
        <div style={{ fontWeight: "bold" }}> Transaction details: </div>
        {transaction && transaction.id ? (
          <p>{JSON.stringify(transaction)}</p>
        ) : (
          <span>
            {transaction.error
              ? JSON.stringify(transaction.error.error.message, null, 2)
              : "No transaction data"}
          </span>
        )}
      </div>
    </div>
  );
};

export default Test;
