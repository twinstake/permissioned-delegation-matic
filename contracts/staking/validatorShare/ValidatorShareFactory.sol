pragma solidity ^0.5.2;

import {ValidatorShareProxy} from "./ValidatorShareProxy.sol";
import {ValidatorShare} from "./ValidatorShare.sol";

contract ValidatorShareFactory {

    // for internal testing purposes only.
     address public owner = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    /**
    - factory to create new validatorShare contracts
   */
    function create(uint256 validatorId, address loggerAddress, address registry) public returns (address) {
        ValidatorShareProxy proxy = new ValidatorShareProxy(registry);

        proxy.transferOwnership(msg.sender);

        address proxyAddr = address(proxy);
        (bool success, bytes memory data) = proxyAddr.call.gas(gasleft())(
            abi.encodeWithSelector(
                ValidatorShare(proxyAddr).initialize.selector, 
                validatorId, 
                loggerAddress, 
                msg.sender, 
                owner
            )
        );

        require(success, string(data));


        return proxyAddr;
    }
}
