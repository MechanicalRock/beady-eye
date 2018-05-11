import { roleArn, IAM } from '../src/IAM'

describe("IAM", ()=> {
    describe("#roleArn", ()=> {
        it('should construct a valid ARN', ()=> {
            expect(roleArn({accountId:'123456', roleName: 'myRole'})).toEqual('arn:aws:iam::123456:role/myRole')
        })
    })

    it('should create a string representation for the role', () => {
        let role = IAM.role({accountId: '1234567', roleName: 'myRole'})
        expect(role.toString()).toEqual('myRole')
    })

    it('should generate STS role parameters for simple STS assume role', () => {
        let role = IAM.role({accountId: '1234567', roleName: 'myRole'})
        let options = role.getOptions()
        expect(options.RoleArn).toEqual('arn:aws:iam::1234567:role/myRole')
        expect(options.RoleSessionName).toEqual('BDIComplianceTest')
        
    })

    it('should generate STS role parameters for externalId STS assume role',() => {
        let role = IAM.role({accountId: '1234567', roleName: 'myRole',externalId: 'clientId'})
        let options = role.getOptions()
        expect(options.ExternalId).toEqual('clientId')        
    })
})