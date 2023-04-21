
pragma solidity ^0.5.2;

import "../libraries/ERC20.sol";


contract ERC20NonTradable is ERC20 {
    function _approve(
        address owner,
        address spender,
        uint256 value
    ) internal {
        revert("disabled");
    }
}