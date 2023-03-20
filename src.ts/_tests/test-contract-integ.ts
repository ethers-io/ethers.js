import assert from "assert";


import { ethers } from "../index.js";

interface ContractAbi {
    mint: ethers.BaseContractMethod<[ ethers.AddressLike ], [ boolean ], ethers.ContractTransactionResponse>;
    totalSupply: ethers.BaseContractMethod<[ ], [ bigint ], [ bigint ]>;
    balanceOf: ethers.BaseContractMethod<[ ethers.AddressLike ], [ bigint ], [ bigint ]>;
}

describe("Tests contract integration", function() {
    const provider = new ethers.JsonRpcProvider("http:/\/127.0.0.1:8545");

    const abi = [
        "constructor(address owner, uint maxSupply)",
        "function mint(address target) returns (bool minted)",
        "function totalSupply() view returns (uint supply)",
        "function balanceOf(address target) view returns (uint balance)",
        "event Minted(address target)"
    ];

    let address: null | string = null;

    it("deploys a contract", async function() {
        this.timeout(10000);

        const bytecode = "0x60c060405234801561001057600080fd5b506040516105863803806105868339818101604052810190610032919061010e565b8173ffffffffffffffffffffffffffffffffffffffff1660808173ffffffffffffffffffffffffffffffffffffffff16815250508060a08181525050505061014e565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006100a58261007a565b9050919050565b6100b58161009a565b81146100c057600080fd5b50565b6000815190506100d2816100ac565b92915050565b6000819050919050565b6100eb816100d8565b81146100f657600080fd5b50565b600081519050610108816100e2565b92915050565b6000806040838503121561012557610124610075565b5b6000610133858286016100c3565b9250506020610144858286016100f9565b9150509250929050565b60805160a051610414610172600039600060fa0152600061021f01526104146000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c806318160ddd146100515780636a6278421461006f57806370a082311461009f5780638da5cb5b146100cf575b600080fd5b6100596100ed565b604051610066919061025c565b60405180910390f35b610089600480360381019061008491906102da565b6100f6565b6040516100969190610322565b60405180910390f35b6100b960048036038101906100b491906102da565b6101d2565b6040516100c6919061025c565b60405180910390f35b6100d761021b565b6040516100e4919061034c565b60405180910390f35b60008054905090565b60007f00000000000000000000000000000000000000000000000000000000000000006000541061012657600080fd5b600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600081548092919061017690610396565b919050555060008081548092919061018d90610396565b91905055507f90ddedd5a25821bba11fbb98de02ec1f75c1be90ae147d6450ce873e7b78b5d8826040516101c1919061034c565b60405180910390a160019050919050565b6000600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b60007f0000000000000000000000000000000000000000000000000000000000000000905090565b6000819050919050565b61025681610243565b82525050565b6000602082019050610271600083018461024d565b92915050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006102a78261027c565b9050919050565b6102b78161029c565b81146102c257600080fd5b50565b6000813590506102d4816102ae565b92915050565b6000602082840312156102f0576102ef610277565b5b60006102fe848285016102c5565b91505092915050565b60008115159050919050565b61031c81610307565b82525050565b60006020820190506103376000830184610313565b92915050565b6103468161029c565b82525050565b6000602082019050610361600083018461033d565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006103a182610243565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82036103d3576103d2610367565b5b60018201905091905056fea26469706673582212200a979ea2bfdf429b5546fa25906c9d20a3d67ef5fbe531f31d2cc83533e3239564736f6c63430008120033";
        const signer = await provider.getSigner(0);

        const factory = new ethers.ContractFactory(abi, bytecode, signer);

        const contract = await factory.deploy(signer, 100);
        address = await contract.getAddress();

        await contract.waitForDeployment();

        const deployed = await provider.getCode(address);
        assert.ok(deployed != "0x", "has bytescode");
    });

    it("runs contract operations", async function() {
        this.timeout(10000);

        assert.ok(address != null);

        const signer = await provider.getSigner(0);

        const CustomContract = ethers.BaseContract.buildClass<ContractAbi>(abi);

        const contract = new CustomContract(address, signer); //ethers.Contract.from<ContractAbi>(address, abi, signer);

        // Test implicit staticCall (i.e. view/pure)
        {
            const supply0 = await contract.totalSupply();
            assert.equal(supply0, BigInt(0), "initial supply 0; default");
        }

        // Test explicit staticCall
        {
            const supply0 = await contract.totalSupply.staticCall();
            assert.equal(supply0, BigInt(0), "initial supply 0; staticCall");
        }

        // Test staticCallResult (positional and named)
        {
            const supply0 = await contract.totalSupply.staticCallResult();
            assert.equal(supply0[0], BigInt(0), "initial supply 0; staticCallResult");
            assert.equal(supply0.supply, BigInt(0), "initial supply 0; staticCallResult");
        }

        // Test populateTransaction
        const txInfo = await contract.mint.populateTransaction(signer);
        assert.equal(txInfo.to, address, "populateTransaction.to");
        const txInfoData = ethers.hexlify(ethers.concat([
            "0x6a627842",
            ethers.zeroPadValue(await signer.getAddress(), 32)
        ]));
        assert.equal(txInfo.data, txInfoData, "populateTransaction.data");

        // Test minting (default)
        const tx = await contract.mint(signer);
        const receipt = await tx.wait();

        assert.ok(receipt, "receipt");

        // Check the receipt has parsed the events
        assert.equal(receipt.logs.length, 1, "logs.length");
        assert.ok(receipt instanceof ethers.ContractTransactionReceipt, "receipt typeof");
        assert.ok(receipt.logs[0] instanceof ethers.EventLog, "receipt.log typeof");
        assert.equal(receipt.logs[0].fragment && receipt.logs[0].fragment.name, "Minted", "logs[0].fragment.name");
        assert.equal(receipt.logs[0].args[0], await signer.getAddress(), "logs[0].args[0]");
        assert.equal(receipt.logs[0].args.target, await signer.getAddress(), "logs[0].args.target");

        // Check the state has been adjusted
        assert.equal(await contract.totalSupply(), BigInt(1), "initial supply 1; default");
        assert.equal(await contract.balanceOf(signer), BigInt(1), "balanceOf(signer)");

        // Test minting (explicit)
        const tx2 = await contract.mint.send(signer);
        await tx2.wait();

        // Check the state has been adjusted
        assert.equal(await contract.totalSupply(), BigInt(2), "initial supply 2; default");
    });
});
