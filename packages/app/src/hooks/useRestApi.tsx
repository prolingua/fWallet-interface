import axios from "axios";
import useApiData from "./useApiData";

const useRestApi = (baseUrl: string) => {
  const { dispatchApiData } = useApiData();

  const buildUri = ({ baseUrl, path, params, queryParams }: any) => {
    const url = `${baseUrl}${path ? path : ""}${
      params && params.length ? "/" + params.join("/") : ""
    }${
      queryParams && queryParams.length
        ? "?" + new URLSearchParams(queryParams)
        : ""
    }`;
    return url;
  };

  const post = ({ path, params, queryParams, body }: any) => {
    return handleApiCall(baseUrl, path, async () =>
      axios.post(
        buildUri({ baseUrl: baseUrl, path, params, queryParams }),
        body,
        {}
      )
    );
  };
  const get = ({ path, params, queryParams }: any) => {
    return handleApiCall(baseUrl, path, async () =>
      axios.get(buildUri({ baseUrl: baseUrl, path, params, queryParams }), {})
    );
  };

  const handleApiCall = async (
    baseUrl: string,
    path: string,
    callback: any
  ) => {
    try {
      dispatchApiData({
        type: "pending",
        call: baseUrl + path,
      });

      const result = await callback();
      dispatchApiData({
        type: "success",
        call: baseUrl + path,
        data: result,
      });

      return result;
    } catch (err) {
      dispatchApiData({
        type: "failed",
        call: baseUrl + path,
        error: err,
      });
    }
  };

  return {
    get,
    post,
  };
};

export default useRestApi;
