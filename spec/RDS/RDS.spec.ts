import { RDS } from "../../src/RDS";
import { IAM } from "../../src/IAM";
import { callbackSuccessReturning } from "../support";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AWSMock = require("aws-sdk-mock");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sinon = require("sinon");

describe("RDS Module", () => {
  describe("#RDSObject", () => {
    const testRDSName = "testRDS";
    const testRDSRegion = "test-region-1";
    let rds;

    beforeEach(() => {
      rds = new RDS(testRDSName, testRDSRegion);
    });

    it("exists", () => expect(rds).toBeDefined());

    it("has a name function which prints a name", () => {
      expect(rds.toString).toBeDefined();
      expect(rds.toString()).toEqual("RDS: testRDS");
    });

    it("can be constructed with a role", async () => {
      const AWS_ACCOUNT_ID = "aws_account_id";
      const AWS_ROLE = "aws_role";

      // Mock the IAM sdk
      const mockCredentialsResult = {
        Credentials: {
          AccessKeyId: "12345",
          SecretAccessKey: "67890",
          SessionToken: "ABCDE",
        },
      };
      const mock = sinon.spy(callbackSuccessReturning(mockCredentialsResult));
      AWSMock.mock("STS", "assumeRole", mock);

      // Construct
      const role = IAM.role({ roleName: AWS_ROLE, accountId: AWS_ACCOUNT_ID });
      rds = new RDS(testRDSName, testRDSRegion, role);
      await rds.awsClient();

      // Check mock
      const expectedParams = {
        RoleArn: `arn:aws:iam::${AWS_ACCOUNT_ID}:role/${AWS_ROLE}`,
        RoleSessionName: "BDIComplianceTest",
        ExternalId: undefined,
      };
      expect(mock.calledOnce).toEqual(true);
      expect(mock.calledWith(expectedParams)).toEqual(true);
    });
  });
});
