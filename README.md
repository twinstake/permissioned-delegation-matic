# Twinstake Matic Validator Share

This project extends the staking contract codebase from matic[https://github.com/maticnetwork/contracts] to introduce a whitelist in validator share contract to meet twinstake KYC enabled requirement needs.

`ValidatorShare.sol`: Smart contract with whitelist integrated Validator Share code.
`Whitelist.sol` : Smart contract with whitelist logic.
`ValidatorShare.test.ts`: Test file containing all logical test flows for ValidatorShare with whitelist.

## Setup

1. create `.env` using `.env.example` file as reference.
2. run `yarn install`

```shell
npx hardhat help
npx hardhat test test/units/staking/ValidatorShare.test.ts
```

## Deployment

Thers is a deployment script in path `scripts/deploy.js` to deploy the Validator Share contract with proxy. To run the script update the variables `nftCounter`, `registry` and `stakingLogger` using the deployed address of staking manager on polygon.

Post deployment, on staking manager `function updateValidatorContractAddress(uint256 validatorId, address newContractAddress) ` will need to be called to update our validatorId address mapping.
