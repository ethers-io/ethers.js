// Do not use this; it is only for an example in the docs

contract MyToken {
    event Transfer(address indexed from, address indexed to, uint amount);

    mapping (address => uint256) _balances;

    constructor(uint256 totalSupply) {
        emit Transfer(address(0), msg.sender, totalSupply);
        _balances[msg.sender] = totalSupply;
    }

    // Read-Only Functions
    function balanceOf(address owner) public view returns (uint256) {
        return _balances[owner];
    }

    function decimals() public pure returns (uint8) {
        return 18;
    }

    function symbol() public pure returns (string memory) {
        return "MyToken";
    }

    // Authenticated Functions
    function transfer(address to, uint amount) public returns (bool) {
        require(_balances[msg.sender] >= amount, "insufficient token balance");
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
}
