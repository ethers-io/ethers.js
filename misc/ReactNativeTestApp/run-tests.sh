#!/bin/bash

cp ../../node_modules/mocha/mocha.js libs/mocha.js
cp ../../packages/tests/dist/tests.esm.js libs/tests.js

# Start our fake registry
node faux-registry/server.js &
REGISTRY=$!

# Install React (comment this out during debugging)
npm install --registry http://localhost:8043

# Shutdown our fake registry
kill $REGISTRY

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

# Shutdown the server
kill $SERVER

# Forward the status
exit $RESULT
