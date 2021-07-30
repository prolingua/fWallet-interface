import React from "react";
import Slider, { createSliderWithTooltip } from "rc-slider";
import "rc-slider/assets/index.css";

// const SliderWithTooltip = createSliderWithTooltip(Slider);

const SliderWithMarks: React.FC<any> = ({
  value,
  setValue,
  min = 0,
  max,
  steps,
  disabled = false,
  markPoints = [0, 25, 50, 75, 100],
  markLabels = null,
  color = "#1969FF",
  secondaryColor = "white",
}) => {
  const markStyle = (value: number, mark: number) => {
    return {
      color: value < mark ? secondaryColor : color,
      fontWeight: "bold",
      fontSize: "16px",
      paddingTop: "5px",
    };
  };

  const marks = markPoints.reduce(
    (accumulator: any, current: number, index: number) => {
      return {
        ...accumulator,
        [parseFloat(max) * (current === 0 ? current : current / 100)]: {
          style: markStyle(value, (parseFloat(max) * current) / 100),
          label: markLabels ? markLabels[index] : `${current}%`,
        },
      };
    },
    {}
  );

  return (
    <Slider
      disabled={disabled}
      onChange={(val) => setValue(val)}
      value={value}
      min={min}
      max={max}
      step={steps}
      marks={marks}
      trackStyle={{ backgroundColor: color, height: 7 }}
      handleStyle={{
        borderColor: color,
        height: 20,
        width: 20,
        marginLeft: 0,
        marginTop: -7,
        backgroundColor: color,
      }}
      railStyle={{ backgroundColor: "#0A162E", height: 7 }}
      dotStyle={{ backgroundColor: "transparent", border: "none" }}
    />
  );
};

export default SliderWithMarks;
