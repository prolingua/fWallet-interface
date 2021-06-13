import React from "react";

const InputError: React.FC<any> = ({ error, fontSize }) => {
  return (
    <div
      style={{
        height: "32px",
        fontSize: fontSize || "24px",
        color: "#F84239",
        paddingLeft: "1rem",
      }}
    >
      {error}
    </div>
  );
};

export default InputError;
