import React from "react";
import styled, { keyframes } from "styled-components";
import ModalClose from "../ModalClose";
import { mediaExact, mediaFrom, mediaTill } from "../index";
import { Item } from "../Grid/Grid";
import ModalBack from "../ModalBack";

export interface ModalProps {
  onDismiss?: () => void;
}

const Modal: React.FC<any> = ({ children, style, onDismiss, onBack }) => {
  return (
    <StyledResponsiveWrapper>
      <StyledModal style={{ ...style }}>
        {onBack && (
          <Item>
            <ModalBack onBack={onBack} />
          </Item>
        )}
        {onDismiss && (
          <Item>
            <ModalClose onDismiss={onDismiss} />
          </Item>
        )}
        {children}
      </StyledModal>
    </StyledResponsiveWrapper>
  );
};

const mobileKeyframes = keyframes`
  0% {
    transform: translateY(0%);
  }
  100% {
    transform: translateY(-100%);
  }
`;

//   animation: ${mobileKeyframes} 0.3s forwards ease-out;
//   max-width: 100vw;

const StyledResponsiveWrapper = styled.div<any>`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  position: relative;
  box-sizing: border-box;
  margin: auto;
  ${mediaExact.xs(`min-width: 90vw; max-width: 90vw;`)}
  ${mediaExact.sm(`min-width: 70vw; max-width: 90vw;`)}
  ${mediaExact.md(`min-width: 500px; max-width: 85vw;`)}
  ${mediaExact.lg(`min-width: 500px; max-width: 75vw;`)}
`;

const StyledModal = styled.div<any>`
  padding: ${(props) =>
    props.padding === undefined ? "20px 40px" : props.padding};
  background: ${(props) => props.theme.color.secondary.navy()};
  color: ${(props) => props.theme.color.white};
  font-family: "proxima-nova", sans-serif;
  border-radius: 8px;
  backdrop-filter: blur(40px);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  min-height: 0;
  width: 100%;
  z-index: 1;
  box-sizing: border-box;
  margin: 1rem 0;

  ${(props) => !props.padding && mediaExact.xs(`padding: 20px 20px`)};
  ${(props) => !props.padding && mediaExact.sm(`padding: 20px 40px`)}
  ${(props) => !props.padding && mediaExact.md(`padding: 20px 40px`)}
  ${(props) => !props.padding && mediaExact.lg(`padding: 20px 40px`)}
`;

export default Modal;
