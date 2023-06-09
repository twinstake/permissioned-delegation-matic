/* global web3 */

import * as ethUtils from "ethereumjs-util";
import { Buffer } from "safe-buffer";
import encode from "ethereumjs-abi";
import fs from "fs";
import path from "path";
import Web3 from "web3";

import { generateFirstWallets, mnemonics } from "./wallets";
import logDecoder from "./log-decoder";
import { ethers, config } from "hardhat";

// console.log(ethUtils.keccak256('depositTokens(address,address,uint256,uint256)').slice(0, 4))

const crypto = require("crypto");

const BN = ethUtils.BN;
const rlp = ethUtils.rlp;

// constants
export let web3Child;

if (process.env.SOLIDITY_COVERAGE) {
  //web3Child = new Web3(web3.currentProvider);
} else {
  web3Child = new Web3(
    new Web3.providers.HttpProvider("http://localhost:8545")
  );
}

export const ZeroAddress = "0x0000000000000000000000000000000000000000";
export let ChildMaticTokenAddress =
  "0x0000000000000000000000000000000000001010";
export const scalingFactor = Web3.utils.toBN(10).pow(Web3.utils.toBN(18));

export function getSigs(wallets, votedata, order = true) {
  // avoid any potential side effects
  const copyWallets = [...wallets];

  if (order) {
    copyWallets.sort((w1, w2) => {
      return w1.address.localeCompare(w2.address);
    });
  }
  const accounts = config.networks.hardhat.accounts;

  return copyWallets.map((w, index) => {
    const wallet1 = ethers.Wallet.fromMnemonic(
      accounts.mnemonic,
      accounts.path + `/${index}`
    );
    const h = ethUtils.toBuffer(votedata);
    const privateKey = wallet1.privateKey;

    const vrs = ethUtils.ecsign(h, ethUtils.toBuffer(privateKey));
    return ethUtils.toRpcSig(vrs.v, vrs.r, vrs.s);
  });
}

export function getSigsWithVotes(_wallets, data, sigPrefix, maxYesVotes) {
  let wallets = [..._wallets];
  wallets.sort((w1, w2) => {
    return w1.address.localeCompare(w2.address);
  });

  return wallets.map((w, index) => {
    let voteData;

    if (index < maxYesVotes) {
      voteData = Buffer.concat([
        ethUtils.toBuffer(sigPrefix || "0x01"),
        ethUtils.toBuffer(data),
      ]);
    } else {
      voteData = Buffer.concat([
        ethUtils.toBuffer(sigPrefix || "0x02"),
        ethUtils.toBuffer(data),
      ]);
    }

    const voteHash = ethUtils.keccak256(voteData);
    voteData = ethUtils.toBuffer(voteHash);
    const vrs = ethUtils.ecsign(voteData, w.getPrivateKey());
    return ethUtils.toRpcSig(vrs.v, vrs.r, vrs.s);
  });
}

export function encodeSigs(sigs = []) {
  return Buffer.concat(sigs.map((s) => ethUtils.toBuffer(s)));
}

export function encodeSigsForCheckpoint(sigs = []) {
  return sigs.map((s) => {
    const buffer = [...ethUtils.toBuffer(s)];
    return [
      new BN(buffer.slice(0, 32)),
      new BN(buffer.slice(32, 64)),
      new BN(buffer.slice(64, 96)),
    ];
  });
}

export async function checkPoint(
  wallets,
  proposer,
  stakeManager,
  { blockInterval = 1, rootchainOwner, order = true } = {}
) {
  const voteData = "dummyData";
  const sigs = encodeSigsForCheckpoint(
    // @ts-ignore
    getSigs(wallets, ethUtils.keccak256(Buffer.from(voteData)), order)
  );

  const stateRoot = ethUtils.bufferToHex(
    ethUtils.keccak256(Buffer.from("stateRoot"))
  );
  // 2/3 majority vote
  await stakeManager.checkSignatures(
    blockInterval,
    ethUtils.bufferToHex(ethUtils.keccak256(Buffer.from(voteData))),
    stateRoot,
    proposer.address,
    sigs,
    {
      from: (rootchainOwner || proposer).address,
    }
  );
}

export async function updateSlashedAmounts(
  wallets,
  proposer,
  _slashingNonce,
  slashingInfoList,
  slashingManager,
  options = {}
) {
  let data = new Web3().eth.abi.encodeParameters(
    ["uint256", "address", "bytes"],
    [
      _slashingNonce,
      proposer.address,
      ethUtils.bufferToHex(ethUtils.rlp.encode(slashingInfoList)),
    ]
  );
  const sigData = Buffer.concat([
    ethUtils.toBuffer("" || "0x01"),
    ethUtils.toBuffer(data),
  ]);
  const sigs = ethUtils.bufferToHex(
    encodeSigs(getSigs(wallets, ethUtils.keccak256(sigData)))
  );
  return slashingManager.updateSlashedAmounts(data, sigs, {
    from: proposer.address,
  });
}

export function assertBigNumberEquality(num1, num2) {
  if (!BN.isBN(num1)) num1 = Web3.utils.toBN(num1.toString());
  if (!BN.isBN(num2)) num2 = Web3.utils.toBN(num2.toString());
  assert(
    num1.eq(num2),
    `expected ${num1.toString(10)} and ${num2.toString(10)} to be equal`
  );
}

export function assertBigNumbergt(num1, num2) {
  if (!BN.isBN(num1)) num1 = Web3.utils.toBN(num1.toString());
  if (!BN.isBN(num2)) num2 = Web3.utils.toBN(num2.toString());

  assert(
    num1.gt(num2),
    `expected ${num1.toString(10)} to be greater than ${num2.toString(10)}`
  );
}

export const toChecksumAddress = (address) =>
  Web3.utils.toChecksumAddress(address);

export function buildsubmitCheckpointPaylod(
  proposer,
  start,
  end,
  root,
  wallets,
  options = {
    rewardsRootHash: "",
    allValidators: false,
    getSigs: false,
    totalStake: 1,
    sigPrefix: "",
  } // false vars are to show expected vars
) {
  if (!root) root = ethUtils.keccak256(encode(start, end)); // dummy root
  if (!wallets) {
    wallets = getWallets();
  }

  let validators = options.allValidators
    ? wallets
    : [wallets[1], wallets[2], wallets[3]];

  let data = Web3.eth.abi.encodeParameters(
    ["address", "uint256", "uint256", "bytes32", "bytes32", "uint256"],
    [proposer, start, end, root, options.rewardsRootHash, 15001]
  );
  const sigData = Buffer.concat([
    ethUtils.toBuffer(options.sigPrefix || "0x01"),
    ethUtils.toBuffer(data),
  ]);

  // in case of TestStakeManger use empty data
  const sigs = encodeSigsForCheckpoint(
    options.getSigs ? getSigs(validators, ethUtils.keccak256(sigData)) : []
  );
  return { data, sigs };
}

export function buildsubmitCheckpointPaylodWithVotes(
  proposer,
  start,
  end,
  root,
  wallets,
  maxYesVotes,
  options = {
    rewardsRootHash: "",
    allValidators: false,
    getSigs: false,
    totalStake: 1,
    sigPrefix: "",
  } // false vars are to show expected vars
) {
  if (!root) root = ethUtils.keccak256(encode(start, end)); // dummy root
  if (!wallets) {
    wallets = getWallets();
  }

  let validators = options.allValidators
    ? wallets
    : [wallets[1], wallets[2], wallets[3]];

  let data = Web3.eth.abi.encodeParameters(
    ["address", "uint256", "uint256", "bytes32", "bytes32", "bytes32"],
    [
      proposer,
      start,
      end,
      root,
      options.rewardsRootHash,
      "0x0000000000000000000000000000000000000000000000000000000000003a99",
    ]
  );
  const sigData = ethUtils.toBuffer(data);

  // in case of TestStakeManger use dummysig data
  const sigs = encodeSigsForCheckpoint(
    options.getSigs
      ? getSigsWithVotes(validators, sigData, options.sigPrefix, maxYesVotes)
      : "dummySig"
  );
  return { data, sigs };
}

export function getWallets() {
  const stakes = {
    1: Web3.utils.toWei("101"),
    2: Web3.utils.toWei("100"),
    3: Web3.utils.toWei("100"),
    4: Web3.utils.toWei("100"),
  };
  return generateFirstWallets(mnemonics, Object.keys(stakes).length);
}

export async function depositOnRoot(
  depositManager,
  rootToken,
  user,
  amountOrToken,
  options = { erc20: true }
) {
  let result;
  if (options.erc20) {
    await rootToken.approve(depositManager.address, amountOrToken);
    result = await depositManager.depositERC20ForUser(
      rootToken.address,
      user,
      amountOrToken
    );
  } else if (options.erc721) {
    await rootToken.mint(amountOrToken);
    await rootToken.approve(depositManager.address, amountOrToken);
    result = await depositManager.depositERC721ForUser(
      rootToken.address,
      user,
      amountOrToken
    );
  }
  const logs = logDecoder.decodeLogs(result.receipt.rawLogs);
  const NewDepositBlockEvent = logs.find(
    (log) => log.event === "NewDepositBlock"
  );
  return NewDepositBlockEvent.args.depositBlockId;
}

export async function deposit(
  depositManager,
  childChain,
  rootContract,
  user,
  amountOrToken,
  options = { rootDeposit: false, erc20: true }
) {
  let depositBlockId;
  if (options.rootDeposit) {
    depositBlockId = await depositOnRoot(
      depositManager,
      rootContract,
      user,
      amountOrToken,
      options
    );
  } else {
    depositBlockId = "0x" + crypto.randomBytes(32).toString("hex");
  }
  const deposit = await fireDepositFromMainToMatic(
    childChain,
    "0xa" /* dummy id */,
    user,
    rootContract.address,
    amountOrToken,
    depositBlockId
  );
  if (options.writeToFile) {
    await writeToFile(options.writeToFile, deposit.receipt);
  }
  return deposit;
}

export function fireDepositFromMainToMatic(
  childChain,
  eventId,
  user,
  tokenAddress,
  amountOrToken,
  depositBlockId
) {
  // ACLed on onlyOwner
  return childChain.onStateReceive(
    eventId,
    encodeDepositStateSync(user, tokenAddress, amountOrToken, depositBlockId)
  );
}

function encodeDepositStateSync(user, rootToken, tokenIdOrAmount, depositId) {
  if (typeof tokenIdOrAmount !== "string") {
    tokenIdOrAmount = "0x" + tokenIdOrAmount.toString(16);
  }
  return Web3.eth.abi.encodeParameters(
    ["address", "address", "uint256", "uint256"],
    [user, rootToken, tokenIdOrAmount, depositId]
  );
}

export function startExit(
  predicate,
  headerNumber,
  blockProof,
  blockNumber,
  blockTimestamp,
  reference,
  logIndex,
  exitTx
) {
  return predicate.startExit(
    ethUtils.bufferToHex(
      rlp.encode([
        headerNumber,
        ethUtils.bufferToHex(Buffer.concat(blockProof)),
        blockNumber,
        blockTimestamp,
        ethUtils.bufferToHex(reference.transactionsRoot),
        ethUtils.bufferToHex(reference.receiptsRoot),
        ethUtils.bufferToHex(reference.receipt),
        ethUtils.bufferToHex(rlp.encode(reference.receiptParentNodes)),
        ethUtils.bufferToHex(
          Buffer.concat([Buffer.from("00", "hex"), reference.path])
        ), // branch mask,
        logIndex,
      ])
    ),
    ethUtils.bufferToHex(exitTx),
    { value: Web3.utils.toWei(".1", "ether") }
  );
}

export function startExitWithBurntTokens(predicate, input, from) {
  if (from) {
    return predicate.startExitWithBurntTokens(
      ethUtils.bufferToHex(rlp.encode(buildReferenceTxPayload(input))),
      { from }
    );
  }
  return predicate.startExitWithBurntTokens(
    ethUtils.bufferToHex(rlp.encode(buildReferenceTxPayload(input)))
  );
}

export function startExitNew(predicate, inputs, exitTx, from) {
  let _inputs = [];
  inputs.forEach((input) => {
    _inputs = _inputs.concat(buildReferenceTxPayload(input));
  });
  const options = { value: Web3.utils.toWei(".1", "ether") };
  if (from) options.from = from;
  return predicate.startExit(
    ethUtils.bufferToHex(rlp.encode(_inputs)),
    ethUtils.bufferToHex(exitTx),
    options
  );
}

export function startExitForErc20Predicate(fn, inputs, exitTx, from) {
  let _inputs = [];
  inputs.forEach((input) => {
    _inputs = _inputs.concat(buildReferenceTxPayload(input));
  });
  const options = { value: Web3.utils.toWei(".1", "ether") };
  if (from) options.from = from;
  return fn(
    ethUtils.bufferToHex(rlp.encode(_inputs)),
    ethUtils.bufferToHex(exitTx),
    options
  );
}

export function startExitForErc20PredicateLegacy(
  fn,
  headerNumber,
  blockProof,
  blockNumber,
  blockTimestamp,
  reference,
  logIndex,
  exitTx,
  from
) {
  const options = { value: Web3.utils.toWei(".1", "ether") };
  if (from) options.from = from;
  return fn(
    ethUtils.bufferToHex(
      rlp.encode([
        headerNumber,
        ethUtils.bufferToHex(Buffer.concat(blockProof)),
        blockNumber,
        blockTimestamp,
        ethUtils.bufferToHex(reference.transactionsRoot),
        ethUtils.bufferToHex(reference.receiptsRoot),
        ethUtils.bufferToHex(reference.receipt),
        ethUtils.bufferToHex(rlp.encode(reference.receiptParentNodes)),
        ethUtils.bufferToHex(
          Buffer.concat([Buffer.from("00", "hex"), reference.path])
        ), // branch mask,
        logIndex,
      ])
    ),
    ethUtils.bufferToHex(exitTx),
    options
  );
}

export function startExitForMarketplacePredicate(
  predicate,
  inputs,
  exitToken,
  exitTx
) {
  let _inputs = [];
  inputs.forEach((input) => {
    _inputs.push(
      Web3.eth.abi.encodeParameters(
        ["address", "bytes"],
        [input.predicate, rlp.encode(buildReferenceTxPayload(input))]
      )
    );
  });
  _inputs.push(exitToken);
  return predicate.startExit(
    ethUtils.bufferToHex(rlp.encode(_inputs)),
    ethUtils.bufferToHex(exitTx),
    { value: Web3.utils.toWei(".1", "ether") }
  );
}

export function startExitForTransferWithSig(fn, inputs, exitTx, from) {
  const options = { value: Web3.utils.toWei(".1", "ether") };
  if (from) options.from = from;
  return fn(
    ethUtils.bufferToHex(
      rlp.encode(inputs.map(buildReferenceTxPayload).map(rlp.encode))
    ),
    ethUtils.bufferToHex(exitTx),
    options
  );
}

export async function verifyDeprecation(
  withdrawManager,
  predicate,
  exitId,
  inputId,
  challengeData,
  options
) {
  const exit = await withdrawManager.exits(exitId);
  // console.log('exit', exit, exit.receiptAmountOrNFTId.toString(16))
  const exitData = Web3.eth.abi.encodeParameters(
    ["address", "address", "uint256", "bytes32", "bool"],
    [
      exit.owner,
      options.childToken,
      "0x" + exit.receiptAmountOrNFTId.toString(16),
      exit.txHash,
      exit.isRegularExit,
    ]
  );
  // console.log('exitData', exitData)
  const inputUtxoData = Web3.eth.abi.encodeParameters(
    ["uint256", "address", "address", "address"],
    [options.age, options.signer, predicate.address, options.childToken]
  );
  // console.log('inputUtxoData', inputUtxoData)
  return predicate.verifyDeprecation(exitData, inputUtxoData, challengeData);
}

export function buildReferenceTxPayload(input) {
  const {
    headerNumber,
    blockProof,
    blockNumber,
    blockTimestamp,
    reference,
    logIndex,
  } = input;
  return [
    headerNumber,
    ethUtils.bufferToHex(Buffer.concat(blockProof)),
    blockNumber,
    blockTimestamp,
    ethUtils.bufferToHex(reference.transactionsRoot),
    ethUtils.bufferToHex(reference.receiptsRoot),
    ethUtils.bufferToHex(reference.receipt),
    ethUtils.bufferToHex(rlp.encode(reference.receiptParentNodes)),
    ethUtils.bufferToHex(
      Buffer.concat([Buffer.from("00", "hex"), reference.path])
    ), // branch mask,
    logIndex,
  ];
}

export function buildChallengeData(input) {
  const data = buildReferenceTxPayload(input);
  const { reference } = input;
  return ethUtils.bufferToHex(
    rlp.encode(
      data.concat([
        ethUtils.bufferToHex(reference.tx),
        ethUtils.bufferToHex(rlp.encode(reference.txParentNodes)),
      ])
    )
  );
}

export async function writeToFile(file, receipt) {
  const r = {
    tx: await web3Child.eth.getTransaction(receipt.transactionHash),
    receipt: await web3Child.eth.getTransactionReceipt(receipt.transactionHash),
    block: await web3Child.eth.getBlock(
      receipt.blockHash,
      true /* returnTransactionObjects */
    ),
  };
  return fs.writeFileSync(
    path.join(__dirname, "..", "mockResponses", file),
    `module.exports = ${JSON.stringify(r, null, 2)}`
  );
}

export function increaseBlockTime(seconds) {
  return Web3.currentProvider.send({
    jsonrpc: "2.0",
    method: "evm_increaseTime",
    params: [seconds],
    id: new Date().getTime(),
  });
}

export function filterEvent(events, event) {
  const index = events.findIndex((e) => {
    return e.event === event;
  });
  if (index === -1) throw new Error(`${event} not found in given events`);
  return index;
}
