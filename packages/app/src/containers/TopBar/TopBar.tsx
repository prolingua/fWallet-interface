import React from "react";

import useWalletProvider from "../../hooks/useWalletProvider";
import useSettings from "../../hooks/useSettings";
import { Header } from "../../components";
import CurrencySelector from "../../components/CurrencySelector";
import Spacer from "../../components/Spacer";
import Row from "../../components/Row";
import LanguageSelector from "../../components/LanguageSelector/LanguageSelector";
import { useTranslation } from "react-i18next";
import WalletSelector from "../../components/WalletSelector";

const TopBar: React.FC<any> = () => {
  const { walletContext } = useWalletProvider();
  const { settings, dispatchSettings } = useSettings();
  const { t, i18n } = useTranslation("common");
  return (
    <Header>
      <Row>
        <Row style={{ alignItems: "center" }}>
          {t("welcome.title", { framework: "FWallet" })}
        </Row>
        <Spacer />
        <LanguageSelector
          width="180px"
          current={settings.language}
          dispatch={dispatchSettings}
          i18n={i18n}
        />
      </Row>
      <Row>
        <CurrencySelector
          width="140px"
          current={settings.currency}
          dispatch={dispatchSettings}
        />
        <Spacer size="xs" />
        <WalletSelector width="200px" walletContext={walletContext} />
      </Row>
    </Header>
  );
};

export default TopBar;
