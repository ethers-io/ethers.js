const hethers = require("hethers");
const fs = require("fs");

let result = [];
for (let i = 0; i < 1024; i++) {
	let wallet = hethers.Wallet.createRandom();

	const accountString = "0.0." + (1000 + i);
	const accountObject = hethers.utils.parseAccount(accountString);
	const addressString = hethers.utils.getAddressFromAccount(accountObject);

	result.push({
		"address": addressString,
		"account": accountString,
		"alias": hethers.utils.computeAlias(wallet.privateKey),
		"checksumAddress": hethers.utils.getChecksumAddress(addressString),
		"icapAddress": hethers.utils.getIcapAddress(addressString),
		"index": i + 12,
		"name": "random-" + i,
		"privateKey": wallet.privateKey,
		"publicKey": wallet.publicKey
	})
}

let data = JSON.stringify(result, null, 2);

fs.writeFile("accounts-2.json", data, function (err) {
	if (err) {
		throw err;
	}
	console.log("Data written to file")
});