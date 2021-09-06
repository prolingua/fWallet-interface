import React from "react";

const InputError: React.FC<any> = ({ error, fontSize }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "32px",
        fontSize: fontSize || "24px",
        color: "#F84239",
      }}
    >
      {error}
    </div>
  );
};

export default InputError;
