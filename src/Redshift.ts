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

            await this.redshiftClient.describeClusters({
                ClusterIdentifier: this.clusterName
            }).promise()

            return true
        } catch (err) {

            if (err.code === 'ClusterNotFound') {
                return false
            }
            throw err
        }
    }

    async allowsConnectionFrom(cidrRange) {

        let cluster = await this.redshiftClient.describeClusters({
            ClusterIdentifier: this.clusterName
        }).promise()

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

        let securityGroups = await this.ec2.describeSecurityGroups({
            GroupIds: securityGroupIds
        }).promise()

        let securityGroupResponse: EC2.SecurityGroup[] = securityGroups.SecurityGroups == undefined ? [] : securityGroups.SecurityGroups

        let flatten = (arr: Array<any>) => {
            return arr.reduce((flat, toFlatten) => {
                flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten)
            })
        }

        let allInboundRules = flatten(securityGroupResponse.map(securityGroup => securityGroup.IpPermissions == undefined ? [] : securityGroup.IpPermissions))
        // IPV4 only supported at the moment
        let allInboundCidrRangeObjects = flatten(allInboundRules.map(securityGroupRule => securityGroupRule.IpRanges == undefined ? [] : securityGroupRule.IpRanges))

        let allInboundCidrRanges = allInboundCidrRangeObjects.map(cidr => cidr.CidrIp)

        return allInboundCidrRanges.includes(cidrRange)
    }

    toString() {
        return `RedshiftCluster(${this.clusterName})`
    }

}