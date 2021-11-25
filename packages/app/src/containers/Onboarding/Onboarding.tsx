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
import useModal from "../../hooks/useModal";
import ModalTitle from "../../components/ModalTitle";
import Modal from "../../components/Modal";
import keystoreFileImg from "../../assets/img/icons/keystoreFileIcon.svg";
import mnemonicImg from "../../assets/img/icons/mnemonicIcon.svg";
import pkeyImg from "../../assets/img/icons/privatekeyIcon.svg";
import InputTextBox from "../../components/InputText/InputTextBox";
import { useSoftwareWallet } from "../../hooks/useSoftwareWallet";
import { useDropzone } from "react-dropzone";
import fileIcon from "../../assets/img/icons/fileWhite.svg";
import crossIcon from "../../assets/img/symbols/Cross.svg";
import {
  useInjectedWallet,
  useLedger,
  useWalletLink,
} from "../../hooks/useConnectWallet";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import useWalletProvider from "../../hooks/useWalletProvider";
import useAccount from "../../hooks/useAccount";

const ConnectPrivateKey: React.FC<any> = ({ onDismiss }) => {
  const { restoreWalletFromPrivateKey } = useSoftwareWallet();
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
          placeholder="Enter your private key"
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

const ConnectMnemonic: React.FC<any> = ({ onDismiss }) => {
  const { color } = useContext(ThemeContext);
  const { restoreWalletFromMnemonic } = useSoftwareWallet();
  const [numOfWords, setNumOfWords] = useState(12);
  const [error, setError] = useState(null);
  const [text, setText] = useState("");

  const handleSetText = (value: string) => {
    const textArray = value.split(" ");
    if (textArray.length > 12) {
      setNumOfWords(24);
    }
    if (numOfWords === 24 && textArray.length < 13) {
      setNumOfWords(12);
    }

    return setText(value);
  };

  const handleConnect = async () => {
    try {
      await restoreWalletFromMnemonic(text);
      onDismiss();
    } catch (err) {
      console.error(err);
      setError("Invalid value");
    }
  };

  return (
    <Column style={{ width: "100%", alignItems: "center" }}>
      <Heading1>Enter your mnemonic phrase</Heading1>
      <Spacer size="xs" />
      <Typo2 style={{ color: color.greys.grey() }}>
        Hit "SPACE" after every successful word entry
      </Typo2>
      <Spacer />
      <InputTextBox
        error={error}
        setError={setError}
        style={{ width: "100%" }}
        text={text}
        setText={handleSetText}
        placeholder="Enter your phrase"
        textArea
        maxLength={false}
      />
      <Row style={{ flexWrap: "wrap", gap: ".5rem", width: "100%" }}>
        {Array(numOfWords)
          .fill("")
          .map((fill, index) => {
            const textArray = text.split(" ");
            return (
              <Row
                key={`mnemonic-input-${index}`}
                style={{
                  width: "24%",
                  height: "4rem",
                  backgroundColor: "#1B283E",
                  borderRadius: "8px",
                  alignItems: "center",
                }}
              >
                <Spacer />
                <Typo2 style={{ color: color.greys.darkGrey() }}>
                  {index + 1}.
                </Typo2>
                <Spacer size="sm" />
                <Typo2 style={{ color: color.white, fontWeight: "bold" }}>
                  {textArray[index] || ""}
                </Typo2>
              </Row>
            );
          })}
      </Row>
      <Spacer size="xl" />
      <Button
        style={{ width: "100%" }}
        variant="primary"
        onClick={() => handleConnect()}
      >
        Access wallet
      </Button>
    </Column>
  );
};

const ConnectKeystoreFile: React.FC<any> = ({ onDismiss }) => {
  const { color } = useContext(ThemeContext);
  const { restoreWalletFromKeystoreFile } = useSoftwareWallet();
  const [fileName, setFileName] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [acceptedFiles, setAcceptedFiles] = useState([]);
  const [fileError, setFileError] = useState(null);
  const [error, setError] = useState(null);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    acceptedFiles: dropzoneAccepted,
    getRootProps: getDropzoneRootProps,
  } = useDropzone({ maxFiles: 1 });

  const {
    acceptedFiles: buttonAccepted,
    getRootProps: getButtonRootProps,
    getInputProps,
  } = useDropzone({ noDrag: true, maxFiles: 1 });

  let reader: any;

  const handleFileRead = (e: any) => {
    try {
      const content = reader.result;
      const json = JSON.parse(content);
      if (json && json?.address && json?.crypto) {
        return setFileContent(content);
      }
      setFileError("Invalid keystore file");
    } catch (err) {
      console.error(err);
      setFileError("Invalid file-type");
    }
  };

  const handleConnect = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await restoreWalletFromKeystoreFile(fileContent, text);
      onDismiss();
    } catch (err) {
      setError(
        err.message
          ? `${err.message[0].toUpperCase()}${err.message.slice(1)}`
          : "Failed to connect"
      );
    } finally {
      setIsLoading(false);
      setText("");
    }
  };

  useEffect(() => {
    setAcceptedFiles([...acceptedFiles, ...dropzoneAccepted]);
  }, [dropzoneAccepted]);
  useEffect(() => {
    setAcceptedFiles([...acceptedFiles, ...buttonAccepted]);
  }, [buttonAccepted]);
  useEffect(() => {
    if (acceptedFiles.length) {
      const file = acceptedFiles[acceptedFiles.length - 1];
      reader = new FileReader();
      reader.onloadend = handleFileRead;
      reader.readAsText(file);
      setFileName(file.path);
    }
  }, [acceptedFiles]);

  return (
    <Column style={{ width: "100%", alignItems: "center" }}>
      <Spacer />
      <img style={{ height: "8rem", width: "8rem" }} src={keystoreFileImg} />
      <Spacer />
      <Heading1>Keystore file</Heading1>
      <Spacer size="xl" />
      {fileContent ? (
        <>
          <ContentBox
            style={{
              padding: "1.5rem 0rem",
              width: "50%",
              backgroundColor: color.primary.black(),
            }}
          >
            <Row
              style={{ width: "100%", alignItems: "center", padding: "0 2rem" }}
            >
              <img src={fileIcon} />
              <Spacer />
              <Typo1 style={{ fontWeight: "bold" }}> {fileName}</Typo1>
              <OverlayButton
                style={{ marginLeft: "auto" }}
                onClick={() => setFileContent(null)}
              >
                <img src={crossIcon} />
              </OverlayButton>
            </Row>
          </ContentBox>
          <Spacer />
          <Row style={{ width: "50%" }}>
            <InputTextBox
              disabled={isLoading}
              style={{ width: "100%" }}
              text={text}
              setText={setText}
              maxLength={null}
              placeholder="Enter password"
              password
            />
          </Row>
          <Spacer size="sm" />
          <Button
            style={{ width: "50%" }}
            disabled={isLoading || !text}
            variant="primary"
            onClick={handleConnect}
          >
            {isLoading ? "Loading wallet..." : "Access wallet"}
          </Button>
          <Spacer size="xs" />
          {error ? (
            <Typo1 style={{ width: "50%", color: "red" }}>{error}</Typo1>
          ) : (
            <Spacer size="sm" />
          )}
        </>
      ) : (
        <>
          <Row
            style={{
              alignItems: "center",
              justifyContent: "center",
              width: "80%",
              height: "8em",
              border: "3px dashed #3A4861",
              borderRadius: "8px",
              fontWeight: "bold",
            }}
            {...getDropzoneRootProps({ className: "dropzone" })}
          >
            <Typo1 style={{ color: color.greys.darkGrey() }}>
              Drop file here
            </Typo1>
          </Row>
          <Spacer />
          <Row
            style={{
              width: "80%",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                width: "47%",
                height: "2px",
                backgroundColor: "#202F49",
              }}
            />
            <Typo1 style={{ fontWeight: "bold", paddingBottom: "2px" }}>
              or
            </Typo1>
            <div
              style={{
                width: "47%",
                height: "2px",
                backgroundColor: "#202F49",
              }}
            />
          </Row>
          <Spacer />
          <Button
            {...getButtonRootProps({ className: "dropzone" })}
            style={{ width: "80%" }}
            variant="primary"
          >
            <input {...getInputProps()} />
            Select file
          </Button>
          <Spacer size="xs" />
          {fileError ? (
            <Typo1 style={{ width: "80%", color: "red" }}>{fileError}</Typo1>
          ) : (
            <Spacer size="sm" />
          )}
        </>
      )}
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
      {selectedSoftware === "mnemonic" && (
        <ConnectMnemonic onDismiss={onDismiss} />
      )}
      {selectedSoftware === "keystore" && (
        <ConnectKeystoreFile onDismiss={onDismiss} />
      )}
    </Modal>
  );
};

const AccessWallet: React.FC<any> = ({ setFlow }) => {
  const { color } = useContext(ThemeContext);
  const { activateInjected } = useInjectedWallet();
  const { activateWalletLink } = useWalletLink();
  const { activateLedger } = useLedger();
  const [tool, setTool] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
  const context = useWeb3React<Web3Provider>();
  const { error } = context;

  const [onPresentAccessByKeystoreModal] = useModal(
    <AccessBySoftwareModal setFlow={setFlow} />,
    "access-by-software-modal"
  );

  const handleSetTool = (tool: string) => {
    setSelectedTool(null);
    setTool(tool);
  };

  useEffect(() => {
    if (selectedTool === "ledger") {
      activateLedger();
    }
    if (selectedTool === "metamask") {
      // loadWeb3Modal();
      activateInjected();
    }
    if (selectedTool === "coinbase") {
      // loadWeb3Modal();
      activateWalletLink();
    }
    if (selectedTool === "keystore") {
      onPresentAccessByKeystoreModal();
    }
  }, [selectedTool]);

  return (
    <Column>
      {selectedTool !== "keystore" && (
        <Column>
          <Spacer size="xxl" />
          <Heading1 style={{ textAlign: "center" }}>
            How do you want to access your wallet?
          </Heading1>
          <Spacer />
          <Row style={{ gap: "1rem" }}>
            <OverlayButton onClick={() => handleSetTool("ledger")}>
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
            <OverlayButton onClick={() => handleSetTool("metamask")}>
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
            <OverlayButton onClick={() => handleSetTool("coinbase")}>
              <ContentBox
                style={{
                  width: "16rem",
                  height: "16rem",
                  boxSizing: "border-box",
                  border: tool === "coinbase" && "2px solid #1969FF",
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
                  <Heading2>Coinbase</Heading2>
                </Column>
              </ContentBox>
            </OverlayButton>
            <OverlayButton onClick={() => handleSetTool("keystore")}>
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
          <Column style={{ alignSelf: "center", alignItems: "center" }}>
            <Button
              disabled={!tool}
              onClick={() => setSelectedTool(tool)}
              style={{ width: "20rem" }}
              variant="primary"
            >
              Continue
            </Button>
            {error && (
              <Column style={{ maxWidth: "80%" }}>
                <Spacer />
                <Typo1 style={{ color: "red", textAlign: "center" }}>
                  {error.message}
                </Typo1>
              </Column>
            )}
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
  const { createNewWallet } = useSoftwareWallet();
  return (
    <Column>
      {!contentFlow && <CreateOrAccessWallet setFlow={setContentFlow} />}
      {contentFlow === "accessWallet" && (
        <AccessWallet setFlow={setContentFlow} />
      )}
      {contentFlow === "newWallet" && (
        <Row>
          <Column>
            <Heading2>NEW WALLET</Heading2>
            <Button onClick={createNewWallet} variant="primary">
              Create wallet
            </Button>
          </Column>
        </Row>
      )}
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
