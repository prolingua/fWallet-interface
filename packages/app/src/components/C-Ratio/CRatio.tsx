import React, { useContext } from "react";
import { ThemeContext } from "styled-components";
import { Typo1 } from "../index";
import Row from "../Row";
import Spacer from "../Spacer";
import Column from "../Column";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";

const CRatio: React.FC<any> = ({ value }) => {
  const { color } = useContext(ThemeContext);
  const percentage = value / 10;
  return (
    <Column>
      <Typo1
        style={{
          alignSelf: "center",
          fontWeight: "bold",
          color: color.greys.grey(),
        }}
      >
        C-Ratio
      </Typo1>
      <Spacer size="md" />
      <Row
        style={{
          width: 130,
          height: 130,
          alignSelf: "center",
          fontWeight: "bold",
        }}
      >
        <CircularProgressbar
          styles={buildStyles({
            pathColor: color.secondary.electricBlue(),
            trailColor: color.greys.darkGrey(0.4),
            textColor: color.white,
          })}
          value={percentage}
          text={`${value}%`}
        />
      </Row>
    </Column>
  );
};
export default CRatio;
