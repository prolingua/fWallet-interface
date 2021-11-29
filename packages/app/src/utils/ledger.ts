import TransportU2F from "@ledgerhq/hw-transport-u2f";
import { BigNumber } from "@ethersproject/bignumber";
import FantomNano from "./ledger/fantom-nano";
import { Signer } from "@ethersproject/abstract-signer";
import {
  Deferrable,
  defineReadOnly,
  resolveProperties,
} from "@ethersproject/properties";
import { Provider, TransactionRequest } from "@ethersproject/abstract-provider";
import { serialize } from "@ethersproject/transactions";

// type TransportCreator = {
//   // @ts-ignore
//   create: () => Promise<u2f.Transport>;
// };
// const transports: { [name: string]: TransportCreator } = {
//   u2f: u2f,
//   default: u2f,
// };

const defaultPath = "m/44'/60'/0'/0/0";

function waiter(duration: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

// @ts-ignore
export class LedgerSigner extends Signer {
  readonly type: string;
  readonly path: string;

  readonly _eth: Promise<any>;

  constructor(provider?: Provider, type?: string, path?: string) {
    super();
    if (path == null) {
      path = defaultPath;
    }
    if (type == null) {
      type = "default";
    }

    defineReadOnly(this, "path", path);
    defineReadOnly(this, "type", type);
    defineReadOnly(this, "provider", provider || null);

    // const transport = transports[type];
    // if (!transport) {
    //   logger.throwArgumentError("unknown or unsupported type", "type", type);
    // }
    defineReadOnly(
      this,
      "_eth",
      TransportU2F.create().then(
        (transport) => {
          console.log(transport);
          // @ts-ignore
          const ftm = new FantomNano(transport);
          return ftm.getVersion().then(
            (version) => {
              console.log(version);
              return ftm;
            },
            (error) => {
              console.log("version error");
              return Promise.reject(error);
            }
          );
        },
        (error) => {
          console.log("transport error");
          return Promise.reject(error);
        }
      )
    );
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

      return reject(new Error("timeout"));
    });
  }

  async getAddress(): Promise<string> {
    return await this._retry((ftm) => ftm.getAddress());
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

  async signTransaction(
    transaction: Deferrable<TransactionRequest>
  ): Promise<string> {
    const tx = await resolveProperties(transaction);
    const baseTx: any = {
      chainId: tx.chainId || undefined,
      data: tx.data || undefined,
      gasLimit: tx.gasLimit || undefined,
      gasPrice: tx.gasPrice || undefined,
      nonce: tx.nonce ? BigNumber.from(tx.nonce).toNumber() : undefined,
      to: tx.to || undefined,
      value: tx.value || undefined,
    };

    // const unsignedTx = serialize(baseTx).substring(2);
    const sig: any = await this._retry((ftm) =>
      ftm.signTransaction(0, 0, baseTx)
    );

    return serialize(baseTx, {
      v: BigNumber.from("0x" + sig.v).toNumber(),
      r: "0x" + sig.r,
      s: "0x" + sig.s,
    });
  }

  // async sendTransaction(transaction: any) {
  //   console.log("SEND TRANSACTION!", { transaction });
  //   if ((await Promise.resolve(transaction.to)) === transaction.to) {
  //     transaction.to = await transaction.to;
  //   }
  //
  //   if (!transaction.value) {
  //     transaction.value = parseEther("0.0");
  //   }
  //
  //   let signedTx = await this.signTransaction(transaction);
  //
  //   return this.provider.sendTransaction(signedTx);
  // }
  //
  connect(provider: Provider): Signer {
    return new LedgerSigner(provider, this.type, this.path);
  }
}
