import React, { useEffect, useState } from "react";
import { Button, Container, OverlayButton, Typo1 } from "../index";
import Column from "../Column";
import Row from "../Row";
import DropDownButton from "../DropDownButton";

import vShape from "../../assets/img/shapes/vShape.png";

export const languageOptions: any = {
  en: {
    name: "English (EN)",
  },
  de: {
    name: "German (DE)",
  },
};

const LanguageSelect: React.FC<any> = ({ dispatch, handleClose, i18n }) => {
  return (
    <Container padding="1rem">
      <Column>
        {Object.keys(languageOptions).map((key: string) => {
          const value = languageOptions[key];
          return (
            <OverlayButton
              key={value.name}
              onClick={() => {
                dispatch({ type: "changeLanguage", language: key });
                i18n.changeLanguage(key);
                handleClose();
              }}
            >
              <Row>
                <Typo1 style={{ fontWeight: "bold" }}>{`${value.name}`}</Typo1>
              </Row>
            </OverlayButton>
          );
        })}
      </Column>
    </Container>
  );
};

const LanguageSelector: React.FC<any> = ({
  current,
  width,
  dispatch,
  i18n,
}) => {
  const [closeDropDown, setCloseDropDown] = useState(false);
  const handleClose = () => {
    setCloseDropDown(true);
  };

  useEffect(() => {
    if (closeDropDown) {
      setCloseDropDown(false);
    }
  }, [closeDropDown]);
  return (
    <DropDownButton
      width={width}
      triggerClose={closeDropDown}
      DropDown={() => LanguageSelect({ dispatch, handleClose, i18n })}
      dropdownWidth={336}
      dropdownTop={70}
      dropdownLeft={0}
    >
      <Button
        variant="secondary"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontWeight: "bold",
          width: "100%",
          height: "56px",
        }}
      >
        {languageOptions[current].name}
        <img alt="" src={vShape} style={{ paddingLeft: ".5rem" }} />
      </Button>
    </DropDownButton>
  );
};

export default LanguageSelector;
