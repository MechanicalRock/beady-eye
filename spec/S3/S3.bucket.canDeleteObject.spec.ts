import { S3 } from "../../src/S3";
import { awsMockCallback, awsMockFailureCallback } from "../support";
import * as AWSMock from "aws-sdk-mock";

describe("S3.bucket#canDeleteObject", () => {
  const bucketName = "myS3Bucket";
  const bucketKey = "test/my-key";

  afterEach(() => {
    AWSMock.restore("S3");
  });

  it("should return true when permission granted", async (done) => {
    AWSMock.mock(
      "S3",
      "deleteObject",
      awsMockCallback("test-data/deleteObject-granted.json")
    );

    const response = await S3.bucket(bucketName).canDeleteObject(bucketKey);
    expect(response).toBe(true);
    done();
  });

  it("should return true when permission granted and key does not exist", async (done) => {
    AWSMock.mock(
      "S3",
      "deleteObject",
      awsMockCallback("test-data/deleteObject-noSuchKey.json")
    );

    const response = await S3.bucket(bucketName).canDeleteObject(bucketKey);
    expect(response).toBe(true);
    done();
  });

  it("should return false when permission denied", async (done) => {
    AWSMock.mock(
      "S3",
      "deleteObject",
      awsMockFailureCallback("test-data/deleteObject-denied.json")
    );

    const response = await S3.bucket(bucketName).canDeleteObject(bucketKey);
    expect(response).toBe(false);
    done();
  });

  it("should return false when permission denied and key does not exist", async (done) => {
    AWSMock.mock(
      "S3",
      "deleteObject",
      awsMockFailureCallback("test-data/deleteObject-errorNoSuchKey.json")
    );

    const response = await S3.bucket(bucketName).canDeleteObject(bucketKey);
    expect(response).toBe(false);
    done();
  });

  it("should throw an error when the bucket does not exist", async (done) => {
    AWSMock.mock(
      "S3",
      "deleteObject",
      awsMockFailureCallback("test-data/deleteObject-notExist.json")
    );

    try {
      await S3.bucket(bucketName).canDeleteObject(bucketKey);
      fail("exception not thrown");
    } catch (err) {
      done();
    }
  });
});
