import { Options } from "libnpmpublish";
import * as local from "./local";
export declare function getPackage(name: string, version?: string): Promise<local.Package>;
export declare function _publish(path: string, manifest: any, options: Options): Promise<void>;
export declare function getPublishOptions(): Promise<{
    publishNames: string[];
    publishPackages: Record<string, {
        name: string;
        gitHead: string;
        oldVersion: string;
        newVersion: string;
    }>;
}>;
declare type PublishScriptModes = 'manual' | 'auto';
export declare function publishAll(mode?: PublishScriptModes): Promise<void>;
export {};
