import { S3 } from "../../src/S3";
import { awsMockCallback, awsMockFailureCallback } from "../support";
import * as AWSMock from "aws-sdk-mock";

describe("S3.bucket#containsFileWithPrefix", () => {
  const bucketName = "myS3Bucket";
  const bucketKey = "test/my-key";

  afterEach(() => {
    AWSMock.restore("S3");
  });

  it("should return true when an object with given prefix exists and permission granted", async (done) => {
    AWSMock.mock(
      "S3",
      "listObjectsV2",
      awsMockCallback("test-data/listObjects-granted.json")
    );
    const response = await S3.bucket(bucketName).containsFileWithPrefix(
      "myprefix.txt"
    );
    expect(response).toBe(true);
    done();
  });
  it("should return false when an object with given prefix does exists and permission granted", async (done) => {
    AWSMock.mock(
      "S3",
      "listObjectsV2",
      awsMockCallback("test-data/listObjects-notExist.json")
    );
    const response = await S3.bucket(bucketName).containsFileWithPrefix(
      "myprefix.txt"
    );
    expect(response).toBe(false);
    done();
  });
});
