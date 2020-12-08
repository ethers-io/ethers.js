/// <reference types="node" />
import AWS from 'aws-sdk';
export declare function getKeys(s3: AWS.S3, bucket: string): Promise<Record<string, string>>;
export declare function putObject(s3: AWS.S3, bucket: string, name: string, content: string | Buffer): Promise<unknown>;
