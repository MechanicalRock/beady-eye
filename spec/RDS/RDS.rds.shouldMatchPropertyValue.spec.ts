import { RDS } from "../../src/RDS";
import { callbackSuccessReturning, nvp } from "../support";
import { testRds } from "./RDS.stub";
const AWSMock = require("aws-sdk-mock");
const sinon = require("sinon");

describe("RDSObject#shouldMatchPropertyValue function", () => {
  let rds: RDS;

  const withMockedDescribeEndpointResult = (result) => {
    AWSMock.mock(
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

  it("returns true if the RDS matches the given property value", async () => {
    withMockedDescribeEndpointResult(testRds.validRdsResultWithEngine);
    expect(await rds.shouldHavePropertyValue("Engine", "postgres")).toEqual(
      true
    );
  });

  it("returns false if the RDS dos not match the given property value", async () => {
    withMockedDescribeEndpointResult(testRds.validRdsResultWithEngine);
    expect(await rds.shouldHavePropertyValue("Engine", "mysql")).toEqual(false);
  });

  it("returns false when the named RDS property does not exist", async () => {
    withMockedDescribeEndpointResult(testRds.validRdsResult);
    expect(await rds.shouldHavePropertyValue("Engine", "postgres")).toEqual(
      false
    );
  });

  it("returns false when the named RDS does not exist", async () => {
    withMockedDescribeEndpointResult(testRds.emptyRdsResult);
    expect(await rds.shouldHavePropertyValue("Engine", "postgres")).toEqual(
      false
    );
  });

  it("returns false when receiving an undefined response from AWS", async () => {
    withMockedDescribeEndpointResult(undefined);
    expect(await rds.shouldHavePropertyValue("Engine", "postgres")).toEqual(
      false
    );
  });
});
