/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar
} from 'react-native';

import {
  Colors
} from 'react-native/Libraries/NewAppScreen';


// Inject the crypto shims (BEFORE the ethers shims)
import "react-native-get-random-values";

// Inject the missing features with the ethers shims
import "@ethersproject/shims";
//import "./libs/shims";

// Import ethers
import { ethers } from "ethers";
//import { ethers } from "./libs/ethers";

// Import the test framework
import "./libs/mocha.js";

// Setup up a testing context (injects primitives like `describe` and `it`)
mocha.setup({ ui: "bdd" });

setTimeout(async function() {

    // Mock location (Mocha checks this?)
    if (window.location == null) {
        window.location = {
            search: ""
        };
    }

    // Load the test cases
    const testing = await import("./libs/tests.js");

    // Serialize all writes to the logging server
    let inflight = Promise.resolve();
    testing.setLogFunc(function(message) {
        console.log(message);
        inflight = inflight.then(() => {
            return ethers.utils._fetchData("http:/\/localhost:8042/", ethers.utils.toUtf8Bytes(message)).then((result) => {
                return true;
            }, (error) => {
                return false;
            });
        });
    });

    mocha.reporter(testing.Reporter);

    //mocha.grep(new RegExp("Test nameprep")).run()
    mocha.run();
}, 1000);


const App: () => React$Node = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <View>
            <Text>Running Tests</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  body: {
    backgroundColor: Colors.white,
  },
});

export default App;
