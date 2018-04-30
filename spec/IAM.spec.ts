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
})