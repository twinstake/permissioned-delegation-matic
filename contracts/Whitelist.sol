pragma solidity 0.5.17;
import {OwnableLockable} from "./common/mixin/OwnableLockable.sol";

contract Whitelist is OwnableLockable {

    mapping(address => bool) public owners;
    mapping(address => bool) public whitelist;


    event OwnerAdded(address indexed account);
    event OwnerRemoved(address indexed account);
    event AccountAddedToWhitelist(address indexed account);
    event AccountRemovedFromWhitelist(address indexed account);

    modifier onlyWhitelistedOwner() {
        require(owners[msg.sender], "not owner");
        _;
    }

    modifier onlyWhiteListed() {
        require(whitelist[msg.sender] , "not whitelisted");
        _;
    }

    function Whitelist__initialize(address _owner) public {
        owners[_owner] = true;
        whitelist[_owner] = true;
     
    }

    function addToWhitelist(address account) public onlyWhitelistedOwner {
        whitelist[account] = true;
        emit AccountAddedToWhitelist(account);
    }

    function removeFromWhitelist(address account) public onlyWhitelistedOwner {
        whitelist[account] = false;
        emit AccountRemovedFromWhitelist(account);
    }

    function addOwner(address _newOwner) public onlyWhitelistedOwner {
       owners[_newOwner] = true;
       emit OwnerAdded(_newOwner);
    }

    function removeOwner(address _oldOwner) public onlyWhitelistedOwner { 
        owners[_oldOwner] = false;
        emit OwnerRemoved(_oldOwner);
    }

    function isWhitelisted(address account) public view returns (bool) {
        return whitelist[account];
    }

    function isWhitelistedOwner(address account) public view returns (bool) {
        return owners[account];
    }
}