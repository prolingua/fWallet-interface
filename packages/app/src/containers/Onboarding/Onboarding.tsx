import Column from "../../components/Column";
import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "styled-components";
import OnboardingTopBar from "./OnboardingTopBar";
import Row from "../../components/Row";
import {
  Button,
  ContentBox,
  Heading1,
  Heading2,
  Heading3,
  OverlayButton,
  Typo1,
  Typo2,
} from "../../components";
import Spacer from "../../components/Spacer";
import walletSymbolImg from "../../assets/img/symbols/WalletBlue.svg";
import keysSymbolImg from "../../assets/img/symbols/Keys.svg";
import checkmarkBlueImg from "../../assets/img/shapes/checkmarkBlue.svg";
import ledgerImg from "../../assets/img/icons/ledgerBlue.svg";
import metamaskImg from "../../assets/img/icons/metamaskBlue.svg";
import keystoreImg from "../../assets/img/icons/keystoreBlue.svg";
import useWeb3Modal from "../../hooks/useWeb3Modal";
import useModal from "../../hooks/useModal";
import ModalTitle from "../../components/ModalTitle";
import Modal from "../../components/Modal";
import keystoreFileImg from "../../assets/img/icons/keystoreFileIcon.svg";
import mnemonicImg from "../../assets/img/icons/mnemonicIcon.svg";
import pkeyImg from "../../assets/img/icons/privatekeyIcon.svg";
import InputTextBox from "../../components/InputText/InputTextBox";
import { useKeyStoreWallet } from "../../hooks/useKeyStoreWallet";

const ConnectPrivateKey: React.FC<any> = ({ onDismiss }) => {
  const { restoreWalletFromPrivateKey } = useKeyStoreWallet();
  const [text, setText] = useState("");
  const [error, setError] = useState(null);

  const handleConnect = async () => {
    try {
      await restoreWalletFromPrivateKey(text);
      onDismiss();
    } catch (err) {
      console.error(err);
      setError("Invalid value");
    }
  };

  return (
    <Column style={{ width: "100%", alignItems: "center" }}>
      <Spacer />
      <img style={{ width: "6rem" }} src={pkeyImg} />
      <Spacer />
      <Heading1>Private key</Heading1>
      <Spacer size="xl" />
      <Row style={{ width: "100%" }}>
        <InputTextBox
          error={error}
          setError={setError}
          style={{ width: "100%" }}
          maxLength={66}
          text={text}
          setText={setText}
          placeholder="input your private key here"
          alignText="center"
        />
      </Row>
      <Spacer />
      <Button
        disabled={text.length !== 66}
        onClick={() => {
          handleConnect();
        }}
        variant="primary"
      >
        Access wallet
      </Button>
      <Spacer />
    </Column>
  );
};

const AccessBySoftwareModal: React.FC<any> = ({ onDismiss, setFlow }) => {
  const { color } = useContext(ThemeContext);
  const [software, setSoftware] = useState(null);
  const [selectedSoftware, setSelectedSoftware] = useState(null);

  const NotRecommended = (
    <ContentBox style={{ backgroundColor: "rgba(248, 66, 57, .15)" }}>
      <Column>
        <Typo2 style={{ fontWeight: "bold" }}>Not recommended</Typo2>
        <Spacer size="sm" />
        <Typo2>
          This is not recommended way to access your wallet. Due to the
          sensitivity of the information involved, these options should only be
          used by experienced users.
        </Typo2>
      </Column>
    </ContentBox>
  );
  const SelectSoftware = (
    <>
      <ModalTitle text="Access by Software" />
      <Column>{NotRecommended}</Column>
      <Spacer size="xl" />
      <Row style={{ width: "100%", justifyContent: "space-between" }}>
        <OverlayButton onClick={() => setSoftware("keystore")}>
          <ContentBox
            style={{
              backgroundColor: color.primary.black(),
              width: "15rem",
              height: "15rem",
              boxSizing: "border-box",
              border: software === "keystore" && "2px solid #1969FF",
            }}
          >
            <Column
              style={{
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img src={keystoreFileImg} />
              <Spacer size="sm" />
              <Heading3>Keystore file</Heading3>
            </Column>
          </ContentBox>
        </OverlayButton>
        <OverlayButton onClick={() => setSoftware("mnemonic")}>
          <ContentBox
            style={{
              backgroundColor: color.primary.black(),
              width: "15rem",
              height: "15rem",
              boxSizing: "border-box",
              border: software === "mnemonic" && "2px solid #1969FF",
            }}
          >
            <Column
              style={{
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img src={mnemonicImg} />
              <Spacer size="sm" />
              <Heading3>Mnemonic Phrase</Heading3>
            </Column>
          </ContentBox>
        </OverlayButton>
        <OverlayButton onClick={() => setSoftware("pkey")}>
          <ContentBox
            style={{
              backgroundColor: color.primary.black(),
              width: "15rem",
              height: "15rem",
              boxSizing: "border-box",
              border: software === "pkey" && "2px solid #1969FF",
            }}
          >
            <Column
              style={{
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img src={pkeyImg} />
              <Spacer size="sm" />
              <Heading3>Private key</Heading3>
            </Column>
          </ContentBox>
        </OverlayButton>
      </Row>
      <Spacer size="xl" />
      <Column style={{ alignItems: "center" }}>
        <Typo2 style={{ color: color.greys.grey() }}>
          Purchase a hardware wallet for the highest security when accessing
          your crypto.
        </Typo2>
        <Spacer size="xs" />
        <OverlayButton>
          <Typo2 style={{ color: color.primary.cyan(), fontWeight: "bold" }}>
            Purchase a hardware wallet
          </Typo2>
        </OverlayButton>
      </Column>
      <Spacer size="xl" />
      <Button
        disabled={!software}
        style={{ width: "100%" }}
        onClick={() => setSelectedSoftware(software)}
        variant="primary"
      >
        Continue
      </Button>
      <Spacer />
    </>
  );

  useEffect(() => {
    return () => setFlow(null);
  }, []);

  return (
    <Modal onDismiss={onDismiss} style={{ width: "50rem" }}>
      {!selectedSoftware && SelectSoftware}
      {selectedSoftware === "pkey" && (
        <ConnectPrivateKey onDismiss={onDismiss} />
      )}
    </Modal>
  );
};

const AccessWallet: React.FC<any> = ({ setFlow }) => {
  const { color } = useContext(ThemeContext);
  const [loadWeb3Modal] = useWeb3Modal();
  const [tool, setTool] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);

  const [onPresentAccessByKeystoreModal] = useModal(
    <AccessBySoftwareModal setFlow={setFlow} />,
    "access-by-software-modal"
  );

  useEffect(() => {
    if (selectedTool === "metamask") {
      loadWeb3Modal();
    }
    if (selectedTool === "keystore") {
      onPresentAccessByKeystoreModal();
    }
  }, [selectedTool]);

  return (
    <Column>
      {!selectedTool && (
        <Column>
          <Spacer size="xxl" />
          <Heading1 style={{ textAlign: "center" }}>
            How do you want to access your wallet?
          </Heading1>
          <Spacer />
          <Row style={{ gap: "1rem" }}>
            <OverlayButton onClick={() => setTool("ledger")}>
              <ContentBox
                style={{
                  width: "16rem",
                  height: "16rem",
                  boxSizing: "border-box",
                  border: tool === "ledger" && "2px solid #1969FF",
                }}
              >
                <Column
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img src={ledgerImg} />
                  <Heading2>Ledger</Heading2>
                </Column>
              </ContentBox>
            </OverlayButton>
            <OverlayButton onClick={() => setTool("metamask")}>
              <ContentBox
                style={{
                  width: "16rem",
                  height: "16rem",
                  boxSizing: "border-box",
                  border: tool === "metamask" && "2px solid #1969FF",
                }}
              >
                <Column
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img src={metamaskImg} />
                  <Heading2>Metamask</Heading2>
                </Column>
              </ContentBox>
            </OverlayButton>
            <OverlayButton onClick={() => setTool("keystore")}>
              <ContentBox
                style={{
                  width: "16rem",
                  height: "16rem",
                  boxSizing: "border-box",
                  border: tool === "keystore" && "2px solid #1969FF",
                }}
              >
                <Column
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img src={keystoreImg} />
                  <Heading2>Software</Heading2>
                </Column>
              </ContentBox>
            </OverlayButton>
          </Row>
          <Spacer size="xl" />
          <Column style={{ alignSelf: "center" }}>
            <Button
              disabled={!tool}
              onClick={() => setSelectedTool(tool)}
              style={{ width: "20rem" }}
              variant="primary"
            >
              Continue
            </Button>
            <Spacer size="lg" />
            <OverlayButton onClick={() => setFlow(null)}>
              <Typo1
                style={{ fontWeight: "bold", color: color.primary.cyan() }}
              >
                Cancel
              </Typo1>
            </OverlayButton>
            <Spacer size="xl" />
            <Spacer size="xl" />
            <Column
              style={{
                marginTop: "auto",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typo1 style={{ color: color.greys.grey() }}>
                Dont have a wallet?
              </Typo1>
              <Spacer size="sm" />
              <OverlayButton onClick={() => setFlow("newWallet")}>
                <Typo1
                  style={{ fontWeight: "bold", color: color.primary.cyan() }}
                >
                  Create a wallet
                </Typo1>
              </OverlayButton>
            </Column>
          </Column>
        </Column>
      )}
    </Column>
  );
};

const CreateOrAccessWallet: React.FC<any> = ({ setFlow }) => {
  const { color } = useContext(ThemeContext);
  return (
    <Row>
      <ContentBox style={{ width: "20rem" }}>
        <Column style={{ width: "100%" }}>
          <Spacer />
          <img
            style={{ alignSelf: "center", height: "78px", width: "84px" }}
            src={walletSymbolImg}
          />
          <Spacer size="xl" />
          <Heading1>Create a new wallet</Heading1>
          <Spacer />
          <Typo2 style={{ color: color.greys.grey() }}>
            Generate you unique wallet
          </Typo2>
          <Spacer />
          <Typo2 style={{ color: color.greys.grey() }}>
            Receive your own unique public address, and create access and
            recovery credentials.
          </Typo2>
          <Spacer size="xl" />
          <Button
            onClick={() => setFlow("newWallet")}
            style={{
              marginTop: "auto",
              backgroundColor: color.greys.realDarkGrey(),
            }}
            variant="primary"
          >
            Get started
          </Button>
        </Column>
      </ContentBox>
      <Spacer />
      <ContentBox style={{ width: "20rem" }}>
        {" "}
        <Column style={{ width: "100%" }}>
          <Spacer />
          <img
            style={{ alignSelf: "center", height: "78px", width: "84px" }}
            src={keysSymbolImg}
          />
          <Spacer size="xl" />
          <Heading1>Access your wallet</Heading1>
          <Spacer />
          <Typo2 style={{ color: color.greys.grey() }}>
            Connect to the Fantom network and:
          </Typo2>
          <Spacer size="sm" />
          <Row>
            <img src={checkmarkBlueImg} />
            <Spacer size="xs" />
            <Typo2>Send and receive FTM</Typo2>
          </Row>
          <Spacer size="sm" />
          <Row>
            <img src={checkmarkBlueImg} />
            <Spacer size="xs" />
            <Typo2>Stake your FTM</Typo2>
          </Row>
          <Spacer size="sm" />
          <Row>
            <img src={checkmarkBlueImg} />
            <Spacer size="xs" />
            <Typo2>Collect your rewards</Typo2>
          </Row>
          <Spacer size="xl" />
          <Button onClick={() => setFlow("accessWallet")} variant="primary">
            Access now
          </Button>
        </Column>
      </ContentBox>
    </Row>
  );
};

const OnboardingContent: React.FC<any> = ({ contentFlow, setContentFlow }) => {
  return (
    <Column>
      {!contentFlow && <CreateOrAccessWallet setFlow={setContentFlow} />}
      {contentFlow === "accessWallet" && (
        <AccessWallet setFlow={setContentFlow} />
      )}
      {contentFlow === "newWallet" && <Row>NEW WALLET</Row>}
    </Column>
  );
};

const Onboarding: React.FC<any> = () => {
  const { color } = useContext(ThemeContext);
  const [contentFlow, setContentFlow] = useState(null);
  return (
    <Column style={{ width: "100%" }}>
      <OnboardingTopBar setContentFlow={setContentFlow} />
      <Column
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <OnboardingContent
          setContentFlow={setContentFlow}
          contentFlow={contentFlow}
        />
      </Column>
      <Row
        style={{
          padding: "2rem",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typo2 style={{ color: "#707B8F" }}>
          By using this application you agree to the
        </Typo2>
        <Spacer size="xxs" />
        <Typo2 style={{ color: color.greys.grey() }}>Terms of Use.</Typo2>
      </Row>
    </Column>
  );
};

export default Onboarding;
