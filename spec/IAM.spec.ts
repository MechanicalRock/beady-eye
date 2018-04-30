import { roleArn } from '../src/IAM'

describe("IAM", ()=> {
    describe("#roleArn", ()=> {
        it('should construct a valid ARN', ()=> {
            expect(roleArn({accountId:'123456', roleName: 'myRole'})).toEqual('arn:aws:iam::123456:role/myRole')
        })
    })
})