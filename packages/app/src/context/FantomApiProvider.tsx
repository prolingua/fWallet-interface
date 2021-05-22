import React, { useReducer } from "react";

const initial: any = {
  getAccountTransactionHistory: new Map([]),
  getTokenPrice: null,
  getGasPrice: null,
};
export const FantomApiContext = React.createContext(null);

export const FantomApiProvider: React.FC = ({ children }) => {
  const fantomApiReducer = (state: any, action: any) => {
    switch (action.type) {
      case "success":
        const successState = {
          status: action.type,
          data: action.data,
          error: null,
        } as any;

        if (action.address) {
          return {
            ...state,
            [action.method]: state[action.method].set(
              action.address.toLowerCase(),
              successState
            ),
          };
        }
        return {
          ...state,
          [action.method]: successState,
        };
      case "error":
        const errorState = {
          status: action.type,
          data: null,
          error: action.error,
        } as any;

        if (action.address) {
          return {
            ...state,
            [action.method]: state[action.method].set(
              action.address.toLowerCase(),
              errorState
            ),
          };
        }
        return {
          ...state,
          [action.method]: errorState,
        };
      case "loading":
        const loadingState = {
          status: action.type,
          data: null,
          error: null,
        } as any;

        if (action.address) {
          return {
            ...state,
            [action.method]: state[action.method].set(
              action.address.toLowerCase(),
              loadingState
            ),
          };
        }
        return {
          ...state,
          [action.method]: loadingState,
        };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(fantomApiReducer, initial);

  return (
    <FantomApiContext.Provider value={[state, dispatch]}>
      {children}
    </FantomApiContext.Provider>
  );
};
