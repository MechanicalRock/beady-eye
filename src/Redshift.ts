import { Redshift as AwsRedshift, EC2 } from 'aws-sdk'
import { expect } from 'chai'
import { region } from 'aws-sdk/clients/health';

export class RedshiftCluster {
    clusterName: string
    redshiftClient: AwsRedshift
    ec2: EC2

    constructor(clusterName: string, region?: string) {
        this.clusterName = clusterName
        let clientParams = { region: region }
        this.redshiftClient = new AwsRedshift(clientParams)
        this.ec2 = new EC2(clientParams)
    }

    async shouldExist() {
        try {

            await this.getClusterDetails()

            return true
        } catch (err) {

            if (err.code === 'ClusterNotFound') {
                return false
            }
            throw err
        }
    }

    async allowsConnectionFrom(cidrRange) {

        let cluster = await this.getClusterDetails()

        let securityGroupIds: string[] = this.getSecurityGroupIdsFrom(cluster)

        let allInboundCidrRanges = await this.mapSecurityGroupIdsToInboundCidrRanges(securityGroupIds)

        return allInboundCidrRanges.includes(cidrRange)
    }

    private getClusterDetails() {
        return this.redshiftClient.describeClusters({
            ClusterIdentifier: this.clusterName
        }).promise()
    }

    private getSecurityGroupIdsFrom(cluster: AwsRedshift.ClustersMessage){
        expect(cluster.Clusters).not.to.be.undefined
        expect(cluster.Clusters!.length).to.equal(1)
        
        let clusterDetails = cluster!.Clusters![0]
        // Redshift Classic instances not currently supported
        expect(clusterDetails.VpcSecurityGroups).not.to.be.undefined

        let securityGroupIds: string[] = clusterDetails!.VpcSecurityGroups!.map((securityGroup: AwsRedshift.VpcSecurityGroupMembership): string => {
            if (securityGroup.VpcSecurityGroupId) {
                return securityGroup.VpcSecurityGroupId
            } else {
                return 'unknown' //should not happen
            }
        })
        return securityGroupIds
    }

    private async mapSecurityGroupIdsToInboundCidrRanges(securityGroupIds: string[]){
        let securityGroups = await this.ec2.describeSecurityGroups({
            GroupIds: securityGroupIds
        }).promise()

        let securityGroupResponse: EC2.SecurityGroup[] = securityGroups.SecurityGroups == undefined ? [] : securityGroups.SecurityGroups

        
        let allInboundRules:EC2.IpPermission[] = this.flatten(securityGroupResponse.map(securityGroup => securityGroup.IpPermissions == undefined ? [] : securityGroup.IpPermissions))
        
        // IPV4 only supported at the moment
        let allInboundIpRanges:EC2.IpRange[] = this.flatten(allInboundRules.map(securityGroupRule => securityGroupRule.IpRanges == undefined ? [] : securityGroupRule.IpRanges))
        
        let allInboundCidrRanges = allInboundIpRanges.map(cidr => cidr.CidrIp)
        return allInboundCidrRanges
    }

    private flatten(arr: Array<any>) {
        return arr.reduce((flat, toFlatten) => {
            flat.concat(Array.isArray(toFlatten) ? this.flatten(toFlatten) : toFlatten)
        })
    }

    toString() {
        return `RedshiftCluster(${this.clusterName})`
    }

}