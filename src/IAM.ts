
import {STS, Credentials} from 'aws-sdk'

export const roleArn = (params: RoleParams):string => {
    let pathPrefix = params.path || 'role/'
    return `arn:aws:iam::${params.accountId}:${pathPrefix}${params.roleName}`
}

interface RoleParams {
    roleName: string,
    accountId: string,
    path?: string,
    externalId?: string
}

export class IamRole {
    params;
    lazySTSClient:STS

    constructor(params: RoleParams){
        this.params = params
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
        return this.params.roleName
    }

    getOptions() : STS.AssumeRoleRequest {
        let basicOptions = {
            RoleArn : roleArn(this.params),
            RoleSessionName : 'BDIComplianceTest',
            ExternalId : this.params.externalId
        }        
        return basicOptions
    }
    
    async credentials(): Promise<Credentials> {
        let client = await this.stsClient()
        return client.assumeRole( this.getOptions() ).promise().then(result => {
            if(!result.Credentials){
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