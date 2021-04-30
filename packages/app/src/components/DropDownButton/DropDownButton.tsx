import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import useOutsideClick from "../../hooks/useOutsideClick";

const DropDownButton: React.FC<any> = ({
  children,
  DropDown,
  triggerClose,
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
    <div style={{ position: "relative" }}>
      <a style={{ textDecoration: "none" }} onClick={() => setIsOpen(!isOpen)}>
        {children}
      </a>
      {isOpen && (
        <StyledDropDown ref={dropdownRef} top={4}>
          <DropDown />
        </StyledDropDown>
      )}
    </div>
  );
};

const StyledDropDown = styled.div<{
  top: number;
  left?: number;
  right?: number;
}>`
  position: absolute;
  top: ${(props) => props.top}rem;
  left: ${(props) => props.left && `${props.left}rem`};
  right: ${(props) => props.right && `${props.right}rem`};
`;

export default DropDownButton;
