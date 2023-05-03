import * as bip39 from "bip39";
import { hdkey } from "ethereumjs-wallet";

import packageJSON from "../../package.json";

export const mnemonics = packageJSON.config.mnemonics;
