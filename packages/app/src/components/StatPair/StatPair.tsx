import React, { useContext } from "react";
import { ThemeContext } from "styled-components";
import { Typo1 } from "../index";
import Spacer from "../Spacer";
import Row from "../Row";
import Column from "../Column";

const StatPair: React.FC<any> = ({
  title,
  titleFontSize,
  titleColor,
  value1,
  value1FontSize,
  value2,
  value2FontSize,
  suffix,
  spacer = "xxs",
  width,
}) => {
  const { color } = useContext(ThemeContext);
  return (
    <Column style={{ width: width && width }}>
      {title && (
        <>
          <Typo1
            style={{
              fontSize: titleFontSize && titleFontSize,
              fontWeight: "bold",
              color: titleColor || color.greys.grey(),
            }}
          >
            {title}
          </Typo1>
          <Spacer size={spacer} />
        </>
      )}
      <Row style={{ alignItems: "flex-end" }}>
        <div style={{ fontSize: value1FontSize || "24px", fontWeight: "bold" }}>
          {value1}
        </div>
        <div
          style={{
            fontSize: value2FontSize || "18px",
            fontWeight: "bold",
            color: color.greys.darkGrey(),
            paddingBottom: ".1rem",
          }}
        >
          {value2}
        </div>
        <Spacer size="xxs" />
        <div
          style={{
            fontSize: value2FontSize || "18px",
            fontWeight: "bold",
            color: color.greys.darkGrey(),
            paddingBottom: ".1rem",
          }}
        >
          {suffix}
        </div>
      </Row>
    </Column>
  );
};

export default StatPair;
