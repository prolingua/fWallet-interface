import TransportU2F from "@ledgerhq/hw-transport-u2f";
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import FantomNano from "./ledger/fantom-nano";
import { Signer } from "@ethersproject/abstract-signer";
import {
  Deferrable,
  defineReadOnly,
  resolveProperties,
} from "@ethersproject/properties";
import { Provider, TransactionRequest } from "@ethersproject/abstract-provider";
import BN from "bn.js";
import config from "../config/config";

function waiter(duration: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

// @ts-ignore
export class LedgerSigner extends Signer {
  readonly addressId: number;
  readonly _eth: Promise<any>;
  transport: any;
  dispatch: any;

  constructor(provider?: Provider, dispatch?: any, addressId?: number) {
    super();
    this.dispatch = dispatch;
    defineReadOnly(this, "provider", provider || null);
    defineReadOnly(this, "addressId", addressId || 0);
    defineReadOnly(
      this,
      "_eth",
      this.getTransport().then(
        (transport) => {
          dispatch({ type: "setHWInitialState" });
          // @ts-ignore
          const ftm = new FantomNano(transport);
          return ftm.getVersion().then(
            (version) => {
              console.log(version);
              this.transport = transport;
              return ftm;
            },
            (error) => {
              console.warn("version error", error);
              if (error.statusCode === 28169) {
                dispatch({ type: "setHWIsLocked", data: { isLocked: true } });
              } else {
                dispatch({
                  type: "setHWIsWrongApp",
                  data: { isWrongApp: true },
                });
              }
              transport.close();
              return Promise.reject(error);
            }
          );
        },
        (error) => {
          console.log("transport error", error);
          return Promise.reject(error);
        }
      )
    );
  }

  getTransport() {
    return navigator.userAgent.indexOf("Chrome") !== -1
      ? TransportWebHID.create()
      : TransportU2F.create();
  }

  async closeTransport() {
    if (this.transport) {
      await this.transport.close();
      this.transport = null;
    }
  }

  _retry<T = any>(
    callback: (ftm: FantomNano) => Promise<T>,
    timeout?: number
  ): Promise<T> {
    return new Promise(async (resolve, reject) => {
      if (timeout && timeout > 0) {
        setTimeout(() => {
          reject(new Error("timeout"));
        }, timeout);
      }

      try {
        const ftm = await this._eth;

        // Wait up to 5 seconds
        for (let i = 0; i < 50; i++) {
          try {
            const result = await callback(ftm);
            return resolve(result);
          } catch (error) {
            if (error.id !== "TransportLocked") {
              return reject(error);
            }
          }
          await waiter(100);
        }
      } catch (error) {
        return reject(error);
      }

      return reject(new Error("timeout"));
    });
  }

  async listAddresses(firstAddress = 0, length = 5): Promise<string[]> {
    try {
      return await this._retry((ftm) =>
        ftm.listAddresses(0, firstAddress, length)
      );
    } finally {
      await this.closeTransport();
    }
  }

  async getAddress(): Promise<string> {
    return await this._retry((ftm) => ftm.getAddress(0, this.addressId, false));
  }

  async signMessage(message: any): Promise<string> {
    // if (typeof message === "string") {
    //   message = ethers.utils.toUtf8Bytes(message);
    // }
    //
    // const messageHex = ethers.utils.hexlify(message).substring(2);

    // const sig = await this._retry((eth) =>
    //   eth.signPersonalMessage(this.path, messageHex)
    // );
    // sig.r = "0x" + sig.r;
    // sig.s = "0x" + sig.s;
    //ethers.utils.joinSignature(sig);
    return "";
  }

  async populateTransaction(transaction: Deferrable<TransactionRequest>) {
    try {
      this.dispatch({ type: "setHWIsApproving", data: { isApproving: true } });
      return super.populateTransaction(transaction);
    } catch (err) {
      this.dispatch({ type: "setHWIsApproving", data: { isApproving: false } });
    }
  }

  async signTransaction(
    transaction: Deferrable<TransactionRequest>
  ): Promise<string> {
    try {
      const tx = await resolveProperties(transaction);
      const baseTx: any = {
        chainId: config.chainId,
        data: tx.data || undefined,
        gasLimit: tx.gasLimit ? new BN(tx.gasLimit.toString()) : undefined,
        gasPrice: tx.gasPrice ? new BN(tx.gasPrice.toString()) : undefined,
        nonce: tx.nonce === undefined ? undefined : new BN(tx.nonce.toString()),
        to: tx.to || undefined,
        value: tx.value ? new BN(tx.value.toString()) : undefined,
      };

      const signedTx: any = await this._retry((ftm) =>
        ftm.signTransaction(0, this.addressId, baseTx)
      );

      return new Promise((resolve) => resolve(signedTx.raw));
    } catch (err) {
      return new Promise((r, reject) => reject(err));
    } finally {
      this.dispatch({ type: "setHWIsApproving", data: { isApproving: false } });
    }
  }

  connect(provider: Provider): Signer {
    return new LedgerSigner(provider, this.dispatch, this.addressId || 0);
  }
}
