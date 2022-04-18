import { Button, Header, Heading3, OverlayButton } from "../../components";
import Row from "../../components/Row";
import React from "react";
import fWalletLogoImg from "../../assets/img/fWalletLogo_beta.svg";
import Spacer from "../../components/Spacer";
// import moonSymbolImg from "../../assets/img/symbols/Moon.svg";

const OnboardingTopBar: React.FC<any> = ({ setContentFlow }) => {
  return (
    <Header style={{ padding: "0 2rem" }}>
      <Row
        style={{
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <img height="50" width="109" src={fWalletLogoImg} alt="fWallet" />
        </div>
        <Row style={{ alignItems: "center" }}>
          {/*<OverlayButton onClick={() => setContentFlow("accessWallet")}>*/}
          {/*  <Heading3>Access wallet</Heading3>*/}
          {/*</OverlayButton>*/}
          {/*<Spacer size="xl" />*/}
          {/*<OverlayButton onClick={() => setContentFlow("newWallet")}>*/}
          {/*  <Heading3>Create new wallet</Heading3>*/}
          {/*</OverlayButton>*/}
          {/*<Spacer size="xl" />*/}
          {/*<Button style={{ height: "56px", width: "56px" }} variant="secondary">*/}
          {/*<Row*/}
          {/*  style={{*/}
          {/*    height: "100%",*/}
          {/*    width: "100%",*/}
          {/*    alignItems: "center",*/}
          {/*    justifyContent: "center",*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <img src={moonSymbolImg} />*/}
          {/*</Row>*/}
          {/*</Button>*/}
        </Row>
      </Row>
    </Header>
  );
};

export default OnboardingTopBar;
