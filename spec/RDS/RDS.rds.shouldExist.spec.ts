import { RDS } from "../../src/RDS";
import { callbackSuccessReturning, nvp } from "../support";
import { testRds } from "./RDS.stub";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AWSMock = require("aws-sdk-mock");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sinon = require("sinon");

describe("RDSObject#shouldExist function", () => {
  let rds: RDS;

  const withMockedDescribeEndpointResult = (result) => {
    return AWSMock.mock(
      "RDS",
      "describeDBInstances",
      callbackSuccessReturning(result)
    );
  };

  beforeEach(() => {
    rds = new RDS(testRds.name, testRds.region);
  });

  afterEach(() => AWSMock.restore("RDS"));

  it("passes the rds name to the AWS SDK", async () => {
    const mock = sinon.spy(callbackSuccessReturning(testRds.validRdsResult));
    AWSMock.mock("RDS", "describeDBInstances", mock);
    const expectedParams = { Filters: [nvp("db-instance-id", [testRds.name])] };
    await rds.shouldExist();
    expect(mock.calledOnce).toEqual(true);
    expect(mock.calledWith(expectedParams)).toEqual(true);
  });

  it("returns true when the named RDS exists", async () => {
    withMockedDescribeEndpointResult(testRds.validRdsResult);
    expect(await rds.shouldExist()).toEqual(true);
  });

  it("returns false when the named RDS does not exist", async () => {
    withMockedDescribeEndpointResult(testRds.emptyRdsResult);
    expect(await rds.shouldExist()).toEqual(false);
  });

  it("returns false when receiving an undefined response from AWS", async () => {
    withMockedDescribeEndpointResult(undefined);
    expect(await rds.shouldExist()).toEqual(false);
  });
});
