contract TestContract {

    event empty();
    event valueChanged(address author, string oldValue, string newValue);
    event callFallback(address sender, uint amount);

    uint _uintValue;
    string _stringValue;
    bytes32 _bytes32Value;

    string[] _arrayValue;
    mapping (string => string) _mappingValue;

    address _owner;
    string _value;

    function TestContract() {
        _uintValue = 42;
        _stringValue = "This is not a string.";
        _bytes32Value = sha3("TheEmptyString");

        _arrayValue.push("One");
        _arrayValue.push("Two");
        _arrayValue.push("Three");

        _mappingValue["A"] = "Apple";
        _mappingValue["B"] = "Banana";
        _mappingValue["C"] = "Cherry";

        _owner = msg.sender;
    }

    function getUintValue() constant returns (uint) {
        return _uintValue;
    }

    function getStringValue() constant returns (string) {
        return _stringValue;
    }

    function getBytes32Value() constant returns (bytes32) {
        return _bytes32Value;
    }

    function getArrayValue(uint index) constant returns (string) {
        return _arrayValue[index];
    }

    function getMappingValue(string key) constant returns (string) {
        return _mappingValue[key];
    }

    function setValue(string value) {
        valueChanged(msg.sender, _value, value);
        _value = value;
    }

    function getValue() constant returns (string) {
        return _value;
    }

    function getValueNamed() constant returns (string value) {
        return _value;
    }

    function triggerEmpty() {
        empty();
    }

    function cleanup() {
        if (_owner != msg.sender) { return; }
        suicide(_owner);
    }

    function getOwner() constant returns (address) {
        return _owner;
    }

    function () {
        bool success = _owner.send(msg.value);
        if (!success) { throw; }
        callFallback(msg.sender, msg.value);
    }
}

contract TestContractDeploy {
    address _owner;

    uint _uintValue;
    string _stringValue;

    function TestContractDeploy(uint uintValue, string stringValue) {
        _owner = msg.sender;
        _uintValue = uintValue;
        _stringValue = stringValue;
    }

    function getValues() constant returns (uint, string) {
        return (_uintValue, _stringValue);
    }

    function cleanup() {
        if (msg.sender != _owner) { return; }
        suicide(_owner);
    }
}
