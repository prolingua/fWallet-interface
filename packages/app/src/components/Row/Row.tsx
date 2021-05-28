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

export const ResponsiveRow = styled.div<{
  breakpoint: number;
  breakpointReverse?: boolean;
  align?: string;
  justify?: string;
  padding?: string;
}>`
  display: flex;
  flex-direction: row;
  align-items: ${(props) => props.align}
  justify-content: ${(props) => props.justify};
  padding: ${(props) => props.padding};

  @media (max-width: ${(props) => props.breakpoint}px) {
    flex-direction: ${(props) =>
      props.breakpointReverse ? "column-reverse" : "column"};
  }
`;

export default Row;
