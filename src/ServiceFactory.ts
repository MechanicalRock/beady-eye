import { Credentials, STS } from "aws-sdk";
import clonedeep = require("lodash.clonedeep")

export class ServiceFactory<T, U> implements IWithOptions<T, U>, IWithRoleChain<T, U> {
    private options?: U = undefined;

    constructor(private stsOptions: STS.ClientConfiguration, private service: Ctor<T, U>) {}

    public WithOptions(options: U): OmitWithOptions<T, U> {
        if (this.options !== undefined) {
            throw new Error("WithOptions has already been called");
        }
        this.options = options;
        return this as OmitWithOptions<T, U>;
    }

    public async WithRoleChain(...roleRequests: STS.AssumeRoleRequest[]): Promise<T> {
        const credentials = roleRequests.reduce((acc: Promise<Credentials>, r: STS.AssumeRoleRequest) => {
            return acc.then((cred) => {
                const tmpOptions = Object.assign(clonedeep(this.stsOptions), { cred });
                return this.assumeRole(new STS(tmpOptions), r);
            });
        }, Promise.resolve(this.stsOptions.credentials));

        const serviceOptions = Object.assign(clonedeep(this.options), { credentials });
        return new this.service(serviceOptions);
    }

    private async assumeRole(sts: STS, params: STS.AssumeRoleRequest) {
        const tmp = (await sts.assumeRole(params).promise()).Credentials;
        if (tmp === undefined) {
            throw new Error("Retrieved credentials are undefined");
        } else {
            const credentials = new Credentials({
                accessKeyId: tmp.AccessKeyId,
                secretAccessKey: tmp.SecretAccessKey,
                sessionToken: tmp.SessionToken,
            });
            return credentials;
        }
    }
}

interface IWithOptions<T, U> {
    WithOptions(options: U): OmitWithOptions<T, U>;
}

interface IWithRoleChain<T, U> {
    WithRoleChain(...roleRequests: STS.AssumeRoleRequest[]): Promise<T>;
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type OmitWithOptions<T, U> = Omit<ServiceFactory<T, U>, "WithOptions">;