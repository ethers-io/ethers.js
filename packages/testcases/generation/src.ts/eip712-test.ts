import { TypedDataUtils } from "eth-sig-util";

import { AbstractAbiTest, AbiType } from "./abi-test";
import { saveTests, TestCase } from "./test";

function fill(testcase: Partial<TestCase.Eip712>): TestCase.Eip712 {
    const domainType: Array<{ name: string, type:string }> = [];

    if (testcase.domain.name != null) {
        domainType.push({ name: "name", type: "string" });
    }
    if (testcase.domain.version != null) {
        domainType.push({ name: "version", type: "string" });
    }
    if (testcase.domain.chainId != null) {
        domainType.push({ name: "chainId", type: "uint256" });
    }
    if (testcase.domain.verifyingContract != null) {
        domainType.push({ name: "verifyingContract", type: "address" });
    }
    if (testcase.domain.salt != null) {
        domainType.push({ name: "salt", type: "bytes32" });
    }

    const typesWithDomain: Record<string, Array<{ name: string, type: string }>> = {
        EIP712Domain: domainType
    };
    for (const key in testcase.types) { typesWithDomain[key] = testcase.types[key]; }


    testcase.encoded = "0x" + TypedDataUtils.encodeData(testcase.primaryType, testcase.data, testcase.types).toString("hex");
    testcase.digest = "0x" + TypedDataUtils.sign({
        types: <any>typesWithDomain,
        domain: testcase.domain,
        primaryType: testcase.primaryType,
        message: testcase.data
    }, true).toString("hex");

    return <TestCase.Eip712>testcase;
}

export class Eip712Test extends AbstractAbiTest<TestCase.Eip712> {
    generateTest(): TestCase.Eip712 {
        const type = this.randomType("tuple");

        const types: Record<string, Array<{ name: string, type: string }>> = { };
        function spelunk(type: AbiType): void {
            if (type.struct) {
                types[type.struct.split("[")[0]] = type.components.map((t) => {
                    spelunk(t);
                    return { name: t.name, type: (t.struct || t.type) };
                });;
            }
        }
        spelunk(type);

        const primaryType = type.struct;
        const data = type.create();

        const domain: any = { };
        if (this.randomChoice([ false, true])) {
            domain.name = this.randomString(1, 64);
        }
        if (this.randomChoice([ false, true])) {
            domain.version = [
                this.randomInteger(0, 50),
                this.randomInteger(0, 50),
                this.randomInteger(0, 50),
            ].join(".");
        }
        if (this.randomChoice([ false, true])) {
            domain.chainId = this.randomInteger(0, 1337);
        }
        if (this.randomChoice([ false, true])) {
            domain.verifyingContract = this.randomAddress();
        }
        if (this.randomChoice([ false, true])) {
            domain.salt = this.randomHexString(32);
        }

        return fill({
            domain,
            type: type.type,
            seed: this.seed,
            primaryType, types, data
        });
    }
}

if (require.main === module) {
    const tests: Array<TestCase.Eip712> = [ ];

    for (let i = 0; i < 1024; i++) {
        const test = new Eip712Test(String(i));
        tests.push(test.generateTest());
    }

    tests.sort((a, b) => (a.type.length - b.type.length));
    tests.forEach((t, i) => { t.name = `random-${ i }`; });

    tests.push({
        name: "EIP712 example",
        domain: {
            name: 'Ether Mail',
            version: '1',
            chainId: 1,
            verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
        },
        primaryType: "Mail",
        types: {
            Person: [
                { name: 'name', type: 'string' },
                { name: 'wallet', type: 'address' }
            ],
            Mail: [
                { name: 'from', type: 'Person' },
                { name: 'to', type: 'Person' },
                { name: 'contents', type: 'string' }
            ]
        },
        data: {
            from: {
                name: 'Cow',
                wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
            },
            to: {
                name: 'Bob',
                wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'
            },
            contents: 'Hello, Bob!'
        },
        encoded: "0xa0cedeb2dc280ba39b857546d74f5549c3a1d7bdc2dd96bf881f76108e23dac2fc71e5fa27ff56c350aa531bc129ebdf613b772b6604664f5d8dbe21b85eb0c8cd54f074a4af31b4411ff6a60c9719dbd559c221c8ac3492d9d872b041d703d1b5aadf3154a261abdd9086fc627b61efca26ae5702701d05cd2305f7c52a2fc8",
        digest: "0xbe609aee343fb3c4b28e1df9e632fca64fcfaede20f02e86244efddf30957bd2",
        privateKey: "0xc85ef7d79691fe79573b1a7064c19c1a9819ebdbd1faaab1a8ec92344438aaf4",
        signature: "0x4355c47d63924e8a72e509b65029052eb6c299d53a04e167c5775fd466751c9d07299936d304c153f6443dfa05f40ff007d72911b6f72307f996231605b915621c"
    });

    saveTests("eip712", tests);
}
