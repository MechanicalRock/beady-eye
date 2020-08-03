import { CloudFront, CFLogsS3Object } from "../../src/CloudFront";
import { S3Bucket, S3 } from "../../src/S3";
import { awsMockCallback, awsMockFailureCallback } from "../support";
import * as AWSMock from "aws-sdk-mock";

describe("CloudFront.Distribution#SendingLogsToS3Within24hours", () => {
  const distributionId = "XYZABCDEF";
  const domainName = "myexample.com";
  const logsBucketName = "mybucket";

  afterEach(() => {
    AWSMock.restore("CloudFront");
  });
  it("test", (done) => {
    done();
  });

  it("should return true when the cloudfront distribution exists", async (done) => {
    AWSMock.mock(
      "CloudFront",
      "getDistribution",
      awsMockCallback("test-data/cloudfront/getDistribution-exists.json")
    );
    const response = await CloudFront.distribution(
      "MYDISTRIBUTION"
    ).shouldExist();
    expect(response).toBe(true);
    done();
  });
  it("should return false when the cloudfront distribution does not exist", async (done) => {
    AWSMock.mock(
      "CloudFront",
      "getDistribution",
      awsMockFailureCallback(
        "test-data/cloudfront/getDistribution-NotExists.json"
      )
    );
    const response = await CloudFront.distribution(
      "MYDISTRIBUTION"
    ).shouldExist();
    expect(response).toBe(false);
    done();
  });
  it("should return true when cloudfront logs for a given day could be found in S3", async (done) => {
    jest
      .spyOn(S3Bucket.prototype, "containsFileWithPrefix")
      .mockResolvedValue(true);
    const s3Bucket = S3.bucket("MY-LOG-BUCKETNAME");
    const response = await CloudFront.distribution(
      "MYEXISTINGCLOUDFRONT"
    ).isSendingLogsWithin(24, s3Bucket);
    expect(response).toBe(true);
    done();
  });
  it("should return false when cloudfront logs for a given day could not be found in S3", async (done) => {
    jest
      .spyOn(S3Bucket.prototype, "containsFileWithPrefix")
      .mockResolvedValue(false);
    const s3Bucket = S3.bucket("MY-LOG-BUCKETNAME");
    const response = await CloudFront.distribution(
      "MYEXISTINGCLOUDFRONT"
    ).isSendingLogsWithin(24, s3Bucket);
    expect(response).toBe(false);
    done();
  });
});
describe("Given a key date and periodHours", () => {
  it("generateS3ObjectPrefix should generate cloudfront logs object prefix", (done) => {
    // 1 Nov 2018 in ms = 1541031869663
    const keyDate = new Date(1541031869663);
    const prefix = new CFLogsS3Object("MYID").generateIdPrefix(keyDate, 24);
    expect(prefix).toBe("MYID.2018-10-31");
    done();
  });
});
