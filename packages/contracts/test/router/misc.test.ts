import { Contract } from "@ethersproject/contracts";
import { parseEther } from "@ethersproject/units";
import * as Sdk from "@reservoir0x/sdk/src";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { ethers, network, upgrades } from "hardhat";

describe("Router - misc", () => {
  let chainId: number;

  let deployer: SignerWithAddress;
  let alice: SignerWithAddress;

  let erc721: Contract;
  let erc1155: Contract;
  let router: Contract;

  beforeEach(async () => {
    chainId = (network.config as any).forking?.url.includes("rinkeby") ? 4 : 1;
    [deployer, alice] = await ethers.getSigners();

    erc721 = await ethers
      .getContractFactory("MockERC721", deployer)
      .then((factory) => factory.deploy());
    erc1155 = await ethers
      .getContractFactory("MockERC1155", deployer)
      .then((factory) => factory.deploy());

    // Make sure testing will not override any mainnet manifest files.
    process.chdir("/tmp");

    router = await upgrades.deployProxy(
      await ethers.getContractFactory("RouterV1", deployer),
      [
        Sdk.Common.Addresses.Weth[chainId],
        Sdk.LooksRare.Addresses.Exchange[chainId],
        Sdk.WyvernV23.Addresses.Exchange[chainId],
        Sdk.ZeroExV4.Addresses.Exchange[chainId],
      ]
    );
    router = await upgrades.upgradeProxy(
      router.address,
      await ethers.getContractFactory("RouterV2", deployer),
      {
        call: {
          fn: "initializeV2",
          args: [
            Sdk.Foundation.Addresses.Exchange[chainId],
            Sdk.X2Y2.Addresses.Exchange[chainId],
            Sdk.X2Y2.Addresses.Erc721Delegate[chainId],
          ],
        },
      }
    );
  });

  afterEach(async () => {
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
  });

  it("Recover stucked ETH and WETH", async () => {
    // Send ETH to the router
    const ethAmount = parseEther("1");
    await deployer.sendTransaction({
      to: router.address,
      value: ethAmount,
    });

    expect(await ethers.provider.getBalance(router.address)).to.eq(ethAmount);

    // Send WETH to the router
    const wethAmount = parseEther("0.5");
    const weth = new Sdk.Common.Helpers.Weth(ethers.provider, chainId);
    await weth.deposit(deployer, wethAmount);
    await weth.transfer(deployer, router.address, wethAmount);

    expect(await weth.getBalance(router.address)).to.eq(wethAmount);

    const targets = [alice.address, weth.contract.address];
    const data = [
      "0x",
      weth.transferTransaction(router.address, alice.address, wethAmount).data,
    ];
    const values = [ethAmount, 0];

    // Only admin can trigger calls
    await expect(
      router.connect(alice).makeCalls(targets, data, values)
    ).to.be.revertedWith("Ownable: caller is not the owner");

    const aliceEthBalanceBefore = await alice.getBalance();

    await router.connect(deployer).makeCalls(targets, data, values);

    const aliceEthBalanceAfter = await alice.getBalance();
    expect(await ethers.provider.getBalance(router.address)).to.eq(0);
    expect(aliceEthBalanceAfter.sub(aliceEthBalanceBefore)).to.eq(ethAmount);
    expect(await weth.getBalance(router.address)).to.eq(0);
    expect(await weth.getBalance(alice.address)).to.eq(wethAmount);
  });

  it("Recover stucked ERC721 and ERC1155", async () => {
    // Send ERC721 to the router
    await erc721.connect(deployer).mint(0);
    await erc721
      .connect(deployer)
      .transferFrom(deployer.address, router.address, 0);

    expect(await erc721.ownerOf(0)).to.eq(router.address);

    // Send ERC1155 to the router
    await erc1155.connect(deployer).mint(0);
    await erc1155
      .connect(deployer)
      .safeTransferFrom(deployer.address, router.address, 0, 1, "0x");

    expect(await erc1155.balanceOf(router.address, 0)).to.eq(1);

    const targets = [erc721.address, erc1155.address];
    const data = [
      erc721.interface.encodeFunctionData("transferFrom", [
        router.address,
        deployer.address,
        0,
      ]),
      erc1155.interface.encodeFunctionData("safeTransferFrom", [
        router.address,
        deployer.address,
        0,
        1,
        "0x",
      ]),
    ];
    const values = [0, 0];

    await router.connect(deployer).makeCalls(targets, data, values);

    expect(await erc721.ownerOf(0)).to.eq(deployer.address);
    expect(await erc1155.balanceOf(router.address, 0)).to.eq(0);
    expect(await erc1155.balanceOf(deployer.address, 0)).to.eq(1);
  });
});
