import { S3 } from "../../src/S3";
import { awsMockCallback, awsMockFailureCallback } from "../support";
import * as AWSMock from "aws-sdk-mock";

describe("S3.bucket#hasAccessLogging", () => {
  const bucketName = "myS3Bucket";

  afterEach(() => {
    AWSMock.restore("S3");
  });

  it("should return true if access logging is enabled", async (done) => {
    AWSMock.mock(
      "S3",
      "getBucketLogging",
      awsMockCallback("test-data/getBucketLogging-enabled.json")
    );

    const response = await S3.bucket(bucketName).hasAccessLogging();
    expect(response).toBe(true);
    done();
  });

  it("should return false if access logging is disabled", async (done) => {
    // Note - disabled is a successful response
    AWSMock.mock(
      "S3",
      "getBucketLogging",
      awsMockCallback("test-data/getBucketLogging-disabled.json")
    );
    const result = await S3.bucket(bucketName).hasAccessLogging();
    expect(result).toBe(false);
    done();
  });

  it("should fail if the bucket does not exist", async (done) => {
    AWSMock.mock(
      "S3",
      "getBucketLogging",
      awsMockFailureCallback("test-data/getBucketLogging-notExist.json")
    );
    try {
      await S3.bucket(bucketName).hasAccessLogging();
      fail("Exception should be thrown");
    } catch (err) {
      done();
    }
  });
});
