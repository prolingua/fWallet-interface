import { ContentBox, mediaExact, OverlayButton } from "../../../components";
import styled from "styled-components";
import { Row } from "../../../components/Grid/Grid";

export const StyledOverlayButton = styled(OverlayButton)`
  transition: 0.2s all;
  padding: 0;

  :hover {
    transform: ${(props) => !props.disabled && "scale(1.04)"};
  }
`;

export const StyledInnerButton = styled(ContentBox)`
  padding: 0;
  box-sizing: border-box;
  ${mediaExact.xs(`width: 8rem; height: 10rem;`)}
  ${mediaExact.sm(`width: 9rem; height: 12rem;`)}
  ${mediaExact.md(`width: 10rem; height: 14rem;`)}
  ${mediaExact.lg(`width: 14rem; height: 16rem;`)}
`;

export const StyledMnemonicRow = styled(Row)`
  ${mediaExact.xs(`width: 31%`)}
  ${mediaExact.sm(`width: 31%`)}
  ${mediaExact.md(`width: 23%`)}
  ${mediaExact.lg(`width: 23%`)}
`;
