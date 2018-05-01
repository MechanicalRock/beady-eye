import { S3 } from "../src/S3"
import { awsMockCallback, awsMockFailureCallback } from './support'
import AWSMock = require('aws-sdk-mock')

describe('S3.bucket#hasVersioningEnabled', () => {
    let bucketName = "myS3Bucket"

    afterEach(() => {
        AWSMock.restore('S3');
    })

    it('should return true if access logging is enabled', async (done) => {
        AWSMock.mock('S3', 'getBucketVersioning', awsMockCallback('test-data/getBucketVersioning-enabled.json'));

        let response = await S3.bucket(bucketName).hasVersioningEnabled()
        expect(response).toBe(true)
        done()
    })

    it('should return false if access logging is disabled', async (done) => {
        // Note - disabled is a successful response
        AWSMock.mock('S3', 'getBucketVersioning', awsMockCallback('test-data/getBucketVersioning-disabled.json'));
        let result = await S3.bucket(bucketName).hasVersioningEnabled()
        expect(result).toBe(false)
        done()
    })

    it('should fail if the bucket does not exist', async(done)=> {
        AWSMock.mock('S3', 'getBucketVersioning', awsMockFailureCallback('test-data/getBucketVersioning-notExist.json'));
        try{
            await S3.bucket(bucketName).hasVersioningEnabled()
            fail('Exception should be thrown')
        }catch (err){
            done()
        }
    })
})