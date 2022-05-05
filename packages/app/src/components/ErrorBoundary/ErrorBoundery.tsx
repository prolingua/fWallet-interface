import React from "react";
import {
  isMobile,
  isTablet,
  isDesktop,
  browserName,
  osName,
} from "react-device-detect";
import Bugsnag from "@bugsnag/js";
import { Heading3, OverlayButton, Typo2 } from "../index";
import { createHash } from "crypto";
import styled from "styled-components";
import Spacer from "../Spacer";
import Column from "../Column";
import { ActiveWalletContext } from "../../context/ActiveWalletProvider";

class ErrorBoundary extends React.Component<any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, errorId: null };
  }

  handleCopy = (errorId: string) => {
    navigator.clipboard.writeText(errorId);
  };

  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }
  static contextType = ActiveWalletContext;
  componentDidCatch(error: Error, errorInfo: any) {
    const [walletContext] = this.context;
    const sessionInfo = {
      isMobile,
      isTablet,
      isDesktop,
      browserName,
      osName,
      walletProvider: walletContext?.activeWallet?.providerType,
    };
    const errorIdTimestamp = parseInt((Date.now() / 1000).toString());
    const errorIdHash = createHash("sha256")
      .update(JSON.stringify(sessionInfo))
      .digest("hex");
    const errorId = `${errorIdTimestamp}_${errorIdHash}`;
    this.setState({
      ...this.state,
      errorId,
    });

    console.warn(
      `[${(this.props as any).name || "Unknown"}] ErrorBoundary hit`
    );
    if (process.env.NODE_ENV === "development") {
      console.error(error, errorInfo);
      return;
    }

    // send the error to an error reporting service
    Bugsnag.notify(error, (event) => {
      event.context = (this.props as any).name || "Unknown";
      event.setUser(errorId);
      event.addMetadata("session_info", sessionInfo);
      event.addMetadata("error_info", errorInfo);
    });
  }

  render() {
    if ((this.state as any).hasError) {
      return (
        <Column style={{ width: "100%" }}>
          <Heading3>Something went wrong.</Heading3>
          <Spacer size="xs" />
          <Typo2>
            Please try again later.
            {/*If the problem persists contact*/}
            {/*support@fwallet.fantom.network.*/}
          </Typo2>
          <StyledError>
            <OverlayButton
              className="error"
              onClick={() => this.handleCopy((this.state as any).errorId)}
            >
              <Typo2 className="error-text">
                Error ID: {(this.state as any).errorId}
              </Typo2>
              <div className="error-tooltip">Click to copy</div>
            </OverlayButton>
          </StyledError>
        </Column>
      );
    }

    return this.props.children;
  }
}

const StyledError = styled(Typo2)`
  .error-tooltip {
    font-weight: normal;
    visibility: hidden;
  }

  .error {
    width: calc(80%);
    color: grey;
    padding: 0.2rem 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    :focus {
      color: dimgrey;
    }

    &:hover .error-tooltip {
      visibility: visible;
    }

    .error-text {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      text-align: start;
    }
  }
`;

export default ErrorBoundary;
