import FadeInOut from "../../components/AnimationFade";
import Column from "../../components/Column";
import Spacer from "../../components/Spacer";
import React from "react";
import CurrencySelector from "../../components/CurrencySelector";
import useSettings from "../../hooks/useSettings";
import { Heading3 } from "../../components";
import LanguageSelector from "../../components/LanguageSelector";
import { useTranslation } from "react-i18next";

const Preferences: React.FC<any> = () => {
  const { t, i18n } = useTranslation("common");
  const { settings, dispatchSettings } = useSettings();
  return (
    <FadeInOut>
      <Column>
        <Spacer size="lg" />
        <Heading3>Select currency</Heading3>
        <Spacer size="xs" />
        <CurrencySelector
          width="336px"
          current={settings.currency}
          dispatch={dispatchSettings}
        />
        <Spacer size="lg" />
        <Heading3>Select language</Heading3>
        <Spacer size="xs" />
        <LanguageSelector
          width="336px"
          current={settings.language}
          dispatch={dispatchSettings}
          i18n={i18n}
        />
      </Column>
    </FadeInOut>
  );
};

export default Preferences;
