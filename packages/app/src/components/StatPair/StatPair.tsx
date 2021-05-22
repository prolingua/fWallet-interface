import React, { useContext } from "react";
import { ThemeContext } from "styled-components";
import Column from "../Column";
import { Typo1 } from "../index";
import Spacer from "../Spacer";
import Row from "../Row";

const StatPair: React.FC<any> = ({ title, value1, value2, suffix }) => {
  const { color } = useContext(ThemeContext);
  return (
    <>
      <Typo1 style={{ fontWeight: "bold", color: color.greys.grey() }}>
        {title}
      </Typo1>
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
        <Spacer size="xs" />
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
    </>
  );
};

export default StatPair;
