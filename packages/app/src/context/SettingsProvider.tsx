import React, { useReducer } from "react";

const initial = {
  currency: "USD",
  language: null,
} as any;
export const SettingsContext = React.createContext(null);

export const SettingsProvider: React.FC = ({ children }) => {
  const settingsReducer = (state: any, action: any) => {
    switch (action.type) {
      case "changeCurrency":
        return {
          ...state,
          currency: action.currency,
        };
      case "changeLanguage":
        return {
          ...state,
          language: action.language,
        };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(settingsReducer, initial);

  return (
    <SettingsContext.Provider value={[state, dispatch]}>
      {children}
    </SettingsContext.Provider>
  );
};
