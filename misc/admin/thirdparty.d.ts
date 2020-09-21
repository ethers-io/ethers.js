
declare module "tar" {
    export type CreateOptions = {
        sync?: boolean,
        cwd?: string,
        prefix?: string,
        gzip?: boolean,
        portable?: boolean,
        mtime?: Date
    };

    export interface Readable {
        read(): Buffer;
    }

    export function create(options: CreateOptions, files: Array<string>): Readable;
}
