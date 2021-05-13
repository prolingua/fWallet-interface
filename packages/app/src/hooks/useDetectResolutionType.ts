import { useEffect, useState } from "react";

const useDetectResolutionType = () => {
  const [width, setWidth] = useState(window.innerWidth);
  const handleWindowSizeChange = () => {
    setWidth(window.innerWidth);
  };

  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  if (width <= 576) {
    return "mobile";
  }
  if (width <= 768) {
    return "tablet";
  }
  if (width <= 1200) {
    return "desktop";
  }
  return "ultra";
};

export default useDetectResolutionType;
