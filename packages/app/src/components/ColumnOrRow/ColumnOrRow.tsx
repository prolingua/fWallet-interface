import styled from "styled-components";

export const ColumnOrRow = styled.div<{ row?: boolean }>`
  display: flex;
  flex-direction: ${(props) => (props.row ? "row" : "column")};
`;

export default ColumnOrRow;
