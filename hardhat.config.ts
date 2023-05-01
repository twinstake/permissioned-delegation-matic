import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const MNEMONIC =
  process.env.MNEMONIC ||
  "clock radar mass judge dismiss just intact mind resemble fringe diary casino";
const API_KEY = process.env.API_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      { version: "0.5.2" },
      { version: "0.5.11" },
      { version: "0.5.17" },
      { version: "0.5.3" },
    ],
  },
};

export default config;
