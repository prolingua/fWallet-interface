import React, { useContext } from "react";
import { ThemeContext } from "styled-components";
import Row from "../Row";
import Spacer from "../Spacer";

const Stepper: React.FC<any> = ({ activeStep, steps }) => {
  const { color } = useContext(ThemeContext);
  return (
    <Row style={{ alignItems: "center", paddingTop: "2px" }}>
      {steps.map((step: string, index: number) => {
        return (
          <Row key={`stepper-step-${index}`}>
            <Row
              style={{
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
                height: "1.5rem",
                width: "1.5rem",
                fontWeight: "bold",
                color: activeStep === step ? "white" : color.greys.grey(),
                backgroundColor:
                  activeStep === step
                    ? color.primary.fantomBlue()
                    : "transparent",
                border:
                  !(activeStep === step) &&
                  `1px solid ${color.greys.darkGrey()}`,
                borderRadius: "8px",
              }}
            >
              {index + 1}
            </Row>
            <Spacer size="sm" />
            <Row
              style={{
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                color: activeStep === step ? "white" : color.greys.darkGrey(),
              }}
            >
              {step}
            </Row>
            <Spacer size="sm" />
            {index + 1 < steps.length && (
              <>
                <Row style={{ alignItems: "center" }}>
                  <div
                    style={{
                      height: "1px",
                      width: "3rem",
                      borderBottom: `1px solid ${color.greys.darkGrey()}`,
                    }}
                  />
                </Row>
                <Spacer />
              </>
            )}
          </Row>
        );
      })}
    </Row>
  );
};

export default Stepper;
