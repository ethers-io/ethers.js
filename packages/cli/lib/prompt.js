/* istanbul ignore file */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChoice = exports.getMessage = exports.getPassword = exports.getProgressBar = void 0;
function repeat(chr, count) {
    var result = "";
    while (result.length < count) {
        result += chr;
    }
    return result;
}
function _getPrompt(prompt, options, callback) {
    process.stdout.write(prompt);
    var stdin = process.stdin;
    stdin.resume();
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    var message = '';
    var respond = function (ctrlC, message) {
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
                        process.stdout.write(prompt + repeat(options.mask, message.length));
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
                    // More password characters
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
    return new Promise(function (resolve, reject) {
        _getPrompt(prompt, options, function (ctrlC, password) {
            if (ctrlC) {
                return reject(new Error("cancelled"));
            }
            resolve(password);
        });
    });
}
function getProgressBar(action) {
    var lastProgress = -1;
    return function (percent) {
        var progress = Math.trunc(percent * 100);
        if (progress == lastProgress) {
            return;
        }
        lastProgress = progress;
        process.stdin.setRawMode(false);
        process.stdin.pause();
        (process.stdout).clearLine();
        (process.stdout).cursorTo(0);
        process.stdout.write(action + "... " + progress + "%");
        if (percent === 1) {
            process.stdout.write('\n');
        }
    };
}
exports.getProgressBar = getProgressBar;
function getPassword(prompt) {
    return getPrompt(prompt, { mask: "*" });
}
exports.getPassword = getPassword;
function getMessage(prompt) {
    return getPrompt(prompt, {});
}
exports.getMessage = getMessage;
// @TODO: Allow choices to be an array, [ "Yes", "No", "All" ] => "(y)es/ (N)o/ (a)ll"
function getChoice(prompt, choices, defaultChoice) {
    var choice = choices.toLowerCase().split("");
    if (defaultChoice) {
        defaultChoice = defaultChoice.toLowerCase();
    }
    var options = { choice: choice, defaultChoice: defaultChoice };
    var hint = choice.map(function (c) { return ((c === defaultChoice) ? c.toUpperCase() : c); }).join("/");
    return getPrompt((prompt + " (" + hint + ") "), options);
}
exports.getChoice = getChoice;
//# sourceMappingURL=prompt.js.map