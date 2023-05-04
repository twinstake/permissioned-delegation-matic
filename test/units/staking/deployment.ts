import chai from "chai";
import web3 from "web3";
import chaiAsPromised from "chai-as-promised";
import deployer from "../../helpers/deployer";
import { generateFirstWallets, mnemonics } from "../../helpers/wallets";
import { BN } from "@openzeppelin/test-helpers";
import { ethers } from "hardhat";

chai.use(chaiAsPromised).should();

export const getWallets = async () => {
  const wallets = await ethers.getSigners();

  const walletAmounts = {
    [wallets[0].address]: {
      amount: web3.utils.toWei("200"),
      stakeAmount: web3.utils.toWei("200"),
      initialBalance: web3.utils.toWei("1200"),
    },
    [wallets[1].address]: {
      amount: web3.utils.toWei("200"),
      stakeAmount: web3.utils.toWei("200"),
      initialBalance: web3.utils.toWei("1200"),
    },
    [wallets[2].address]: {
      amount: web3.utils.toWei("250"),
      stakeAmount: web3.utils.toWei("150"),
      restakeAmonut: web3.utils.toWei("100"),
      initialBalance: web3.utils.toWei("805"),
    },
    [wallets[3].address]: {
      amount: web3.utils.toWei("300"),
      stakeAmount: web3.utils.toWei("300"),
      initialBalance: web3.utils.toWei("850"),
    },
    [wallets[4].address]: {
      initialBalance: web3.utils.toWei("800"),
    },
  };

  const signer = await ethers.Wallet.createRandom();

  return { wallets, walletAmounts, signer };
};

export async function freshDeploy() {
  const { wallets, walletAmounts } = await getWallets();

  let contracts = await deployer.deployStakeManager(wallets);
  this.stakeToken = contracts.stakeToken;
  this.stakeManager = contracts.stakeManager;
  this.nftContract = contracts.stakingNFT;
  this.rootChainOwner = contracts.rootChainOwner;
  this.registry = contracts.registry;
  this.governance = contracts.governance;
  this.validatorShare = deployer.validatorShare;
  this.slashingManager = contracts.slashingManager;

  await this.stakeManager.updateCheckpointReward(web3.utils.toWei("10000"));
  await this.stakeManager.updateCheckPointBlockInterval(1);

  for (const walletAddr in walletAmounts) {
    await this.stakeToken.mint(
      walletAddr,
      walletAmounts[walletAddr].initialBalance
    );
  }

  await this.stakeToken.mint(
    this.stakeManager.address,
    web3.utils.toWei("10000000")
  );

  this.defaultHeimdallFee = new BN(web3.utils.toWei("1"));
}

export async function approveAndStake({
  wallet,
  stakeAmount,
  approveAmount,
  acceptDelegation = false,
  heimdallFee,
  noMinting = false,
  signer,
}) {
  const fee = heimdallFee || this.defaultHeimdallFee;

  const mintAmount = new BN(approveAmount || stakeAmount).add(new BN(fee));

  if (noMinting) {
    // check if allowance covers fee
    const balance = await this.stakeToken.balanceOf(wallet.address);
    if (balance.lt(mintAmount)) {
      // mint more
      await this.stakeToken.mint(wallet.address, mintAmount.sub(balance));
    }
  } else {
    await this.stakeToken.mint(wallet.address, mintAmount);
  }

  await this.stakeToken.approve(this.stakeManager.address, new BN(mintAmount), {
    from: wallet.address,
  });

  console.log(signer);

  await this.stakeManager.stakeFor(
    wallet.address,
    stakeAmount,
    fee,
    acceptDelegation,
    signer || wallet.publicKey,
    {
      from: wallet.address,
    }
  );
}
