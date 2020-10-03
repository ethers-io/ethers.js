export declare function getProgressBar(action: string): (percent: number) => void;
export declare type ColorifyFunc = (text: string) => string;
export declare const colorify: {
    [format: string]: ColorifyFunc;
};
export declare type PromptOptions = {
    choice?: Array<string>;
    defaultChoice?: string;
    mask?: string;
};
export declare function getPrompt(prompt: string, options?: PromptOptions): Promise<string>;
export declare function getPassword(prompt: string): Promise<string>;
