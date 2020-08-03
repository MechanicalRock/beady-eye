import { S3 } from "../../src/S3";
import * as AWSMock from "aws-sdk-mock";

describe("S3 module", () => {
  describe("#bucket()", () => {
    const bucketName = "myS3Bucket";
    const bucket = S3.bucket(bucketName);

    it("should be defined", () => {
      expect(bucket).toBeDefined();
    });

    it("should provide a string representation including the bucket name", () => {
      expect(bucket.toString).toBeDefined();
      expect(bucket.toString()).toEqual("S3 Bucket: myS3Bucket");
    });
  });
});
