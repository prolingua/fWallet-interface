import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "styled-components";
import Column from "../Column";
import Row from "../Row";
import { Input, TextArea, Typo2 } from "../index";
import Spacer from "../Spacer";
import InputError from "../InputError";

const InputTextBox: React.FC<any> = ({
  title,
  text,
  setText,
  placeholder,
  maxLength = 120,
  error,
  valueName = "value",
  textArea = false,
}) => {
  const { color } = useContext(ThemeContext);
  const [internalError, setInternalError] = useState(error);

  const onHandleChange = (value: string) => {
    if (value.length <= maxLength) {
      setText(value);
    }
  };

  useEffect(() => {
    setInternalError(null);
    return () => setInternalError(null);
  }, [text]);

  return (
    <Column>
      {title && (
        <Row style={{ justifyContent: "space-between" }}>
          <Typo2 style={{ fontWeight: "bold", color: color.greys.grey() }}>
            {title}
          </Typo2>
        </Row>
      )}
      <Spacer size="xs" />
      {textArea ? (
        <Row
          style={{
            backgroundColor: "#202F49",
            borderRadius: "8px",
            height: "200px",
            alignItems: "center",
          }}
        >
          <Spacer />
          <TextArea
            value={text}
            onInput={(event) => {
              // @ts-ignore
              onHandleChange(event.target.value);
            }}
            onBlur={() =>
              text.length === 0 &&
              setInternalError(`Please enter a ${valueName}`)
            }
            placeholder={placeholder}
          />
        </Row>
      ) : (
        <Row
          style={{
            backgroundColor: "#202F49",
            borderRadius: "8px",
            height: "64px",
            alignItems: "center",
          }}
        >
          <Spacer />
          <Input
            type="text"
            value={text}
            onChange={(event) => {
              onHandleChange(event.target.value);
            }}
            onBlur={() =>
              text.length === 0 &&
              setInternalError(`Please enter a ${valueName}`)
            }
            onKeyDown={(event) => {
              if ((event.charCode || event.keyCode) === 13) {
                event.preventDefault();
              }
            }}
            placeholder={placeholder}
          />
        </Row>
      )}
      <Spacer size="xs" />
      <Row
        style={{
          justifyContent: "space-between",
          color: color.greys.darkGrey(),
        }}
      >
        {internalError ? (
          <InputError fontSize="18px" error={internalError} />
        ) : (
          <Spacer size="lg" />
        )}
        <Typo2>
          {text.length}/{maxLength}
        </Typo2>
      </Row>
    </Column>
  );
};

export default InputTextBox;
