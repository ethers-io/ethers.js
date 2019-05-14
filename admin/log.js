"use strict";

function getColor(color) {
    if (!color || color === "normal") { return "\x1b[0m"; }
    return "\x1b[1m" + ({
        blue: "\x1b[34m",
        cyan: "\x1b[36m",
        green: "\x1b[32m",
        magenta: "\x1b[35m",
        red:   "\x1b[31m",
        yellow: "\x1b[33m",
        bold: ""
    })[color];
}

// See: https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
let disableColor = !(process.stdout.isTTY);
function colorify(message, color) {
    if (color) {
        if (disableColor) { return message; }
        return getColor(color) + message + getColor();
    }

    return message.replace(/<([^:]*):((?:[^<>\\]|\\.)*)>/g, (all, color, message) => {
        message = message.replace("\\>", ">");
        if (disableColor) { return message; }
        return getColor(color) + message + getColor();
    });
}

function colorifyStatus(status) {
    switch (status) {
        case "modified":   return colorify("<blue:" + status + ">");
        case "added":      return colorify("<green:" + status + ">");
        case "deleted":    return colorify("<red:" + status + ">");
        case "unmodified": return colorify("<magenta:" + status + ">");
    }
    return status;
}

function log(message, color) {
    if (color) {
        console.log(colorify(message, color));
    } else {
        console.log(colorify(message));
    }
}

module.exports = {
    colorify: colorify,
    colorifyStatus: colorifyStatus,
    log: log
}
