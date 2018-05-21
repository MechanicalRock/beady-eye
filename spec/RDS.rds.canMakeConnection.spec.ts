import { RDS } from '../src/RDS'
import { connectionTester, endpointAddress } from '../src/interfaces'
import { callbackSuccessReturning, nvp } from './support'
import { testRds } from './RDS.stub'
var AWSMock = require('aws-sdk-mock')
var sinon = require('sinon')
var net = require('net')

class connectionTesterMock implements connectionTester {

    sourceId: string;
    result: boolean;
    requestedAddress: string;
    requestedPort: number;

    constructor(sourceId: string) {
        this.sourceId = sourceId;
    }

    setResult(result: boolean) {
        this.result = result;
    }

    tryConnectionTo(endpoint: endpointAddress, timeout_ms: number): boolean {
        this.requestedAddress = endpoint.address;
        this.requestedPort = endpoint.port;
        return this.result;
    }
}


describe("RDSObject#canMakeConnection function", () => {
    let rds: RDS;
    let fakeTester: connectionTesterMock;

    let withMockedConnectionResult = (result) => {
        // RDS result
        let instanceCB = callbackSuccessReturning(testRds.validRdsResultWithEndpointAddress);
        AWSMock.mock('RDS', 'describeDBInstances', instanceCB);

        // Fake connection tester
        fakeTester = new connectionTesterMock('tester')
        fakeTester.setResult(result);

        // Socket connection result: Will be moved to connection tester object
        // let fakeConnection = () => {
        //     let s = net.Socket();

        //     // Fire the intended result, or allow natural timeout if undefined
        //     if (result !== undefined) { setTimeout(() => s.emit(result), 200 ); }
        //     return s;
        // }
        // fakeSocket = sinon.stub(net, 'createConnection').callsFake(fakeConnection)
    }

    beforeEach(() => { rds = new RDS(testRds.name, testRds.region);} )

    afterEach(() => {
        AWSMock.restore('RDS');
    })

    it("tests the connection from a source to the endpoint address", async () => {
        withMockedConnectionResult(true);
        expect(await rds.isReachableFrom(fakeTester)).toEqual(true);
        expect(fakeTester.requestedAddress).toEqual('test.address');
        expect(fakeTester.requestedPort).toEqual(5432);

    })

    it("returns true if a connection can be made", async () => {
        withMockedConnectionResult(true);
        expect(await rds.isReachableFrom(fakeTester)).toEqual(true);
    })

    it("returns false if a connection cannot be made", async () => {
        withMockedConnectionResult(false);
        expect(await rds.isReachableFrom(fakeTester)).toEqual(false);
    })

})