import React, { useContext } from "react";
import styled, { ThemeContext } from "styled-components";
import Spacer from "../Spacer";
import checkMarkShapeImg from "../../assets/img/shapes/chechmarkShape.png";
import { mediaExact, Typo2 } from "../index";
import { Row } from "../Grid/Grid";

const Stepper: React.FC<any> = ({ activeStep, steps }) => {
  const { color } = useContext(ThemeContext);
  const stepIndex = steps.findIndex(
    (indexStep: any) => indexStep === activeStep
  );
  return (
    <Row style={{ alignItems: "center", paddingTop: "2px" }}>
      {steps.map((step: string, index: number) => {
        return (
          <Row key={`stepper-step-${index}`}>
            <StyledResponsiveStepperBox
              style={{
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
                fontWeight: "bold",
                color: activeStep === step ? "white" : color.greys.grey(),
                backgroundColor:
                  activeStep === step
                    ? color.primary.fantomBlue()
                    : stepIndex > index
                    ? "#27B44F"
                    : "transparent",
                border:
                  !(activeStep === step) &&
                  `1px solid ${color.greys.darkGrey()}`,
              }}
            >
              {stepIndex > index ? (
                <img alt="" src={checkMarkShapeImg} />
              ) : (
                <div>{index + 1}</div>
              )}
            </StyledResponsiveStepperBox>
            <Spacer responsive size="sm" />
            <Row
              style={{
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                color: activeStep === step ? "white" : color.greys.darkGrey(),
              }}
            >
              <Typo2>{step}</Typo2>
            </Row>
            <Spacer responsive size="sm" />
            {index + 1 < steps.length && (
              <>
                <Row style={{ alignItems: "center" }}>
                  <StyledResponsiveLine
                    style={{
                      height: "1px",
                      borderBottom: `1px solid ${color.greys.darkGrey()}`,
                    }}
                  />
                </Row>
                <Spacer responsive size="sm" />
              </>
            )}
          </Row>
        );
      })}
    </Row>
  );
};

const StyledResponsiveStepperBox = styled(Row)`
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 8px;
  ${mediaExact.xs(`width: 1rem; height: 1rem; border-radius: 3px`)};
`;

const StyledResponsiveLine = styled.div`
  ${mediaExact.xs(`width: .5rem`)};
  ${mediaExact.sm(`width: 1.5rem`)};
  ${mediaExact.md(`width: 2rem`)};
  ${mediaExact.lg(`width: 3rem`)};
`;

export default Stepper;
