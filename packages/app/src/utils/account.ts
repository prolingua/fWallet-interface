import { formatHexToInt } from "./conversion";

export interface Account {
  account: {
    address: string;
    balance: string;
    txCount: string;
    txList: {
      edges: Transaction[];
    };
  };
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  status: string;
  block: {
    number: string;
    timestamp: string;
  };
}

export const getAccountBalance = (accountData: Account) => {
  return formatHexToInt(accountData.account.balance);
};

export const getAccountTransactions = (accountData: Account) => {
  if (!accountData || !accountData.account) {
    return;
  }

  return accountData.account.txList.edges;
};
