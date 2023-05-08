pragma solidity 0.5.17;

contract Whitelist {

    bytes32 constant private OWNER = keccak256("OWNER");

    mapping(address => bool) public owners;
    mapping(address => bool) public whitelist;

    event WhitelistAdded(address indexed account);
    event WhitelistRemoved(address indexed account);

    modifier onlyRole(bytes32 role) {
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
    }

    function addWhitelist(address account) public onlyRole(OWNER) {
        whitelist[account] = true;
        emit WhitelistAdded(account);
    }

    function removeWhitelist(address account) public onlyRole(OWNER) {
        whitelist[account] = false;
        emit WhitelistRemoved(account);
    }

    function addOwner(address _newOwner) public onlyRole(OWNER) {
        addWhitelist(_newOwner);
    }

    function removeOwner(address _oldOwner) public onlyRole(OWNER) { 
        removeWhitelist(_oldOwner);
    }
}