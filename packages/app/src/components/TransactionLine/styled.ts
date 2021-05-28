import styled from "styled-components";
import Column from "../Column";

export const StyledPair = styled(Column)`
  flex: 5;
  max-width: 45%;
  align-items: flex-start;
`;

export const StyledPairHeader = styled.div`
  color: ${(props) => props.theme.color.greys.grey()};
  font-size: 14px;
`;

export const StyledPairValue = styled.div`
  color: ${(props) => props.theme.color.primary.semiWhite()};
  font-size: 14px;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
