import { RDS } from "../../src/RDS";
import { connectionTester, endpointAddress } from "../../src/interfaces";
import { callbackSuccessReturning, nvp } from "../support";
import { testRds } from "./RDS.stub";
import { connectionTesterMock } from "../ConnectionTesters/connectionTesterMock";
const AWSMock = require("aws-sdk-mock");
const sinon = require("sinon");
const net = require("net");

describe("RDSObject#canMakeConnection function", () => {
  let rds: RDS;
  let fakeTester: connectionTesterMock;

  const withMockedConnectionResult = (result) => {
    // RDS result
    const instanceCB = callbackSuccessReturning(
      testRds.validRdsResultWithEndpointAddress
    );
    AWSMock.mock("RDS", "describeDBInstances", instanceCB);

    // Fake connection tester
    fakeTester = new connectionTesterMock("tester");
    fakeTester.setResult(result);

    // Socket connection result: Will be moved to connection tester object
    // let fakeConnection = () => {
    //     let s = net.Socket();

    //     // Fire the intended result, or allow natural timeout if undefined
    //     if (result !== undefined) { setTimeout(() => s.emit(result), 200 ); }
    //     return s;
    // }
    // fakeSocket = sinon.stub(net, 'createConnection').callsFake(fakeConnection)
  };

  beforeEach(() => {
    rds = new RDS(testRds.name, testRds.region);
  });

  afterEach(() => {
    AWSMock.restore("RDS");
  });

  it("tests the connection from a source to the endpoint address", async () => {
    withMockedConnectionResult(true);
    expect(await rds.isReachableFrom(fakeTester)).toEqual(true);
    expect(fakeTester.requestedAddress).toEqual("test.address");
    expect(fakeTester.requestedPort).toEqual(5432);
  });

  it("returns true if a connection can be made", async () => {
    withMockedConnectionResult(true);
    expect(await rds.isReachableFrom(fakeTester)).toEqual(true);
  });

  it("returns false if a connection cannot be made", async () => {
    withMockedConnectionResult(false);
    expect(await rds.isReachableFrom(fakeTester)).toEqual(false);
  });
});
