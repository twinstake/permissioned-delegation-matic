import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

export const artifacts = async () => {
  const RootChain = await ethers.getContractFactory("RootChain");
  const RootChainProxy = await ethers.getContractFactory("RootChainProxy");
  const Registry = await ethers.getContractFactory("Registry");
  const Governance = await ethers.getContractFactory("Governance");
  const GovernanceLockableTest = await ethers.getContractFactory(
    "GovernanceLockableTest"
  );
  const GovernanceProxy = await ethers.getContractFactory("GovernanceProxy");
  const StakeManager = await ethers.getContractFactory("StakeManager");
  const StakeManagerExtension = await ethers.getContractFactory(
    "StakeManagerExtension"
  );
  const StakeManagerTest = await ethers.getContractFactory("StakeManagerTest");
  const StakeManagerProxy = await ethers.getContractFactory(
    "StakeManagerProxy"
  );
  const DrainStakeManager = await ethers.getContractFactory(
    "DrainStakeManager"
  );

  const StakingInfo = await ethers.getContractFactory("StakingInfo");
  const EventsHubProxy = await ethers.getContractFactory("EventsHubProxy");
  const EventsHub = await ethers.getContractFactory("EventsHub");
  const StakingNFT = await ethers.getContractFactory("StakingNFT");
  const ValidatorShareProxy = await ethers.getContractFactory(
    "ValidatorShareProxy"
  );
  const ValidatorShare = await ethers.getContractFactory("ValidatorShareTest");
  const IValidatorShare = await ethers.getContractFactory("IValidatorShare");

  const StakeManagerTestable = await ethers.getContractFactory(
    "StakeManagerTestable"
  );
  const ValidatorShareFactory = await ethers.getContractFactory(
    "ValidatorShareFactory"
  );
  const SlashingManager = await ethers.getContractFactory("SlashingManager");

  const DepositManager = await ethers.getContractFactory("DepositManager");
  const DepositManagerProxy = await ethers.getContractFactory(
    "DepositManagerProxy"
  );
  const Drainable = await ethers.getContractFactory("Drainable");
  const WithdrawManager = await ethers.getContractFactory("WithdrawManager");
  const WithdrawManagerProxy = await ethers.getContractFactory(
    "WithdrawManagerProxy"
  );
  const StateSender = await ethers.getContractFactory("StateSender");

  const ERC20Predicate = await ethers.getContractFactory("ERC20Predicate");
  const ERC20PredicateBurnOnly = await ethers.getContractFactory(
    "ERC20PredicateBurnOnly"
  );
  const ERC721Predicate = await ethers.getContractFactory("ERC721Predicate");
  const ERC721PredicateBurnOnly = await ethers.getContractFactory(
    "ERC721PredicateBurnOnly"
  );
  const MintableERC721Predicate = await ethers.getContractFactory(
    "MintableERC721Predicate"
  );
  const MarketplacePredicate = await ethers.getContractFactory(
    "MarketplacePredicate"
  );
  const MarketplacePredicateTest = await ethers.getContractFactory(
    "MarketplacePredicateTest"
  );
  const TransferWithSigPredicate = await ethers.getContractFactory(
    "TransferWithSigPredicate"
  );

  // tokens
  const MaticWETH = await ethers.getContractFactory("MaticWETH");
  const TestToken = await ethers.getContractFactory("TestToken");
  const RootERC721 = await ethers.getContractFactory("RootERC721");
  const ERC721PlasmaMintable = await ethers.getContractFactory(
    "ERC721PlasmaMintable"
  );
  const ExitNFT = await ethers.getContractFactory("ExitNFT");

  // Misc
  const GnosisSafeProxy = await ethers.getContractFactory("GnosisSafeProxy");
  const GnosisSafe = await ethers.getContractFactory("GnosisSafe");

  // child chain
  const childContracts = {
    Marketplace: await ethers.getContractFactory("Marketplace"),
    ChildChain: await ethers.getContractFactory("ChildChain"),
    ChildTokenProxy: await ethers.getContractFactory("ChildTokenProxy"),
    ChildERC20: await ethers.getContractFactory("ChildERC20"),
    ChildERC20Proxified: await ethers.getContractFactory("ChildERC20Proxified"),
    ChildERC721: await ethers.getContractFactory("ChildERC721"),
    ChildERC721Proxified: await ethers.getContractFactory(
      "ChildERC721Proxified"
    ),
    ChildERC721Mintable: await ethers.getContractFactory("ChildERC721Mintable"),
    MRC20: await ethers.getContractFactory("MRC20"),
    TestMRC20: await ethers.getContractFactory("TestMRC20"),
  };

  return {
    RootChain,
    RootChainProxy,
    Registry,
    Governance,
    GovernanceLockableTest,
    GovernanceProxy,
    StakeManager,
    StakeManagerExtension,
    StakeManagerTest,
    StakeManagerProxy,
    DrainStakeManager,
    StakingInfo,
    EventsHubProxy,
    EventsHub,
    StakingNFT,
    ValidatorShareProxy,
    ValidatorShare,
    IValidatorShare,
    StakeManagerTestable,
    ValidatorShareFactory,
    SlashingManager,
    DepositManager,
    DepositManagerProxy,
    Drainable,
    WithdrawManager,
    WithdrawManagerProxy,
    StateSender,
    ERC20Predicate,
    ERC20PredicateBurnOnly,
    ERC721Predicate,
    ERC721PredicateBurnOnly,
    MintableERC721Predicate,
    MarketplacePredicate,
    MarketplacePredicateTest,
    TransferWithSigPredicate,
    MaticWETH,
    TestToken,
    RootERC721,
    ERC721PlasmaMintable,
    ExitNFT,
    GnosisSafeProxy,
    GnosisSafe,
    childContracts,
  };
};
