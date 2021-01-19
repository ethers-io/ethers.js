export declare type PromptOptions = {
    choice?: Array<string>;
    defaultChoice?: string;
    mask?: string;
};
export declare function getProgressBar(action: string): (percent: number) => void;
export declare function getPassword(prompt: string): Promise<string>;
export declare function getMessage(prompt: string): Promise<string>;
export declare function getChoice(prompt: string, choices: string, defaultChoice?: string): Promise<string>;
//# sourceMappingURL=prompt.d.ts.map