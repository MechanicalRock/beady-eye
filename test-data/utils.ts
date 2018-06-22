import fs = require('fs')
import { IAM } from '../src/IAM'


export const writeTo = (filename) => {
    return (result) => {
        fs.writeFileSync(`test-data/${filename}`, JSON.stringify(result,null,2))
    }
}

export const credentials = async (extraParams?) => {
    let roleName = process.env['AWS_ROLE_NAME'] || 'unknown'
    return credentialsForRole(roleName,extraParams)
}

export const credentialsForRole = async (roleName, extraParams?) => {
    let accountId: string = process.env['AWS_ACCOUNT_ID'] || 'unknown'
    let opts = {
        roleName: roleName,
        accountId: accountId,        
    }    
    return  await IAM.role({...opts,...extraParams}).credentials()

}