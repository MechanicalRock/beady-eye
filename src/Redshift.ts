import { Redshift as AwsRedshift, EC2 } from 'aws-sdk'
import { expect } from 'chai'
import { region } from 'aws-sdk/clients/health';
import { ConnectableAWSService } from './ConnectableAWSService'
import { endpointAddress } from './interfaces'


export class RedshiftCluster extends ConnectableAWSService{
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

    async getAddress(): Promise<endpointAddress> {
        let cluster = await this.getClusterDetails()

        expect(cluster.Endpoint).not.to.be.undefined

        return {
            address: cluster!.Endpoint!.Address as string,
            port: cluster!.Endpoint!.Port as number
        }
    }


    /**
     * Get the endpoint for the RedshiftCluster
     * @deprecated Use #getAddress() instead.  This method shall be removed in a future version.
     * @see #getAddress
     */
    async externalEndpoint(): Promise<AwsRedshift.Endpoint>{

        console.error('externalEndpoint is deprecated.')

        let cluster = await this.getClusterDetails()

        expect(cluster.Endpoint).not.to.be.undefined

        return cluster!.Endpoint as AwsRedshift.Endpoint

    }
    
    private async getClusterDetails():Promise<AwsRedshift.Cluster> {
        let clusters = await this.redshiftClient.describeClusters({
            ClusterIdentifier: this.clusterName
        }).promise()

        expect(clusters.Clusters).not.to.be.undefined
        expect(clusters.Clusters!.length).to.equal(1)
        
        let clusterDetails = clusters!.Clusters![0]

        return clusterDetails

    }
    
    private getSecurityGroupIdsFrom(cluster: AwsRedshift.Cluster){
        expect(cluster.VpcSecurityGroups).not.to.be.undefined
        
        let securityGroupIds: string[] = cluster!.VpcSecurityGroups!.map((securityGroup: AwsRedshift.VpcSecurityGroupMembership): string => {

            expect(securityGroup.VpcSecurityGroupId).not.to.be.undefined
            return securityGroup.VpcSecurityGroupId as string

        })
        return securityGroupIds
    }
    
    private async mapSecurityGroupIdsToInboundCidrRanges(securityGroupIds: string[]){
        let securityGroups = await this.ec2.describeSecurityGroups({
            GroupIds: securityGroupIds
        }).promise()
        
        let securityGroupResponse: EC2.SecurityGroup[] = securityGroups.SecurityGroups || []
        
        return this.getInboundCidrRangesFrom(securityGroupResponse)
    }
    
    private getInboundCidrRangesFrom(securityGroups: EC2.SecurityGroup[]){
        let allInboundRules:EC2.IpPermission[] = this.flatten(securityGroups.map(securityGroup => securityGroup.IpPermissions || [] ))
        
        // IPV4 only supported at the moment
        let allInboundIpRanges:EC2.IpRange[] = this.flatten(allInboundRules.map(securityGroupRule => securityGroupRule.IpRanges || [] ))
        
        let allInboundCidrRanges = allInboundIpRanges.map(cidr => cidr.CidrIp)
        return allInboundCidrRanges
    }

    private flatten(arr: Array<any>) {
        if(arr.length == 0){
            return []
        }

        return arr.reduce((item, toFlatten) => {
            let rest = Array.isArray(toFlatten) ? this.flatten(toFlatten) : toFlatten
            let arr = item instanceof Array ? item : [item]
            return arr.concat(rest)
        })
    }

    toString() {
        return `RedshiftCluster(${this.clusterName})`
    }

}