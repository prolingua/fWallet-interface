import React, { useContext } from "react";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Row from "../Row";
import { ThemeContext } from "styled-components";

const CircularRatioBar: React.FC<any> = ({ children, ratios, ratioColors }) => {
  const { color } = useContext(ThemeContext);
  return (
    <Row style={{ width: 200, height: 200 }}>
      <CircularProgressbarWithChildren
        value={ratios[1]}
        strokeWidth={5}
        styles={buildStyles({
          pathColor: ratioColors[1],
          trailColor: color.greys.darkGrey(0.4),
          strokeLinecap: "butt",
        })}
      >
        {/* Foreground path */}
        <CircularProgressbarWithChildren
          value={ratios[0]}
          strokeWidth={5}
          styles={buildStyles({
            pathColor: ratioColors[0],
            trailColor: "transparent",
            strokeLinecap: "butt",
          })}
        >
          {children}
        </CircularProgressbarWithChildren>
      </CircularProgressbarWithChildren>
    </Row>
  );
};

export default CircularRatioBar;
