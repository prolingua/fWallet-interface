import React from "react";
import fWalletLogo from "../../assets/img/fWalletLogo.svg";
import Spacer from "../../components/Spacer";

const SideBar: React.FC<any> = () => {
  return (
    <div
      style={{
        backgroundColor: "darkgray",
        display: "flex",
        flexDirection: "column",
        width: "12rem",
        padding: "2rem 0 0 2rem",
      }}
    >
      <img height="50" width="109" src={fWalletLogo} alt="fWallet" />
      <Spacer />
      <div style={{ marginBottom: "1rem" }}>SIDEBAR 1</div>
      <div style={{ marginBottom: "1rem" }}>SIDEBAR 2</div>
      <div style={{ marginBottom: "1rem" }}>SIDEBAR 3</div>
      <div style={{ marginBottom: "1rem" }}>SIDEBAR 4</div>
    </div>
  );
};

export default SideBar;
