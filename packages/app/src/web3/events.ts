export const switchToChain = async (provider: any, chainId: number) => {
  const getNetworkDetails = () => {
    if (chainId === 250) {
      return {
        chainId: "0xfa", // A 0x-prefixed hexadecimal string
        chainName: "Fantom Opera",
        nativeCurrency: {
          name: "Fantom",
          symbol: "FTM", // 2-6 characters long
          decimals: 18,
        },
        rpcUrls: ["https://rpc.ftm.tools/"],
        blockExplorerUrls: ["https://ftmscan.com/"],
      };
    }
    if (chainId === 4002) {
      return {
        chainId: "0xfa2", // A 0x-prefixed hexadecimal string
        chainName: "Fantom Testnet",
        nativeCurrency: {
          name: "Fantom",
          symbol: "FTM", // 2-6 characters long
          decimals: 18,
        },
        rpcUrls: ["https://xapi.testnet.fantom.network/lachesis"],
        blockExplorerUrls: ["https://testnet.ftmscan.com/"],
      };
    }
  };

  const networkDetails = getNetworkDetails();
  if (!networkDetails || !provider) {
    return;
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: networkDetails.chainId }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [networkDetails],
        });
      } catch (addError) {
        console.error(addError);
        // handle "add" error
      }
    }
    console.error(switchError);
    // handle other "switch" errors
  }
};
