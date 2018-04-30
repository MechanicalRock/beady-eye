
import {STS, Credentials} from 'aws-sdk'


let sts = new STS();

export const roleArn = (params: RoleParams):string => {
    let pathPrefix = params.path || 'role/'
    return `arn:aws:iam::${params.accountId}:${pathPrefix}${params.roleName}`
}

interface RoleParams {
    roleName: string,
    accountId: string,
    path?: string,
}

export class IamRole {
    params;

    constructor(params: RoleParams){
        this.params = params
    }

    toString() {
        return this.params.roleName
    }

    async credentials(): Promise<Credentials> {
        return sts.assumeRole({
            RoleArn: roleArn(this.params),
            RoleSessionName: 'BDIComplianceTest',        
        }).promise().then(result => {
            if(!result.Credentials){
                throw new Error('No credentials provided')
            }
            return new Credentials({
                accessKeyId: result.Credentials.AccessKeyId,
                secretAccessKey: result.Credentials.SecretAccessKey,
                sessionToken: result.Credentials.SessionToken,
            })
        });
    }
}

const role = (params: RoleParams): IamRole => {
    return new IamRole(params)
}

const roleOld = (params: RoleParams):Promise<Credentials> => {
    return sts.assumeRole({
        RoleArn: roleArn(params),
        RoleSessionName: 'BDIComplianceTest',        
    }).promise().then(result => {
        if(!result.Credentials){
            throw new Error('No credentials provided')
        }
        return new Credentials({
            accessKeyId: result.Credentials.AccessKeyId,
            secretAccessKey: result.Credentials.SecretAccessKey,
            sessionToken: result.Credentials.SessionToken,
        })
    });
}

export const IAM = {
    role: role,
}