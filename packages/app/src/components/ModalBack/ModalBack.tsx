import React from "react";
import { mediaExact, OverlayButton } from "../index";
import BackSymbol from "../../assets/img/symbols/Back.svg";
import styled from "styled-components";

const ModalBack: React.FC<any> = ({ onBack }) => {
  return (
    <StyledPosition style={{ position: "absolute" }}>
      <OverlayButton onClick={() => onBack()}>
        <StyledBackImg alt="back" src={BackSymbol} />
      </OverlayButton>
    </StyledPosition>
  );
};

const StyledPosition = styled.div`
  ${mediaExact.xs(`left: 1.5rem; top: 1.5rem;`)}
  ${mediaExact.sm(`left: 1.5rem; top: 1.7rem;`)}
  ${mediaExact.md(`left: 1.7rem; top: 1.9rem;`)}
  ${mediaExact.lg(`left: 1.7rem; top: 1.9rem;`)}
`;

const StyledBackImg = styled.img`
  ${mediaExact.xs(`width: .8rem; height: .8rem;`)}
  ${mediaExact.sm(`width: .9rem; height: .9rem;`)}
  ${mediaExact.md(`width: 1rem; height: 1rem;`)}
  ${mediaExact.lg(`width: 1.1rem; height: 1.1rem;`)}
`;

export default ModalBack;
