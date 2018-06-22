import { S3, STS, Redshift, CloudFormation, EC2 } from 'aws-sdk'
import { writeTo, credentials, credentialsForRole } from '../utils'
import * as approvals from 'approvals'
import { AWS, Template, Ref } from 'cloudformation-declarations';
import * as crypto from 'crypto'
import * as uuid from 'uuid'

const roleNameWithoutAccess = 'beady-eyeDeniedRole'
let existingClusterName = 'test-redshift-cluster'
let region = 'ap-southeast-2'

const redshiftTests = async (credentials) => {
    var redshift = new Redshift({ credentials: credentials, region: region })

    let notExistsClusterName = 'this-does-not-exist'

    // These require the clusters above to exist/not.  Once created, the test data needs to be scrubbed (TODO)
    // Uncomment to re-create the test data
    // redshift.describeClusters({ClusterIdentifier: notExistsClusterName}).promise().catch(writeTo('redshift/describeClusters-not-exists.json'))
    
    
    var deniedCreds = await credentialsForRole(roleNameWithoutAccess)
    var redshiftDenied = new Redshift({ credentials: deniedCreds, region: region })
    
    redshiftDenied.describeClusters({ ClusterIdentifier: existingClusterName }).promise().catch(writeTo('redshift/describeClusters-denied.json'))
    
}

describe('Redshift Approval Tests', () => {
    
    let createEnvironment = false
    let tearDownEnvironment = true
    let stackName = 'beady-eye-approval-redshift'
    
    beforeAll(async (done) => {
        
        this.creds = await credentials()
        this.clientParams = {credentials: this.creds, region: region}
        
        
        if(createEnvironment){
            let cf = new CloudFormation(this.clientParams)
            try{
                await cf.createStack({StackName: stackName,
                    TemplateBody: JSON.stringify(template),
                }).promise()
                await cf.waitFor("stackCreateComplete", {
                    StackName: stackName,
                }).promise()
            }catch(err){
                console.log('Ignoring failure to create stack - does it already exist?')
                console.log(err)
            }
        }
        
        done()
        
    }, 10*60*1000)
    
    afterAll(async (done) => {
        if(tearDownEnvironment){
            let cf = new CloudFormation(this.clientParams)
            let response = await cf.deleteStack({StackName: stackName}).promise()
        }
        done()
    },10*60*1000)
    
    it('should clean up the approval test stack when finished', ()=> {
        // this doesn't actually do anything
        // but is here in case other tests are disabled.
        expect(tearDownEnvironment).toBe(true)
    })

    xit('should generate test-data for redshift', async (done)=> {
        await redshiftTests(this.creds)
        done()
    })
    
    xit('should generate data for the subnets', async (done) => {
        var redshift = new Redshift(this.clientParams)
        
        existingClusterName = 'beady-eye-approval-redshift-redshiftcluster-gqlpmk80mi5o'
        redshift.describeClusters({ClusterIdentifier: existingClusterName}).promise().then(writeTo('redshift/describeClusters-exists.json'))
        let clusterDetails = await redshift.describeClusters({ClusterIdentifier: existingClusterName}).promise()
        let securityGroupIds:string[] = clusterDetails.Clusters![0].VpcSecurityGroups!.map((securityGroup: Redshift.VpcSecurityGroupMembership):string => {
            if(securityGroup.VpcSecurityGroupId){
                return securityGroup.VpcSecurityGroupId
            }else{
                return 'unknown' //should not happen
            }
        })
        
        let ec2 = new EC2(this.clientParams)

        // TODO - actually use approvalTest to compare

        ec2.describeSecurityGroups({GroupIds: securityGroupIds}).promise().then(writeTo('redshift/ec2-describe-security-groups.json'))
        done()

    })
    
})

let redshiftPort = '5439'
let template: Template = {
    AWSTemplateFormatVersion: '2010-09-09',
    Resources: {
        igw: AWS.EC2.InternetGateway({
            Properties: {}
        }),
        
        redshiftVpc: AWS.EC2.VPC({
            DependsOn: 'igw',
            Properties: {
                CidrBlock: '10.0.0.0/16',
                EnableDnsSupport: 'false',
                EnableDnsHostnames: 'false',
            }
        }),
        
        igwAttachment: AWS.EC2.VPCGatewayAttachment({
            Properties: {
                VpcId: Ref('redshiftVpc'),
                InternetGatewayId: Ref('igw')
            }
        }),
        
        publicRouteTable: AWS.EC2.RouteTable({
            DependsOn: 'redshiftVpc',
            Properties: {
                VpcId: Ref('redshiftVpc')
            }
        }),
        
        publicRouteToInternet: AWS.EC2.Route({
            DependsOn: 'igw',
            Properties: {
                RouteTableId: Ref('publicRouteTable'),
                DestinationCidrBlock: '0.0.0.0/0',
                GatewayId: Ref('igw'),
            }
        }),
        
        redshiftPublicSubnetRT: AWS.EC2.SubnetRouteTableAssociation({
            Properties: {
                SubnetId: Ref('redshiftPublicSubnet'),
                RouteTableId: Ref('publicRouteTable')
            }
        }),
        
        redshiftPublicSubnet: AWS.EC2.Subnet({
            
            Properties: {
                VpcId: Ref('redshiftVpc'),
                CidrBlock: '10.0.0.0/24',
                AvailabilityZone: "ap-southeast-2a",
            }
        }),
        SecurityGroup: AWS.EC2.SecurityGroup({
            Properties: {
                VpcId: Ref('redshiftVpc'),
                GroupDescription: 'Amazon Redshift security group',
                SecurityGroupIngress: [
                    {
                        CidrIp: '0.0.0.0/0',
                        FromPort: redshiftPort,
                        ToPort: redshiftPort,
                        IpProtocol: 'tcp'
                    },
                ]
            },
        }),
        ClusterSubnetGroup: AWS.Redshift.ClusterSubnetGroup({
            Properties: {
                Description: "RedshiftClusterSubnetGroup",
                SubnetIds: [Ref('redshiftPublicSubnet')
            ]
        }
    }),
    RedshiftCluster: AWS.Redshift.Cluster({
        DependsOn: 'ClusterSubnetGroup',
        Properties: {
            ClusterType: 'single-node',
            NodeType: 'dc2.large',
            ClusterIdentifier: existingClusterName,
            DBName: existingClusterName,
            MasterUsername: `a${uuid.v1()}`,
            MasterUserPassword: `aA1${crypto.randomBytes(30).toString('hex')}`,
            PubliclyAccessible: 'true',
            Port: redshiftPort,
            VpcSecurityGroupIds: [
                Ref('SecurityGroup'),
            ],
            ClusterSubnetGroupName: Ref('ClusterSubnetGroup'),
        }
    // cast as 'any' required since ClusterIdentifier isn't supported yet
    } as any),
}

}



