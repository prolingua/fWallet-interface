export const formatHexToInt = (value: string) => {
  return parseInt(value, 16);
};

export const WeiToUnit = (value: string, decimals = 18) => {
  return parseInt(value, 10) / Math.pow(10, decimals);
};

export const toCurrencySymbol = (currency: string) => {
  if (currency.toLowerCase() === "usd") return "$";
  if (currency.toLowerCase() === "eur") return "€";
};

export const millisecondsToTimeUnit = (millis: number) => {
  const seconds = millis / 1000;
  if (seconds < 60 * 60) {
    return `${Math.round(seconds / 60)} ${seconds < 60 ? "minute" : "minutes"}`;
  }
  if (seconds < 60 * 60 * 24) {
    return `${Math.round(seconds / (60 * 60))} ${
      seconds < 60 * 60 ? "hour" : "hours"
    }`;
  }
  if (seconds < 60 * 60 * 24 * 365) {
    return `${Math.round(seconds / (60 * 60 * 24))} ${
      seconds < 60 * 60 * 24 ? "day" : "days"
    }`;
  }
};
