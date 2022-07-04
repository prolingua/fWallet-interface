import { useEffect, useState } from "react";

const useDetectResolution = () => {
  const [width, setWidth] = useState(window.innerWidth);
  let timeout: any;
  const handleWindowSizeChange = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      setWidth(window.innerWidth);
    }, 100);
  };

  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getResolutionType = () => {
    if (width <= 480) {
      return "xs";
    }
    if (width <= 768) {
      return "sm";
    }
    if (width <= 1024) {
      return "md";
    }
    return "lg";
  };

  return { resolutionSize: getResolutionType(), width };
};

export default useDetectResolution;
