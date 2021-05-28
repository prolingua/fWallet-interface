import { BigNumber } from "@ethersproject/bignumber";

export const formatHexToBN = (value: string) => {
  return BigNumber.from(value);
};
export const formatHexToInt = (value: string) => {
  return parseInt(value, 16);
};

export const weiToUnitBN = (value: BigNumber, decimals = 18) => {
  return value.div(Math.pow(10, decimals));
};
export const weiToUnit = (value: string | number, decimals = 18) => {
  return parseInt(value.toString(), 10) / Math.pow(10, decimals);
};

export const hexToUnit = (value: string, decimals = 18) => {
  const bn = BigNumber.from(value);
  return weiToUnit(bn.toString(), decimals);
};

export const toFormattedBalance = (value: string | number): string[] => {
  const formatThousands = (value: number) => {
    let valueLeft = value;
    let formatted = "";
    while (valueLeft >= 1000) {
      formatted =
        "," +
        valueLeft.toString().substr(valueLeft.toString().length - 3) +
        formatted;
      valueLeft = parseInt((valueLeft / 1000).toString());
    }

    return valueLeft.toString() + formatted;
  };
  const full = value.toString();
  const parts = full.toString().split(".");

  return [
    formatThousands(parseInt(parts[0], 10)),
    parts[1] ? `.${parts[1].substr(0, 2)}` : ".00",
  ];
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
