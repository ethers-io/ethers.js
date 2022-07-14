import path from 'path';
import shell from 'shelljs';
import fs from 'fs';

describe('Hethers Tests', function () {
    this.timeout(240 * 1000); // 240 seconds

    after(function () {
        runLocalHederaNetwork(false);
    });

    describe("Executing test cases", async () => {
        runLocalHederaNetwork(true);
        fs.readdirSync(path.resolve(__dirname, '../lib'))
            .forEach(test => {
                if (test !== 'index.spec.js' && test.endsWith('.spec.js')) {
                    require(`./${test}`);
                }
            });
    });

    function runLocalHederaNetwork(start = true) {
        if (!start) {
            // stop local-node
            console.log('Shutdown local node');
            shell.exec('npx hedera-local stop');
            return;
        }

        // set env variables for docker images until local-node is updated
        process.env['NETWORK_NODE_IMAGE_TAG'] = '0.26.3';
        process.env['HAVEGED_IMAGE_TAG'] = '0.26.3';
        process.env['MIRROR_IMAGE_TAG'] = '0.59.0-rc1';
        console.log(`Docker container versions, services: ${process.env['NETWORK_NODE_IMAGE_TAG']}, mirror: ${process.env['MIRROR_IMAGE_TAG']}`);

        // start local-node
        console.log('Start local node');
        shell.exec('npx hedera-local restart');
        console.log('Hedera Hashgraph local node env started');
    }
});
