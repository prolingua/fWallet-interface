import React, { useContext } from "react";
import { ThemeContext } from "styled-components";
import { Typo1 } from "../index";
import Spacer from "../Spacer";
import Row from "../Row";
import Column from "../Column";

const StatPair: React.FC<any> = ({
  title,
  value1,
  value2,
  suffix,
  spacer = "xxs",
  titleColor,
  width,
}) => {
  const { color } = useContext(ThemeContext);
  return (
    <Column style={{ width: width && width }}>
      <Typo1
        style={{ fontWeight: "bold", color: titleColor || color.greys.grey() }}
      >
        {title}
      </Typo1>
      <Spacer size={spacer} />
      <Row style={{ alignItems: "flex-end" }}>
        <div style={{ fontSize: "24px", fontWeight: "bold" }}>{value1}</div>
        <div
          style={{
            fontSize: "18px",
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
            fontSize: "18px",
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
