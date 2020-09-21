export declare function getProgressBar(action: string): (percent: number) => void;
export declare type ColorifyFunc = (text: string) => string;
export declare const colorify: {
    [format: string]: ColorifyFunc;
};
