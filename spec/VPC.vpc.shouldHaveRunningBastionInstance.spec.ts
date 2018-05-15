import { VPC } from '../src/VPC'
import { callbackSuccessReturning, nvp } from './support'
import { testVpc } from './VPC.stub'
var AWSMock = require('aws-sdk-mock')
var sinon = require('sinon')

describe("VPCObject#shouldHaveRunningBastionInstance function", () =>{

    let vpc: VPC;
    let testMethod;

    let withMockedDescribeEndpointResult = (result) => {
        AWSMock.mock('EC2', 'describeVpcs', callbackSuccessReturning(testVpc.validVpcResult));
        AWSMock.mock('EC2', 'describeInstances', callbackSuccessReturning(result));
    }

    beforeEach(() => { vpc = new VPC(testVpc.name, testVpc.region); })

    afterEach(() => AWSMock.restore('EC2') )

    it("passes the vpc name to the AWS SDK", async () => {
        const mock = sinon.spy(callbackSuccessReturning(testVpc.validEC2EndpointResult));
        AWSMock.mock('EC2', 'describeVpcs', callbackSuccessReturning(testVpc.validVpcResult));
        AWSMock.mock('EC2', 'describeInstances', mock);
        withMockedDescribeEndpointResult(testVpc.validVpcResult);
        const expectedParams = { Filters: [
            nvp('vpc-id', [ "12345" ]),
            nvp('tag:Name', ['*bastion*'])
            ]};
        await vpc.shouldHaveRunningBastionInstance();
        expect(mock.calledOnce).toEqual(true);
        expect(mock.calledWith(expectedParams)).toEqual(true);
    })

    it("returns true when a bastion instance exists in the VPC", async () => {
        withMockedDescribeEndpointResult(testVpc.validEC2EndpointResult);
        expect(await vpc.shouldHaveRunningBastionInstance()).toEqual(true);
    })

    it("returns false when no bastion instance exists in the VPC", async () => {
        withMockedDescribeEndpointResult(testVpc.emptyEC2EndpointResult);
        expect(await vpc.shouldHaveRunningBastionInstance()).toEqual(false);
    })

    it("returns false when receiving an undefined response from AWS", async () => {
        withMockedDescribeEndpointResult(undefined);
        expect(await vpc.shouldHaveRunningBastionInstance()).toEqual(false);
    })

})