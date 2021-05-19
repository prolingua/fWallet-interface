import React from "react";
import styled, { keyframes } from "styled-components";

export interface ModalProps {
  onDismiss?: () => void;
}

const Modal: React.FC = ({ children }) => {
  return (
    <StyledResponsiveWrapper>
      <StyledModal>{children}</StyledModal>
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

const StyledResponsiveWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: relative;
  max-width: 50vw;
  @media (max-width: ${(props) => props.theme.breakpoints.tablet}px) {
    flex: 1;
    position: absolute;
    top: 100%;
    right: 0;
    left: 0;
    max-height: 100%;
    animation: ${mobileKeyframes} 0.3s forwards ease-out;
    max-width: 100vw;
  }
`;

const StyledModal = styled.div`
  padding: 20px 60px;
  background: ${(props) => props.theme.color.primary.black()};
  color: ${(props) => props.theme.color.white};
  font-family: "proxima-nova", sans-serif;
  border: 1.5px solid #3a486b;
  border-radius: 8px;
  backdrop-filter: blur(40px);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  min-height: 0;
  z-index: 1;
`;

export default Modal;
