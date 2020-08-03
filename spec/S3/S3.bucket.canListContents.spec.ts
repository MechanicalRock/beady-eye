import { S3 } from "../../src/S3";
import { awsMockCallback, awsMockFailureCallback } from "../support";
import * as AWSMock from "aws-sdk-mock";

describe("S3.bucket#canListContents", () => {
  const bucketName = "myS3Bucket";

  afterEach(() => {
    AWSMock.restore("S3");
  });

  it("should succeed if the bucket contents can be listed", async (done) => {
    AWSMock.mock(
      "S3",
      "listObjects",
      awsMockCallback("test-data/listObjects-granted.json")
    );

    const response = await S3.bucket(bucketName).canListContents();
    expect(response).toBe(true);
    done();
  });

  it("should return false if the bucket contents cannot be listed", async (done) => {
    AWSMock.mock(
      "S3",
      "listObjects",
      awsMockFailureCallback("test-data/listObjects-denied.json")
    );

    const response = await S3.bucket(bucketName).canListContents();
    expect(response).toBe(false);
    done();
  });

  it("should fail if the bucket does not exist", async (done) => {
    AWSMock.mock(
      "S3",
      "listObjects",
      awsMockFailureCallback("test-data/listObjects-notExist.json")
    );

    try {
      await S3.bucket(bucketName).canListContents();
      fail("exception should be thrown");
    } catch (err) {
      done();
    }
  });
});
