import { VPC } from '../src/VPC'
import { callbackSuccessReturning, nvp } from './support'
import { testVpc } from './VPC.stub'
var AWSMock = require('aws-sdk-mock')
var sinon = require('sinon')

describe("VPCObject#shouldExist function", () =>{
    let vpc: VPC;

    let withMockedDescribeEndpointResult = (result) =>
        {return AWSMock.mock('EC2', 'describeVpcs', callbackSuccessReturning(result));}

    beforeEach(() => { vpc = new VPC(testVpc.name, undefined, testVpc.region);} )

    afterEach(() => AWSMock.restore('EC2') )

    it("passes the vpc name to the AWS SDK", async () => {
        const mock = sinon.spy(callbackSuccessReturning(testVpc.validVpcResult));
        AWSMock.mock('EC2', 'describeVpcs', mock);
        const expectedParams = { Filters: [ nvp('tag:Name', [testVpc.name])] };
        await vpc.shouldExist();
        expect(mock.calledOnce).toEqual(true);
        expect(mock.calledWith(expectedParams)).toEqual(true);
    })

    it("returns true when the named VPC exists", async () => {
        withMockedDescribeEndpointResult(testVpc.validVpcResult);
        expect(await vpc.shouldExist()).toEqual(true);
    })

    it("returns false when the named VPC does not exist", async () => {
        withMockedDescribeEndpointResult(testVpc.emptyVpcResult);
        expect(await vpc.shouldExist()).toEqual(false);
    })

    it("returns false when receiving an undefined response from AWS", async () => {
        withMockedDescribeEndpointResult(undefined);
        expect(await vpc.shouldExist()).toEqual(false);
    })
}
)