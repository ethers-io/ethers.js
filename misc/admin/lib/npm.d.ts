import { Options } from "libnpmpublish";
import { Package } from "./local";
export declare function getPackage(name: string, version?: string): Promise<Package>;
export declare function publish(path: string, manifest: any, options: Options): Promise<void>;
