import { useContext } from "react";
import { ApiDataContext } from "../context/ApiDataProvider";

const useApiData = () => {
  const [apiData, dispatchApiData] = useContext(ApiDataContext);

  return { apiData, dispatchApiData };
};

export default useApiData;
