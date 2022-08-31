import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "styled-components";
import useWalletProvider from "../../hooks/useWalletProvider";
import { isSameAddress, isValidAddress } from "../../utils/wallet";
import Column from "../Column";
import Row from "../Row";
import { Input, OverlayButton, Typo2, Typo3 } from "../index";
import walletSymbol from "../../assets/img/symbols/wallet.svg";
import Spacer from "../Spacer";
import AddressBalance from "../AddressBalance";
import InputError from "../InputError";
import useUnstoppableDomains from "../../hooks/useUnstoppableDomains";

const InputAddress: React.FC<any> = ({
  token,
  setReceiverAddress,
  initial,
}) => {
  const { color } = useContext(ThemeContext);
  const { walletContext } = useWalletProvider();
  const {
    getFantomDomainForAddress,
    getFantomAddressForDomain,
    isValidDomain,
  } = useUnstoppableDomains();

  const [value, setValue] = useState(initial || "");
  const [error, setError] = useState(null);
  const [validAddress, setValidAddress] = useState(null);
  const [domain, setDomain] = useState("");
  const [labels, setLabels] = useState([]);
  const [validDomain, setValidDomain] = useState(null);

  const onHandleBlur = (value: string) => {
    if (!value.length) {
      return;
    }

    if (!isValidAddress(value) && !isValidDomain(value)) {
      setError("Invalid fantom address or domain");
    }
  };

  const onHandleChange = (value: string) => {
    setError(null);
    setValidAddress(null);
    setDomain("");
    setLabels([]);
    setValidDomain(null);
    setReceiverAddress(null);
    setValue(value);

    if (isValidAddress(value)) {
      if (isSameAddress(value, walletContext.activeWallet.address)) {
        return setError("Receiver address is same as sender address");
      }
      return setValidAddress(value);
    }

    if (isValidDomain(value)) {
      //TODO check if same address as sender
      return setValidDomain(value);
    }

    if ((value.length === 42 && !isValidAddress(value)) || value.length > 42) {
      return setError("Invalid address");
    }
  };

  useEffect(() => {
    setDomain(null);
    if (value) {
      if (isValidAddress(value)) {
        setReceiverAddress(value);
        getFantomDomainForAddress(value).then((fetchedDomains) => {
          setLabels([...fetchedDomains, validAddress]);
        });
      }
      if (isValidDomain(value)) {
        getFantomAddressForDomain(value).then((fetchedAddress) => {
          if (fetchedAddress) {
            setReceiverAddress(fetchedAddress);
            setLabels([
              ...labels.filter(
                (label) =>
                  label?.toLowerCase() !== fetchedAddress?.toLowerCase()
              ),
              fetchedAddress,
            ]);
            setValidAddress(fetchedAddress);
            return;
          }
          setError("Invalid fantom address or domain");
        });
      }
    }
  }, [value]);

  // useEffect(() => {
  //   if (validAddress) {
  //     setReceiverAddress(value);
  //     getFantomDomainForAddress(value).then((fetchedDomains) => {
  //       setLabels([...fetchedDomains, validAddress]);
  //     });
  //   }
  // }, [validAddress]);

  useEffect(() => {
    if (domain) {
      setValue(domain);
    }
  }, [domain]);

  // useEffect(() => {
  //   if (validDomain) {
  //     setValidAddress(null);
  //     getFantomAddressForDomain(value).then((fetchedAddress) => {
  //       if (fetchedAddress) {
  //         setReceiverAddress(fetchedAddress);
  //         setLabels([...labels, fetchedAddress]);
  //         setValidAddress(fetchedAddress);
  //         return;
  //       }
  //       setError("Invalid fantom address or domain");
  //     });
  //   }
  // }, [validDomain]);

  const createLabel = (text: string) => {
    return (
      <OverlayButton
        key={`address-label-${text}`}
        style={{ padding: 0 }}
        onClick={() => setValue(text)}
      >
        <Row
          style={{
            backgroundColor: "#0a162e",
            padding: ".3rem .6rem",
            borderRadius: "8px",
          }}
        >
          <Typo3>{text}</Typo3>
        </Row>
      </OverlayButton>
    );
  };

  return (
    <Column>
      <Row style={{ justifyContent: "space-between" }}>
        <Typo2 style={{ color: color.greys.grey() }}>To</Typo2>
        {validAddress && (
          <Row>
            <img alt="" src={walletSymbol} />
            <Spacer size="xs" />
            {validAddress ? (
              <AddressBalance address={validAddress} token={token} />
            ) : (
              <Typo2 style={{ color: color.greys.grey() }}>
                {`0 ${token.symbol}`}
              </Typo2>
            )}
          </Row>
        )}
      </Row>
      <Spacer size="xs" />
      <Row
        style={{
          backgroundColor: "#202F49",
          borderRadius: "8px",
          height: "64px",
          alignItems: "center",
        }}
      >
        <Spacer />
        <Input
          style={{ maxWidth: "80%", fontSize: "18px" }}
          type="text"
          value={value}
          onChange={(event) => {
            onHandleChange(event.target.value);
          }}
          onBlur={(event) => onHandleBlur(event.target.value)}
          placeholder="Input a Fantom Opera address"
        />
      </Row>
      <Spacer size="xs" />
      {labels?.length > 0 && (
        <Row style={{ flexWrap: "wrap", gap: ".5rem" }}>
          {labels
            .filter((label) => label?.toLowerCase() !== value?.toLowerCase())
            .map((label) => createLabel(label))}
        </Row>
      )}
      {error ? (
        <Row>
          <Spacer size="xxs" />
          <InputError error={error} />
        </Row>
      ) : (
        <Spacer size="lg" />
      )}
    </Column>
  );
};

export default InputAddress;
