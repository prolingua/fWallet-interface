import React, { useReducer } from "react";

const initial = {} as any;
export const TokenPriceContext = React.createContext(null);

export const TokenPriceProvider: React.FC = ({ children }) => {
  const tokenPriceReducer = (state: any, action: any) => {
    switch (action.type) {
      case "setTokenPrices":
        return {
          ...action.tokens,
        };
      // case "setTokenImages":
      //   return {
      //     ...action.tokens,
      //   };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(tokenPriceReducer, initial);

  return (
    <TokenPriceContext.Provider value={[state, dispatch]}>
      {children}
    </TokenPriceContext.Provider>
  );
};
