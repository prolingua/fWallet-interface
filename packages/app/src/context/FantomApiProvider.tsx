import React, { useReducer } from "react";

const initial: any = {};
export const FantomApiContext = React.createContext(null);

export const FantomApiProvider: React.FC = ({ children }) => {
  const fantomApiReducer = (state: any, action: any) => {
    switch (action.type) {
      case "success":
        return {
          ...state,
          [action.method]: {
            status: action.type,
            data: action.data,
            error: null,
          },
        };
      case "error":
        return {
          ...state,
          [action.method]: {
            status: action.type,
            data: null,
            error: action.error,
          },
        };
      case "loading":
        return {
          ...state,
          [action.method]: {
            status: action.type,
            data: null,
            error: null,
          },
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
