import React from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const SliderWithMarks: React.FC<any> = ({ value, setValue, max, steps }) => {
  const markStyle = (first = false) => {
    return {
      color: "white",
      fontWeight: "bold",
      fontSize: "16px",
      paddingTop: first ? "5px 0 0 5px" : "5px",
    };
  };

  return (
    <Slider
      onChange={(val) => setValue(val)}
      value={value}
      min={0}
      max={max}
      step={steps}
      marks={{
        [0]: {
          style: markStyle(true),
          label: "0%",
        },
        [(max * 0.25).toFixed(2)]: {
          style: markStyle(),
          label: "25%",
        },
        [(max * 0.5).toFixed(1)]: {
          style: markStyle(),
          label: "50%",
        },
        [(max * 0.75).toFixed(2)]: {
          style: markStyle(),
          label: "75%",
        },
        [max]: {
          style: markStyle(),
          label: "100%",
        },
      }}
      trackStyle={{ backgroundColor: "#1969FF", height: 7 }}
      handleStyle={{
        borderColor: "#1969FF",
        height: 20,
        width: 20,
        marginLeft: 0,
        marginTop: -7,
        backgroundColor: "#1969FF",
      }}
      railStyle={{ backgroundColor: "#0A162E", height: 7 }}
      dotStyle={{ backgroundColor: "transparent", border: "none" }}
    />
  );
};

export default SliderWithMarks;
