import { LambdaConnectionTester } from '../src/ConnectionTesters'
import { callbackSuccessReturning, callbackFailure } from './support'
import { lambdaResponseData } from './LambdaConnectionTester.stub'
var sinon = require('sinon')

var AWSMock = require('aws-sdk-mock')

describe("a connection testing example", ()=> {
    let lambdaConnectionTester = new LambdaConnectionTester('ConnectionTestFunctionName')
    let endpointAddress = {address : 'mythical.host', port: 31337}
    let withMockedConnectionResult = (result) => {

    }

    afterEach( () => {
        AWSMock.restore('Lambda')
    })

    it("should return true when the lambda connection tester returns true",async () => {
        AWSMock.mock('Lambda','invoke',callbackSuccessReturning(lambdaResponseData.successResult))
        let response = await lambdaConnectionTester.tryConnectionTo(endpointAddress)
        expect(response).toBe(true)
    })

    it("should return false when the lambda connection tester returns false",async () => {
        AWSMock.mock('Lambda','invoke',callbackSuccessReturning(lambdaResponseData.failureResult))
        let response = await lambdaConnectionTester.tryConnectionTo(endpointAddress)
        expect(response).toBe(false)
    })

    it("should throw an Error when the lambda connection tester failed or timed out",async () => {
        let msg = 'Lambda executionFailed'
        AWSMock.mock('Lambda','invoke',callbackFailure(msg))
        try {
            let response = await lambdaConnectionTester.tryConnectionTo(endpointAddress)
            fail("expected connection tester to fail")
        } catch(e) {
            expect(e.message).toBe(msg)
        }
    })

    it("should pass through parameters to the lambda as specified by the caller", async () => {
        // test that the payload is correct:
        // - endpoint
        // - invocation type
        // - function name
        const mock = sinon.spy(callbackSuccessReturning(lambdaResponseData.successResult));
        AWSMock.mock('Lambda','invoke',mock)
        const expectedParams = { 
            FunctionName: 'ConnectionTestFunctionName',
            InvocationType: 'RequestResponse',
            Payload: '{"endpointAddress":"mythical.host","endpointPort":31337,"connectionTimeout_ms":1234}'
        };
        await lambdaConnectionTester.tryConnectionTo(endpointAddress, 1234)
        expect(mock.calledOnce).toEqual(true);
        expect(mock.calledWith(expectedParams)).toEqual(true);
    })

    it("should pass through a defaulted timeout parameter if it is missing", async () => {
        // test that the payload is correct:
        // - endpoint
        // - invocation type
        // - function name
        const mock = sinon.spy(callbackSuccessReturning(lambdaResponseData.successResult));
        AWSMock.mock('Lambda','invoke',mock)
        const expectedParams = { 
            FunctionName: 'ConnectionTestFunctionName',
            InvocationType: 'RequestResponse',
            Payload: '{"endpointAddress":"mythical.host","endpointPort":31337,"connectionTimeout_ms":2000}'
        };
        await lambdaConnectionTester.tryConnectionTo(endpointAddress)
        expect(mock.calledOnce).toEqual(true);
        expect(mock.calledWith(expectedParams)).toEqual(true);
    })

    it("should return false if the called lambda handled an error", async () => {
        AWSMock.mock('Lambda','invoke',callbackSuccessReturning(lambdaResponseData.handledErrorResult))
        let response = await lambdaConnectionTester.tryConnectionTo(endpointAddress)
        expect(response).toBe(false)
    })

    it("should propogate unhandled errors from the lambda", async () => {
        AWSMock.mock('Lambda','invoke',callbackSuccessReturning(lambdaResponseData.unhandledErrorResult))
        
        let expectedError = new Error('NameError: bad things happened')
        let failureCall = lambdaConnectionTester.tryConnectionTo(endpointAddress)
        
        expect(failureCall).rejects.toThrow('NameError: bad things happened')
    })
})