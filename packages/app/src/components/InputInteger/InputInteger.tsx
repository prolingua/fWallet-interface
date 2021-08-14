import React, { useContext, useState } from "react";
import { ThemeContext } from "styled-components";
import Row from "../Row";
import { Input, Typo1, Typo2, Typo3 } from "../index";
import Column from "../Column";
import Spacer from "../Spacer";

const InputInteger: React.FC<any> = ({
  title,
  value,
  setValue,
  min = 0,
  max,
  setError,
  placeholder,
  valueName = "value",
}) => {
  const { color } = useContext(ThemeContext);

  const onHandleChange = (value: string) => {
    if (value === "") {
      setValue(null);
    }
    if (parseInt(value) >= min && parseInt(value) <= max) {
      setError(null);
    }
    setValue(value);
  };

  const onHandleBlur = (value: string) => {
    if (value === "") {
      return setError(`Please enter a valid value for [${title}].`);
    }
    if (parseInt(value) < min) {
      return setError(
        `[${title}] is incorrect, value must be at least ${min}.`
      );
    }
    if (parseInt(value) > max) {
      return setError(`[${title}] is incorrect, value must be at most ${max}.`);
    }
  };

  return (
    <Column>
      <Row>
        <Typo2 style={{ fontWeight: "bold", color: color.greys.grey() }}>
          {title}
        </Typo2>
      </Row>
      <Spacer size="sm" />
      <Row style={{ alignItems: "center" }}>
        <Row
          style={{
            backgroundColor: "#202F49",
            borderRadius: "8px",
            height: "4rem",
            width: "4rem",
          }}
        >
          <Input
            style={{ textAlign: "center", width: "100%" }}
            type="number"
            value={value}
            onChange={(event) => {
              onHandleChange(event.target.value);
            }}
            onBlur={(event) => {
              onHandleBlur(event.target.value);
            }}
            placeholder={placeholder}
          />
        </Row>
        <Spacer size="sm" />
        <Typo1 style={{ color: color.greys.darkGrey() }}>{valueName}</Typo1>
      </Row>
      <Spacer size="xs" />
      <Typo3
        style={{ color: color.greys.darkGrey() }}
      >{`min ${min} - max ${max}`}</Typo3>
    </Column>
  );
};

export default InputInteger;
