import { ethers, network, run } from "hardhat";
import * as fs from "fs";
import * as path from "path";

const DEFAULT_LAUNCH_FEE_WEI = ethers.parseEther("0"); // fee enforced off-chain per-launch via msg.value; 0 floor by default

const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS;

async function main() {
  if (!TREASURY_ADDRESS) {
    throw new Error("TREASURY_ADDRESS env var is required (the wallet that should receive launch fees)");
  }

  const [deployer] = await ethers.getSigners();
  console.log(`\nDeploying to network: ${network.name} (chainId ${network.config.chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer balance: ${ethers.formatEther(balance)} native token`);

  console.log("\n1/2 Deploying BarbieFunToken implementation...");
  const TokenFactory = await ethers.getContractFactory("BarbieFunToken");
  const tokenImpl = await TokenFactory.deploy();
  await tokenImpl.waitForDeployment();
  const tokenImplAddress = await tokenImpl.getAddress();
  console.log(`   Implementation deployed at: ${tokenImplAddress}`);

  console.log("\n2/2 Deploying BarbieFunTokenFactory...");
  const Factory = await ethers.getContractFactory("BarbieFunTokenFactory");
  const factory = await Factory.deploy(tokenImplAddress, TREASURY_ADDRESS, DEFAULT_LAUNCH_FEE_WEI, deployer.address);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log(`   Factory deployed at: ${factoryAddress}`);

  const deployment = {
    network: network.name,
    chainId: network.config.chainId,
    tokenImplementation: tokenImplAddress,
    factory: factoryAddress,
    treasury: TREASURY_ADDRESS,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    txHashes: {
      tokenImplementation: tokenImpl.deploymentTransaction()?.hash,
      factory: factory.deploymentTransaction()?.hash,
    },
  };

  const outDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `${network.name}.json`), JSON.stringify(deployment, null, 2));
  console.log(`\nSaved deployment record to deployments/${network.name}.json`);

  // Best-effort verification — non-fatal if the explorer API isn't reachable/known yet.
  console.log("\nAttempting contract verification...");
  try {
    await run("verify:verify", { address: tokenImplAddress, constructorArguments: [] });
    console.log("   Token implementation verified.");
  } catch (err: any) {
    console.log(`   Token implementation verification skipped/failed: ${err.message?.split("\n")[0]}`);
  }
  try {
    await run("verify:verify", {
      address: factoryAddress,
      constructorArguments: [tokenImplAddress, TREASURY_ADDRESS, DEFAULT_LAUNCH_FEE_WEI, deployer.address],
    });
    console.log("   Factory verified.");
  } catch (err: any) {
    console.log(`   Factory verification skipped/failed: ${err.message?.split("\n")[0]}`);
  }

  console.log("\nDone.\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
