
import { STS, Credentials } from 'aws-sdk'

export class IamRole {
    lazySTSClient: STS
    roleArn: string
    externalId?: string

    constructor(params: RoleParams) {
        this.externalId = params.externalId
        this.roleArn = roleArn(params)
    }

    async stsClient() {
        if (this.lazySTSClient) {
            return this.lazySTSClient
        } else {
            this.lazySTSClient = new STS()
            return this.lazySTSClient
        }
    }

    toString() {
        return roleName(this.roleArn);
    }

    getOptions(): STS.AssumeRoleRequest {
        let basicOptions = {
            RoleArn: this.roleArn,
            RoleSessionName: 'BDIComplianceTest',
            ExternalId: this.externalId
        }
        return basicOptions
    }

    async credentials(): Promise<Credentials> {
        let client = await this.stsClient()
        return client.assumeRole(this.getOptions()).promise().then(result => {
            if (!result.Credentials) {
                throw new Error('No credentials provided')
            }
            return new Credentials({
                accessKeyId: result.Credentials.AccessKeyId,
                secretAccessKey: result.Credentials.SecretAccessKey,
                sessionToken: result.Credentials.SessionToken,
            })
        })
    }
}

const role = (params: RoleParams): IamRole => {
    return new IamRole(params)
}


export const IAM = {
    role: role,
}

export const roleArn = (params: RoleParams): string => {
    if (params.roleArn) {
        return params.roleArn
    } else {
        return roleArnFromParts(params as RoleParamsWithParts)
    }
}

const roleArnFromParts = (params: RoleParamsWithParts): string => {
    let pathPrefix = params.path || 'role/'
    return `arn:aws:iam::${params.accountId}:${pathPrefix}${params.roleName}`

}

const roleName = (roleArn: string) => {
    return roleArn.split('/').pop()
}

interface ExternalIdParam {
    externalId?: string
}
interface RoleParamsWithArn {
    roleArn: string
}

interface RoleParamsWithParts {
    roleName: string,
    accountId: string,
    path?: string,
}

// @see https://gist.github.com/19majkel94/93dd0f13a3be3d8a6d8d620979637e1d
type Disjoint<T1, T2> =
    | ({ [P in keyof T2]?: never } & { [P in keyof T1]: T1[P] })
    | ({ [P in keyof T1]?: never } & { [P in keyof T2]: T2[P] });

export type RoleParams = Disjoint<RoleParamsWithParts, RoleParamsWithArn> & ExternalIdParam;