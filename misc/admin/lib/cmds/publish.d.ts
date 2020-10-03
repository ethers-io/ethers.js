/// <reference types="node" />
import AWS from 'aws-sdk';
declare type PutInfo = {
    ACL: "public-read";
    Body: string | Buffer;
    Bucket: string;
    ContentType: string;
    Key: string;
};
export declare function putObject(s3: AWS.S3, info: PutInfo): Promise<{
    name: string;
    hash: string;
}>;
export declare function invalidate(cloudfront: AWS.CloudFront, distributionId: string): Promise<string>;
export {};
