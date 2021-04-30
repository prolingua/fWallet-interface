import React, { useEffect, useState } from "react";
import styled from "styled-components";

const DropDownButton: React.FC<any> = ({
  children,
  DropDown,
  triggerClose,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (triggerClose) {
      setIsOpen(false);
    }
  }, [triggerClose]);
  return (
    <div style={{ position: "relative" }}>
      <a style={{ textDecoration: "none" }} onClick={() => setIsOpen(!isOpen)}>
        {children}
      </a>
      {isOpen && (
        <StyledDropDown top={4}>
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
