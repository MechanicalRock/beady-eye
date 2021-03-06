import { RedshiftCluster } from "../../src/Redshift";
import { awsMockCallback, awsMockFailureCallback } from "../support";
import * as AWSMock from "aws-sdk-mock";

describe("RedshiftCluster module", () => {
  const clusterName = "test-redshift-cluster";

  describe("#shouldExist()", () => {
    afterEach(() => {
      AWSMock.restore("Redshift");
    });

    it("should return true when the cluster exists", async (done) => {
      AWSMock.mock(
        "Redshift",
        "describeClusters",
        awsMockCallback("test-data/redshift/describeClusters-exists.json")
      );
      const redshift = new RedshiftCluster(clusterName, "ap-southeast-2");

      const response = await redshift.shouldExist();
      expect(response).toBe(true);
      done();
    });

    it("should return false when the cluster does not exist", async (done) => {
      AWSMock.mock(
        "Redshift",
        "describeClusters",
        awsMockFailureCallback(
          "test-data/redshift/describeClusters-not-exists.json"
        )
      );
      const redshift = new RedshiftCluster(clusterName, "ap-southeast-2");

      const response = await redshift.shouldExist();
      expect(response).toBe(false);
      done();
    });

    it("should throw exception when an unexpected error is returned", async (done) => {
      AWSMock.mock(
        "Redshift",
        "describeClusters",
        awsMockFailureCallback(
          "test-data/redshift/describeClusters-denied.json"
        )
      );
      const redshift = new RedshiftCluster(clusterName, "ap-southeast-2");

      try {
        await redshift.shouldExist();
        done.fail("Expected exception to be thrown");
      } catch (err) {
        // error should be propogated
        expect(err.code).toBe("AccessDenied");
        done();
      }
    });
  });
});
