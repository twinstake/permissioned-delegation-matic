
pragma solidity ^0.5.2;


contract ERC20NonTradable is ERC20 {
    function _approve(
        address owner,
        address spender,
        uint256 value
    ) internal {
        revert("disabled");
    }
}