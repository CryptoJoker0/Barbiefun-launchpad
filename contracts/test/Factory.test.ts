import { expect } from "chai";
import { ethers } from "hardhat";
import type { BarbieFunToken, BarbieFunTokenFactory } from "../typechain-types";

describe("BarbieFunTokenFactory", function () {
  let factory: BarbieFunTokenFactory;
  let tokenImplAddress: string;
  let deployer: any, treasury: any, creator: any, other: any;
  const LAUNCH_FEE = ethers.parseEther("0.01");

  beforeEach(async () => {
    [deployer, treasury, creator, other] = await ethers.getSigners();

    const TokenFactory = await ethers.getContractFactory("BarbieFunToken");
    const tokenImpl = await TokenFactory.deploy();
    await tokenImpl.waitForDeployment();
    tokenImplAddress = await tokenImpl.getAddress();

    const Factory = await ethers.getContractFactory("BarbieFunTokenFactory");
    factory = (await Factory.deploy(
      tokenImplAddress,
      treasury.address,
      LAUNCH_FEE,
      deployer.address
    )) as unknown as BarbieFunTokenFactory;
    await factory.waitForDeployment();
  });

  it("rejects direct initialization of the shared implementation", async () => {
    const impl = await ethers.getContractAt("BarbieFunToken", tokenImplAddress);
    await expect(
      impl.initialize("Hack", "HACK", ethers.parseUnits("1000", 18), other.address)
    ).to.be.revertedWithCustomError(impl, "InvalidInitialization");
  });

  it("deploys a token clone, mints full supply to creator, and forwards the fee to treasury", async () => {
    const supply = ethers.parseUnits("1000000000", 18);
    const treasuryBalanceBefore = await ethers.provider.getBalance(treasury.address);

    const tx = await factory
      .connect(creator)
      .createToken("Barbie Fun Token", "BARBIE", supply, { value: LAUNCH_FEE });
    const receipt = await tx.wait();

    const event = receipt!.logs
      .map((log) => {
        try {
          return factory.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((parsed) => parsed?.name === "TokenCreated");

    expect(event).to.not.be.undefined;
    const tokenAddress = event!.args.token as string;

    const token = (await ethers.getContractAt("BarbieFunToken", tokenAddress)) as unknown as BarbieFunToken;
    expect(await token.name()).to.equal("Barbie Fun Token");
    expect(await token.symbol()).to.equal("BARBIE");
    expect(await token.totalSupply()).to.equal(supply);
    expect(await token.balanceOf(creator.address)).to.equal(supply);
    expect(await token.owner()).to.equal(creator.address);

    const treasuryBalanceAfter = await ethers.provider.getBalance(treasury.address);
    expect(treasuryBalanceAfter - treasuryBalanceBefore).to.equal(LAUNCH_FEE);

    expect(await factory.creatorOf(tokenAddress)).to.equal(creator.address);
    expect(await factory.totalTokens()).to.equal(1n);
    expect(await factory.tokensOf(creator.address)).to.deep.equal([tokenAddress]);
  });

  it("rejects launches that don't pay at least the configured fee", async () => {
    await expect(
      factory.connect(creator).createToken("X", "X", ethers.parseUnits("1", 18), {
        value: LAUNCH_FEE - 1n,
      })
    ).to.be.revertedWith("Factory: insufficient fee");
  });

  it("rejects empty name/symbol and zero supply", async () => {
    await expect(
      factory.connect(creator).createToken("", "X", 1n, { value: LAUNCH_FEE })
    ).to.be.revertedWith("Factory: empty name");
    await expect(
      factory.connect(creator).createToken("X", "", 1n, { value: LAUNCH_FEE })
    ).to.be.revertedWith("Factory: empty symbol");
    await expect(
      factory.connect(creator).createToken("X", "X", 0n, { value: LAUNCH_FEE })
    ).to.be.revertedWith("Factory: zero supply");
  });

  it("gives each launch its own independent token clone", async () => {
    const supply = ethers.parseUnits("1000", 18);
    const tx1 = await factory.connect(creator).createToken("Token One", "ONE", supply, { value: LAUNCH_FEE });
    const r1 = await tx1.wait();
    const tx2 = await factory.connect(other).createToken("Token Two", "TWO", supply, { value: LAUNCH_FEE });
    const r2 = await tx2.wait();

    const addr1 = r1!.logs
      .map((l) => { try { return factory.interface.parseLog(l); } catch { return null; } })
      .find((p) => p?.name === "TokenCreated")!.args.token as string;
    const addr2 = r2!.logs
      .map((l) => { try { return factory.interface.parseLog(l); } catch { return null; } })
      .find((p) => p?.name === "TokenCreated")!.args.token as string;

    expect(addr1).to.not.equal(addr2);
    expect(await factory.totalTokens()).to.equal(2n);
  });

  it("only the owner can update treasury, fee, or pause", async () => {
    await expect(factory.connect(other).setTreasury(other.address)).to.be.revertedWithCustomError(
      factory,
      "OwnableUnauthorizedAccount"
    );
    await expect(factory.connect(other).setLaunchFee(0)).to.be.revertedWithCustomError(
      factory,
      "OwnableUnauthorizedAccount"
    );
    await expect(factory.connect(other).pause()).to.be.revertedWithCustomError(
      factory,
      "OwnableUnauthorizedAccount"
    );

    await factory.connect(deployer).setTreasury(other.address);
    expect(await factory.treasury()).to.equal(other.address);

    await factory.connect(deployer).setLaunchFee(0);
    expect(await factory.launchFee()).to.equal(0n);
  });

  it("blocks new launches while paused, allows again after unpause", async () => {
    await factory.connect(deployer).pause();
    await expect(
      factory.connect(creator).createToken("X", "X", 1n, { value: LAUNCH_FEE })
    ).to.be.revertedWithCustomError(factory, "EnforcedPause");

    await factory.connect(deployer).unpause();
    await expect(
      factory.connect(creator).createToken("X", "X", 1n, { value: LAUNCH_FEE })
    ).to.not.be.reverted;
  });
});
