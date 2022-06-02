import React from "react";
import styled from "styled-components";
import { Heading1 } from "../index";

interface ModalTitleProps {
  text?: string;
}

const ModalTitle: React.FC<ModalTitleProps> = ({ text }) => (
  <StyledModalTitle>{text}</StyledModalTitle>
);

const StyledModalTitle = styled(Heading1)`
  align-items: center;
  justify-content: center;
  color: ${(props) => props.theme.color.white};
  display: flex;
  // font-size: 22px;
  // font-weight: 700;
  margin-bottom: 2rem;
`;

export default ModalTitle;
