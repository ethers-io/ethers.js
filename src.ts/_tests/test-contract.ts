
import assert from "assert";

import { getProvider } from "./create-provider.js";

import { Contract, EventLog, Wallet } from "../index.js";
import type { ContractEventPayload, ContractEventName, Log } from "../index.js";

describe("Test Contract", function() {
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
        "function testCallAdd(uint256 a, uint256 b) pure returns (uint256 result)"
    ];

    it("tests contract calls", async function() {
        this.timeout(10000);

        const provider = getProvider("InfuraProvider", "goerli");
        const contract = new Contract(addr, abi, provider);

        assert.equal(await contract.testCallAdd(4, 5), BigInt(9), "testCallAdd(4, 5)");
        assert.equal(await contract.testCallAdd(6, 0), BigInt(6), "testCallAdd(6, 0)");
    });

    it("tests events", async function() {
        this.timeout(60000);

        const provider = getProvider("InfuraProvider", "goerli");
        assert.ok(provider);

        const contract = new Contract(addr, abi, provider);

        const signer = new Wallet(<string>(process.env.FAUCET_PRIVATEKEY), provider);
        const contractSigner = <any>contract.connect(signer);

        const vUint256 = 42;
        const vAddrName = "ethers.eth";
        const vAddr = "0x228568EA92aC5Bc281c1E30b1893735c60a139F1";
        const vString = "Hello";
        const vBytes = "0x12345678";

        let hash: null | string = null;

        // Test running a listener for a specific event
        const specificEvent = new Promise((resolve, reject) => {
            contract.on("EventUint256", async (value, event) => {
                // Triggered by someone else
                if (hash == null || hash !== event.log.transactionHash) { return; }

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
                } catch (e) {
                    event.removeListener();
                    reject(e);
                }
            });
        });

        // Test running a listener on all (i.e. "*") events
        const allEvents = new Promise((resolve, reject) => {
            const waitingFor: Record<string, any> = {
                EventUint256: vUint256,
                EventAddress: vAddr,
                EventString: vString,
                EventBytes: vBytes
            };

            contract.on("*", (event: ContractEventPayload) => {
                // Triggered by someone else
                if (hash == null || hash !== event.log.transactionHash) { return; }
                try {
                    const name = event.eventName;

                    assert.equal(event.args[0], waitingFor[name], `${ name }`);
                    delete waitingFor[name];

                    if (Object.keys(waitingFor).length === 0) {
                        event.removeListener();
                        resolve(null);
                    }

                } catch (error) {
                    reject(error);
                }
            });

        });

        // Send a transaction to trigger some events
        const tx = await contractSigner.testEvent(vUint256, vAddr, vString, vBytes);
        hash = tx.hash;

        const checkEvent = (filter: ContractEventName, event: EventLog | Log) => {
            const values: Record<string, any> = {
                EventUint256: vUint256,
                EventString: vString,
                EventAddress: vAddr,
                EventBytes: vBytes
            };

            assert.ok(event instanceof EventLog, `queryFilter(${ filter }):isEventLog`);

            const name = event.eventName;

            assert.equal(event.address, addr, `queryFilter(${ filter }):address`);
            assert.equal(event.args[0], values[name], `queryFilter(${ filter }):args[0]`);
        };

        const checkEventFilter = async (filter: ContractEventName) => {
            const events = (await contract.queryFilter(filter, -10)).filter((e) => (e.transactionHash === hash));
            assert.equal(events.length, 1, `queryFilter(${ filter }).length`);
            checkEvent(filter, events[0]);
            return events[0];
        };

        const receipt = await tx.wait();

        // Check the logs in the receipt
        for (const log of receipt.logs) { checkEvent("receipt", log); }

        // Various options for queryFilter
        await checkEventFilter("EventUint256");
        await checkEventFilter([ "EventUint256" ]);
        await checkEventFilter([ [ "EventUint256" ] ]);
        await checkEventFilter("EventUint256(uint)");
        await checkEventFilter([ "EventUint256(uint)" ]);
        await checkEventFilter([ [ "EventUint256(uint)" ] ]);
        await checkEventFilter([ [ "EventUint256", "EventUint256(uint)" ] ]);
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
            const filter = [ [ "EventUint256", "EventString" ] ];
            const events = (await contract.queryFilter(filter, -10)).filter((e) => (e.transactionHash === hash));
            assert.equal(events.length, 2, `queryFilter(${ filter }).length`);

            for (const event of events) { checkEvent(filter, event); }
        }

        await specificEvent;
        await allEvents;
    });
});


/*
describe("Test Contract Calls", function() {
    it("finds typed methods", async function() {
        const contract = new Contract("0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72", [
            "function foo(string s) view returns (uint)",
            "function foo(uint8) view returns (uint)",
            "function foo(uint u, bool b) view returns (uint)",
        ]);
        const value = Typed.string("42");
        await contract.foo.populateTransaction(value, Typed.overrides({ value: 100 }))
        contract["foo(string)"].fragment
    });
});

describe("Test Contract Interface", function() {
    it("builds contract interfaces", async function() {
        this.timeout(60000);

        interface Erc20Interface {
            // Constant Methods
            balanceOf: ConstantContractMethod<[ address: string | Addressable ], bigint>;
            decimals: ConstantContractMethod<[ ], bigint>;

            name: ConstantContractMethod<[ ], string>;
            symbol: ConstantContractMethod<[ ], string>;

            // Mutation Methods
            transferFrom: ContractMethod<[ address: string | Addressable,
              address: string | Addressable, amount: BigNumberish ], boolean>;

            // Events
            filters: {
                Transfer: ContractEvent<[ from: Addressable | string, to: BigNumberish ]>;
            }
        }

        const erc20Abi = [
            "function balanceOf(address owner) view returns (uint)",
            "function decimals() view returns (uint)",
            "function name() view returns (string)",
            "function symbol() view returns (string)",

            "function transferFrom(address from, address to, uint amount) returns (boolean)",

            "event Transfer(address indexed from, address indexed to, uint amount)"
        ];

        class Erc20Contract extends BaseContract.buildClass<Erc20Interface>(erc20Abi) { };

        const provider = new providers.InfuraProvider();
        // ENS
        //const addr = "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72";
        // DAI
        const addr = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
        const contract = new Erc20Contract(addr, provider);
        console.log("SYMBOL", await contract.symbol());
        console.log("DECIMALS", await contract.decimals());
        console.log(await contract.balanceOf("0x5555763613a12D8F3e73be831DFf8598089d3dCa"));
        console.log(await contract.balanceOf("ricmoo.eth"));

        await contract.on(contract.filters.Transfer, (from, to, value, event) => {
            console.log("HELLO!", { from, to, value, event });
            event.removeListener();
        });
        const logs = await contract.queryFilter("Transfer", -10);
        console.log(logs, logs[0], logs[0].args.from);
    });
});
*/
