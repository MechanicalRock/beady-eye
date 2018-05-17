import { RDS } from '../src/RDS'
import { callbackSuccessReturning, nvp } from './support'
import { testRds } from './RDS.stub'
var AWSMock = require('aws-sdk-mock')
var sinon = require('sinon')
var net = require('net')

describe("RDSObject#canMakeConnection function", () => {
    let rds: RDS;
    let fakeSocket;

    let withMockedConnectionResult = (result) =>
        {   // RDS result
            let instanceCB = callbackSuccessReturning(testRds.validRdsResultWithEndpointAddress);
            AWSMock.mock('RDS', 'describeDBInstances', instanceCB);

            // Socket connection result
            let fakeConnection = () => {
                let s = net.Socket();

                // Fire the intended result, or allow natural timeout if undefined
                if (result !== undefined) { setTimeout(() => s.emit(result), 200 ); }
                return s;
            }
            fakeSocket = sinon.stub(net, 'createConnection').callsFake(fakeConnection)
        }

    beforeEach(() => { rds = new RDS(testRds.name, testRds.region);} )

    afterEach(() => {
        AWSMock.restore('RDS');
        net.createConnection.restore();
    })

    it("tests the connection to the endpoint address", async () => {
        withMockedConnectionResult('connect');
        expect(await rds.canMakeConnection()).toEqual(true);
        expect(fakeSocket.calledOnce).toEqual(true);
        expect(fakeSocket.calledWith(5432, 'test.address')).toEqual(true);

    })

    it("returns true if a connection can be made", async () => {
        withMockedConnectionResult('connect');
        expect(await rds.canMakeConnection()).toEqual(true);
    })

    it("returns false if a connection cannot be made", async () => {
        withMockedConnectionResult(undefined);
        expect(await rds.canMakeConnection()).toEqual(false);
    })

})