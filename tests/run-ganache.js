if (global.ethers) {
    console.log('Using global ethers; ' + __filename);
    var ethers = global.ethers;
} else {
    var ethers = require('..');
}

// For getting revert-reasons, install ganache-cli 6.1.4 or higher
var GanacheCLI = require("ganache-cli");
var provider;
var wallet;


var account = {
    privateKey: '0x7ab741b57e8d94dd7e1a29055646bafde7010f38a900f55bbd7647880faa6ee8',
    publicKey: '0xd9995bae12fee327256ffec1e3184d492bd94c31',
}
var defaultBalance = "999999999999999999999999999999999999";

var server = GanacheCLI.server({
    accounts: [
        { 
            secretKey: account.privateKey,
            balance: defaultBalance
        }
    ]
});


function run(){
    var port = 18545;
    server.listen(port);

    // Ganache version 6.1.4 listens to http://127.0.0.1:8545
    provider = new ethers.providers.JsonRpcProvider(`http://127.0.0.1:${port}`);
    wallet = new ethers.Wallet(account.privateKey, provider);

    return {
        wallet,
        provider
    }
};

function stop(){
    server.close();
}

module.exports = { run, stop }