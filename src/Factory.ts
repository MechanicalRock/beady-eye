import  { Config, Credentials, STS, Service, S3, SimpleDB } from 'aws-sdk'
import clonedeep = require('lodash.clonedeep')

/*
Fluent factory system for instantiating AWS services using role-credential
pairs that require use of one or more STS hops.

Example Usage:
import { EnvironmentCredentials, S3, STS } from 'aws-sdk'

const base = new EnvironmentCredentials('AWS')

const myS3svc = new Factory({ credentials: base })
    .ForService<S3>()
    .WithOptions({
        Region: 'ap-southeast2'
    })
    .WithRoleChain({
        RoleArn: ''.
        RoleSessionName: '',
    }, {
        RoleArn: '',
        RoleSessionName: '',
    })
*/


export type Ctor<T, U> = new (options: U) => T

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export type OmitWithOptions<T, U> = Omit<ServiceFactory<T, U>, "WithOptions">

export class ServiceFactory<T,U> implements IWithOptions<T, U>, IWithRoleChain<T, U> {
    private options?: U = undefined

    constructor(private stsOptions: STS.ClientConfiguration, private service: Ctor<T,U>) {}

    WithOptions(options: U): OmitWithOptions<T,U> {
        if (this.options !== undefined) {
            throw new Error("WithOptions has already been called")
        }
        this.options = options 
        return this as OmitWithOptions<T,U>
    }

    async WithRoleChain(...roleRequests: Array<STS.AssumeRoleRequest>): Promise<T> {
        const credentials = roleRequests.reduce((acc: Promise<Credentials>, r: STS.AssumeRoleRequest) => {
            return acc.then(credentials => {
                const tmpOptions = Object.assign(clonedeep(this.stsOptions), { credentials })
                return this.assumeRole(new STS(tmpOptions), r)
            })
        }, Promise.resolve(this.stsOptions.credentials))

        const serviceOptions = Object.assign(clonedeep(this.options), { credentials })
        return new this.service(serviceOptions)
    }

    private async assumeRole (sts: STS, params: STS.AssumeRoleRequest) {
        const tmp = (await sts.assumeRole(params).promise()).Credentials
        if (tmp === undefined) {
            throw new Error("Retrieved credentials are undefined")
        } else {
            const credentials = new Credentials({
                accessKeyId: tmp.AccessKeyId,
                secretAccessKey: tmp.SecretAccessKey,
                sessionToken: tmp.SessionToken
            })
            return credentials
        }
    }
}

export class Factory implements IForService { 
    constructor(private options: STS.ClientConfiguration) {}

    ForService<T,U>(service: Ctor<T,U>) {
        return new ServiceFactory(this.options, service)
    }
}

interface IForService {
    ForService<T,U>(ctor: Ctor<T,U>)
}

interface IWithOptions<T, U> {
    WithOptions(options: U): OmitWithOptions<T, U>
}

interface IWithRoleChain<T,U> {
    WithRoleChain(...roleRequests: Array<STS.AssumeRoleRequest>): Promise<T>
}
