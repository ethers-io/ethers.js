module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "node": true
    },
    "extends": [
//        "eslint:recommended",
//        "plugin:promise/recommended"
    ],
    "parserOptions": {
        "ecmaVersion": 5
    },
    "plugins": [
        "promise"
    ],
    "rules": {
        "promise/always-return": "error",
        "promise/no-return-wrap": "error",
        "promise/param-names": "error",
        "promise/catch-or-return": "error",
        "promise/no-native": "off",
//        "promise/no-nesting": "warn",
        "promise/no-promise-in-callback": "warn",
        "promise/no-callback-in-promise": "warn",
//        "promise/avoid-new": "warn",
        "promise/no-new-statics": "error",
        "promise/no-return-in-finally": "warn",
        "promise/valid-params": "warn"
    }
};
