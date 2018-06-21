import { RedshiftCluster } from "../../src/Redshift"
import { awsMockCallback, awsMockFailureCallback } from '../support'
import AWSMock = require('aws-sdk-mock')


describe("RedshiftCluster class", () => {
    let clusterName = "test-redshift-cluster"
    let region = 'ap-southeast-2'
    
    describe('#allowsConnectionFrom()', () => {
        // afterEach(() => {
        //     AWSMock.restore('Redshift');
        // })

        it('should exist', async (done) => {
            let redshift = new RedshiftCluster(clusterName, region)
            expect(redshift.allowsConnectionFrom).toBeDefined()
            done()
        })
        
        it('should return false if there is no inbound security group rule that matches the given CIDR exactly', async (done)=> {
            let redshift = new RedshiftCluster(clusterName, region)
            let result = await redshift.allowsConnectionFrom('0.0.0.0/0')

            expect(result).toBe(false)
            done()
        })

        it('should return true if a security group associated with the redshift cluster matches contains an inbound rule that matches the given CIDR range exactly', async (done) => {
            done.fail('todo')
        })


        // it('should return true when the cluster exists', async (done) => {
        //     AWSMock.mock('Redshift', 'describeClusters', awsMockCallback('test-data/redshift/describeClusters-exists.json'));
        //     let redshift = new RedshiftCluster(clusterName, 'ap-southeast-2')
            
        //     let response = await redshift.shouldExist()
        //     expect(response).toBe(true)
        //     done()
        // })
        
        // it('should return false when the cluster does not exist', async (done) => {
        //     AWSMock.mock('Redshift', 'describeClusters', awsMockFailureCallback('test-data/redshift/describeClusters-not-exists.json'));
        //     let redshift = new RedshiftCluster(clusterName, 'ap-southeast-2')
            
        //     let response = await redshift.shouldExist()
        //     expect(response).toBe(false)
        //     done()
        // })
        
        // it('should throw exception when an unexpected error is returned', async(done) => { 
        //     AWSMock.mock('Redshift', 'describeClusters', awsMockFailureCallback('test-data/redshift/describeClusters-denied.json'));
        //     let redshift = new RedshiftCluster(clusterName, 'ap-southeast-2')
            
        //     try{
        //         await redshift.shouldExist()
        //         done.fail('Expected exception to be thrown')
        //     }catch(err){
        //         // error should be propogated
        //         expect(err.code).toBe('AccessDenied')
        //         done()
        //     }
            
        // })
    })
    
})