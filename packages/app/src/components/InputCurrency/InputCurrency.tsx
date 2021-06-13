import { Input } from "../index";
import React from "react";

const InputCurrency: React.FC<any> = ({
  value,
  max,
  handleValue,
  handleError,
  token,
}) => {
  const handleChange = (value: string) => {
    handleError(null);

    // Filter out invalid Numbers but allow zero's
    if (value && !Number(value)) {
      if (value === "0") handleValue("0");
      if (value.length === 2 && value === "0.") handleValue("0.");
      if (value.length > 2 && value.substr(0, 2) === "0.") {
        if (
          value[value.length - 1] === "0" ||
          Number(value[value.length - 1])
        ) {
          return handleValue(value);
        }

        handleValue(value.slice(0, -1));
      }

      return;
    }

    if (parseFloat(value) > max) {
      handleError("Insufficient funds");
    }

    if (
      value?.split(".").length &&
      value?.split(".")[1]?.length > token.decimals
    ) {
      handleError(
        `Exceeded max of ${token.decimals} decimals for ${token.symbol}`
      );
    }
    handleValue(value);
  };

  return (
    <Input
      type="text"
      value={value}
      onChange={(event) => handleChange(event.target.value)}
      placeholder="Enter an amount"
    />
  );
};

export default InputCurrency;
