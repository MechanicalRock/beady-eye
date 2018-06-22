import { S3 } from '../../src/S3'
import { awsMockCallback, awsMockFailureCallback } from '../support'
import * as AWSMock from 'aws-sdk-mock'

describe('S3.bucket#hasEncryptionByDefault', () => {
    let bucketName = "myS3Bucket"

    afterEach(() => {
        AWSMock.restore('S3');
    })

    it('should return true if the S3 bucket is encrypted by default', async (done) => {
        AWSMock.mock('S3', 'getBucketEncryption', awsMockCallback('test-data/getBucketEncryption-encrypted.json'));

        let response = await S3.bucket(bucketName).hasEncryptionByDefault()
        expect(response).toBe(true)
        done()
    })

    it('should return false if the S3 bucket is not encrypted by default', async (done) => {
        AWSMock.mock('S3', 'getBucketEncryption', awsMockFailureCallback('test-data/getBucketEncryption-notEncrypted.json'));
        let result = await S3.bucket(bucketName).hasEncryptionByDefault()
        expect(result).toBe(false)
        done()
    })

    it('should fail if the bucket does not exist', async(done)=> {
        AWSMock.mock('S3', 'getBucketEncryption', awsMockFailureCallback('test-data/getBucketEncryption-notExist.json'));
        try{
            await S3.bucket(bucketName).hasEncryptionByDefault()
            fail('Exception should be thrown')
        }catch (err){
            done()
        }
    })
})