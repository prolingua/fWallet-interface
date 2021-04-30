import styled from "styled-components";

export const Row = styled.div<{
  align?: string;
  justify?: string;
  padding?: string;
}>`
  display: flex;
  flex-direction: row;
  align-items: ${(props) => props.align}
  justify-content: ${(props) => props.justify};
  padding: ${(props) => props.padding};
`;

export default Row;
