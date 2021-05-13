import styled from "styled-components";

export const Header = styled.div`
  font-family: Proxima Nova;
  background-color: ${(props) => props.theme.color.primary.black()};
  height: ${(props) => props.theme.topBarSize}px;
  padding: 0 4rem 0 2rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  color: white;
`;

export const Body = styled.div`
  font-family: Proxima Nova;
  background-color: ${(props) => props.theme.color.primary.black()};
  color: white;
  display: flex;
  font-size: calc(10px + 2vmin);
  min-height: calc(100vh);
  display: flex;
  flex-direction: row;
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

export const Heading1 = styled.div`
  font-size: 32px;
  font-weight: bold;
`;

export const Heading2 = styled.div`
  font-size: 20px;
  font-weight: bold;
`;

export const Typo1 = styled.div`
  font-size: 18px;
`;

export const Typo2 = styled.div`
  font-size: 16px;
`;

export const OverlayButton = styled.button`
  background-color: transparent;
  border: none;
  text-decoration: none;
`;

export const Button = styled.button<{
  variant: "primary" | "secondary";
  disabled?: boolean;
}>`
  background-color: ${(props) =>
    props.variant === "primary"
      ? props.theme.color.primary.fantomBlue()
      : "transparent"};
  border: ${(props) =>
    props.variant === "primary"
      ? "none"
      : `1px solid ${props.theme.color.greys.mediumGray()}`};
  border-radius: 8px;
  color: ${(props) => (!props.disabled ? "white" : "#6c726c")};
  cursor: pointer;
  font-family: Proxima Nova;
  font-size: 18px;
  text-align: center;
  text-decoration: none;
  padding: 12px 24px;

  ${(props) => props.hidden && "hidden"} :focus {
    border: ${(props) => props.variant === "primary" && "none"};
    outline: none;
  }
`;

export const Container = styled.div<{ padding?: string }>`
  border: ${(props) => `1px solid ${props.theme.color.greys.mediumGray()}`};
  padding: ${(props) => (props.padding ? props.padding : "2rem")};
  background-color: ${(props) => props.theme.color.primary.black()};
  border-radius: 8px;
`;
