#!/bin/bash

cp ../../packages/ethers/dist/ethers-all.umd.min.js libs/ethers.js
cp ../../node_modules/mocha/mocha.js libs/mocha.js
cp ../../packages/tests/dist/tests.umd.js libs/tests.js
cp ../../packages/shims/dist/index.js libs/shims.js

# Install React (comment this out during debugging)
npm install

# Link any native modules
npx react-native link

pushd ios
pod install
popd

# Start the webserver
npx react-native start --no-interactive > webserver.log &
SERVER=$!

# Put the watcher in the background so it is ready for the Reporter
node watcher.js &
WATCHER=$!

# Run the test application
npx react-native run-ios

# Wait until the Watcher completes (exits with the Reporter status)
wait $WATCHER
RESULT=$?

# Kill the server
kill $SERVER

# Forward the status
exit $RESULT
