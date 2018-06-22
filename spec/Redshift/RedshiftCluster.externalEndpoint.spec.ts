import { RedshiftCluster } from "../../src/Redshift"
import { awsMockCallback, awsMockFailureCallback } from '../support'
import * as AWSMock from 'aws-sdk-mock'


describe("RedshiftCluster class", () => {
    let clusterName = "test-redshift-cluster"
    let region = 'ap-southeast-2'

    describe('#externalEndpoint()', () => {
        
        it('should exist', async (done) => {
            AWSMock.mock('Redshift', 'describeClusters', awsMockCallback('test-data/redshift/describeClusters-exists.json'));
            this.redshift = new RedshiftCluster(clusterName, region)
            expect(this.redshift.externalEndpoint).toBeDefined()
            done()
        })

        describe('when the cluster exists', ()=> {
            beforeEach(() => {
                AWSMock.mock('Redshift', 'describeClusters', awsMockCallback('test-data/redshift/describeClusters-exists.json'));
    
                this.redshift = new RedshiftCluster(clusterName, region)
            })
            
            afterEach(() => {
                AWSMock.restore('Redshift');
            })

            it('should return the public endpoint details if the cluster exists', async (done) => {
                let actual = await this.redshift.externalEndpoint()

                expect(actual.Address).toBe("test-redshift-cluster.c7xqwt2jzuyc.ap-southeast-2.redshift.amazonaws.com")
                expect(actual.Port).toBe(5439)
                done()
            })
        })

        describe('when the cluster does not exist', () => {
            beforeEach(() => {
                AWSMock.mock('Redshift', 'describeClusters', awsMockFailureCallback('test-data/redshift/describeClusters-not-exists.json'));
    
                this.redshift = new RedshiftCluster(clusterName, region)
            })

            it('should fail', async (done) => {
                try{
                    let actual = await this.redshift.externalEndpoint()
                    fail("Error should have been thrown")
                }catch(err){
                    expect(err.code).toBe("ClusterNotFound")
                    done()
                }
            })
        })

    })

})