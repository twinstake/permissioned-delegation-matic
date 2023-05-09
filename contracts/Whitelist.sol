pragma solidity 0.5.17;
import "hardhat/console.sol";

contract Whitelist {

    mapping(address => bool) public owners;
    mapping(address => bool) public whitelist;

    event WhitelistAdded(address indexed account);
    event WhitelistRemoved(address indexed account);

    modifier onlyOwner() {
        require(owners[msg.sender], "not owner");
        _;
    }

    modifier onlyWhiteListed() {
        require(whitelist[msg.sender], "not whitelisted");
        _;
    }

    function Whitelist__initialize(address _owner) public {
        owners[_owner] = true;
        addWhitelist(_owner);
        console.log(_owner);
    }

    function addWhitelist(address account) public onlyOwner {
        whitelist[account] = true;
        emit WhitelistAdded(account);
    }

    function removeWhitelist(address account) public onlyOwner {
        whitelist[account] = false;
        emit WhitelistRemoved(account);
    }

    function addOwner(address _newOwner) public onlyOwner {
        addWhitelist(_newOwner);
    }

    function removeOwner(address _oldOwner) public onlyOwner { 
        removeWhitelist(_oldOwner);
    }
}