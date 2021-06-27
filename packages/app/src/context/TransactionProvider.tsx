import React, { useReducer } from "react";

const initial = {
  id: null,
  error: null,
  state: null,
} as any;
export const TransactionContext = React.createContext(null);

export const TransactionProvider: React.FC = ({ children }) => {
  const transactionReducer = (state: any, action: any) => {
    switch (action.type) {
      case "transactionPending":
        return {
          id: action.id,
          state: "pending",
        };
      case "transactionCompleted":
        return {
          ...state,
          state: "completed",
        };
      case "transactionError":
        return {
          ...state,
          error: action.error,
          state: "failed",
        };
      case "reset":
        return initial;
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(transactionReducer, initial);

  return (
    <TransactionContext.Provider value={[state, dispatch]}>
      {children}
    </TransactionContext.Provider>
  );
};
