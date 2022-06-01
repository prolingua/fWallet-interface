import styled from "styled-components";

export const Column = styled.div<{
  align?: string;
  justify?: string;
  padding?: string;
}>` 
  display: flex;
  flex-direction: column;
  align-items: ${(props) => props.align}
  justify-content: ${(props) => props.justify};
    padding: ${(props) => props.padding};
`;

export default Column;
