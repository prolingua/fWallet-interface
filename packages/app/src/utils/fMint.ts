import { Token } from "../shared/types";
import { formatHexToBN, formatHexToInt } from "./conversion";

export interface FMint {
  fMintAccount: {
    collateralValue: string;
    debtValue: string;
    collateral: Collateral[];
  };
}

export interface Collateral {
  balance: string;
  value: string;
  token: Token;
}

export const getLockedCollateral = (fMint: FMint, tokenSymbol = "WFTM") => {
  if (!fMint?.fMintAccount) {
    return;
  }

  return formatHexToBN(
    fMint.fMintAccount.collateral.find(
      (collateral: any) => collateral.token.symbol === "WFTM"
    )?.balance || "0x0"
  );
};

export const getCurrentCRatio = (fMint: FMint) => {
  if (!fMint?.fMintAccount) {
    return;
  }

  return (
    (formatHexToInt(fMint.fMintAccount.collateralValue) /
      formatHexToInt(fMint.fMintAccount.debtValue)) *
    100
  );
};
