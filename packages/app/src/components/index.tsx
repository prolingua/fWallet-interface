import styled from "styled-components";

export type MediaSizes = "xs" | "sm" | "md" | "lg";
export const mediaExact = {
  xs: (styles: any) => `
  @media only screen and (min-width: 240px) and (max-width: 480px) {
    ${styles}
  }
  `,
  sm: (styles: any) => `
  @media only screen and (min-width: 481px) and (max-width: 768px) {
    ${styles}
  }
  `,
  md: (styles: any) => `
  @media only screen and (min-width: 769px) and (max-width: 1024px) {
    ${styles}
  }
  `,
  lg: (styles: any) => `
  @media only screen and (min-width: 1025px) {
    ${styles}
  }
  `,
} as any;
export const mediaTill = {
  xs: (styles: any) => `
  @media only screen and (max-width: 480px) {
    ${styles}
  }
  `,
  sm: (styles: any) => `
  @media only screen and (max-width: 768px) {
    ${styles}
  }
  `,
  md: (styles: any) => `
  @media only screen and (max-width: 1024px) {
    ${styles}
  }
  `,
  lg: (styles: any) => `
  @media only screen and (min-width: 1025px) {
    ${styles}
  }
  `,
} as any;
export const mediaFrom = {
  xs: (styles: any) => `
  @media only screen and (min-width: 240px) {
    ${styles}
  }
  `,
  sm: (styles: any) => `
  @media only screen and (min-width: 481px) {
    ${styles}
  }
  `,
  md: (styles: any) => `
  @media only screen and (min-width: 769px) {
    ${styles}
  }
  `,
  lg: (styles: any) => `
  @media only screen and (min-width: 1025px) {
    ${styles}
  }
  `,
} as any;

export const Header = styled.div`
  font-family: "proxima-nova", sans-serif;
  background-color: ${(props) => props.theme.color.primary.black()};
  height: ${(props) => props.theme.topBarSize}px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  color: white;

  ${mediaExact.xs(`padding: 0 1.5rem 0 1rem`)};
  ${mediaExact.sm(`padding: 0 2rem 0 1.5rem`)};
  ${mediaExact.md(`padding: 0 4rem 0 2rem`)};
  ${mediaExact.lg(`padding: 0 4rem 0 2rem`)};
`;

export const Body = styled.div`
  font-family: "proxima-nova", sans-serif;
  background-color: ${(props) => props.theme.color.primary.black()};
  color: white;
  display: flex;
  font-size: calc(10px + 2vmin);
  min-height: calc(100vh);
  display: flex;
  flex-direction: row;

  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  button {
    font-family: inherit;
  }
`;

export const Link = styled.a.attrs({
  target: "_blank",
  rel: "noopener noreferrer",
})`
  color: #61dafb;
  margin-top: 10px;
`;

export const WrapA = styled.a`
  text-decoration: none;
  cursor: pointer;
`;

export const LinkExt = styled.a.attrs({
  target: "_blank",
  rel: "noopener noreferrer",
})`
  color: ${(props) => props.theme.color.primary.semiWhite()};

  :visited {
    color: ${(props) => props.theme.color.greys.darkGrey()};
  }
`;

export const Heading1 = styled.div`
  font-weight: bold;
  ${mediaExact.xs(`font-size: 24px`)}
  ${mediaExact.sm(`font-size: 24px`)}
  ${mediaExact.md(`font-size: 30px`)}
  ${mediaExact.lg(`font-size: 30px`)}
`;

export const Heading2 = styled.div`
  font-weight: bold;
  ${mediaExact.xs(`font-size: 20px`)}
  ${mediaExact.sm(`font-size: 20px`)}
  ${mediaExact.md(`font-size: 24px`)}
  ${mediaExact.lg(`font-size: 24px`)}
`;

export const Heading3 = styled.div`
  font-weight: bold;
  ${mediaExact.xs(`font-size: 16px`)}
  ${mediaExact.sm(`font-size: 16px`)}
  ${mediaExact.md(`font-size: 20px`)}
  ${mediaExact.lg(`font-size: 20px`)}
`;

export const Typo1 = styled.div`
  ${mediaExact.xs(`font-size: 16px`)}
  ${mediaExact.sm(`font-size: 16px`)}
  ${mediaExact.md(`font-size: 18px`)}
  ${mediaExact.lg(`font-size: 18px`)}
`;

export const Typo2 = styled.div`
  ${mediaExact.xs(`font-size: 14px`)}
  ${mediaExact.sm(`font-size: 14px`)}
  ${mediaExact.md(`font-size: 16px`)}
  ${mediaExact.lg(`font-size: 16px`)}
`;

export const Typo3 = styled.div`
  ${mediaExact.xs(`font-size: 12px`)}
  ${mediaExact.sm(`font-size: 12px`)}
  ${mediaExact.md(`font-size: 14px`)}
  ${mediaExact.lg(`font-size: 14px`)}
`;

export const OverlayButton = styled.button<{ disabled?: boolean }>`
  background-color: transparent;
  border: none;
  text-decoration: none;
  cursor: ${(props) => !props.disabled && "pointer"};
  color: inherit;
  font-family: "proxima-nova", sans-serif;
  transition: 0.2s all;

  :active {
    transform: ${(props) => !props.disabled && "scale(0.98)"};
  }
`;

export const Button = styled.button<{
  variant: "primary" | "secondary" | "tertiary";
  padding?: string;
  color?: string;
  fontSize?: string;
  disabled?: boolean;
  width?: string;
}>`
  background-color: ${(props) =>
    props.variant === "primary"
      ? props.theme.color.primary.fantomBlue(props.disabled ? 0.6 : 1)
      : props.variant === "secondary"
      ? "transparent"
      : props.theme.color.secondary.navy(props.disabled ? 0.6 : 1)};
  border: ${(props) =>
    props.variant === "primary" || props.variant === "tertiary"
      ? "none"
      : `1px solid ${props.theme.color.greys.mediumGray()}`};
  border-radius: 8px;
  color: ${(props) => (!props.disabled ? props.color || "white" : "#6c726c")};
  cursor: ${(props) => (!props.disabled ? "pointer" : "cursor")};
  font-size: ${(props) => props.fontSize};
  font-weight: bold;
  text-align: center;
  text-decoration: none;
  padding: ${(props) => (props.padding ? props.padding : "14px 24px")};
  transition: 0.2s all;
  width: ${(props) => props.width && props.width};

  ${(props) => props.hidden && "hidden"} :focus {
    border: ${(props) => props.variant === "primary" && "none"};
    outline: none;
  }

  :active {
    transform: ${(props) => !props.disabled && "scale(0.98)"};
  }

  ${(props) => !props.fontSize && mediaExact.xs(`font-size: 16px`)};
  ${(props) => !props.fontSize && mediaExact.sm(`font-size: 16px`)};
  ${(props) => !props.fontSize && mediaExact.md(`font-size: 18px`)};
  ${(props) => !props.fontSize && mediaExact.lg(`font-size: 18px`)};
  ${(props) => !props.padding && mediaExact.xs(`padding: 12px 20px`)};
  ${(props) => !props.padding && mediaExact.sm(`padding: 12px 20px`)};
  ${(props) => !props.padding && mediaExact.md(`padding: 14px 24px`)};
  ${(props) => !props.padding && mediaExact.lg(`padding: 14px 24px`)};
`;

export const Container = styled.div<{ padding?: string }>`
  border: ${(props) => `1px solid ${props.theme.color.greys.mediumGray()}`};
  padding: ${(props) => (props.padding ? props.padding : "2rem")};
  background-color: ${(props) => props.theme.color.primary.black()};
  border-radius: 8px;
`;

export const ContentBox = styled.div<{ padding?: string }>`
  background-color: ${(props) => props.theme.color.secondary.navy()};
  display: inline-flex;
  padding: ${(props) => (props.padding ? props.padding : "2rem")};
  border-radius: 8px;
  box-sizing: border-box;
`;

export const Input = styled.input<{
  fontSize?: string;
  fontWeight?: string;
  disabled?: boolean;
  withMarginForTokenSelect?: boolean;
}>`
  flex: 1;
  background-color: transparent;
  border: none;
  color: white;
  font-size: ${(props) => props.fontSize};
  font-weight: ${(props) => props.fontWeight && props.fontWeight};
  opacity: ${(props) => props.disabled && 0.6};

  :focus {
    outline: none;
  }

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  ::-webkit-input-placeholder {
    font-size: 16px;
    line-height: 3;
  }

  [type="number"] {
    -moz-appearance: textfield;
  }

  ${mediaExact.xs(`width: 50%`)};
  ${mediaExact.sm(`width: 50%`)};
  ${(props) => !props.fontSize && mediaExact.xs(`font-size: 16px`)};
  ${(props) => !props.fontSize && mediaExact.sm(`font-size: 16px`)};
  ${(props) => !props.fontSize && mediaExact.md(`font-size: 20px`)};
  ${(props) => !props.fontSize && mediaExact.lg(`font-size: 20px`)};
`;

export const TextArea = styled.textarea`
  font-family: "proxima-nova", sans-serif;
  flex: 1;
  background-color: transparent;
  border: none;
  color: white;
  font-size: 20px;
  padding-top: 1.5rem;
  height: 170px;
  resize: none;
  line-height: 24px;

  :focus {
    outline: none;
  }
`;
