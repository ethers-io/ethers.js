'use strict';

import assert from "assert";

import { ethers } from "ethers";
import { GsnSigner, GsnApproveParams, _gsnInternal } from "@ethersproject/experimental";

const TIMEOUT_PERIOD = 300000;
const relayHubAddress = '0xD216153c06E857cD7f72665E0aF1d7D82172F494';

const network = 'rinkeby';
const provider = new ethers.providers.InfuraProvider(network);
const wallet = ethers.Wallet.createRandom().connect(provider);


// source of these contracts is at https://github.com/yuetloo/gsn-example
// these contracts are gsn-enabled test contract
const contractList = {
    "rinkeby": "0x7d6bea40FD170B2cF3caA101f908545E4991a3a8"
}
const contractAddress = contractList[network];

const abi = [ "function value() public view returns(uint)",
              "function setValue(uint256 val) public payable",
              "function nonExistent(uint256 val) public" ];


describe(`Test read and set value using gsn signer for account ${wallet.address}`, function() {
    it('should pass', async function() {
        this.timeout(TIMEOUT_PERIOD);
        const signer = new GsnSigner(wallet);
        const contract = new ethers.Contract(contractAddress, abi, signer);
        const value = '12345678901234';
        const tx = await contract.setValue(value);
        const { from, to, nonce } : { from: string, to: string, nonce: number } = tx.relayedTransaction;
        assert.equal(from, wallet.address, "incorrect relayed transaction signer");
        assert.equal(nonce, 0, "nonce should be zero");
        assert.equal(to, contractList[network], "incorrect contract address");

        await tx.wait();
        const newValue = await contract.value();
        assert.equal(newValue, value, 'value should equal new value');
    });
});


describe('Test preferredRelayer option', function() {
    it('should use the preferred relayer if it is active', async function() {
        this.timeout(TIMEOUT_PERIOD);

        // use a relayer from a network that is different from the provider's network
        const preferredRelayers = [{
            url: 'https://rinkeby-02.gsn.openzeppelin.org',
            owner: '0xd97709745693EAC4bb09B20EE1cF8A78DCA53Be5',
            relayFee: ethers.BigNumber.from('0x0f').toNumber(),
            unstakeDelay: ethers.BigNumber.from('0x0f43fc2c04ee0000'),
            stake: ethers.BigNumber.from('0x127500')
        },
        ];

        const gasPrice = ethers.BigNumber.from(3000000000);
        const pinger = new _gsnInternal.GsnRelayPinger(preferredRelayers, { gasPrice });
        const relayer = await pinger.nextRelayer();

        assert.equal( relayer.url, preferredRelayers[0].url);
    });

    it('should fallback to other relayers if preferred relayers failed', async function() {
        this.timeout(TIMEOUT_PERIOD);

        // use invalid relayers
        const preferredRelayers = [
        { address: '0x8C729aDDA5A1077F6Fdd0A852bFd392212678B16',
            owner: '0x3431c5139Bb6F5ba16E4d55EF2420ba8E0E127F6',
         relayFee: 70,
              url: 'https://goerli-relay2.burnerfactory.com'
        },
        { address: '0x8C729aDDA5A1077F6Fdd0A852bFd392212678B16',
            owner: '0x3431c5139Bb6F5ba16E4d55EF2420ba8E0E127F6',
         relayFee: 70,
              url: 'https://goerli-relay3.burnerfactory.com'
        }
        ];
       /*
        const preferredRelayers = [
          { address: '0x8C729aDDA5A1077F6Fdd0A852bFd392212678B16',
            owner: '0x3431c5139Bb6F5ba16E4d55EF2420ba8E0E127F6',
            relayFee: 70,
            url: 'https://rinkeby-05.gsn.openzeppelin.org',
          },
          { address: '0x8C729aDDA5A1077F6Fdd0A852bFd392212678B16',
            owner: '0x3431c5139Bb6F5ba16E4d55EF2420ba8E0E127F6',
            relayFee: 70,
            url: 'https://rinkeby-04.gsn.openzeppelin.org',
          }
        ];
       */

        const signer = new GsnSigner(wallet, { preferredRelayers } );
        const contract = new ethers.Contract(contractAddress, abi, signer);
        const value = '90000000000004';
        const tx = await contract.setValue(value);
        await tx.wait();
        const newValue = await contract.value();
        assert.equal(newValue, value, 'value should equal new value');
    });
});

describe('Test sorting with multiple relayers', function() {
    it('should order relayers in order of lowest relayFee, skipping unavailble relayers', async function() {
        this.timeout(TIMEOUT_PERIOD);

        // do this test on mainnet as mainnet has multiple valid relayers
        const productionProvider = new ethers.providers.InfuraProvider();

        // start from a very old block to pick up the relayer https://gsn-main1.openeth.dev
        // which has a false Ready status.  However, there should be 2 other valid relayers
        // for this test to pass
        const currentBlock = await productionProvider.getBlockNumber();
        const fromBlock = currentBlock - 4969406;
        const relayHub = new _gsnInternal.GsnRelayHub(productionProvider, relayHubAddress);

        const gasPrice = ethers.BigNumber.from(50000000000);
        const activeRelayers = await relayHub.fetchRelayers(fromBlock);
        const signer = new GsnSigner(wallet);
        const filtered = signer.filterAndSortRelayers(activeRelayers);

        let lastRelayer: _gsnInternal.GsnRelayer;
        filtered.forEach(relayer => {
            if( lastRelayer ) {
                assert.ok(lastRelayer.score >= relayer.score,
                   'last score ' + lastRelayer.score  + ' current score ' + relayer.score);
                assert.ok(lastRelayer.relayFee <= relayer.relayFee,
                   'last fee ' + lastRelayer.relayFee + ' current fee ' + relayer.relayFee);
            }
            lastRelayer = relayer;
        });

        let relayer;
        const pinger = new _gsnInternal.GsnRelayPinger(filtered, { gasPrice });
        while(relayer = await pinger.nextRelayer()){
            assert.ok(relayer.score, 'missing score');
        }
    });
});

describe(`Test GsnSigner with approvalFunction for account ${wallet.address}`, function() {

    it('should pass with valid approveData', async function() {
        this.timeout(TIMEOUT_PERIOD);
        const asyncApprovalData = async function (relayRequest: GsnApproveParams) {
          return Promise.resolve('0x123456')
        }
        const signer = new GsnSigner(wallet, { approveFunction: asyncApprovalData });
        const contract = new ethers.Contract(contractAddress, abi, signer);
        const value = '2424245566778899';
        const tx = await contract.setValue(value);
        await tx.wait();
        const newValue = await contract.value();
        assert.equal(newValue, value, `value ${value} should equal new value ${newValue}`);
    });

    it('should pass with invalid approveData', async function() {
        this.timeout(TIMEOUT_PERIOD);
        const asyncApprovalData = async function (relayRequest: GsnApproveParams) {
          return Promise.resolve('0x12345678')
        }
        const signer = new GsnSigner(wallet, { approveFunction: asyncApprovalData });
        const contract = new ethers.Contract(contractAddress, abi, signer);
        const value = '3556677889009999';
        let result = null;

        try {
            result = await contract.setValue(value);
        } catch( err ) {
            assert.ok(err, 'expect error');
        }

        if( result !== null ) {
            assert.fail('should fail but succeeded unexpectedly');
        }
    });

    it('should get non-zero receipt status if call was rejected', async function() {
        this.timeout(TIMEOUT_PERIOD);
        const signer = new GsnSigner(wallet);
        const contract = new ethers.Contract(contractAddress, abi, signer);
        const value = '3556677889009999';
        let result = null;
        try {
            const tx = await contract.nonExistent(value, {gasLimit: 300000});
            result = await tx.wait();
        } catch( err ) {
            console.log('throw error', err);
            assert.ok(err, 'expect error');
        }

        if( result !== null ) {
            assert.fail('should fail but succeeded unexpectedly');
        }
    });
});

describe(`Test estimateGas`, function() {
    it('should pass if estimating a transaction for a gsn enabled contract', async function() {
        this.timeout(TIMEOUT_PERIOD);
        const signer = new GsnSigner(wallet);
        const tx = {
           to: contractAddress,
           data: "0x55241077000000000000000000000000000000000000000000000000000ca2c79a27a94f"
        }
        const gasLimit = await signer.estimateGas(tx);
        assert.ok(gasLimit.gt(0), "gas limit should be greater than 0");
    });

    it('should fail if estimating for a non-contract transaction', async function() {
        this.timeout(TIMEOUT_PERIOD);

        const signer = new GsnSigner(wallet);
        const tx = {
           to: "0xdC962cEAb6C926E3a9B133c46c7258c0E371b82b",
           value: "0.1"
        }

        let gasLimit = null;
        try {
            gasLimit = await signer.estimateGas(tx);
        }
        catch ( error )
        {
            assert.equal( error.code, 'INVALID_ARGUMENT', 'expect invalid argument error');
            assert.equal( error.argument, 'transaction.data', 'expect argument is transaction data');

            assert.ok(error, `expecting error ${JSON.stringify(error)}`);
        }

        if( gasLimit !== null ) {
            assert.fail(`Unexpectedly got gas estimation of value ${gasLimit.toString()} for non-contract transaction `);
        }
    });

    it('should fail if estimating for a non-gsn enabled contract transaction', async function() {
        this.timeout(TIMEOUT_PERIOD);

        const signer = new GsnSigner(wallet);
        const tx = {
           to: relayHubAddress,
           data: '0xab12'
        }

        let gasLimit = null;
        try {
            gasLimit = await signer.estimateGas(tx);
        }
        catch ( error )
        {
            assert.equal(error.reason, 'contract does not support GSN', `expecting error ${JSON.stringify(error)}`);
        }


        if( gasLimit !== null ) {
            assert.fail(`Unexpectedly got gas estimation of value ${gasLimit.toString()} for non-contract transaction `);
        }
    });
});

describe('Test user defined gasPrice', function() {
    it('should use the gasPrice value as the transaction gas price', async function() {
        this.timeout(TIMEOUT_PERIOD);
        const gasPrice = 3230000001;
        const signer = new GsnSigner(wallet);
        const contract = new ethers.Contract(contractAddress, abi, signer);
        const value = '77775523';
        const tx = await contract.setValue(value, { gasPrice });
        assert.equal(tx.gasPrice, gasPrice, `tx.gasPrice ${tx.gasPrice} should equal gasPrice ${gasPrice}`);
    });

    it('should reject if user supplied gasPrice is lower than the minGasPrice required by relayer', async function() {
        this.timeout(TIMEOUT_PERIOD);
        const gasPrice = 200002;
        const signer = new GsnSigner(wallet);
        const contract = new ethers.Contract(contractAddress, abi, signer);
        const value = '77775522';
        let tx = null;
        try {
           tx = await contract.setValue(value, { gasPrice });
        } catch (error) {
           assert.ok(error, "should get error due to gas price too low");
        }

        if( tx !== null ) {
           assert.fail(`expect tx ${tx.hash} to fail due to gas price too low`);
        }
    });
});

describe(`Test calculateScore option`, function() {
    it('should pass if a custom logic is used', async function() {
        this.timeout(TIMEOUT_PERIOD);

        // pass a dummy list of relayers
        const activeRelayers = [
            { url: 'https://mainnet-02.gsn.openzeppelin.org' },
            { url: 'https://gsn.multis.co' },
            { url: 'https://mainnet-03.gsn.openzeppelin.org' }
        ];

        // score the relayers by the length of their url
        const calculateScoreFunc = (r: _gsnInternal.GsnRelayer) => r.url.length;
        const signer = new GsnSigner(wallet, { calculateScoreFunc });

        const filtered = signer.filterAndSortRelayers(activeRelayers);

        let lastRelayer: _gsnInternal.GsnRelayer;
        filtered.forEach(relayer => {
            if( lastRelayer ) {
                assert.ok(lastRelayer.score >= relayer.score,
                   'last score ' + lastRelayer.score  + ' current score ' + relayer.score);
                assert.ok(lastRelayer.url.length >= relayer.url.length,
                   'last url ' + lastRelayer.url.length + ' current url ' + relayer.url);
            }
            lastRelayer = relayer;
        });

        assert.equal(filtered.length, activeRelayers.length, "filtered and active relayers should have the same length");
    });
});

describe(`Test default score calculation`, function() {
    it('should correctly adjust failed relayers scores', async function() {
        this.timeout(TIMEOUT_PERIOD);

        const preferredRelayers = [
        {
          address: '0x8C729aDDA5A1077F6Fdd0A852bFd392212678B16',
            owner: '0x3431c5139Bb6F5ba16E4d55EF2420ba8E0E127F6',
         relayFee: 70,
              url: 'https://goerli-relay2.burnerfactory.com'
        }
        ];

        const signer = new GsnSigner(wallet, { preferredRelayers });

        // calling a contract function will trigger signer to record the bad relayer specified as preferred
        const contract = new ethers.Contract(contractAddress, abi, signer);
        await contract.setValue('22223334');

        // pass a dummy list of relayers
        const activeRelayers = [
            { url: 'https://goerli-relay2.burnerfactory.com', relayFee: 75 },
            { url: 'https://gsn.multis.co', relayFee: 80 }
        ];
        const filtered = signer.filterAndSortRelayers(activeRelayers);

        assert.equal(filtered[0].url, "https://gsn.multis.co", "expect https://gsn.multis.co to be first");
        assert.equal(filtered[1].url, "https://goerli-relay2.burnerfactory.com", "expect goerli relay to be second");
    });
});

describe(`Test relayFilter option`, function() {
    describe('default relayFilter', function() {
        it('should filter out relayers without score if minStake or minDelay options are not used', async function() {
            this.timeout(TIMEOUT_PERIOD);

            const calculateScoreFunc = (r: _gsnInternal.GsnRelayer) => (r.relayFee > 75? 1: null);
            const signer = new GsnSigner(wallet, { calculateScoreFunc });

            // pass a dummy list of relayers
            const activeRelayers = [
                { url: 'https://goerli-relay.burnerfactory.com', relayFee: 75 },
                { url: 'https://gsn.multis.co', relayFee: 80 }
            ];
            const filtered = signer.filterAndSortRelayers(activeRelayers);

            assert.equal(filtered.length, 1, "expect filtered list to contain 1 item only");
            assert.equal(filtered[0].url, "https://gsn.multis.co", "expect https://gsn.multis.co in the list only");
        });

        it('should filter out relayers with score but unstakeDelay is less than  minDelay', async function() {
            this.timeout(TIMEOUT_PERIOD);

            const signer = new GsnSigner(wallet, { minDelay: 10 });

            // pass a dummy list of relayers
            const activeRelayers = [
                { url: 'https://goerli-relay.burnerfactory.com', relayFee: 75, unstakeDelay: ethers.BigNumber.from(9) },
                { url: 'https://gsn.multis.co', relayFee: 80, unstakeDelay: ethers.BigNumber.from(20) }
            ];
            const filtered = signer.filterAndSortRelayers(activeRelayers);

            assert.equal(filtered.length, 1, "expect filtered list to contain 1 item only");
            assert.equal(filtered[0].url, "https://gsn.multis.co", "expect https://gsn.multis.co in the list only");
        });

        it('should filter out relayers with score but stake is less than minStake', async function() {
            this.timeout(TIMEOUT_PERIOD);

            const signer = new GsnSigner(wallet, { minStake: 10 });

            // pass a dummy list of relayers
            const activeRelayers = [
                { url: 'https://goerli-relay.burnerfactory.com', relayFee: 75, stake: ethers.BigNumber.from(20) },
                { url: 'https://gsn.multis.co', relayFee: 80, stake: ethers.BigNumber.from(5) }
            ];
            const filtered = signer.filterAndSortRelayers(activeRelayers);

            assert.equal(filtered.length, 1, "expect filtered list to contain 1 item only");
            assert.equal(filtered[0].url, "https://goerli-relay.burnerfactory.com", "expect https://goerli-relay.burnerfactory.com in the list only");
        });
    });

    describe('custom relayFilter', function() {
        it('should filter based on custom logic regardless of score', async function() {
            this.timeout(TIMEOUT_PERIOD);

            const relayFilter = ( r: _gsnInternal.GsnRelayer ) => r.url === "https://gsn.multis.co";
            const signer = new GsnSigner(wallet, { relayFilter });

            // pass a dummy list of relayers
            const activeRelayers = [
                { url: 'https://goerli-relay.burnerfactory.com', relayFee: 75 },
                { url: 'https://gsn.multis.co', relayFee: 80 }
            ];
            const filtered = signer.filterAndSortRelayers(activeRelayers);

            assert.equal(filtered.length, 1, "expect filtered list to contain 1 item only");
            assert.equal(filtered[0].url, "https://gsn.multis.co", "expect https://gsn.multis.co in the list only");
        });
    });
});

describe(`Test send ether`, function() {
    describe("to externally owned account", function() {
        it('should give error', async function() {
            this.timeout(TIMEOUT_PERIOD);
            const signer = new GsnSigner(wallet);
            const recipient = ethers.Wallet.createRandom();
            let tx = null;

            try {
                tx = await signer.sendTransaction({ to: recipient.address, value: '0.005'});
            } catch (error) {
                assert.equal(error.code, 'INVALID_ARGUMENT', 'expect error from sending ether');
            }

            if (tx !== null) {
                assert.fail('should not be able to send ether');
            }
        });
    });

    describe("to contract", function() {
        it('should give error if recipient is non-gsn enabled contract', async function() {
            this.timeout(TIMEOUT_PERIOD);
            const signer = new GsnSigner(wallet);
            let tx = null;

            try {
                tx = await signer.sendTransaction({ to: relayHubAddress, value: '0.005'});
            } catch (error) {
                assert.equal(error.code, 'INVALID_ARGUMENT', 'expect error from sending ether');
            }

            if (tx !== null) {
                assert.fail('should not be able to send ether to non-gsn enabled contract');
            }
        });

        it('should give error if recipient is gsn-enabled contract', async function() {
            this.timeout(TIMEOUT_PERIOD);
            const signer = new GsnSigner(wallet);
            let tx = null;

            try {
                tx = await signer.sendTransaction({ to: contractAddress, value: '0.005'});
            } catch (error) {
                assert.equal(error.code, 'INVALID_ARGUMENT', 'expect error from sending ether');
            }

            if (tx !== null) {
                assert.fail('should not be able to send ether');
            }
        });

    });
});

describe("Test set value and send ether to gsn enabled contract", function() {
    it('should give error', async function() {
        this.timeout(TIMEOUT_PERIOD);
        const signer = new GsnSigner(wallet);
        const contract = new ethers.Contract(contractAddress, abi, signer);
        const value = '9314';
        let result = null;
        try {
            result = await contract.setValue(value, { value: '1234' });
        } catch (error) {
            assert.equal(error.code, 'INVALID_ARGUMENT', 'expect invalid argument error');
        }

        if( result !== null ) {
            assert.fail('expect error sending ether to gsn enabled contract');
        }
    });
});

describe("Test resolveName", function() {
    it('should pass', async function() {
        this.timeout(TIMEOUT_PERIOD);
        const signer = new GsnSigner(wallet);
        const address = await signer.resolveName("ricmoo.eth");
        assert.ok(ethers.utils.isAddress(address), "should be a valid address");
    });
});

describe(`Test call()`, function() {
    it('should pass', async function() {
        this.timeout(TIMEOUT_PERIOD);
        const signer = new GsnSigner(wallet);
        const tx = { data: "0x54fd4d50", to: relayHubAddress };  // get relayHub's version

        const result = await signer.call(tx);
        const expected = "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000005312e302e30000000000000000000000000000000000000000000000000000000";

        assert.equal(result, expected, "result should be the version encoded hex string");
    });
});
