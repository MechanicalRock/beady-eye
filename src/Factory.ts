import { STS } from "aws-sdk";
import { ServiceFactory } from "./ServiceFactory";

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

export type Ctor<T, U> = new (options: U) => T;

export class Factory implements IForService {
    constructor(private options: STS.ClientConfiguration) {}

    public ForService<T, U>(service: Ctor<T, U>) {
        return new ServiceFactory(this.options, service);
    }
}

interface IForService {
    ForService<T, U>(ctor: Ctor<T, U>);
}
