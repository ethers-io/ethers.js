"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPassword = exports.getPrompt = exports.colorify = exports.getProgressBar = void 0;
const utils_1 = require("./utils");
// See: https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
let disableColor = !(process.stdout.isTTY);
function getProgressBar(action) {
    let lastProgress = -1;
    return function (percent) {
        const progress = Math.trunc(percent * 100);
        if (disableColor) {
            if (lastProgress === -1) {
                console.log(action + "...");
            }
            lastProgress = progress;
            return;
        }
        process.stdin.setRawMode(false);
        process.stdin.pause();
        if (progress === lastProgress || lastProgress === 100) {
            return;
        }
        lastProgress = progress;
        (process.stdout).clearLine();
        (process.stdout).cursorTo(0);
        process.stdout.write(action + "... " + progress + "%");
        if (percent === 1) {
            process.stdout.write('\n');
        }
        return;
    };
}
exports.getProgressBar = getProgressBar;
const colorSequences = {
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    magenta: "\x1b[35m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    bold: "\x1b[97m"
};
function getColor(color) {
    if (!color || color === "normal") {
        return "\x1b[0m";
    }
    return "\x1b[1m" + colorSequences[color];
}
function _colorify(format) {
    return function (text) {
        if (disableColor) {
            return text;
        }
        return getColor(format) + text.replace(/[^ -~]+/g, "") + getColor();
    };
}
exports.colorify = Object.freeze({
    bold: _colorify("bold"),
    blue: _colorify("blue"),
    green: _colorify("green"),
    red: _colorify("red"),
});
function _getPrompt(prompt, options, callback) {
    process.stdout.write(prompt);
    let stdin = process.stdin;
    stdin.resume();
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    let message = '';
    let respond = (ctrlC, message) => {
        process.stdout.write('\n');
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener('data', handler);
        callback(ctrlC, message);
    };
    function handler(chr) {
        chr = String(chr);
        switch (chr) {
            // Enter (ish)
            case "\n":
            case "\r":
            case "\u0004":
                if (options.choice) {
                    if (options.defaultChoice) {
                        respond(null, options.defaultChoice);
                    }
                }
                else {
                    respond(null, message);
                }
                break;
            // Backspace
            case "\u007f":
                if (message.length > 0 && options.choice == null) {
                    message = message.substring(0, message.length - 1);
                    (process.stdout).clearLine();
                    (process.stdout).cursorTo(0);
                    if (options.mask) {
                        process.stdout.write(prompt + (0, utils_1.repeat)(options.mask, message.length));
                    }
                    else {
                        process.stdout.write(prompt + message);
                    }
                }
                break;
            // Ctrl-C
            case "\u0003":
                process.stdout.write('\n[ CTRL-C ]');
                respond(true, null);
                break;
            // Any other character
            default:
                if (options.choice) {
                    if (options.choice.indexOf(chr) >= 0) {
                        process.stdout.write(chr);
                        respond(null, chr);
                    }
                }
                else {
                    // More passsword characters
                    if (options.mask) {
                        process.stdout.write('*');
                    }
                    else {
                        process.stdout.write(chr);
                    }
                    message += chr;
                }
                break;
        }
    }
    stdin.on('data', handler);
}
function getPrompt(prompt, options) {
    return new Promise((resolve, reject) => {
        _getPrompt(prompt, (options || {}), (ctrlC, password) => {
            if (ctrlC) {
                return reject(new Error("cancelled"));
            }
            resolve(password);
        });
    });
}
exports.getPrompt = getPrompt;
function getPassword(prompt) {
    return getPrompt(prompt, { mask: "*" });
}
exports.getPassword = getPassword;
