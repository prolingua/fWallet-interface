import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import useOutsideClick from "../../hooks/useOutsideClick";
import { OverlayButton } from "../index";

const DropDownButton: React.FC<any> = ({
  children,
  DropDown,
  triggerClose,
  width,
  dropdownWidth,
  dropdownTop,
  dropdownRight,
  dropdownLeft,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (triggerClose) {
      setIsOpen(false);
    }
  }, [triggerClose]);

  useOutsideClick(dropdownRef, () => {
    if (isOpen) {
      setIsOpen(false);
    }
  });

  return (
    <div style={{ width, position: "relative" }}>
      <OverlayButton onClick={() => setIsOpen(!isOpen)}>
        {children}
      </OverlayButton>
      {isOpen && (
        <StyledDropDown
          ref={dropdownRef}
          width={dropdownWidth}
          top={dropdownTop}
          left={dropdownLeft}
          right={dropdownRight}
        >
          <DropDown />
        </StyledDropDown>
      )}
    </div>
  );
};

const StyledDropDown = styled.div<{
  width?: number;
  top?: number;
  left?: number;
  right?: number;
}>`
  position: absolute;
  width: ${(props) => props.width}px;
  top: ${(props) => props.top}px;
  left: ${(props) => props.left && `${props.left}px`};
  right: ${(props) => props.right && `${props.right}px`};
`;

export default DropDownButton;
