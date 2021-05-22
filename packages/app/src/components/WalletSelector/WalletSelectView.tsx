import React from "react";
import Row from "../Row";
import stc from "string-to-color";
import Column from "../Column";
import { formatAddress } from "../../utils/wallet";
import { Typo2 } from "../index";

const WalletSelectView: React.FC<any> = ({ wallet }) => {
  return (
    <Row key={wallet.address}>
      <div
        style={{
          alignSelf: "center",
          backgroundColor: stc(wallet.address.toLowerCase()),
          borderRadius: "50%",
          height: "1.8rem",
          width: "1.8rem",
          marginRight: ".6rem",
        }}
      />
      <Column style={{ alignItems: "baseline" }}>
        <div style={{ fontSize: "18px", fontWeight: "bold" }}>
          {formatAddress(wallet.address)}
        </div>
        <Typo2 style={{ color: "#B7BECB" }}>{wallet.providerType}</Typo2>
      </Column>
    </Row>
  );
};

export default WalletSelectView;
