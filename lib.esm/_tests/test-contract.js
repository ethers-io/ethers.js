import assert from "assert";
import { getProvider, setupProviders } from "./create-provider.js";
import { Contract, EventLog, isError, Typed, Wallet } from "../index.js";
setupProviders();
describe("Test Contract", function () {
    const addr = "0x99417252Aad7B065940eBdF50d665Fb8879c5958";
    const abi = [
        "error CustomError1(uint256 code, string message)",
        "event EventUint256(uint256 indexed value)",
        "event EventAddress(address indexed value)",
        "event EventString(string value)",
        "event EventBytes(bytes value)",
        "function testCustomError1(bool pass, uint code, string calldata message) pure returns (uint256)",
        "function testErrorString(bool pass, string calldata message) pure returns (uint256)",
        "function testPanic(uint256 code) returns (uint256)",
        "function testEvent(uint256 valueUint256, address valueAddress, string valueString, bytes valueBytes) public",
        "function testCallAdd(uint256 a, uint256 b) pure returns (uint256 result)",
    ];
    it("tests contract calls", async function () {
        this.timeout(10000);
        const provider = getProvider("InfuraProvider", "goerli");
        const contract = new Contract(addr, abi, provider);
        assert.equal(await contract.testCallAdd(4, 5), BigInt(9), "testCallAdd(4, 5)");
        assert.equal(await contract.testCallAdd(6, 0), BigInt(6), "testCallAdd(6, 0)");
    });
    it("tests events", async function () {
        this.timeout(60000);
        const provider = getProvider("InfuraProvider", "goerli");
        assert.ok(provider);
        const contract = new Contract(addr, abi, provider);
        const signer = new Wallet((process.env.FAUCET_PRIVATEKEY), provider);
        const contractSigner = contract.connect(signer);
        const vUint256 = 42;
        const vAddrName = "ethers.eth";
        const vAddr = "0x228568EA92aC5Bc281c1E30b1893735c60a139F1";
        const vString = "Hello";
        const vBytes = "0x12345678";
        let hash = null;
        // Test running a listener for a specific event
        const specificEvent = new Promise((resolve, reject) => {
            contract.on("EventUint256", async (value, event) => {
                // Triggered by someone else
                if (hash == null || hash !== event.log.transactionHash) {
                    return;
                }
                try {
                    assert.equal(event.filter, "EventUint256", "event.filter");
                    assert.equal(event.fragment.name, "EventUint256", "event.fragment.name");
                    assert.equal(event.log.address, addr, "event.log.address");
                    assert.equal(event.args.length, 1, "event.args.length");
                    assert.equal(event.args[0], BigInt(42), "event.args[0]");
                    const count = await contract.listenerCount("EventUint256");
                    await event.removeListener();
                    assert.equal(await contract.listenerCount("EventUint256"), count - 1, "decrement event count");
                    resolve(null);
                }
                catch (e) {
                    event.removeListener();
                    reject(e);
                }
            });
        });
        // Test running a listener on all (i.e. "*") events
        const allEvents = new Promise((resolve, reject) => {
            const waitingFor = {
                EventUint256: vUint256,
                EventAddress: vAddr,
                EventString: vString,
                EventBytes: vBytes
            };
            contract.on("*", (event) => {
                // Triggered by someone else
                if (hash == null || hash !== event.log.transactionHash) {
                    return;
                }
                try {
                    const name = event.eventName;
                    assert.equal(event.args[0], waitingFor[name], `${name}`);
                    delete waitingFor[name];
                    if (Object.keys(waitingFor).length === 0) {
                        event.removeListener();
                        resolve(null);
                    }
                }
                catch (error) {
                    reject(error);
                }
            });
        });
        // Send a transaction to trigger some events
        const tx = await contractSigner.testEvent(vUint256, vAddr, vString, vBytes);
        hash = tx.hash;
        const checkEvent = (filter, event) => {
            const values = {
                EventUint256: vUint256,
                EventString: vString,
                EventAddress: vAddr,
                EventBytes: vBytes
            };
            assert.ok(event instanceof EventLog, `queryFilter(${filter}):isEventLog`);
            const name = event.eventName;
            assert.equal(event.address, addr, `queryFilter(${filter}):address`);
            assert.equal(event.args[0], values[name], `queryFilter(${filter}):args[0]`);
        };
        const checkEventFilter = async (filter) => {
            const events = (await contract.queryFilter(filter, -10)).filter((e) => (e.transactionHash === hash));
            assert.equal(events.length, 1, `queryFilter(${filter}).length`);
            checkEvent(filter, events[0]);
            return events[0];
        };
        const receipt = await tx.wait();
        // Check the logs in the receipt
        for (const log of receipt.logs) {
            checkEvent("receipt", log);
        }
        // Various options for queryFilter
        await checkEventFilter("EventUint256");
        await checkEventFilter(["EventUint256"]);
        await checkEventFilter([["EventUint256"]]);
        await checkEventFilter("EventUint256(uint)");
        await checkEventFilter(["EventUint256(uint)"]);
        await checkEventFilter([["EventUint256(uint)"]]);
        await checkEventFilter([["EventUint256", "EventUint256(uint)"]]);
        await checkEventFilter("0x85c55bbb820e6d71c71f4894e57751de334b38c421f9c170b0e66d32eafea337");
        // Query by Event
        await checkEventFilter(contract.filters.EventUint256);
        // Query by Deferred Topic Filter; address
        await checkEventFilter(contract.filters.EventUint256(vUint256));
        // Query by Deferred Topic Filter; address
        await checkEventFilter(contract.filters.EventAddress(vAddr));
        // Query by Deferred Topic Filter; ENS name => address
        await checkEventFilter(contract.filters.EventAddress(vAddrName));
        // Multiple Methods
        {
            const filter = [["EventUint256", "EventString"]];
            const events = (await contract.queryFilter(filter, -10)).filter((e) => (e.transactionHash === hash));
            assert.equal(events.length, 2, `queryFilter(${filter}).length`);
            for (const event of events) {
                checkEvent(filter, event);
            }
        }
        await specificEvent;
        await allEvents;
    });
});
describe("Test Typed Contract Interaction", function () {
    const tests = [
        {
            types: ["uint8", "uint16", "uint24", "uint32", "uint40", "uint48", "uint56", "uint64", "uint72", "uint80", "uint88", "uint96", "uint104", "uint112", "uint120", "uint128", "uint136", "uint144", "uint152", "uint160", "uint168", "uint176", "uint184", "uint192", "uint200", "uint208", "uint216", "uint224", "uint232", "uint240", "uint248", "uint256", "int8", "int16", "int24", "int32", "int40", "int48", "int56", "int64", "int72", "int80", "int88", "int96", "int104", "int112", "int120", "int128", "int136", "int144", "int152", "int160", "int168", "int176", "int184", "int192", "int200", "int208", "int216", "int224", "int232", "int240", "int248", "int256"],
            valueFunc: (type) => { return 42; }
        },
        {
            types: [
                "bytes1", "bytes2", "bytes3", "bytes4", "bytes5", "bytes6", "bytes7", "bytes8", "bytes9", "bytes10", "bytes11", "bytes12", "bytes13", "bytes14", "bytes15", "bytes16", "bytes17", "bytes18", "bytes19", "bytes20", "bytes21", "bytes22", "bytes23", "bytes24", "bytes25", "bytes26", "bytes27", "bytes28", "bytes29", "bytes30", "bytes31", "bytes32",
                "bytes"
            ],
            valueFunc: (type) => {
                const length = type.substring(5);
                if (length) {
                    const value = new Uint8Array(parseInt(length));
                    value.fill(42);
                    return value;
                }
                return "0x123456";
            }
        }, {
            types: ["bool"],
            valueFunc: (type) => { return true; }
        }, {
            types: ["address"],
            valueFunc: (type) => { return "0x643aA0A61eADCC9Cc202D1915D942d35D005400C"; }
        }, {
            types: ["string"],
            valueFunc: (type) => { return "someString"; }
        }
    ];
    const abi = [];
    for (let i = 1; i <= 32; i++) {
        abi.push(`function testTyped(uint${i * 8}) public pure returns (string memory)`);
        abi.push(`function testTyped(int${i * 8}) public pure returns (string memory)`);
        abi.push(`function testTyped(bytes${i}) public pure returns (string memory)`);
    }
    abi.push(`function testTyped(address) public pure returns (string memory)`);
    abi.push(`function testTyped(bool) public pure returns (string memory)`);
    abi.push(`function testTyped(bytes memory) public pure returns (string memory)`);
    abi.push(`function testTyped(string memory) public pure returns (string memory)`);
    const addr = "0x838f41545DA5e18AA0e1ab391085d22E172B7B02";
    const provider = getProvider("InfuraProvider", "goerli");
    const contract = new Contract(addr, abi, provider);
    for (const { types, valueFunc } of tests) {
        for (const type of types) {
            const value = valueFunc(type);
            it(`tests typed value: Typed.from(${type})`, async function () {
                this.timeout(10000);
                const v = Typed.from(type, value);
                const result = await contract.testTyped(v);
                assert.equal(result, type);
            });
            it(`tests typed value: Typed.${type}()`, async function () {
                this.timeout(10000);
                const v = Typed[type](value);
                const result = await contract.testTyped(v);
                assert.equal(result, type);
            });
        }
    }
});
describe("Test Contract Fallback", function () {
    const tests = [
        {
            name: "none",
            address: "0x0ccdace3d8353fed9b87a2d63c40452923ccdae5",
            abi: [],
            sendNone: { error: "no fallback" },
            sendData: { error: "no fallback" },
            sendValue: { error: "no fallback" },
            sendDataAndValue: { error: "no fallback" },
        },
        {
            name: "non-payable fallback",
            address: "0x3f10193f79a639b11ec9d2ab42a25a4a905a8870",
            abi: [
                "fallback()"
            ],
            sendNone: { data: "0x" },
            sendData: { data: "0x1234" },
            sendValue: { error: "overrides.value" },
            sendDataAndValue: { error: "overrides.value" },
        },
        {
            name: "payable fallback",
            address: "0xe2de6b97c5eb9fee8a47ca6c0fa642331e0b6330",
            abi: [
                "fallback() payable"
            ],
            sendNone: { data: "0x" },
            sendData: { data: "0x1234" },
            sendValue: { data: "0x" },
            sendDataAndValue: { data: "0x1234" },
        },
        {
            name: "receive-only",
            address: "0xf8f2afbbe37f6a4520e4db7f99495655aa31229b",
            abi: [
                "receive()"
            ],
            sendNone: { data: "0x" },
            sendData: { error: "overrides.data" },
            sendValue: { data: "0x" },
            sendDataAndValue: { error: "overrides.data" },
        },
        {
            name: "receive and payable fallback",
            address: "0x7d97ca5d9dea1cd0364f1d493252006a3c4e18a0",
            abi: [
                "fallback() payable",
                "receive()"
            ],
            sendNone: { data: "0x" },
            sendData: { data: "0x1234" },
            sendValue: { data: "0x" },
            sendDataAndValue: { data: "0x1234" },
        },
        {
            name: "receive and non-payable fallback",
            address: "0x5b59d934f0d22b15e73b5d6b9ae83486b70df67e",
            abi: [
                "fallback() payable",
                "receive()"
            ],
            sendNone: { data: "0x" },
            sendData: { data: "0x" },
            sendValue: { data: "0x" },
            sendDataAndValue: { error: "overrides.value" },
        },
    ];
    const provider = getProvider("InfuraProvider", "goerli");
    const testGroups = [
        {
            group: "sendNone",
            tx: {}
        },
        {
            group: "sendData",
            tx: { data: "0x1234" }
        },
        {
            group: "sendValue",
            tx: { value: 123 }
        },
        {
            group: "sendDataAndValue",
            tx: { data: "0x1234", value: 123 }
        },
    ];
    for (const { group, tx } of testGroups) {
        for (const test of tests) {
            const { name, address, abi } = test;
            const send = test[group];
            const contract = new Contract(address, abi, provider);
            it(`test contract fallback checks: ${group} - ${name}`, async function () {
                const func = async function () {
                    if (abi.length === 0) {
                        throw new Error("no fallback");
                    }
                    assert.ok(contract.fallback);
                    return await contract.fallback.populateTransaction(tx);
                };
                if ("data" in send) {
                    await func();
                    //const result = await func();
                    //@TODO: Test for the correct populated tx
                    //console.log(result);
                    assert.ok(true);
                }
                else {
                    assert.rejects(func, function (error) {
                        if (error.message === send.error) {
                            return true;
                        }
                        if (isError(error, "INVALID_ARGUMENT")) {
                            return error.argument === send.error;
                        }
                        console.log("EE", error);
                        return true;
                    });
                }
            });
        }
    }
});
//# sourceMappingURL=test-contract.js.map