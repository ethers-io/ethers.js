
// See: https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
let disableColor = !(process.stdout.isTTY);

export function getProgressBar(action: string): (percent: number) => void {
    let lastProgress = -1;

    return function(percent: number): void {
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

        if (progress === lastProgress || lastProgress === 1) { return; }
        lastProgress = progress;

        (<any>(process.stdout)).clearLine();
        (<any>(process.stdout)).cursorTo(0);
        process.stdout.write(action + "... " + progress + "%");

        if (percent === 1) {
            process.stdout.write('\n');
        }
    }
}

const colorSequences: Record<string, string> = {
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    magenta: "\x1b[35m",
    red:   "\x1b[31m",
    yellow: "\x1b[33m",
    bold: ""
};

function getColor(color?: string): string {
    if (!color || color === "normal") { return "\x1b[0m"; }
    return "\x1b[1m" + colorSequences[color];
}

export type ColorifyFunc = (text: string) => string;

function _colorify(format: string): ColorifyFunc {
    return function (text: string): string {
        if (disableColor) { return text; }
        return getColor(format) + text.replace(/[^ -~]+/g, "") + getColor();
    }
}

export const colorify: { [ format: string ]: ColorifyFunc } = Object.freeze({
    bold: _colorify("bold"),

    blue: _colorify("blue"),
    green: _colorify("green"),
    red: _colorify("red"),
});
