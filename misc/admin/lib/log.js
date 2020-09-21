"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        //process.stdin.setRawMode(false);
        //process.stdin.pause();
        if (progress === lastProgress || lastProgress === 1) {
            return;
        }
        lastProgress = progress;
        (process.stdout).clearLine();
        (process.stdout).cursorTo(0);
        process.stdout.write(action + "... " + progress + "%");
        if (percent === 1) {
            process.stdout.write('\n');
        }
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
    bold: ""
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
