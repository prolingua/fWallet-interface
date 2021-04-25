import { black, white } from "./colors";

const theme = {
  fontFamily: "Proxima Nova",
  borderRadius: 12,
  breakpoints: {
    mobile: 576,
    tablet: 768,
    desktop: 992,
    ultra: 1200,
  },
  color: {
    white,
    black,

    primary: {
      fantomBlue: "rgba(25 105 255 100%)",
      cyan: "rgba(25 255 255 100%)",
      black: "rgba(10 22 46 100%)",
      semiWhite: "rgba(239 243 251 100%)",
    },
    secondary: {
      aqua: "rgba(105 226 220 100%)",
      electricBlue: "rgba(25 255 255 100%)",
      navy: "rgba(14 29 55 100%)",
      red: "rgba(248 66 57 100%)",
    },
    greys: {
      mediumGray: "rgba(58 72 97 100%)",
      darkGrey: "rgba(112 123 143 100%)",
      grey: "rgba(183 190 203 100%)",
    },
  },
  siteWidth: 1200,
  spacing: {
    1: 4,
    2: 8,
    3: 16,
    4: 24,
    5: 32,
    6: 48,
    7: 64,
  },
  topBarSize: 72,
};

export default theme;
