import styled from "styled-components";
import { mediaExact, mediaTill, MediaSizes, mediaFrom } from "../index";

export const Grid = styled.div<{ plain?: boolean }>`
  width: 100%;
  box-sizing: border-box;
  ${(props) => !props.plain && mediaExact.xs(`padding: 1rem`)}
  ${(props) => !props.plain && mediaExact.sm(`padding: 1.4rem`)}
  ${(props) => !props.plain && mediaExact.md(`padding: 1.8rem`)}
  ${(props) => !props.plain && mediaExact.lg(`padding: 2rem`)}
`;

export const Row = styled.div<{
  flipDirectionGTE?: MediaSizes;
  flipDirectionLTE?: MediaSizes;
}>`
  display: flex;

  ${(props) =>
    props.flipDirectionLTE &&
    mediaTill[props.flipDirectionLTE](`flex-direction: column;`)}
  ${(props) =>
    props.flipDirectionGTE &&
    mediaFrom[props.flipDirectionGTE](`flex-direction: column;`)}
`;

export const Column = styled.div<{
  flipDirectionGTE?: MediaSizes;
  flipDirectionLTE?: MediaSizes;
}>`
  display: flex;
  flex-direction: column;

  ${(props) =>
    props.flipDirectionLTE &&
    mediaTill[props.flipDirectionLTE](`flex-direction: row;`)}
  ${(props) =>
    props.flipDirectionGTE &&
    mediaFrom[props.flipDirectionGTE](`flex-direction: row;`)}
`;

export const Item = styled.div<{
  size?: number;
  collapseGTE?: MediaSizes;
  collapseLTE?: MediaSizes;
}>`
  flex: ${(props) => (props?.size ? props.size : 1)};
  ${(props) =>
    props.collapseLTE && mediaTill[props.collapseLTE](`display: none`)}
  ${(props) =>
    props.collapseGTE && mediaFrom[props.collapseGTE](`display: none`)}
`;
