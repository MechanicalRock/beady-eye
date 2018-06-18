import { VPC } from '../../src/VPC'
import { callbackSuccessReturning, nvp } from '../support'
import { testVpc } from './VPC.stub'

var AWSMock = require('aws-sdk-mock')
var sinon = require('sinon')

describe("VPCObject#shouldHaveS3Endpoint function", () => {

    let vpc: VPC;

    let withMockedDescribeEndpointResult = (result) => {
        AWSMock.mock('EC2', 'describeVpcs', callbackSuccessReturning(testVpc.validVpcResult));
        AWSMock.mock('EC2', 'describeVpcEndpoints', callbackSuccessReturning(result));
    }

    beforeEach(() => { vpc = new VPC(testVpc.name, testVpc.region);} )

    afterEach(() => AWSMock.restore('EC2') )

    it("passes the vpc name to the AWS SDK", async () => {
        const mock = sinon.spy(callbackSuccessReturning(testVpc.validVpcEndpointResult));
        AWSMock.mock('EC2', 'describeVpcs', callbackSuccessReturning(testVpc.validVpcResult));
        AWSMock.mock('EC2', 'describeVpcEndpoints', mock);
        withMockedDescribeEndpointResult(testVpc.validVpcResult);
        const expectedParams = { Filters: [
            nvp('vpc-id', [ "12345" ]),
            nvp('service-name', ['com.amazonaws.eu-west-1.s3'])
            ]};
        await vpc.shouldHaveS3Endpoint();
        expect(mock.calledOnce).toEqual(true);
        expect(mock.calledWith(expectedParams)).toEqual(true);
    })

    it("returns true when an S3 endpoint exists on the VPC", async () => {
        withMockedDescribeEndpointResult(testVpc.validVpcEndpointResult);
        expect(await vpc.shouldHaveS3Endpoint()).toEqual(true);
    })

    it("returns false when no S3 endpoint exists on the VPC", async () => {
        withMockedDescribeEndpointResult(testVpc.emptyVpcEndpointResult);
        expect(await vpc.shouldHaveS3Endpoint()).toEqual(false);
    })

    it("returns false when receiving an undefined response from AWS", async () => {
        withMockedDescribeEndpointResult(undefined);
        expect(await vpc.shouldHaveS3Endpoint()).toEqual(false);
    })

})