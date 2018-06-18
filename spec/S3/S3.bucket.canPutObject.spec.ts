import { S3 } from '../../src/S3'
import { awsMockCallback, awsMockFailureCallback } from '../support'
import AWSMock = require('aws-sdk-mock')

describe('S3.bucket#canPutObject', () => {
    let bucketName = "myS3Bucket"
    let bucketKey = "test/my-key"

    afterEach(() => {
        AWSMock.restore('S3');
    })

    it('should return true when object exists and permission granted', async (done) => {
        AWSMock.mock('S3', 'putObject', awsMockCallback('test-data/putObject-granted.json'));

        let response = await S3.bucket(bucketName).canPutObject(bucketKey)
        expect(response).toBe(true)
        done()
    })

    it('should return false when object exists and permission denied', async (done) => {
        AWSMock.mock('S3', 'putObject', awsMockFailureCallback('test-data/putObject-denied.json'));

        let response = await S3.bucket(bucketName).canPutObject(bucketKey)
        expect(response).toBe(false)
        done()
    })

    it('should throw an error when the bucket does not exist', async (done) => {
        AWSMock.mock('S3', 'putObject', awsMockFailureCallback('test-data/putObject-notExist.json'));

        try {
            await S3.bucket(bucketName).canPutObject(bucketKey)
            fail('exception not thrown')
        } catch (err) {
            done()
        }
    })

})