import { Provider } from "@ethersproject/abstract-provider";
import { BigNumberish, BigNumber } from "@ethersproject/bignumber";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import * as Sdk from "@reservoir0x/sdk/src";
import { ethers, network } from "hardhat";

// --- MISC UTILS ---

export const bn = (value: BigNumberish) => BigNumber.from(value);

export const lc = (value: string) => value.toLowerCase();

export const getCurrentTimestamp = async (provider: Provider) =>
  provider.getBlock("latest").then((b) => b.timestamp);

export const getRandomBoolean = () => Math.random() < 0.5;

export const getRandomInteger = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getRandomFloat = (min: number, max: number) =>
  Math.random() * (max - min) + min;

// --- NETWORK UTILS ---

// Reset forked network state
export const reset = async () => {
  if ((network.config as any).forking) {
    await network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            jsonRpcUrl: (network.config as any).forking.url,
            blockNumber: (network.config as any).forking.blockNumber,
          },
        },
      ],
    });
  }
};

// Retrieve the forked network's chain id
export const getChainId = () =>
  (network.config as any).forking?.url.includes("rinkeby") ? 4 : 1;

// --- CONTRACT UTILS ---

// TODO: Fix type issues and avoid returning `any`

// Deploy mock ERC20 contract
export const setupTokens = async (deployer: SignerWithAddress) => {
  const erc20: any = await ethers
    .getContractFactory("MockERC20", deployer)
    .then((factory) => factory.deploy());

  return { erc20 };
};

// Deploy mock ERC721/1155 contracts
export const setupNFTs = async (deployer: SignerWithAddress) => {
  const erc721: any = await ethers
    .getContractFactory("MockERC721", deployer)
    .then((factory) => factory.deploy());
  const erc1155: any = await ethers
    .getContractFactory("MockERC1155", deployer)
    .then((factory) => factory.deploy());

  return { erc721, erc1155 };
};

export enum ExchangeKind {
  WYVERN_V23,
  LOOKS_RARE,
  ZEROEX_V4,
  FOUNDATION,
  X2Y2,
  SEAPORT,
}

export const setupRouter = async (
  chainId: number,
  deployer: SignerWithAddress,
  version: "v1" | "v2" | "v3" | "v4" | "v5" = "v5"
) => {
  switch (version) {
    case "v1":
      return ethers
        .getContractFactory("ReservoirV1_0_0", deployer)
        .then((factory) =>
          factory.deploy(
            Sdk.Common.Addresses.Weth[chainId],
            Sdk.LooksRare.Addresses.Exchange[chainId],
            Sdk.WyvernV23.Addresses.Exchange[chainId],
            Sdk.ZeroExV4.Addresses.Exchange[chainId]
          )
        ) as any;

    case "v2":
      return ethers
        .getContractFactory("ReservoirV2_0_0", deployer)
        .then((factory) =>
          factory.deploy(
            Sdk.Common.Addresses.Weth[chainId],
            Sdk.LooksRare.Addresses.Exchange[chainId],
            Sdk.WyvernV23.Addresses.Exchange[chainId],
            Sdk.ZeroExV4.Addresses.Exchange[chainId],
            Sdk.Foundation.Addresses.Exchange[chainId],
            Sdk.X2Y2.Addresses.Exchange[chainId],
            Sdk.X2Y2.Addresses.Erc721Delegate[chainId]
          )
        ) as any;

    case "v3":
      return ethers
        .getContractFactory("ReservoirV3_0_0", deployer)
        .then((factory) =>
          factory.deploy(
            Sdk.Common.Addresses.Weth[chainId],
            Sdk.LooksRare.Addresses.Exchange[chainId],
            Sdk.WyvernV23.Addresses.Exchange[chainId],
            Sdk.ZeroExV4.Addresses.Exchange[chainId],
            Sdk.Foundation.Addresses.Exchange[chainId],
            Sdk.X2Y2.Addresses.Exchange[chainId],
            Sdk.X2Y2.Addresses.Erc721Delegate[chainId],
            Sdk.Seaport.Addresses.Exchange[chainId]
          )
        ) as any;

    case "v4":
      return ethers
        .getContractFactory("ReservoirV4_0_0", deployer)
        .then((factory) =>
          factory.deploy(
            Sdk.Common.Addresses.Weth[chainId],
            Sdk.LooksRare.Addresses.Exchange[chainId],
            Sdk.WyvernV23.Addresses.Exchange[chainId],
            Sdk.ZeroExV4.Addresses.Exchange[chainId],
            Sdk.Foundation.Addresses.Exchange[chainId],
            Sdk.X2Y2.Addresses.Exchange[chainId],
            Sdk.X2Y2.Addresses.Erc721Delegate[chainId],
            Sdk.Seaport.Addresses.Exchange[chainId]
          )
        ) as any;

    case "v5":
      return ethers
        .getContractFactory("ReservoirV5_0_0", deployer)
        .then((factory) =>
          factory.deploy(
            Sdk.Common.Addresses.Weth[chainId],
            Sdk.LooksRare.Addresses.Exchange[chainId],
            Sdk.WyvernV23.Addresses.Exchange[chainId],
            Sdk.ZeroExV4.Addresses.Exchange[chainId],
            Sdk.Foundation.Addresses.Exchange[chainId],
            Sdk.X2Y2.Addresses.Exchange[chainId],
            Sdk.X2Y2.Addresses.Erc721Delegate[chainId],
            Sdk.Seaport.Addresses.Exchange[chainId]
          )
        ) as any;
  }
};
