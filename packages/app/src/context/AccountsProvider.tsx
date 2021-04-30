import React, { useReducer } from "react";

type ProviderType = "metamask" | "key";
export interface ActiveAccount {
  account: string;
  type: ProviderType;
}
const initial: { activeAccounts: ActiveAccount[] } = {
  activeAccounts: [],
};
export const AccountsContext = React.createContext(null);

export const AccountsProvider: React.FC = ({ children }) => {
  const accountsReducer = (state: any, action: any) => {
    switch (action.type) {
      case "addAccount":
        // Dont add account if the account already exist
        if (
          state.activeAccounts.find(
            (activeAccount: ActiveAccount) =>
              activeAccount.account.toLowerCase() ===
              action.activeAccount.account.toLowerCase()
          )
        ) {
          return state;
        }
        return {
          activeAccounts: [...state.activeAccounts, action.activeAccount],
        };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(accountsReducer, initial);

  return (
    <AccountsContext.Provider value={[state, dispatch]}>
      {children}
    </AccountsContext.Provider>
  );
};
