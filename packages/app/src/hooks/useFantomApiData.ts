import { useContext } from "react";
import { FantomApiContext } from "../context/FantomApiProvider";

const useFantomApiData = () => {
  const [apiData, dispatchApiData] = useContext(FantomApiContext);
  return { apiData, dispatchApiData };
};

export default useFantomApiData;
