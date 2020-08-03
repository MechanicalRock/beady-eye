import { Redshift as AwsRedshift, EC2 } from "aws-sdk";
import { expect } from "chai";
import { region } from "aws-sdk/clients/health";
import { ConnectableAWSService } from "./ConnectableAWSService";
import { endpointAddress, connectable } from "./interfaces";
import { flatten } from "./util/Arrays";

export class RedshiftCluster implements connectable {
  clusterName: string;
  redshiftClient: AwsRedshift;
  ec2: EC2;

  constructor(clusterName: string, region?: string) {
    this.clusterName = clusterName;
    const clientParams = { region: region };
    this.redshiftClient = new AwsRedshift(clientParams);
    this.ec2 = new EC2(clientParams);
  }

  async shouldExist() {
    try {
      await this.getClusterDetails();

      return true;
    } catch (err) {
      if (err.code === "ClusterNotFound") {
        return false;
      }
      throw err;
    }
  }

  async allowsConnectionFrom(cidrRange) {
    const cluster = await this.getClusterDetails();

    const securityGroupIds: Array<string> = this.getSecurityGroupIdsFrom(
      cluster
    );

    const allInboundCidrRanges = await this.mapSecurityGroupIdsToInboundCidrRanges(
      securityGroupIds
    );

    return allInboundCidrRanges.includes(cidrRange);
  }

  async getAddress(): Promise<endpointAddress> {
    const cluster = await this.getClusterDetails();

    expect(cluster.Endpoint).not.to.be.undefined;

    return {
      address: cluster!.Endpoint!.Address as string,
      port: cluster!.Endpoint!.Port as number,
    };
  }

  /**
   * Get the endpoint for the RedshiftCluster
   * @deprecated Use #getAddress() instead.  This method shall be removed in a future version.
   * @see #getAddress
   */
  async externalEndpoint(): Promise<AwsRedshift.Endpoint> {
    console.error("externalEndpoint is deprecated.");

    const cluster = await this.getClusterDetails();

    expect(cluster.Endpoint).not.to.be.undefined;

    return cluster!.Endpoint as AwsRedshift.Endpoint;
  }

  private async getClusterDetails(): Promise<AwsRedshift.Cluster> {
    const clusters = await this.redshiftClient
      .describeClusters({
        ClusterIdentifier: this.clusterName,
      })
      .promise();

    expect(clusters.Clusters).not.to.be.undefined;
    expect(clusters.Clusters!.length).to.equal(1);

    const clusterDetails = clusters!.Clusters![0];

    return clusterDetails;
  }

  private getSecurityGroupIdsFrom(cluster: AwsRedshift.Cluster) {
    expect(cluster.VpcSecurityGroups).not.to.be.undefined;

    const securityGroupIds: Array<string> = cluster!.VpcSecurityGroups!.map(
      (securityGroup: AwsRedshift.VpcSecurityGroupMembership): string => {
        expect(securityGroup.VpcSecurityGroupId).not.to.be.undefined;
        return securityGroup.VpcSecurityGroupId as string;
      }
    );
    return securityGroupIds;
  }

  private async mapSecurityGroupIdsToInboundCidrRanges(
    securityGroupIds: Array<string>
  ) {
    const securityGroups = await this.ec2
      .describeSecurityGroups({
        GroupIds: securityGroupIds,
      })
      .promise();

    const securityGroupResponse: Array<EC2.SecurityGroup> =
      securityGroups.SecurityGroups || [];

    return this.getInboundCidrRangesFrom(securityGroupResponse);
  }

  private getInboundCidrRangesFrom(securityGroups: Array<EC2.SecurityGroup>) {
    const allInboundRules: Array<EC2.IpPermission> = flatten(
      securityGroups.map((securityGroup) => securityGroup.IpPermissions || [])
    );

    // IPV4 only supported at the moment
    const allInboundIpRanges: Array<EC2.IpRange> = flatten(
      allInboundRules.map(
        (securityGroupRule) => securityGroupRule.IpRanges || []
      )
    );

    const allInboundCidrRanges = allInboundIpRanges.map((cidr) => cidr.CidrIp);
    return allInboundCidrRanges;
  }

  toString() {
    return `RedshiftCluster(${this.clusterName})`;
  }
}
