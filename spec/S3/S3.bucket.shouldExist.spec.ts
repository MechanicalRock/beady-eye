import { S3 } from "../../src/S3";
import { awsMockCallback, awsMockFailureCallback } from "../support";
import * as AWSMock from "aws-sdk-mock";

describe("S3.bucket#shouldExist", () => {
  const bucketName = "myS3Bucket";

  afterEach(() => {
    AWSMock.restore("S3");
  });

  it("should succeed when the bucket exists", async (done) => {
    AWSMock.mock(
      "S3",
      "headBucket",
      awsMockCallback("test-data/headBucket-exists.json")
    );

    const response = await S3.bucket(bucketName).shouldExist();
    expect(response).toBe(true);
    done();
  });

  it("should throw an error when the bucket does not exist", async (done) => {
    AWSMock.mock(
      "S3",
      "headBucket",
      awsMockFailureCallback("test-data/headBucket-notExists.json")
    );

    try {
      await S3.bucket(bucketName).shouldExist();
      fail("exception not thrown");
    } catch (err) {
      done();
    }
  });
});
