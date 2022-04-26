import { useContext } from "react";
import { TokenPriceContext } from "../context/TokenPriceProvider";

const useTokenPrice = () => {
  const [tokenPrices, dispatchTokenPrices] = useContext(TokenPriceContext);
  return { tokenPrices, dispatchTokenPrices };
};

export default useTokenPrice;
