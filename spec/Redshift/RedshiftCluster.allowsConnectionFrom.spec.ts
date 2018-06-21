import { RedshiftCluster } from "../../src/Redshift"
import { awsMockCallback, awsMockFailureCallback } from '../support'
import AWSMock = require('aws-sdk-mock')


describe("RedshiftCluster class", () => {
    let clusterName = "test-redshift-cluster"
    let region = 'ap-southeast-2'
    
    describe('#allowsConnectionFrom()', () => {
        beforeEach( () => {
            AWSMock.mock('Redshift', 'describeClusters', awsMockCallback('test-data/redshift/describeClusters-exists.json'));

            this.ec2Spy = awsMockCallback('test-data/redshift/ec2-describe-security-groups.json')
            AWSMock.mock('EC2', 'describeSecurityGroups', this.ec2Spy);

            this.redshift = new RedshiftCluster(clusterName, region)
        } )

        afterEach(() => {
            AWSMock.restore('Redshift');
            AWSMock.restore('EC2');
        })

        it('should exist', async (done) => {
            expect(this.redshift.allowsConnectionFrom).toBeDefined()
            done()
        })
        
        it('should return false if there is no inbound security group rule that matches the given CIDR exactly', async (done)=> {
            let result = await this.redshift.allowsConnectionFrom('1.0.0.0/0')
            expect(result).toBe(false)
            done()
            
        })
        
        it('should return true if a security group associated with the redshift cluster matches contains an inbound rule that matches the given CIDR range exactly', async (done) => {
            let result = await this.redshift.allowsConnectionFrom('0.0.0.0/0')
            expect(result).toBe(true)
            done()
        })

        it('should only query for the security groups from the redshift cluster', async (done) => {
            let result = await this.redshift.allowsConnectionFrom('0.0.0.0/0')

            let securityGroupIds = [ 'sg-8ec02ef6' ]
            let expectedParams = {
                GroupIds: securityGroupIds
            }
            expect(this.ec2Spy).toBeCalled()
            expect(this.ec2Spy).toBeCalledWith(expectedParams, expect.anything())
            done()

        })

    })
    
})