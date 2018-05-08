import { awsMockCallback, awsMockFailureCallback } from './support'
import AWSMock = require('aws-sdk-mock')
import { IAM } from '../src/IAM'
// import { STS } from 'aws-sdk'

describe("STS#Assume role fails without externalId",() => {
    afterEach(() => {
        AWSMock.restore('STS');
    })
    it("should fail to assume a role when the externalId is missing",async () => {
        try {
            AWSMock.mock('STS','assumeRole',awsMockFailureCallback('test-data/assumeRole-denied.json'))
            await IAM.role({roleName:'anyRole',accountId:'123456'}).credentials()
            fail("expected call to fail")            
        } catch (e) {            
            expect(e.code).toEqual('AccessDenied')            
        }
    })

    it("should succeed in assuming a role when the externalId is correct",async() => {
        AWSMock.mock('STS','assumeRole',awsMockCallback('test-data/assumeRole-granted.json'))
        try {
            let creds = IAM.role({roleName:'anyRole',accountId:'123456',externalId: 'testing'}).credentials()
            expect(creds).toBeDefined()
        } catch (e) {
            fail("unexpected failure of mock assume role with external Id")
        }
    })
})
