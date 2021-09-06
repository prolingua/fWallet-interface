import { black, white } from "./colors";

const theme = {
  fontFamily: '"proxima-nova", sans-serif',
  borderRadius: 12,
  breakpoints: {
    mobile: 576,
    tablet: 768,
    desktop: 992,
    ultra: 1200,
  },
  fontColor: {
    primary: white,
    secondary: "#B7BECB",
  },
  color: {
    white,
    black,
    primary: {
      fantomBlue: (opacity: number = 1) => `rgba(25, 105, 255, ${opacity})`, // #1969FF
      cyan: (opacity: number = 1) => `rgba(25, 255, 255, ${opacity})`, // #19E1FF
      black: (opacity: number = 1) => `rgba(10, 22, 46, ${opacity})`, // #09172E
      semiWhite: (opacity: number = 1) => `rgba(239, 243, 251, ${opacity})`, // #EFF3FB
    },
    secondary: {
      aqua: (opacity: number = 1) => `rgba(105, 226, 220, ${opacity})`,
      electricBlue: (opacity: number = 1) => `rgba(13, 31, 255, ${opacity})`, //#0D1FFF
      navy: (opacity: number = 1) => `rgba(14, 29, 55, ${opacity})`, // #0E1D37
      red: (opacity: number = 1) => `rgba(248, 66, 57, ${opacity})`, // #F84239
    },
    greys: {
      mediumGray: (opacity: number = 1) => `rgba(58, 72, 97, ${opacity})`, // #3A4861
      darkGrey: (opacity: number = 1) => `rgba(112, 123, 143, ${opacity})`, // #202F49; // #707B8F
      realDarkGrey: (opacity: number = 1) => `rgba(32, 47, 73, ${opacity}`, // #202F49;
      grey: (opacity: number = 1) => `rgba(183, 190, 203, ${opacity})`, // #B7BECB
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
  topBarSize: 128,
};

export default theme;
