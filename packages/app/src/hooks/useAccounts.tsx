import { useContext } from "react";
import { AccountsContext } from "../context/AccountsProvider";

const useSettings = () => {
  const [accounts, dispatchAccounts] = useContext(AccountsContext);
  return { accounts, dispatchAccounts };
};

export default useSettings;
