import { S3, IAM } from "../src/index";

const bucket = S3.bucket("myBucket");
describe(bucket.toString(), () => {
  const asDeveloperRole = IAM.role({
    roleName: "DeveloperRole",
    accountId: "0123456789",
  });
  describe(`${asDeveloperRole} access`, () => {
    const bucket = S3.bucket("myBucket", asDeveloperRole);
    it("should exist", async () => {
      await bucket.shouldExist();
    });
  });
});
