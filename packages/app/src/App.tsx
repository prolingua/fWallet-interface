import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import ModalProvider from "./context/ModalProvider";
import { ThemeProvider } from "styled-components";
import { TransactionProvider } from "./context/TransactionProvider";
import { WalletProvider } from "./context/WalletProvider";
import withConnectedWallet from "./hocs/withConnectedWallet";
import Test from "./containers/Test/Test";
import TopBar from "./containers/TopBar/TopBar";
import theme from "./theme/theme";
import SideBar from "./containers/SideBar/SideBar";
import { Body } from "./components";
import { SettingsProvider } from "./context/SettingsProvider";
import { AccountsProvider } from "./context/AccountsProvider";

const TestWithWallet = withConnectedWallet(Test);

function App() {
  return (
    <Providers>
      <Body>
        <SideBar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <TopBar />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              padding: "0 2rem",
            }}
          >
            <Switch>
              <Route path="/otherRoute" component={TestWithWallet} />
              <Route path="/home" component={Test} />
              <Route path="/send" component={Test} />
              <Route path="/staking" component={Test} />
              <Route path="/defi" component={Test} />
              <Route path="/governance" component={Test} />
              <Route path="/" exact component={Test} />
            </Switch>
          </div>
        </div>
      </Body>
    </Providers>
  );
}

const Providers: React.FC<any> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <SettingsProvider>
        <AccountsProvider>
          <WalletProvider>
            <TransactionProvider>
              <ModalProvider>{children}</ModalProvider>
            </TransactionProvider>
          </WalletProvider>
        </AccountsProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
};

export default App;
