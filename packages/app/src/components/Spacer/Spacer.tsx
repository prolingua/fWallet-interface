import React, { useContext } from "react";
import styled, { ThemeContext } from "styled-components";
import { mediaExact } from "../index";

interface SpacerProps {
  size?: "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  responsive?: boolean;
}

const Spacer: React.FC<SpacerProps> = ({ size = "md", responsive = false }) => {
  const { spacing } = useContext(ThemeContext);

  let s: number;
  switch (size) {
    case "xxl":
      s = spacing[7];
      break;
    case "xl":
      s = spacing[6];
      break;
    case "lg":
      s = spacing[5];
      break;
    case "sm":
      s = spacing[3];
      break;
    case "xs":
      s = spacing[2];
      break;
    case "xxs":
      s = spacing[1];
      break;
    case "md":
    default:
      s = spacing[4];
  }

  return <StyledSpacer size={s} responsive={responsive} />;
};

interface StyledSpacerProps {
  size: number;
  responsive: boolean;
}

const StyledSpacer = styled.div<StyledSpacerProps>`
  height: ${(props) => props.size}px;
  // width: ${(props) => props.size}px;
  ${(props) =>
    props.responsive && mediaExact.xs(`width: ${props.size * 0.7}px;`)}
  ${(props) =>
    props.responsive && mediaExact.sm(`width: ${props.size * 0.8}px;`)}
  ${(props) =>
    props.responsive && mediaExact.md(`width: ${props.size * 0.9}px;`)}
  ${(props) => `width: ${props.size}px;`}
}
`;

export default Spacer;
