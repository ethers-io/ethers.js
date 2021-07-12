/* istanbul ignore file */

"use strict";

export type PromptOptions = {
    choice?: Array<string>;
    defaultChoice?: string;
    mask?: string;
};

function repeat(chr: string, count: number): string {
    let result = "";
    while (result.length < count) { result += chr; }
    return result;
}

function _getPrompt(prompt: string, options: PromptOptions, callback: (ctrlC: boolean, message: string) => void) {
    process.stdout.write(prompt);

    let stdin = process.stdin;
    stdin.resume();
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    let message = '';

    let respond = (ctrlC: boolean, message: string) => {
        process.stdout.write('\n');
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener('data', handler);
        callback(ctrlC, message);
    }

    function handler(chr: string): void {
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
                } else {
                    respond(null, message);
                }
                break;

            // Backspace
            case "\u007f":
                if (message.length > 0 && options.choice == null) {
                    message = message.substring(0, message.length - 1);
                    (<any>(process.stdout)).clearLine();
                    (<any>(process.stdout)).cursorTo(0);
                    if (options.mask) {
                        process.stdout.write(prompt + repeat(options.mask, message.length));
                    } else {
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
                } else {
                    // More password characters
                    if (options.mask) {
                        process.stdout.write('*');
                    } else {
                        process.stdout.write(chr);
                    }
                    message += chr;
                }
                break;
        }
    }
    stdin.on('data', handler);
}

function getPrompt(prompt: string, options: PromptOptions): Promise<string> {
    return new Promise((resolve, reject) => {
        _getPrompt(prompt, options, (ctrlC, password) => {
             if (ctrlC) {
                 return reject(new Error("cancelled"));
             }
             resolve(password);
        });
    });
}


export function getProgressBar(action: string): (percent: number) => void {
    let lastProgress = -1;
    return function(percent: number): void {
        let progress = Math.trunc(percent * 100);
        if (progress == lastProgress) { return; }
        lastProgress = progress;

        process.stdin.setRawMode(false);
        process.stdin.pause();

        (<any>(process.stdout)).clearLine();
        (<any>(process.stdout)).cursorTo(0);
        process.stdout.write(action + "... " + progress + "%");

        if (percent === 1) {
            process.stdout.write('\n');
        }
    }
}

export function getPassword(prompt: string): Promise<string> {
    return getPrompt(prompt, { mask: "*" });
}

export function getMessage(prompt: string): Promise<string> {
    return getPrompt(prompt, { });
}


// @TODO: Allow choices to be an array, [ "Yes", "No", "All" ] => "(y)es/ (N)o/ (a)ll"
export function getChoice(prompt: string, choices: string, defaultChoice?: string): Promise<string> {
    let choice = choices.toLowerCase().split("");
    if (defaultChoice) {
        defaultChoice = defaultChoice.toLowerCase();
    }
    let options = { choice: choice, defaultChoice: defaultChoice }
    let hint = choice.map((c) => ((c === defaultChoice) ? c.toUpperCase(): c)).join("/");
    return getPrompt((prompt + " (" + hint + ") "), options);
}
