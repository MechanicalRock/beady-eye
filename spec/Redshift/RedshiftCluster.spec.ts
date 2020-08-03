import { RedshiftCluster } from "../../src/Redshift";
import * as AWSMock from "aws-sdk-mock";

describe("RedshiftCluster module", () => {
  const clusterName = "my-redshift-cluster";
  const redshift = new RedshiftCluster(clusterName);
  describe("#toString()", () => {
    it("should be defined", () => {
      expect(redshift.toString).toBeDefined();
    });
    it("should return the form RedshiftCluster(clusterName)", () => {
      expect(redshift.toString()).toBe("RedshiftCluster(my-redshift-cluster)");
    });
  });
});
